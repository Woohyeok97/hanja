"use client";

import { useState, type SubmitEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import type { SearchApiResponse, SearchResult } from "@/app/api/search/route";
import { isHangulWord } from "@/lib/hanja";

async function fetchHanjaSearch(query: string): Promise<SearchApiResponse> {
  const res = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("검색 요청에 실패했어요");
  return res.json();
}

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [submittedTerm, setSubmittedTerm] = useState("");

  const isValidInput = isHangulWord(submittedTerm);

  const { data, isLoading, isError, isPaused } = useQuery({
    queryKey: ["hanja-search", submittedTerm],
    queryFn: () => fetchHanjaSearch(submittedTerm),
    enabled: submittedTerm !== "" && isValidInput,
  });

  const handleSubmitSearch = (event: SubmitEvent) => {
    event.preventDefault();
    const trimmedSearchTerm = searchTerm.trim();
    if (!trimmedSearchTerm) return;
    setSubmittedTerm(trimmedSearchTerm);
  };

  return (
    <main className="mx-auto max-w-3xl px-6 py-16 font-sans">
      <h1 className="mb-6 text-2xl font-semibold">한자어 훈음 분해</h1>
      <form onSubmit={handleSubmitSearch} className="flex gap-2">
        <input
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
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
        <SearchStatus
          submittedTerm={submittedTerm}
          isValidInput={isValidInput}
          isLoading={isLoading}
          isError={isError || isPaused}
          reason={data?.reason}
          resultCount={data?.results.length ?? 0}
        />
        {data?.results.map((result, index) => (
          <ResultCard
            key={`${result.word}-${result.sup_no}-${index}`}
            result={result}
          />
        ))}
      </div>
    </main>
  );
}

interface SearchStatusProps {
  submittedTerm: string;
  isValidInput: boolean;
  isLoading: boolean;
  isError: boolean;
  reason: "not_found" | "native_korean" | undefined;
  resultCount: number;
}

function SearchStatus({
  submittedTerm,
  isValidInput,
  isLoading,
  isError,
  reason,
  resultCount,
}: SearchStatusProps) {
  if (!submittedTerm) return null;
  if (!isValidInput) {
    return <p className="text-zinc-500">한글 단어를 입력해 주세요.</p>;
  }
  if (isLoading) return <p className="text-zinc-500">불러오는 중…</p>;
  if (isError) {
    return (
      <p className="text-red-600">
        오류가 발생했어요. 잠시 후 다시 시도해 주세요.
      </p>
    );
  }
  if (resultCount > 0) return null;
  if (reason === "native_korean") {
    return (
      <p className="text-zinc-500">
        &apos;{submittedTerm}&apos;는 순우리말입니다.
      </p>
    );
  }
  return (
    <p className="text-zinc-500">
      &apos;{submittedTerm}&apos;에 대한 검색 결과가 없어요.
    </p>
  );
}

interface ResultCardProps {
  result: SearchResult;
}

function ResultCard({ result }: ResultCardProps) {
  return (
    <article className="rounded border border-zinc-200 p-4 dark:border-zinc-800">
      <header className="flex items-baseline gap-3">
        <span className="text-lg font-medium">{result.word}</span>
        {result.sup_no && result.sup_no !== "0" && (
          <span className="text-sm text-zinc-500">{result.sup_no}</span>
        )}
        <span className="text-lg">{result.origin}</span>
        {result.pos && (
          <span className="ml-auto text-sm text-zinc-500">{result.pos}</span>
        )}
      </header>
      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1">
        {result.matches.map((match, matchIndex) => (
          <span key={matchIndex} className="tabular-nums">
            <span className="mr-1 text-lg">{match.char}</span>
            <span className={match.matched ? "" : "text-zinc-400"}>
              {match.hun} {match.eum}
            </span>
          </span>
        ))}
      </div>
      {result.definition && (
        <p className="mt-2 text-zinc-700 dark:text-zinc-300">
          뜻: {result.definition}
        </p>
      )}
    </article>
  );
}
