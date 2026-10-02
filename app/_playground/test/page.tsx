import { ProductStockIn } from "@/components/product-stock-in";
import { validationError } from "@/lib/api/response";

type Input = {
  name?: string | boolean;
};

export default function page() {
  const person: Input = { name: true };
  validationError("test");

  if (typeof person.name === "boolean") {
    // Inside here, TypeScript dynamically changes the type to strictly: boolean
    console.log(person.name);
    person.name = "toto";
    console.log(person.name);
  }

  return (
    <div>
      test
      <ProductStockIn />
    </div>
  );
}
