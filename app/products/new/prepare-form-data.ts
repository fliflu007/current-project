import { ImageItemType } from "./page";

import { CreateProductData } from "@/schemas/product";

/**
 * Builds the FormData payload expected by the create-product API.
 *
 * - data: JSON string containing product data
 * - imagesdata: JSON string containing image metadata
 *   [{ key: "key0", isMain: true }, ...]
 * - key0, key1, ...: actual image files
 */

export function prepareFormData(
  data: CreateProductData,
  images: ImageItemType[],
) {
  const formdata = new FormData();

  formdata.append("data", JSON.stringify(data));

  const imageList = images.map((image, index) => {
    return {
      key: `key${index}`,
      isMain: image.isMain,
    };
  });

  formdata.append("imagesData", JSON.stringify(imageList));

  // add the key and fill loop
  images.forEach((image, index) => {
    formdata.append(`key${index}`, image.file);
  });

  return formdata;
}
