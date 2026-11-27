export type ProductDetailUI = {
  data: {
    id: string;
    companyId: string;
    createdAt: Date;
    name: string;
    description: string | null;
    quantity: string;
    barcode: string | null;
  };
  images: {
    id: string;
    productId: string;
    url: string;
    publicId: string;
    isPrimary: boolean;
    createdAt: Date;
  }[];
};
