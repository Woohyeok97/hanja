import { NextRequest } from "next/server";
import { isHanjaOnly, matchWord, type Match } from "@/lib/hanja";

export type SearchResult = {
  word: string;
  sup_no: string;
  origin: string;
  pos: string;
  definition: string;
  matches: Match[];
};

// "not_found"  : stdict가 항목 자체를 못 줌 (오타·신조어·미등재 등)
// "native_korean": 항목은 있지만 전부 한자 표기가 없음 (순우리말)
export type SearchApiResponse = {
  results: SearchResult[];
  reason?: "not_found" | "native_korean";
};

const trim = (s: unknown) => (typeof s === "string" ? s.trim() : "");

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("query")?.trim();
  if (!query) {
    return Response.json({ results: [] } satisfies SearchApiResponse);
  }

  const key = process.env.STDICT_API_KEY;
  if (!key) {
    console.error("[search] STDICT_API_KEY missing");
    return Response.json({ error: "config" }, { status: 500 });
  }

  // stdict API 자체의 파라미터 이름은 "q"로 고정되어 있어(외부 계약) 그대로 둔다.
  const url = `https://stdict.korean.go.kr/api/search.do?key=${encodeURIComponent(key)}&q=${encodeURIComponent(query)}&req_type=json`;

  let text: string;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`[search] stdict responded ${res.status}`);
      return Response.json({ error: "upstream" }, { status: 502 });
    }
    text = await res.text();
  } catch (err) {
    console.error("[search] stdict fetch failed", err);
    return Response.json({ error: "upstream" }, { status: 502 });
  }

  // 결과가 없는 검색어는 JSON이 아니라 빈 본문(길이 0)으로 온다. 이건 오류가 아니라
  // "결과 없음" 신호이므로 별도로 처리한다.
  if (!text) {
    return Response.json({
      results: [],
      reason: "not_found",
    } satisfies SearchApiResponse);
  }

  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch (err) {
    console.error("[search] stdict returned invalid JSON", err);
    return Response.json({ error: "upstream" }, { status: 502 });
  }

  const rawItem = (data as { channel?: { item?: unknown } })?.channel?.item;
  const items = Array.isArray(rawItem) ? rawItem : rawItem ? [rawItem] : [];

  if (items.length === 0) {
    return Response.json({
      results: [],
      reason: "not_found",
    } satisfies SearchApiResponse);
  }

  const results: SearchResult[] = items
    .map((item: Record<string, unknown>) => {
      const origin = trim(item.origin).normalize("NFC");
      const word = trim(item.word);
      const sense = item.sense as Record<string, unknown> | undefined;
      return {
        word,
        sup_no: trim(item.sup_no),
        origin,
        pos: trim(item.pos),
        definition: trim(sense?.definition),
        matches: matchWord(origin, word),
      };
    })
    // origin이 한자 표기가 아닌 표제어(순우리말, 외래 인명 등)는 제외
    .filter((result: SearchResult) => isHanjaOnly(result.origin));

  if (results.length === 0) {
    return Response.json({
      results: [],
      reason: "native_korean",
    } satisfies SearchApiResponse);
  }

  return Response.json({ results } satisfies SearchApiResponse);
}
