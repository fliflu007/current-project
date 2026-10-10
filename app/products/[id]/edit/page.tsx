import EditCard from "@/components/edit-card";

import Navbar from "@/components/navbar";

import { notFound } from "next/navigation";

import { ProductByIdResponse } from "./patch-types-schema";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // fetch all data and show in console.
  const { id } = await params;

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/product/${id}`,
  );

  if (response.status === 404) {
    notFound();
  }

  if (!response.ok) {
    throw new Error("Failed to fetch product");
  }

  const result: { data: ProductByIdResponse } = await response.json();
  const product = result.data;
  console.log("PRODUCT", product);

  return (
    <div className="flex min-h-screen flex-col">
      <div>
        <Navbar />

        <main className="flex flex-1 my-10 justify-center">
          <div className="w-136 overflow-visible">
            <EditCard product={product} />
          </div>
        </main>
      </div>
    </div>
  );
}
