# NEXT_TASKS.md

## 1. Current Objective

Complete the inventory application audit, verify the main functionality, fix identified issues, and prepare the project for portfolio presentation.

The goal is to reach a stable, demonstrable application with reliable documentation and deployment evidence.

## 2. Current Focus

**Phase: Implementation Review and Testing**

Review the existing implementation and test each feature progressively.

Do not assume a feature is complete just because it exists in the code.

## 3. Priority Tasks

### Priority 1 — Complete Functional Review

Review and verify the main application areas.

| Area                       | Status      |
| -------------------------- | ----------- |
| Product creation           | COMPLETED   |
| Product listing            | COMPLETED   |
| Product details            | NOT STARTED |
| Product editing (PATCH)    | NOT STARTED |
| Product images             | NOT STARTED |
| Product deletion           | NOT STARTED |
| Stock IN                   | NOT STARTED |
| Stock OUT                  | NOT STARTED |
| Inventory movement history | NOT STARTED |
| Authentication             | NOT STARTED |
| Roles and permissions      | NOT STARTED |
| Company data isolation     | NOT STARTED |

Update statuses as work progresses.

### Priority 2 — Fix Identified Issues

- Fix bugs discovered during implementation review.
- Correct inconsistent API behaviour.
- Verify validation and error handling.
- Check database operations and data consistency.
- Verify image upload and cleanup behaviour.
- Verify role and company access restrictions.

Only add specific tasks when an issue is actually identified.

### Priority 3 — Automated Testing

- Review existing Vitest tests.
- Identify important untested helpers and API behaviour.
- Add tests where useful.
- Verify test results.
- Consider Playwright for important end-to-end workflows.

### Priority 4 — Production Readiness

- Verify production build.
- Review environment variable configuration.
- Check production database connectivity.
- Verify authentication in deployment.
- Verify Cloudinary integration.
- Deploy or update the application on Vercel.
- Test the deployed application.

### Priority 5 — Portfolio Preparation

- Review and improve GitHub README.
- Document project features and architecture.
- Explain authentication, roles and company isolation.
- Include screenshots of important workflows.
- Provide a working deployment link.
- Explain testing approach and verification evidence.
- Clean up unnecessary development files and code.

## 4. Current Session / Daily Progress

Record what was accomplished during the latest working session.

| Date | Work completed | Remaining issues |
| ---- | -------------- | ---------------- |
|      |                |                  |

## 5. Known Issues

Record actual problems discovered during review.

| Issue             | Area | Priority | Status |
| ----------------- | ---- | -------- | ------ |
| None recorded yet | —    | —        | —      |

## 6. Next Immediate Task

Continue reviewing Product Creation and its remaining validation and business-rule tests.

After that, proceed to Product Listing.

## 7. Completion Criteria

The inventory project is ready for portfolio presentation when:

- Main user workflows have been reviewed and verified.
- Important business rules work as expected.
- Authentication and permissions have been checked.
- Company data isolation has been verified.
- Important automated tests pass.
- Known critical bugs are resolved.
- Production build succeeds.
- Application is deployed and accessible.
- README and project documentation are clear.

## 8. Related Documentation

- `PROJECT_OVERVIEW.md`
- `PROJECT_DECISIONS.md`
- `IMPLEMENTATION_STATUS.md`
- `TEST_PLAN.md`
- `API_CONTRACT.md`
- `API_ERRORS.md`
