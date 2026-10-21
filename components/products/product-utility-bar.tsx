import ProductPagination from "./product-pagination";
import ProductSearch from "./product-search";

type ProductUtilityBarProps = {
  currentPage: number;
  lastPage: number;
};

export default function ProductUtilityBar({
  currentPage,
  lastPage,
}: ProductUtilityBarProps) {
  return (
    <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-2 container mx-auto">
      <ProductSearch />
      <ProductPagination currentPage={currentPage} lastPage={lastPage} />
    </div>
  );
}
