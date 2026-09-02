const KEY = "recent-searches";
const MAX = 8;

// localStorage에서 저장된 검색어 목록 읽기
function readAll(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

// localStorage에 검색어 목록 저장
function writeAll(terms: string[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(terms));
  } catch {
    // localStorage 접근 불가(프라이빗 모드 등) 시 조용히 무시
  }
}

// 저장된 최근 검색어 목록 조회
export function getRecentSearches(): string[] {
  return readAll();
}

// 검색어를 최근 검색어 목록 맨 앞에 추가 (중복 제거, 최대 개수 유지)
export function addRecentSearch(term: string): string[] {
  const next = [term, ...readAll().filter((t) => t !== term)].slice(0, MAX);
  writeAll(next);
  return next;
}

// 최근 검색어 목록에서 특정 검색어 제거
export function removeRecentSearch(term: string): string[] {
  const next = readAll().filter((t) => t !== term);
  writeAll(next);
  return next;
}
