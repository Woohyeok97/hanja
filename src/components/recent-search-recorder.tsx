"use client";

import { useEffect } from "react";
import { addRecentSearch } from "@/lib/recent-searches";

// 검색 결과가 있을 때만 렌더링되어, 마운트 시점에 "성공한 검색어"를 최근 검색어(로컬스토리지)에 기록
export function RecentSearchRecorder({ term }: { term: string }) {
  useEffect(() => {
    addRecentSearch(term);
  }, [term]);

  return null;
}
