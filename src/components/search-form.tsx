"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { isHangulWord } from "@/lib/hanja";
import { getRecentSearches, removeRecentSearch } from "@/lib/recent-searches";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SearchFormProps {
  defaultSearchTerm: string;
}

export function SearchForm({ defaultSearchTerm }: SearchFormProps) {
  const router = useRouter();
  const [invalidMessage, setInvalidMessage] = useState<string | null>(null);
  // 초기 렌더 시 드롭다운이 항상 닫혀 있어 화면 출력에 영향을 주지 않으므로,
  // lazy initializer로 바로 읽어도 서버/클라이언트 하이드레이션 불일치가 없다.
  const [recentSearches, setRecentSearches] = useState<string[]>(() =>
    getRecentSearches(),
  );
  const [searchTerm, setSearchTerm] = useState(defaultSearchTerm);
  const [isFocused, setIsFocused] = useState(false);

  // 검색어 유효성 검증 후 쿼리 파라미터로 라우팅
  const search = (term: string) => {
    if (!isHangulWord(term)) {
      setInvalidMessage("한글 단어를 입력해 주세요.");
      return;
    }
    setInvalidMessage(null);
    setSearchTerm(term);
    router.push(`/?query=${encodeURIComponent(term)}`);
  };

  // 폼 제출 시 현재 검색어로 검색 실행
  const handleSubmitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const term = searchTerm.trim();
    if (!term) return;
    search(term);
  };

  // 최근 검색어 목록에서 항목 제거
  const handleRemoveRecent = (term: string) => {
    setRecentSearches(removeRecentSearch(term));
  };

  // 최근 검색어 노출여부
  const showRecent =
    isFocused && searchTerm.trim() === "" && recentSearches.length > 0;

  return (
    <div>
      <form onSubmit={handleSubmitSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Input
            name="query"
            value={searchTerm}
            placeholder="예: 심도, 낙원, 여자"
            autoComplete="off"
            className="h-11 px-3 text-base"
            // 포커스 시 최근 검색어 목록을 최신 상태로 다시 읽고 드롭다운 노출
            onFocus={() => {
              setIsFocused(true);
              setRecentSearches(getRecentSearches());
            }}
            // 포커스 해제 시 드롭다운 숨김
            onBlur={() => setIsFocused(false)}
            // 입력값 갱신
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          {showRecent && (
            <div
              className={cn(
                "absolute top-full left-0 z-10 mt-1 w-full origin-top overflow-hidden rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10",
              )}
            >
              <p className="px-1.5 py-1 text-xs text-zinc-500">최근 검색어</p>
              <ul className="space-y-1">
                {recentSearches.map((term) => (
                  <li key={term}>
                    <button
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => search(term)}
                      className="flex w-full cursor-pointer items-center justify-between gap-1.5 rounded-md px-2 py-2 text-sm select-none hover:bg-accent hover:text-accent-foreground"
                    >
                      <span>{term}</span>
                      <span
                        role="button"
                        aria-label={`${term} 삭제`}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={(event) => {
                          event.stopPropagation();
                          handleRemoveRecent(term);
                        }}
                        className="cursor-pointer rounded p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      >
                        <X size={14} />
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <Button type="submit" size="lg" className="h-11 px-4">
          검색
        </Button>
      </form>
      {invalidMessage && <p className="mt-2 text-zinc-500">{invalidMessage}</p>}
    </div>
  );
}
