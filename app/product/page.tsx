import MovementHistoryTable from "@/components/movement-history-table";
import Navbar from "@/components/navbar";
import ProductDetails from "@/components/product-details";
import ProductToolbar from "@/components/product-toolbar";
import ProductUtilityBar from "@/components/product-utility-bar";
import ProductViewer from "@/components/product-viewer";

export default function page() {
  return (
    <div>
      <Navbar isLoggedIn={true} />
      <ProductToolbar></ProductToolbar>
      <div className="container mx-auto">
        <ProductUtilityBar></ProductUtilityBar>
      </div>

      <ProductViewer
        MovementHistoryTable={<MovementHistoryTable />}
        ProductDetails={<ProductDetails />}
      />
    </div>
  );
}
