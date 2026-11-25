# TEST_PLAN.md

## 1. Purpose

This document tracks the actual testing progress of the inventory application.

It is a living checklist. Update it progressively while reviewing and testing each feature.

A test should only be marked `PASS` after it has actually been executed and the result matches expectations.

## 2. Test Status Definitions

- `PASS` — Test executed successfully; actual result matches expected result.
- `FAIL` — Test executed but actual result does not match expected result.
- `NOT TESTED` — Test has not yet been executed.
- `BLOCKED` — Test cannot be performed because of another issue.

## 3. Testing Workflow

For each feature:

1. Review the implementation.
2. Compare it with `PROJECT_DECISIONS.md`.
3. Execute the relevant tests.
4. Update `IMPLEMENTATION_STATUS.md`.
5. Update the corresponding test results in this document.

## 4. Authentication

### 4.1 Login

| Test                                         | Expected result                       | Status |
| -------------------------------------------- | ------------------------------------- | ------ |
| Login with valid credentials                 | User is authenticated                 | TESTED |
| Login with invalid credentials               | Login fails and an error is displayed | TESTED |
| Access protected page without authentication | User is redirected or denied access   | TESTED |

### 4.2 API Authentication

| Test                                         | Expected result  | Status     |
| -------------------------------------------- | ---------------- | ---------- |
| Call protected API without authentication    | 401 UNAUTHORIZED | NOT TESTED |
| Call protected API with valid authentication | Request proceeds | NOT TESTED |

## 5. Roles and Permissions

| Action               | Admin   | Staff   | Viewer  |
| -------------------- | ------- | ------- | ------- |
| View products        | Allowed | Allowed | Allowed |
| View product details | Allowed | Allowed | Allowed |
| View images          | Allowed | Allowed | Allowed |
| View stock history   | Allowed | Allowed | Allowed |
| Create product       | Allowed | Denied  | Denied  |
| Edit product         | Allowed | Denied  | Denied  |
| Delete product       | Allowed | Denied  | Denied  |
| Stock IN             | Allowed | Allowed | Denied  |
| Stock OUT            | Allowed | Allowed | Denied  |

### Permission tests

| Test                                           | Expected result     | Status     |
| ---------------------------------------------- | ------------------- | ---------- |
| Staff attempts product creation through API    | 403 FORBIDDEN       | NOT TESTED |
| Staff attempts product editing through API     | 403 FORBIDDEN       | NOT TESTED |
| Staff attempts product deletion through API    | 403 FORBIDDEN       | NOT TESTED |
| Viewer attempts stock movement through API     | 403 FORBIDDEN       | NOT TESTED |
| Unauthorized action through direct API request | API rejects request | NOT TESTED |

## 6. Company Data Isolation

### 6.1 Product Visibility

| Test                                             | Expected result                           | Status     |
| ------------------------------------------------ | ----------------------------------------- | ---------- |
| User views products belonging to their company   | Company products are returned             | NOT TESTED |
| User views products belonging to another company | Other company's products are not returned | NOT TESTED |
| User requests another company's product by ID    | 404 NOT_FOUND                             | NOT TESTED |

### 6.2 Product Operations

| Test                                                | Expected result     | Status     |
| --------------------------------------------------- | ------------------- | ---------- |
| Edit another company's product                      | Request is rejected | NOT TESTED |
| Delete another company's product                    | Request is rejected | NOT TESTED |
| Record stock movement for another company's product | Request is rejected | NOT TESTED |

## 7. Product Creation

<text>**Current progress: Product creation workflow verified.**</text>

### 7.1 Creation Workflow

| Test                                 | Expected result                                 | Status |
| ------------------------------------ | ----------------------------------------------- | ------ |
| Submit valid product information     | Product is created successfully                 | PASS   |
| Product appears in the product list  | Created product is visible                      | PASS   |
| Product details are stored correctly | Saved information matches submitted information | PASS   |

### 7.2 Validation and Business Rules

| Test                                              | Expected result      | Status |
| ------------------------------------------------- | -------------------- | ------ |
| Submit empty product name                         | Validation error     | PASS   |
| Submit invalid quantity                           | Validation error     | PASS   |
| Submit negative initial quantity                  | Validation error     | PASS   |
| Submit duplicate product name within same company | 409 CONFLICT         | PASS   |
| Submit a name already used by another company     | Creation is allowed  | PASS   |
| Send invalid data directly to API                 | 400 VALIDATION_ERROR | PASS   |

### 7.3 Initial Stock

