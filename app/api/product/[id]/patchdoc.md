# API Update Conventions

## PATCH Product — FormData Request Fields

## Create Product — FormData Request Fields

## PATCH Product — FormData Request Fields

| FormData key               | Type     | Expected content                                               |
| -------------------------- | -------- | -------------------------------------------------------------- |
| `data`                     | `string` | JSON string containing product fields to update                |
| `existingImages`           | `string` | JSON string containing an array of `{ publicId, isPrimary }`   |
| `newImages`                | `string` | JSON string containing an array of `{ key, isPrimary }`        |
| `image_0`, `image_1`, etc. | `File`   | Actual uploaded image files referenced by `key` in `newImages` |

### Notes

- `data` is optional for image-only updates, if permitted by the API.
- `existingImages` and `newImages` must be supplied together when updating images.
- Each `key` in `newImages` must match the corresponding FormData key containing the uploaded `File`.
- `publicId` identifies an existing Cloudinary image.
- `isPrimary` indicates whether an image should be the primary image.
- The backend must parse and validate the JSON strings, validate each uploaded file, and verify the final image collection before applying changes.

### Notes

- `data` and `imagesData` are JSON strings that must be parsed and validated.
- Each `key` in `imagesData` must match the corresponding `FormData` key containing the uploaded `File`.
- The `key` is a lookup key used to retrieve the file, not the Cloudinary `publicId`.
- Each image metadata entry contains a `key` and an `isMain` boolean.
- The backend must validate the metadata, ensure each referenced file exists, and validate each image's format and size.
  **Notes:**

- `data`, `existingImages`, and `newImages` contain JSON strings that must be parsed and validated.
- `existingImages` and `newImages` must be supplied together when updating images.
- Each `key` in `newImages` must match the FormData key containing its uploaded `File`.

## 1. General Partial Update Rules

| Request value                  | Meaning                       | Backend behavior                   |
| ------------------------------ | ----------------------------- | ---------------------------------- |
| Field missing                  | No change requested           | Leave the field unchanged          |
| Empty object `{}`              | No fields to update           | No data update                     |
| One valid field provided       | Update one field              | Update only that field             |
| Multiple valid fields provided | Update multiple fields        | Update only those fields           |
| Invalid field value            | Invalid request               | Return `400 VALIDATION_ERROR`      |
| Field explicitly set to `null` | Depends on the field's schema | Validate whether `null` is allowed |

## 2. PATCH Product — Image Update Rules

| `existingImages` | `newImages` | Meaning                        | Backend behavior                            |
| ---------------- | ----------- | ------------------------------ | ------------------------------------------- |
| Missing          | Missing     | No image changes requested     | Leave images unchanged                      |
| Missing          | Present     | Incomplete instructions        | Return validation error                     |
| Present          | Missing     | Incomplete instructions        | Return validation error                     |
| `[]`             | `[]`        | Final collection is empty      | Reject: at least one image is required      |
| `[A, B]`         | `[]`        | Keep existing images A and B   | Retain A and B                              |
| `[A]`            | `[B]`       | Keep A and add B               | Retain A and upload B                       |
| `[]`             | `[B]`       | Replace existing images with B | Upload B and remove omitted existing images |

## 3. PATCH Product — Image Validation Requirements

| Rule                     | Requirement                                         |
| ------------------------ | --------------------------------------------------- |
| Final image count        | Minimum 1, maximum 5                                |
| Main image               | Exactly one image must be marked as main            |
| Existing images          | Verify they belong to the product being edited      |
| New images               | Each metadata entry must reference an uploaded file |
| File validation          | Check allowed format and maximum file size          |
| Image removal            | The update service handles removing omitted images  |
| No image fields supplied | Do not modify existing images                       |

## 4. Important Distinction

- **Missing image fields:** Do not modify existing images.
- **Both image fields present:** They describe the complete desired image collection.
- **Only one image field present:** Return a validation error.
- **Empty array `[]`:** Explicitly means there are zero images in that category; it does not mean "leave unchanged."
- **Empty object `{}`:** Not a valid image collection. Image collections must be arrays.

The backend must validate the final image collection before applying changes to the database or Cloudinary.
