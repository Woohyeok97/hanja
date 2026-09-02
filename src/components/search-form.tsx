"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { isHangulWord } from "@/lib/hanja";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SearchFormProps {
  defaultSearchTerm: string;
}

export function SearchForm({ defaultSearchTerm }: SearchFormProps) {
  const router = useRouter();
  const [invalidMessage, setInvalidMessage] = useState<string | null>(null);

  const handleSubmitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const searchTerm = new FormData(event.currentTarget).get("query")?.toString().trim();
    if (!searchTerm) return;

    if (!isHangulWord(searchTerm)) {
      setInvalidMessage("한글 단어를 입력해 주세요.");
      return;
    }

    setInvalidMessage(null);
    router.push(`/?query=${encodeURIComponent(searchTerm)}`);
  };

  return (
    <div>
      <form onSubmit={handleSubmitSearch} className="flex gap-2">
        <Input
          name="query"
          defaultValue={defaultSearchTerm}
          placeholder="예: 심도, 낙원, 여자"
          className="flex-1"
          autoComplete="off"
          autoFocus
        />
        <Button type="submit">검색</Button>
      </form>
      {invalidMessage && (
        <p className="mt-2 text-zinc-500">{invalidMessage}</p>
      )}
    </div>
  );
}
