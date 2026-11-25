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
    <div className="container mx-auto grid grid-cols-1 items-center justify-items-center gap-3 sm:grid-cols-2 sm:justify-items-stretch py-3">
      <ProductSearch />
      <ProductPagination currentPage={currentPage} lastPage={lastPage} />
    </div>
  );
}
