import raw from "@/data/hanja.json";

export type HanjaEntry = {
  char: string;
  meanings: [string, string][];
  main_sound: string;
  radical: string;
  total_strokes: number;
  level: string;
};

export type Match = {
  char: string;
  hun: string;
  eum: string;
  matched: boolean; // false = 속음 등으로 fallback
};

const entries = raw as HanjaEntry[];
const byChar = new Map(entries.map((e) => [e.char, e]));

// 한글 음절 → 두음법칙 변환된 어두 형태
// ㄹ + {ㅑㅕㅖㅛㅠㅣ} → ㅇ + same vowel   (리→이, 려→여)
// ㄹ + other vowel   → ㄴ + same          (로→노, 락→낙)
// ㄴ + {ㅕㅛㅠㅣ}   → ㅇ + same          (녀→여, 뇨→요)
function dueumVariant(syl: string): string | null {
  const code = syl.charCodeAt(0) - 0xac00;
  if (code < 0 || code >= 11172) return null;
  const cho = Math.floor(code / (21 * 28));
  const jung = Math.floor((code % (21 * 28)) / 28);
  const jong = code % 28;
  const R = 5,
    N = 2,
    NG = 11;
  const yodVowels = new Set([2, 6, 7, 12, 17, 20]); // ㅑㅕㅖㅛㅠㅣ
  const nToNg = new Set([6, 12, 17, 20]); // ㅕㅛㅠㅣ
  let newCho: number | null = null;
  if (cho === R) newCho = yodVowels.has(jung) ? NG : N;
  else if (cho === N && nToNg.has(jung)) newCho = NG;
  if (newCho === null) return null;
  return String.fromCharCode(0xac00 + (newCho * 21 + jung) * 28 + jong);
}

export function lookup(char: string): HanjaEntry | undefined {
  return byChar.get(char.normalize("NFC"));
}

// 한자 한 글자 + 그 자리의 한글 독음 → 훈음 선택
export function matchOne(
  char: string,
  reading: string,
  isFirst: boolean
): Match {
  const c = char.normalize("NFC");
  const e = byChar.get(c);
  if (!e) return { char: c, hun: "", eum: "", matched: false };
  // 정확히 일치
  let hit = e.meanings.find(([, eum]) => eum === reading);
  if (!hit && isFirst) {
    // 두음법칙: 사전의 eum이 두음변환되면 reading이 되는가
    hit = e.meanings.find(([, eum]) => dueumVariant(eum) === reading);
  }
  if (hit) return { char: c, hun: hit[0], eum: hit[1], matched: true };
  // 실패 시 첫 번째 훈음 (속음 등)
  const [hun, eum] = e.meanings[0];
  return { char: c, hun, eum, matched: false };
}

// 한자 표기 전체 + 한글 독음 전체 → 각 글자 매칭
export function matchWord(origin: string, reading: string): Match[] {
  const chars = [...origin.normalize("NFC")];
  const readings = [...reading.normalize("NFC")];
  return chars.map((c, i) => matchOne(c, readings[i] ?? "", i === 0));
}
