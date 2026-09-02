import type { SearchResult } from "@/types/search";

interface ResultCardProps {
  result: SearchResult;
}

export function ResultCard({ result }: ResultCardProps) {
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
