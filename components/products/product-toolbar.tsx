import { Button } from "@/components/ui/button";

import Link from "next/link";

export default function ProductToolbar() {
  console.log("in prodcut bar");
  return (
    <div className="container mx-auto flex justify-center">
      <Link href={"/products/new"}>
        <Button variant="ghost" className="border-2 border-secondary">
          + Create Product
        </Button>
      </Link>
    </div>
  );
}
