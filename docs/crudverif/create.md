# Create Product Verification

## 1. Expected Behaviour

- Product can be created.
- Required fields are validated.
- Product is saved in the database.
- Images are uploaded correctly.

## 2. Manual Verification

| Check                   | Status | Notes |
| ----------------------- | ------ | ----- |
| Valid product creation  | PASS   |       |
| Missing required fields | PASS   |       |
| Invalid quantity        | PASS   |       |
| Unauthenticated request | PASS   |       |
| Company association     | PASS   |       |
| Product appears in list | PASS   |       |
| Image upload            | PASS   |       |

## 3. Automated Verification (Vitest) => CHECK file

| Automated Test                 | Expected Behaviour | Result |
| ------------------------------ | ------------------ | ------ |
| Valid product data             | Accept validation  | PASS   |
| Name shorter than 3 characters | Reject validation  | PASS   |
| Name longer than 25 characters | Reject validation  | PASS   |
| Negative quantity              | Reject validation  | PASS   |
| Missing required name          | Reject validation  | PASS   |

## 4. Automated API Behaviour Tests

[View CREATE API tests](../../tests/products/create.product.api.test.ts)

**Result: 7 tests passed**

| Test                         | Expected Result           | Status |
| ---------------------------- | ------------------------- | ------ |
| Create product successfully  | 201 Created               | PASS   |
| Unauthenticated user         | 401 Unauthorized          | PASS   |
| Staff user attempts creation | 403 Forbidden             | PASS   |
| Invalid product data         | 400 Validation Error      | PASS   |
| Duplicate product name       | 409 Conflict              | PASS   |
| Missing image data           | 400 Validation Error      | PASS   |
| Unexpected database error    | 500 Internal Server Error | PASS   |

## 5. Issues Discovered

- None

## 6. Fixes Applied

- None

## 7. Final Result

**Status: PASS**

- Manual verification: PASS
- Automated verification (Vitest): PASS

Create Product has passed the documented manual checks and existing automated validation tests.
