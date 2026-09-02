# Tests

## Current Test Database Setup

Integration tests currently use a development Supabase database and
a hardcoded company ID:

`7c02bbc9-8053-459e-9d09-90cb9927c78d`

This is temporary.

During the AUTH phase, the test setup will be updated to automatically
create the required test user, profile, company, and related data.

### Important

If you clone this repository, the integration tests require your own
Supabase/PostgreSQL test database and environment variables.

Do not use the original development database credentials.
