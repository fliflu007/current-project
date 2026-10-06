import { MAX_IMAGE_SIZE } from "@/constants/products";
import { ALLOWED_IMAGE_TYPES } from "@/constants/products";
import { ImageItemType } from "../page";
import { MAX_PRODUCT_IMAGES } from "@/constants/products";

import { CreateDataForm } from "../page";

/**
 * Validates a list of image files.
 *
 * @param fileList - Array of files selected by the user.
 * @returns -{files:[Files] | null, error:null|string}
 */
export function validateImageInput(fileList: File[]) {
  if (fileList.length === 0) {
    return { files: null, error: "No image selected" };
  }

  for (const item of fileList) {
    if (item.size > MAX_IMAGE_SIZE) {
      return { files: null, error: "Image too big" };
    }

    if (!ALLOWED_IMAGE_TYPES.includes(item.type)) {
      return { files: null, error: "Image wrong format" };
    }
  }

  return { files: fileList, error: null };
}

export function normalizeImageInput(files: File[], hasExistingImage: boolean) {
  // implemnt cumulator logic and Is main logic
  let filenormalised = files.map((item, index) => {
    return {
      file: item,
      previewUrl: URL.createObjectURL(item),
      /// TODO IMPLMEENT Ismain Logic

      isMain: !hasExistingImage && index == 0 ? true : false, // logic here
    };
  });
  return filenormalised;
}

export function addImages(prev: ImageItemType[], newImages: ImageItemType[]) {
  return [...prev, ...newImages].slice(0, MAX_PRODUCT_IMAGES);
}

export function prepareFormData(data: CreateDataForm, images: ImageItemType[]) {
  // create Formdata
  const formdata = new FormData();
  // set key    ( date: json({datahere},file1:file,file2:...))
  formdata.append("data", JSON.stringify(data));

  const imageList = images.map((image, index) => {
    return {
      key: `key${index}`,
      isMain: image.isMain,
    };
  });

  formdata.append("imagesdata", JSON.stringify(imageList));

  // add the key and fill loop
  images.forEach((image, index) => {
    formdata.append(`key${index}`, image.file);
  });

  return formdata;
}
