import { Suspense } from "react";
import { SearchForm } from "@/components/search-form";
import { SearchResults } from "@/components/search-results";
import Link from "next/link";

export default async function Home(props: PageProps<"/">) {
  const rawSearchTerm = (await props.searchParams).query;
  const searchTerm =
    typeof rawSearchTerm === "string" ? rawSearchTerm.trim() : "";

  return (
    <main className="mx-auto max-w-3xl px-6 py-16 font-sans">
      <h1 className="mb-6 text-2xl font-semibold">
        <Link href="/">한자어 훈음 분해</Link>
      </h1>
      <SearchForm key={searchTerm} defaultSearchTerm={searchTerm} />
      <div className="mt-8 space-y-6">
        {searchTerm && (
          <Suspense
            key={searchTerm}
            fallback={<p className="text-zinc-500">불러오는 중…</p>}
          >
            <SearchResults searchTerm={searchTerm} />
          </Suspense>
        )}
      </div>
    </main>
  );
}
