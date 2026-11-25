# 01 — CREATE Product Verification

**Feature:** Create a new product

## 1. Manual Verification

| Check                                          | Result |
| ---------------------------------------------- | ------ |
| Valid product creation                         | PASS   |
| Required fields are validated                  | PASS   |
| Invalid quantity is rejected                   | PASS   |
| Unauthenticated request is rejected            | PASS   |
| Product is associated with the current company | PASS   |
| Product appears correctly in the product list  | PASS   |
| Product images upload correctly                | PASS   |
| Duplicate product name displays an error       | PASS   |

## 2. Automated Verification — Vitest

### A. Zod Schema Validation

| Test                           | Expected Behaviour | Result |
| ------------------------------ | ------------------ | ------ |
| Valid product data             | Accept validation  | PASS   |
| Name shorter than 3 characters | Reject validation  | PASS   |
| Name longer than 25 characters | Reject validation  | PASS   |
| Negative quantity              | Reject validation  | PASS   |
| Missing required name          | Reject validation  | PASS   |

**Result: 5 tests passed.**

### B. CREATE API Route Tests

**Test file:** `tests/products/create.product.api.test.ts`

| Test                         | Expected Result           | Status |
| ---------------------------- | ------------------------- | ------ |
| Create product successfully  | 201 Created               | PASS   |
| Unauthenticated user         | 401 Unauthorized          | PASS   |
| Staff user attempts creation | 403 Forbidden             | PASS   |
| Invalid product data         | 400 Validation Error      | PASS   |
| Duplicate product name       | 409 Conflict              | PASS   |
| Missing image data           | 400 Validation Error      | PASS   |
| Unexpected database error    | 500 Internal Server Error | PASS   |

**Result: 7 tests passed.**

## 3. Testing Summary

| Testing Method          | Purpose                                                                             |
| ----------------------- | ----------------------------------------------------------------------------------- |
| Frontend manual testing | Verify user experience and frontend validation                                      |
| Postman API testing     | Verify API responses and behaviour during development                               |
| Vitest schema tests     | Verify Zod validation rules automatically                                           |
| Vitest API route tests  | Verify authentication, authorization, validation, business rules and error handling |

## 4. Issues Discovered

- None currently recorded.

## 5. Fixes Applied

- None currently recorded.

## 6. Final Result

**Status: PASS**

- Manual verification: PASS
- Automated schema validation: PASS (5 tests)
- Automated API route testing: PASS (7 tests)

**Total: 12 automated tests passed, plus manual verification.**

Create Product has passed the documented manual checks and automated tests.
