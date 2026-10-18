# ElectroGhar database

Versioned migrations in `migrations/` are the source of truth for the database schema.
They create the catalog, category hierarchy, blogs, indexes, timestamp triggers,
row-level policies, and public `uploads` storage bucket. The initial baseline can
also run against the existing manually initialized ElectroGhar.pk schema without
resetting tables or deleting data.

## Apply migrations

```sh
npx supabase login
npx supabase link --project-ref jllqmeialxfrwocryucy
npx supabase db push --dry-run
npx supabase db push
npx supabase migration list
```

For future changes, create a new migration with `npx supabase migration new name`.
Do not edit migrations that have already been applied.

## Local database

With Docker running:

```sh
npx supabase start
npx supabase db reset --local
```

Local resets use `seed-current.sql`, containing the current catalog and blog
fixtures with slug conflict protection. Production pushes do not load fixtures
unless seed inclusion is explicitly requested. Never reset the remote database
as part of a normal migration.

The older root SQL files are retained for reference. In particular,
`catalog-v2.sql` drops tables; use migrations instead of running that file.

Server credentials belong in the ignored `server/.env`. The browser must never
receive the service role key. Auth users and existing uploaded files are not
created or transferred by these migrations. The catalog/admin migration removes permissive authenticated write policies.
Catalog, blog, hero and upload writes go through the backend service role after
server-side token validation and an `app_metadata.role = "admin"` check.

## Default admin account

Schema migrations do not create Supabase Auth accounts. After applying migrations
and configuring `server/.env`, run:

```sh
cd server
npm run setup:admin
```

This creates and confirms `admin@electroghar.pk` only if it is missing. It preserves existing passwords and assigns the trusted admin role to the
configured account. A generated password is saved in the ignored, private
`server/.env.admin.local`; use it at `/admin/login` and change it from the admin
Users page. Alternatively set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in your environment
when running the command. Passwords are never embedded in migrations or logged.

The deployment backend must have the new project's `SUPABASE_URL`,
`SUPABASE_SERVICE_ROLE_KEY`, and `SUPABASE_ANON_KEY` environment variables.

## Category and hero upgrade

Apply `20261012180000_catalog_admin_hero.sql` with `supabase db push` after reviewing
`supabase db push --dry-run`. This changes category assignments, preserves all
products and product details, and keeps legacy categories inactive for reference.
Computer/display products are matched by brand; legacy accessories and gadgets
are moved into accessory groups. Review these assignments in the Products admin
screen, particularly miscellaneous gadgets. No remote migration was run by this
implementation.

Run `npm run setup:admin` from `server` for your designated `ADMIN_EMAIL` before
using the updated admin screens. Existing users need the trusted application
metadata role; user-editable metadata does not grant access. Log in again to
obtain a refresh token. Do not grant every existing Auth user an admin role.

Manage categories at `/admin/categories` and hero images at `/admin/hero-images`.
Category slugs stay fixed on edits; the display name, parent, order and activation
can change. Delete children first, and select a replacement category if products
are attached. Reassignment and deletion run in one database transaction.

Hero images use the existing public `uploads` bucket (5 MB per file). Upload a
desktop image and optionally a mobile image, then save. Multiple active images
rotate in order; an empty list uses the existing branded hero background. Removing
or replacing a hero removes its homepage reference; uploaded storage objects are
retained to avoid deleting files used elsewhere.

Validation: `npm run build`, `npm run lint --prefix client`, and
`npm test --prefix server`. Product drafts are saved per user/product in the tab's
session storage and restored after reauthentication in that same tab.
