import { searchHanja } from "@/lib/search";
import { isHangulWord } from "@/lib/hanja";
import type { SearchReason } from "@/types/search";
import { ResultCard } from "@/components/result-card";

interface SearchResultsProps {
  searchTerm: string;
}

export async function SearchResults({ searchTerm }: SearchResultsProps) {
  if (!isHangulWord(searchTerm)) {
    return <StatusMessage text="한글 단어를 입력해 주세요." />;
  }

  const { results, reason } = await searchHanja(searchTerm);
  if (results.length > 0) {
    return results.map((result, index) => (
      <ResultCard
        key={`${result.word}-${result.sup_no}-${index}`}
        result={result}
      />
    ));
  }

  return (
    <StatusMessage
      text={describeEmptyResult(searchTerm, reason)}
      isError={reason === "upstream"}
    />
  );
}

// 결과가 0건일 때 이유별 문구. 분기를 늘려도 여기에 한 줄만 추가하면 된다.
const emptyResultMessages: Record<SearchReason, (searchTerm: string) => string> = {
  not_found: (searchTerm) => `'${searchTerm}'에 대한 검색 결과가 없어요.`,
  native_korean: (searchTerm) => `'${searchTerm}'는 순우리말입니다.`,
  upstream: () => "오류가 발생했어요. 잠시 후 다시 시도해 주세요.",
};

function describeEmptyResult(searchTerm: string, reason: SearchReason | undefined) {
  return emptyResultMessages[reason ?? "not_found"](searchTerm);
}

interface StatusMessageProps {
  text: string;
  isError?: boolean;
}

function StatusMessage({ text, isError = false }: StatusMessageProps) {
  return (
    <p className={isError ? "text-red-600" : "text-zinc-500"}>{text}</p>
  );
}