| Test                                          | Expected result               | Status |
| --------------------------------------------- | ----------------------------- | ------ |
| Create product without quantity               | Quantity defaults to 0        | PASS   |
| Create product with positive initial quantity | Quantity is stored on product | PASS   |
| Create product with initial quantity          | No movement record is created | PASS   |

## 8. Product Listing and Details

### 8.1 Product Listing

| Test                     | Expected result                | Status     |
| ------------------------ | ------------------------------ | ---------- |
| View product list        | Products are displayed         | NOT TESTED |
| Navigate between pages   | Correct products are displayed | NOT TESTED |
| View empty product list  | Empty state is displayed       | NOT TESTED |
| Verify company filtering | Only company products appear   | NOT TESTED |

### 8.2 Product Details

| Test                     | Expected result                     | Status     |
| ------------------------ | ----------------------------------- | ---------- |
| Open an existing product | Correct details are displayed       | NOT TESTED |
| Open nonexistent product | Not-found handling is displayed     | NOT TESTED |
| Open invalid product ID  | Request is rejected safely          | NOT TESTED |
| View product images      | Images display correctly            | NOT TESTED |
| View current quantity    | Correct stock quantity is displayed | NOT TESTED |

## 9. Product Editing (PATCH)

| Test                                           | Expected result                                    | Status     |
| ---------------------------------------------- | -------------------------------------------------- | ---------- |
| Update product name only                       | Name changes; other fields remain unchanged        | NOT TESTED |
| Update description only                        | Description changes; other fields remain unchanged | NOT TESTED |
| Update name and description                    | Both fields change                                 | NOT TESTED |
| Submit no editable fields and no image changes | No unintended changes occur                        | NOT TESTED |
| Submit empty description                       | Behaviour follows nullable description rules       | NOT TESTED |
| Attempt to update quantity through PATCH       | Quantity is not changed                            | NOT TESTED |
| Submit invalid data                            | 400 VALIDATION_ERROR                               | NOT TESTED |
| Submit duplicate name                          | 409 CONFLICT                                       | NOT TESTED |
| Update nonexistent product                     | 404 NOT_FOUND                                      | NOT TESTED |

## 10. Product Images

### 10.1 Creation

| Test                               | Expected result                         | Status     |
| ---------------------------------- | --------------------------------------- | ---------- |
| Create with one image              | Image uploaded and associated           | NOT TESTED |
| Create with three images           | All images uploaded                     | NOT TESTED |
| Create without images              | Request rejected if images are required | NOT TESTED |
| Create with more than three images | Request rejected                        | NOT TESTED |
| Upload unsupported file type       | Request rejected                        | NOT TESTED |
| Upload image exceeding size limit  | Request rejected                        | NOT TESTED |

### 10.2 Editing

| Test                                   | Expected result                           | Status     |
| -------------------------------------- | ----------------------------------------- | ---------- |
| Update product without changing images | Existing images remain unchanged          | NOT TESTED |
| Add a new image                        | New image is included                     | NOT TESTED |
| Remove an existing image               | Removed image is excluded                 | NOT TESTED |
| Submit five images                     | Accepted if all image rules are satisfied | NOT TESTED |
| Submit more than five images           | Request rejected                          | NOT TESTED |
| Submit no primary image                | Request rejected                          | NOT TESTED |
| Submit multiple primary images         | Request rejected                          | NOT TESTED |
| Submit exactly one primary image       | Request accepted                          | NOT TESTED |

### 10.3 Image Cleanup

| Test                        | Expected result                             | Status     |
| --------------------------- | ------------------------------------------- | ---------- |
| Remove image during editing | Removed Cloudinary image is cleaned up      | NOT TESTED |
| Delete product with images  | Associated Cloudinary images are cleaned up | NOT TESTED |

## 11. Product Deletion

| Test                                 | Expected result                            | Status     |
| ------------------------------------ | ------------------------------------------ | ---------- |
| Admin deletes existing product       | Product is deleted                         | NOT TESTED |
| Staff attempts deletion              | 403 FORBIDDEN                              | NOT TESTED |
| Viewer attempts deletion             | 403 FORBIDDEN                              | NOT TESTED |
| Delete nonexistent product           | 404 NOT_FOUND                              | NOT TESTED |
| Delete product with movement history | Product and associated history are deleted | NOT TESTED |
| Delete product with images           | Associated images are cleaned up           | NOT TESTED |

## 12. Stock IN and OUT

### 12.1 Stock IN

| Test                     | Expected result                      | Status     |
| ------------------------ | ------------------------------------ | ---------- |
| Record valid stock IN    | Product quantity increases           | NOT TESTED |
| Record decimal quantity  | Quantity increases by decimal amount | NOT TESTED |
| Record zero quantity     | Request rejected                     | NOT TESTED |
| Record negative quantity | Request rejected                     | NOT TESTED |

