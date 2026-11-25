## PATCH /api/products/:id

### Purpose

Partially update a product and synchronize its images.

### Product fields

`product` is a JSON object containing optional product fields.

If a field is provided, it is updated.
If a field is omitted, the existing value is preserved.

### Existing images

`existingImages` represents the existing images that should remain associated
with the product.

- Field omitted → existing images are not modified.
- Field provided → the provided list becomes the desired existing image set.
- Empty array → remove all existing images.

### New images

`newImages` describes newly uploaded files and their metadata.

Each file is associated with a `key` such as `file0`, `file1`, etc.

### Example

FormData:

product:

```json
{
  "name": "Updated product",
  "description": "Updated description"
}
```
