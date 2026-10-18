# Verification — 2026-10-18

The configured database is `jllqmeialxfrwocryucy.supabase.co`. Read-only API checks against it returned 67 active products, 38 categories, 8 published blogs and 4 blog categories. Product list, Dell search (11 matches), laptops filter (20 matches), featured products, brands, autocomplete and product detail all returned HTTP 200. An unauthenticated admin product request returned 401.

The live site at https://www.electroghar.pk returns only 3 active products. None of their IDs match the configured database's 67 active products. Production therefore does not currently expose the intended catalog. Deployment environment access is needed to establish the precise cause. Verify Vercel Production SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and SUPABASE_ANON_KEY all belong to the intended project, then redeploy. Local .env changes do not update deployment settings.

Local fixes:
- Resolve server/.env relative to the backend module, so root-level/serverless startup loads it consistently while preserving deployment environment precedence.
- Require trusted app_metadata.role=admin for login and every protected endpoint. Newly created administrators receive that role. Existing designated administrators must have it assigned through Supabase's trusted admin interface before deployment; ordinary accounts must not be promoted automatically.
- Document the correct frontend API path (/api), Node >=22 requirement, and Render origins/anon key.
- Display product fetch errors with a retry action rather than presenting a failed request as an empty catalog.
- Include directly assigned parent-category products on homepage shelves and recommendations.
- Propagate category product-count query failures.

Validation: frontend production build passed; frontend lint returned no errors and 15 existing warnings. Admin middleware regression test covers missing token, invalid token, ordinary user (including forged user_metadata role), and trusted administrator. API integration checks used Node 20's experimental WebSocket flag because this machine lacks Node 22. Normal startup on Node 20 fails with the installed Supabase SDK; use Node 22+ for deployment.

Remaining verification: browser interaction/visual checks, authenticated admin login and write/upload flows were not performed. No production settings, database rows, Auth accounts or storage objects were changed. No deployment was performed.

Additional issue: legacy SQL setup scripts grant writes to all authenticated users via permissive RLS policies. Backend role checks do not fix direct database access. Inspect actual remote policies and replace permissive policies with trusted admin-role checks before production approval; local SQL files alone do not establish which remote policies are installed.
