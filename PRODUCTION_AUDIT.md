# Production audit and repair plan

Audit date: 2026-10-12. Scope: read-only review of repository configuration and public production responses. No production settings, data, users, or deployments were changed.

## Findings

1. **The live frontend matches the local build.** The JavaScript served from `https://www.electroghar.pk/assets/index-D19co0Ob.js` and the local `client/dist` file have identical SHA-256 hashes: `1660bb3a1a38d33c5a18e5612585b6ab48f42b2aeddf8a54c43ea624508517b7`. Both use `/api`. The domain serves Vercel responses, and `/api/health` returns 200. An old frontend build or external frontend API destination is therefore unlikely to explain this incident.

2. **Production data references the previous Supabase project.** `/api/products?limit=2` returns products with image URLs under `fbkdvndgufctuitlvmxn.supabase.co`. Local `server/.env` targets `jllqmeialxfrwocryucy.supabase.co`; its legacy JWT key project references match that local URL. The likely cause is stale Vercel Production Supabase environment variables. This is not yet proven: imported rows can retain old storage URLs even when served by the new database. The actual deployed environment must be inspected to distinguish these cases.

3. **Deployment variables override the local env file.** `server/src/config/supabase.js` loads `server/.env` through dotenv without `override`. Existing runtime variables take precedence. The local env file is ignored by Git, so changing it does not update Vercel's environment. Database queries, password login, and token validation all use the backend's selected project.

4. **Admin access requires trusted metadata.** Login and protected routes require `user.app_metadata.role === "admin"`. An existing Auth account without this role receives 403. An account absent from the selected project cannot log in; a token issued by the previous project cannot authenticate against the new one. Schema migrations do not transfer Auth users or uploaded objects. The existing `setup:admin` script provisions/promotes the designated account and preserves an existing password.

5. **The production frontend env example is misleading for this deployment.** `client/.env.production.example` sets `VITE_API_URL=https://api.electroghar.pk`, without `/api`. Requests append `/products` and `/admin/login`, while Express routes require `/api/products` and `/api/admin/login`. The current live build correctly uses `/api`, so this is a future configuration hazard, not the current observed cause.

6. **Health does not establish database correctness.** `/api/health` only reports Express availability. `/api/logo` returns `{ "url": null }`, and `/api/hero-images` returns an empty array. Neither proves a project mismatch; missing hero tables are deliberately converted to an empty list.

7. **CORS accepts the current www origin.** A request with `Origin: https://www.electroghar.pk` received 200 and the corresponding allow-origin header. The observed problem is not a rejection of this origin.

## Repair plan, in order

1. Inspect the Vercel project serving both `electroghar.pk` and `www.electroghar.pk`: production deployment commit, domain assignment, root directory, and Production-scoped environment variables. Check for branch-specific overrides. Record the current settings for rollback without copying secrets into reports.
2. Compare production `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `SUPABASE_ANON_KEY` against the intended project `jllqmeialxfrwocryucy`. All three must belong to that project. If they already match, compare a known product/category between production and the intended database; investigate copied old data and storage links instead of assuming a connection mismatch.
3. Review migration history on the intended project and run a migration dry-run. Apply only missing versioned migrations after reviewing their effects. Never run the destructive legacy `catalog-v2.sql` or reset the remote database. Decide explicitly which catalog data and storage objects must be retained/transferred; schema migration alone does not copy them.
4. Verify the intended admin accounts exist in the intended project's Auth service and have `app_metadata.role = "admin"`. Run the existing setup script against verified project credentials for each designated administrator as needed. Retain the protected main account `admin@electroghar.pk`; custom email accounts do not acquire main-admin management permissions automatically. Do not grant all Auth users administrator access.
5. Correct Vercel Production variables if mismatched. Use `VITE_API_URL=/api` for this single-domain deployment, `NODE_ENV=production`, and `CLIENT_URL=https://electroghar.pk,https://www.electroghar.pk`. Rebuild and redeploy the intended commit; changing a Vite variable requires a new build. Update the production env example to document this configuration.
6. Clear saved admin sessions on the live origin and log in again. Verify public catalog/category/hero responses match the intended data, admin login succeeds, protected reads succeed, and a reversible admin edit/upload works. Confirm ordinary users still receive 403 and unauthenticated requests receive 401. Verify both apex and www routing.
7. Add safe deployment diagnostics: log the non-secret Supabase hostname and deployment revision at startup, validate required production credentials, and provide a database readiness check separate from process health. This makes future project drift visible without exposing keys.

## Verification limits

Vercel account settings, actual production credential values, intended database migration history, and production Auth users were not accessible through the public endpoints reviewed. Admin passwords were not submitted and no authentication attempts were made. Local server tests could not run because `npm` is unavailable in this shell. The public asset comparison and HTTP checks did run successfully.
