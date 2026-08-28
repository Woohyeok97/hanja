// PRODUCT.md 검증 케이스 자체 테스트
// tsx 없이 돌리려고 lib/hanja.ts 로직을 미러링한다. ponytail: 로직 두 번 유지 대신 여기서만 assert.
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const __dirname = dirname(fileURLToPath(import.meta.url));
const entries = JSON.parse(
  readFileSync(join(__dirname, "..", "src", "data", "hanja.json"), "utf8")
);
const byChar = new Map(entries.map((e) => [e.char, e]));

function dueumVariant(syl) {
  const code = syl.charCodeAt(0) - 0xac00;
  if (code < 0 || code >= 11172) return null;
  const cho = Math.floor(code / (21 * 28));
  const jung = Math.floor((code % (21 * 28)) / 28);
  const jong = code % 28;
  const R = 5,
    N = 2,
    NG = 11;
  const yod = new Set([2, 6, 7, 12, 17, 20]);
  const nToNg = new Set([6, 12, 17, 20]);
  let newCho = null;
  if (cho === R) newCho = yod.has(jung) ? NG : N;
  else if (cho === N && nToNg.has(jung)) newCho = NG;
  if (newCho === null) return null;
  return String.fromCharCode(0xac00 + (newCho * 21 + jung) * 28 + jong);
}

function matchOne(char, reading, isFirst) {
  const c = char.normalize("NFC");
  const e = byChar.get(c);
  if (!e) return { char: c, hun: "", eum: "", matched: false };
  let hit = e.meanings.find(([, eum]) => eum === reading);
  if (!hit && isFirst)
    hit = e.meanings.find(([, eum]) => dueumVariant(eum) === reading);
  if (hit) return { char: c, hun: hit[0], eum: hit[1], matched: true };
  const [hun, eum] = e.meanings[0];
  return { char: c, hun, eum, matched: false };
}

function matchWord(origin, reading) {
  const chars = [...origin.normalize("NFC")];
  const readings = [...reading.normalize("NFC")];
  return chars.map((c, i) => matchOne(c, readings[i] ?? "", i === 0));
}

const cases = [
  ["심도", "深度", [["深", "깊을", "심"], ["度", "법도", "도"]]],
  ["촌탁", "忖度", [["忖", "헤아릴", "촌"], ["度", "헤아릴", "탁"]]],
  ["낙원", "樂園", [["樂", "즐길", "락"], ["園", "동산", "원"]]],
  ["음악", "音樂", [["音", "소리", "음"], ["樂", "노래", "악"]]],
  ["요산요수", "樂山樂水", [["樂", "좋아할", "요"], ["山", "메", "산"], ["樂", "좋아할", "요"], ["水", "물", "수"]]],
  ["여자", "女子", [["女", "계집", "녀"], ["子", "아들", "자"]]],
  ["이유", "理由", [["理", "다스릴", "리"], ["由", "말미암을", "유"]]],
  ["노인", "老人", [["老", "늙을", "로"], ["人", "사람", "인"]]],
  ["확률", "確率", [["確", "굳을", "확"], ["率", "비율", "률"]]],
  ["인솔", "引率", [["引", "끌", "인"], ["率", "거느릴", "솔"]]],
  ["자동차", "自動車", [["自", "스스로", "자"], ["動", "움직일", "동"], ["車", "수레", "차"]]],
  ["유치원", "幼稚園", [["幼", "어릴", "유"], ["稚", "어릴", "치"], ["園", "동산", "원"]]],
  ["불가능", "不可能", [["不", "아닐", "불"], ["可", "옳을", "가"], ["能", "능할", "능"]]],
  ["시월", "十月", [["十", "열", "십"], ["月", "달", "월"]]],
];

let fail = 0;
for (const [reading, origin, expected] of cases) {
  const got = matchWord(origin, reading);
  const gotSimple = got.map((m) => [m.char, m.hun, m.eum]);
  try {
    assert.deepEqual(gotSimple, expected);
    console.log(`✓ ${reading} ${origin}`);
  } catch {
    fail++;
    console.log(`✗ ${reading} ${origin}`);
    console.log(`  expected ${JSON.stringify(expected)}`);
    console.log(`  got      ${JSON.stringify(gotSimple)}`);
  }
}
if (fail) {
  console.log(`\n${fail} failed`);
  process.exit(1);
}
console.log(`\nall ${cases.length} passed`);
