# Products — READ Verification

## 1. Product List

| Test                | Expected Result                                                   | Status     |
| ------------------- | ----------------------------------------------------------------- | ---------- |
| Open product list   | Products belonging to the current company are displayed           | passed     |
| Product information | Product name and quantity are displayed correctly                 | passed     |
| Product images      | Correct product images are displayed                              | passed     |
| Empty product list  | Appropriate empty-state message is displayed                      | passed     |
| Pagination          | Moving between pages displays the correct products                | passed     |
| Last page           | No additional products are displayed beyond the available results | Not verify |

## 2. Product Details

| Test                          | Expected Result                                        | Status     |
| ----------------------------- | ------------------------------------------------------ | ---------- |
| Open a product from the list  | Correct product detail page is displayed               | Not tested |
| Product information           | Name, description and quantity are displayed correctly | Not tested |
| Product images                | Correct product images are displayed                   | Not tested |
| Primary image                 | Primary image is displayed correctly                   | Not tested |
| Navigate back to product list | User can return to the product list                    | Not tested |

## 3. Invalid or Missing Products

| Test                                        | Expected Result                              | Status     |
| ------------------------------------------- | -------------------------------------------- | ---------- |
| Open a nonexistent product ID               | Appropriate not-found handling is displayed  | Not tested |
| Open an invalid product ID                  | Appropriate invalid-ID handling is displayed | Not tested |
| Open a product belonging to another company | Product is not accessible                    | Not tested |

## 4. Verification Summary

- [ ] Product list verified
- [ ] Product details verified
- [ ] Product images verified
- [ ] Empty state verified
- [ ] Pagination verified
- [ ] Invalid and nonexistent products verified
- [ ] Company data isolation verified

**Testing method:** Manual functional verification through the application.

**Notes / Issues:**

- Record any bugs or unexpected behaviour discovered during verification.