### 12.2 Stock OUT

| Test                                         | Expected result                        | Status     |
| -------------------------------------------- | -------------------------------------- | ---------- |
| Record valid stock OUT                       | Product quantity decreases             | NOT TESTED |
| Record decimal quantity                      | Quantity decreases by decimal amount   | NOT TESTED |
| Record zero quantity                         | Request rejected                       | NOT TESTED |
| Record negative quantity                     | Request rejected                       | NOT TESTED |
| Record quantity greater than available stock | Quantity is allowed to become negative | NOT TESTED |

### 12.3 Movement Validation

| Test                                          | Expected result       | Status     |
| --------------------------------------------- | --------------------- | ---------- |
| Submit unsupported movement type              | Request rejected      | NOT TESTED |
| Submit valid movement type and quantity       | Movement is processed | NOT TESTED |
| Viewer attempts stock movement                | 403 FORBIDDEN         | NOT TESTED |
| Submit movement for nonexistent product       | 404 NOT_FOUND         | NOT TESTED |
| Submit movement for another company's product | Request rejected      | NOT TESTED |

## 13. Inventory Movement History

| Test                                | Expected result                          | Status     |
| ----------------------------------- | ---------------------------------------- | ---------- |
| Record stock IN                     | Corresponding movement record is created | NOT TESTED |
| Record stock OUT                    | Corresponding movement record is created | NOT TESTED |
| View product movement history       | Correct movements are displayed          | NOT TESTED |
| View history as Viewer              | History is accessible                    | NOT TESTED |
| Attempt to edit existing movement   | Operation is unavailable                 | NOT TESTED |
| Attempt to delete existing movement | Operation is unavailable                 | NOT TESTED |
| Delete associated product           | Its movement history is deleted          | NOT TESTED |

## 14. Stock Movement Atomicity

Movement creation and product quantity update must succeed or fail together.

| Test                                 | Expected result                 | Status     |
| ------------------------------------ | ------------------------------- | ---------- |
| Movement and quantity update succeed | Both changes are saved          | NOT TESTED |
| Movement creation fails              | Product quantity is not changed | NOT TESTED |
| Quantity update fails                | Movement record is not retained | NOT TESTED |

## 15. API Response and Error Handling

| Test                    | Expected result                            | Status     |
| ----------------------- | ------------------------------------------ | ---------- |
| Successful API request  | `{ data: ..., error: null }`               | NOT TESTED |
| Validation failure      | `{ data: null, error: { code, message } }` | NOT TESTED |
| Unauthenticated request | 401 UNAUTHORIZED                           | NOT TESTED |
| Forbidden request       | 403 FORBIDDEN                              | NOT TESTED |
| Missing resource        | 404 NOT_FOUND                              | NOT TESTED |
| Duplicate resource      | 409 CONFLICT                               | NOT TESTED |
| Unexpected server error | 500 INTERNAL_SERVER_ERROR                  | NOT TESTED |

## 16. Unit and Automated Tests

| Area                 | What to verify                                          | Status     |
| -------------------- | ------------------------------------------------------- | ---------- |
| PATCH schema         | Valid and invalid input                                 | NOT TESTED |
| PATCH form utilities | Optional fields and image data preparation              | NOT TESTED |
| Image normalization  | Existing image metadata is normalized correctly         | NOT TESTED |
| FormData preparation | Existing images and new files are represented correctly | NOT TESTED |
| API helpers          | Expected errors and return values                       | NOT TESTED |

## 17. Deployment Verification

| Test                   | Expected result                        | Status     |
| ---------------------- | -------------------------------------- | ---------- |
| Production build       | Build completes successfully           | NOT TESTED |
| Environment variables  | Required variables are configured      | NOT TESTED |
| Authentication         | Login and protected routes work        | NOT TESTED |
| Database connection    | Deployed application accesses database | NOT TESTED |
| Cloudinary integration | Upload and display work                | NOT TESTED |
| Main product workflows | Main operations work in production     | NOT TESTED |

## 18. Test Evidence

For important tests, record:

- Test file and test name, if automated.
- API endpoint and request payload, if applicable.
- Expected HTTP status and response.
- Actual browser behaviour.
- Console or server error, if any.
- Date of verification.

Do not mark a test as `PASS` simply because its code exists.

## 19. Related Documentation

- `PROJECT_OVERVIEW.md`
- `PROJECT_DECISIONS.md`
- `IMPLEMENTATION_STATUS.md`
- `API_CONTRACT.md`
- `API_ERRORS.md`
- `NEXT_TASKS.md`
