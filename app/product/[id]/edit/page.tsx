import EditCard from "@/components/edit-card";
import { getProductById } from "@/services/products.service";
import z from "zod";
import { getProductImageData } from "@/services/products.service";

import Navbar from "@/components/navbar";
import { productImages } from "@/db/schema";
import { Product } from "@/types/product";

export type EditCardProps = {
  product: Product;
  imagelist: (typeof productImages.$inferSelect)[];
};

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const uuidschema = z.string().uuid();

  const result = uuidschema.safeParse(id);
  if (!result.success) {
    return <h1>Invalid product ID</h1>;
  }
  const product = await getProductById(result.data);

  if (!product) {
    return <h1>No product found</h1>;
  }

  const imagelist = await getProductImageData(result.data);

  return (
    <div className="flex min-h-screen flex-col">
      <div>
        <Navbar />

        <main className="flex flex-1 my-10 justify-center">
          <div className="w-136 overflow-visible">
            <EditCard product={product} imagelist={imagelist} />
          </div>
        </main>
      </div>
    </div>
  );
}
