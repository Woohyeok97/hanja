import { Suspense } from "react";
import { SearchForm } from "@/components/search-form";
import { SearchResults } from "@/components/search-results";

export default async function Home(props: PageProps<"/">) {
  const rawQuery = (await props.searchParams).query;
  const query = typeof rawQuery === "string" ? rawQuery.trim() : "";

  return (
    <main className="mx-auto max-w-3xl px-6 py-16 font-sans">
      <h1 className="mb-6 text-2xl font-semibold">한자어 훈음 분해</h1>
      <SearchForm key={query} defaultQuery={query} />
      <div className="mt-8 space-y-6">
        {query && (
          <Suspense
            key={query}
            fallback={<p className="text-zinc-500">불러오는 중…</p>}
          >
            <SearchResults query={query} />
          </Suspense>
        )}
      </div>
    </main>
  );
}
