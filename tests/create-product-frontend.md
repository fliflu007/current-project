# CREATE Product — Testing Checklist

## 1. Frontend Validation Tests

| Validation                 | Expected Behaviour    | Result |
| -------------------------- | --------------------- | ------ |
| Name minimum 3 characters  | Reject                | Passed |
| Name maximum 25 characters | Reject                | Passed |
| Description optional       | Allow empty           | Passed |
| Zero images                | Show validation error | Passed |
| Duplicate product name     | Show submission error | Passed |
| Negative quantity          | Show validation error | Passed |

## 2. Postman API Tests

| API Test                       | Expected Behaviour                 | Result |
| ------------------------------ | ---------------------------------- | ------ |
| Valid product data             | Product created successfully (201) | passed |
| Name shorter than 3 characters | Reject (400)                       | passed |
| Name longer than 25 characters | Reject (400)                       | passed |
| Negative quantity              | Reject (400)                       | passed |
| Missing required name          | Reject (400)                       | passed |
| No images                      | Reject (400)                       | passed |
| Unauthenticated request        | Reject (401)                       | passed |
| Duplicate product name         | Reject (409)                       | passed |

## 3. Vitest Automated Tests

**Target:** Create Product Zod schema validation

| Automated Test                 | Expected Behaviour | Result |
| ------------------------------ | ------------------ | ------ |
| Valid product data             | Accept validation  | pass   |
| Name shorter than 3 characters | Reject validation  | pass   |
| Name longer than 25 characters | Reject validation  | pass   |
| Negative quantity              | Reject validation  | pass   |
| Missing required name          | Reject validation  | pass   |

### Vitest Completion Criteria

- [ x] All five tests implemented.
- [ x] All tests pass.
- [ ] Tests committed to GitHub.
- [ x] Able to explain what each test verifies.

---

## Testing Summary

| Testing Method           | Purpose                                             |
| ------------------------ | --------------------------------------------------- |
| Frontend manual testing  | Verify user experience and frontend validation      |
| Postman API testing      | Verify API responses, validation and authentication |
| Vitest automated testing | Verify Zod validation rules automatically           |

**Goal:** Demonstrate that Create Product works correctly, rejects invalid data and has basic automated test coverage.
