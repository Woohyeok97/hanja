"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";

interface SearchFormProps {
  defaultQuery: string;
}

export function SearchForm({ defaultQuery }: SearchFormProps) {
  const router = useRouter();

  const handleSubmitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = new FormData(event.currentTarget).get("query")?.toString().trim();
    if (!query) return;
    router.push(`/?query=${encodeURIComponent(query)}`);
  };

  return (
    <form onSubmit={handleSubmitSearch} className="flex gap-2">
      <input
        name="query"
        defaultValue={defaultQuery}
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
  );
}
