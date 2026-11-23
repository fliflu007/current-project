## PATCH API Testing

**Test file:** `tests/products/patch.test.ts`

**Result:** 23 tests passed.

### 1. PATCH Validation Tests (13)

| Test                                           | Result |
| ---------------------------------------------- | ------ |
| Accept a PATCH containing only one new image   | PASS   |
| Accept a valid name update                     | PASS   |
| Accept a valid description update              | PASS   |
| Reject a request with no fields                | PASS   |
| Reject an invalid product ID                   | PASS   |
| Reject invalid JSON                            | PASS   |
| Reject a name shorter than 3 characters        | PASS   |
| Reject an empty update object                  | PASS   |
| Reject a request with only `existingImages`    | PASS   |
| Reject a request with only `newImages`         | PASS   |
| Reject invalid existing image metadata         | PASS   |
| Reject an invalid new image key                | PASS   |
| Reject an image update without a primary image | PASS   |

### 2. PATCH API Route Tests (10)

| Test                                                   | Result |
| ------------------------------------------------------ | ------ |
| Return 401 when the user is not authenticated          | PASS   |
| Return 403 when the user is not an admin               | PASS   |
| Return 404 when the product belongs to another company | PASS   |
| Return 404 when the product does not exist             | PASS   |
| Return 400 when validation fails                       | PASS   |
| Upload and add a new primary image                     | PASS   |
| Remove images no longer included in the request        | PASS   |
| Successfully update product details                    | PASS   |
| Return 500 when the database update fails              | PASS   |
| Return 500 when the Cloudinary upload fails            | PASS   |

### 3. PATCH UI Verification

| Check                                 | Result |
| ------------------------------------- | ------ |
| Existing product data loads correctly | PASS   |
| Existing images display correctly     | PASS   |
| Add new images                        | PASS   |
| Remove existing images                | PASS   |
| Select primary image                  | PASS   |
| Prevent removal of the last image     | PASS   |
| Submit updated product information    | PASS   |
| Updated images persist after refresh  | PASS   |
| Validation errors display correctly   | PASS   |

**Total: 23 automated tests passed + 9 UI verification checks passed.**
