"use client";

import { useState } from "react";
import type { SearchResult } from "@/app/api/search/route";

export default function Home() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const query = q.trim();
    if (!query) return;
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "검색 실패");
      setResults(data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-16 font-sans">
      <h1 className="mb-6 text-2xl font-semibold">한자어 훈음 분해</h1>
      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="예: 심도, 낙원, 여자"
          className="flex-1 rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          autoFocus
        />
        <button
          type="submit"
          className="rounded bg-black px-4 py-2 text-white dark:bg-white dark:text-black"
        >
          검색
        </button>
      </form>

      <div className="mt-8 space-y-6">
        {loading && <p className="text-zinc-500">불러오는 중…</p>}
        {error && <p className="text-red-600">에러: {error}</p>}
        {results && results.length === 0 && (
          <p className="text-zinc-500">결과 없음 (한자 표기가 있는 표제어만 표시)</p>
        )}
        {results?.map((r, i) => (
          <article
            key={`${r.word}-${r.sup_no}-${i}`}
            className="rounded border border-zinc-200 p-4 dark:border-zinc-800"
          >
            <header className="flex items-baseline gap-3">
              <span className="text-lg font-medium">{r.word}</span>
              {r.sup_no && r.sup_no !== "0" && (
                <span className="text-sm text-zinc-500">{r.sup_no}</span>
              )}
              <span className="text-lg">{r.origin}</span>
              {r.pos && (
                <span className="ml-auto text-sm text-zinc-500">{r.pos}</span>
              )}
            </header>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1">
              {r.matches.map((m, j) => (
                <span key={j} className="tabular-nums">
                  <span className="mr-1 text-lg">{m.char}</span>
                  <span className={m.matched ? "" : "text-zinc-400"}>
                    {m.hun} {m.eum}
                  </span>
                </span>
              ))}
            </div>
            {r.definition && (
              <p className="mt-2 text-zinc-700 dark:text-zinc-300">
                뜻: {r.definition}
              </p>
            )}
          </article>
        ))}
      </div>
    </main>
  );
}
