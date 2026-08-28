import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const CSV_URL =
  "https://raw.githubusercontent.com/rycont/hanja-grade-dataset/main/hanja.csv";

// ponytail: minimal CSV parser — this dataset only quotes the meaning field, no embedded newlines
function parseCsv(text) {
  const rows = [];
  for (const line of text.split("\n")) {
    if (!line) continue;
    const cells = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c === "," && !inQuotes) {
        cells.push(cur);
        cur = "";
      } else {
        cur += c;
      }
    }
    cells.push(cur);
    rows.push(cells);
  }
  return rows;
}

// "[[['깊을'], ['심']]]" → [["깊을", "심"]]
function parseMeaning(raw) {
  const json = raw.replace(/'/g, '"');
  const parsed = JSON.parse(json);
  return parsed.map(([hun, eum]) => [hun[0], eum[0]]);
}

const nfc = (s) => s.normalize("NFC");

const res = await fetch(CSV_URL);
if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
const csv = await res.text();

const [header, ...rows] = parseCsv(csv);
const idx = Object.fromEntries(header.map((h, i) => [h, i]));

const out = rows.map((r) => ({
  char: nfc(r[idx.hanja]),
  meanings: parseMeaning(r[idx.meaning]).map(([h, e]) => [nfc(h), nfc(e)]),
  main_sound: nfc(r[idx.main_sound]),
  radical: nfc(r[idx.radical]),
  total_strokes: Number(r[idx.total_strokes]),
  level: nfc(r[idx.level]),
}));

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, "..", "src", "data", "hanja.json");
writeFileSync(outPath, JSON.stringify(out));

// self-check
const byChar = new Map(out.map((x) => [x.char, x]));
const check = (ch, hun, eum) => {
  const e = byChar.get(nfc(ch));
  if (!e) throw new Error(`missing: ${ch}`);
  const ok = e.meanings.some(([h, u]) => h === hun && u === eum);
  if (!ok)
    throw new Error(
      `${ch} expected ${hun} ${eum}, got ${JSON.stringify(e.meanings)}`
    );
};
check("深", "깊을", "심");
check("度", "법도", "도");
check("度", "헤아릴", "탁");
check("樂", "즐길", "락"); // compat-han sanity via NFC
check("車", "수레", "차");
check("不", "아닐", "불");

console.log(`wrote ${out.length} entries → ${outPath}`);
