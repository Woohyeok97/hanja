import type { Match } from "@/lib/hanja";

export interface SearchResult {
  word: string;
  sup_no: string;
  origin: string;
  pos: string;
  definition: string;
  matches: Match[];
}

// "not_found"     : stdict가 항목 자체를 못 줌 (오타·신조어·미등재 등)
// "native_korean" : 항목은 있지만 전부 한자 표기가 없음 (순우리말)
// "upstream"      : stdict 호출 자체가 실패
export type SearchReason = "not_found" | "native_korean" | "upstream";

export interface SearchResponse {
  results: SearchResult[];
  reason?: SearchReason;
}
