import React from "react";
import Navbar from "@/components/navigation/navbar";
import CreateProductForm from "./components/create-product-form";

export default function page() {
  return (
    <div className="flex min-h-screen flex-col">
      <div>
        <main className="w-full ">
          <CreateProductForm />
        </main>
      </div>
    </div>
  );
}
