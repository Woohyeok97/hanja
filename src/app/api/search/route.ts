import { NextRequest } from "next/server";
import { matchWord, type Match } from "@/lib/hanja";

export type SearchResult = {
  word: string;
  sup_no: string;
  origin: string;
  pos: string;
  definition: string;
  matches: Match[];
};

const trim = (s: unknown) => (typeof s === "string" ? s.trim() : "");

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q) return Response.json({ results: [] });
  const key = process.env.STDICT_API_KEY;
  if (!key)
    return Response.json({ error: "STDICT_API_KEY missing" }, { status: 500 });

  const url = `https://stdict.korean.go.kr/api/search.do?key=${encodeURIComponent(
    key
  )}&q=${encodeURIComponent(q)}&req_type=json`;
  const res = await fetch(url);
  if (!res.ok)
    return Response.json({ error: `stdict ${res.status}` }, { status: 502 });
  const data = await res.json();

  const rawItem = data?.channel?.item;
  const items = Array.isArray(rawItem) ? rawItem : rawItem ? [rawItem] : [];

  const results: SearchResult[] = items
    .map((it: Record<string, unknown>) => {
      const origin = trim(it.origin).normalize("NFC");
      const word = trim(it.word);
      const sense = it.sense as Record<string, unknown> | undefined;
      return {
        word,
        sup_no: trim(it.sup_no),
        origin,
        pos: trim(it.pos),
        definition: trim(sense?.definition),
        matches: origin ? matchWord(origin, word) : [],
      };
    })
    .filter((r: SearchResult) => r.origin);

  return Response.json({ results });
}
