import React from "react";
import { Button } from "@/components/ui/button";
export default function Page() {
  return (
    <div>
      <button className="bg-blue-400 px-3 py-2 bg-background ">
        registeration
      </button>
      <Button variant="destructive" className="bg-background">
        other button
      </Button>
    </div>
  );
}
