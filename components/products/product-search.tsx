"use client";

import { Search } from "lucide-react";
import { Input } from "@base-ui/react";
import { useRouter } from "next/navigation";

export default function ProductSearch() {
  const router = useRouter();

  async function triggerFilter(searchValue: string) {
    await new Promise((resolve) => setTimeout(resolve, 1300));
    const params = new URLSearchParams();
    params.set("search", searchValue);
    params.set("page", "1");
    router.replace(`/?${params.toString()}`);
  }
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
      <Input
        className="pl-9"
        placeholder="Search products..."
        aria-label="Search products"
        onChange={(e) => triggerFilter(e.target.value)}
      />
    </div>
  );
}
