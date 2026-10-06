import { CreateDataForm } from "../create/page";
import { ImageItemType } from "../create/page";

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
