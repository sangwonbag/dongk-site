# Security hardening — 2026-11-17

Scope: dongk-site and Supabase project DK-Floor. This document records production changes and unresolved work. Do not treat this document as evidence that the application is fully secured.

## Changes applied directly to production Supabase

1. Saved baseline RLS policy definitions and role grants in a non-exposed, access-restricted `dk_security_audit` schema:
   - `policy_snapshot_20261117`: 43 original policy rows
   - `grants_snapshot_20261117`: 84 original grants rows
   - The snapshots do not copy customer data or credentials.
2. Removed anonymous Storage INSERT/UPDATE policies on `storage.objects` for bucket `materials`.
3. Revoked direct anonymous/authenticated execution of the internal `public.handle_new_user()` SECURITY DEFINER trigger function.
4. Fixed `search_path` for `public.make_order_no()` and `public.set_updated_at()`.
5. Removed unrestricted public DELETE RLS policies from `products`, `materials`, `inquiries`, `orders`, and `order_items`.
6. Removed unrestricted public UPDATE on `profiles` and added an invoker trigger to reject changes to `profiles.role` from `anon` and `authenticated`, including setting privileged roles on INSERT.

Verified after applying: Storage anonymous write policies=0; public DELETE policies for listed tables=0; unrestricted profile UPDATE policy=0; profile role guard trigger enabled; internal trigger not callable directly; security adviser warnings for those functions were resolved; product/profile/inquiry row counts unchanged.

## Critical unresolved risks — do not defer

- **Legacy authentication:** `src/lib/auth.js` compares unsalted SHA-256 password hashes in the browser and trusts data stored in localStorage. There are legacy profiles, including the only administrator, not linked to Supabase Auth. Disabling anonymous profile SELECT before migrating these accounts would immediately break login. Plan: enroll users in Supabase Auth (reset passwords; never bulk-import existing SHA-256 hashes), authorize administrators server-side, switch all client sessions to validated Auth tokens, then remove exposed password hashes and public profile policies.
- **Sensitive table data exposure:** `profiles`, `inquiries`, `orders`, and `order_items` still have unrestricted public SELECT policies. `products`, `inquiries`, and `orders` still have unsafe public INSERT/UPDATE policies. These MUST be closed once protected replacements exist; RLS ENABLED does not make `USING (true)` policies safe.
- **Admin CRUD:** Current legacy admin operations call Supabase Data API directly with a publishable/anon key. Before tightening those writes, implement admin-only RPCs or a server-side API validated with Supabase Auth. Never embed a secret or service_role key in Vite (`VITE_*`) variables.
- **Guest checkout/inquiries:** Move creation/confirmation to narrowly authorized server endpoints or reviewed secure RPCs with field validation and rate limits. Preserve the ability to submit a guest inquiry without exposing the inquiry table.
- **Storage authenticated uploads:** Current authenticated image policies check only the session role, not privileged membership. Add an administrator check before granting image writes.
- **Supabase Auth:** Leaked password protection is currently disabled; enable it in the Auth dashboard.
- **GitHub:** Public repo's `main` branch is unprotected and no rulesets are present. Enable required PR reviews, status checks, disallow force pushes/deletion, secret scanning and push protection where available. GitHub project settings cannot be changed through this repository patch.
- **Vercel:** Keep preview deployment protection; scope credentials by environment; never put privileged credentials in `VITE_*`. Review firewall and API rate limiting separately.

## Safe rollout sequence

1. Set up a separate Supabase Auth admin identity with secure recovery/MFA, and verify it can administer the site.
2. Update UI and APIs to validate Auth sessions and ownership, not localStorage flags.
3. Deploy new login/admin/inquiry/order API flow; validate checkout, guest inquiries, customer order history, admin CRM and images using real preview accounts.
4. Remove permissive RLS policies and excessive `anon` / `authenticated` grants in a transaction. Specifically revoke public SELECT on private tables and public UPDATE on operational tables; keep public SELECT on active catalog rows only.
5. Run negative permission tests with truly unauthenticated clients, ordinary signed-in users, and admins. Check `products`, `inquiries`, `orders`, `order_items`, `profiles`, `materials`, Storage buckets and RPC functions.
6. Force password resets of all legacy accounts and retire the old password column and legacy login code. Rotate any credential that may have been exposed.
7. Verify privacy exposure via available access logs; do not claim historical data were not read solely because policies are fixed.

**Operational caution:** The production database still contains HIGH-SEVERITY issues. This first phase does NOT close the customer PII read exposure or unrestricted product updates. Do not roll back by restoring permissive policies from the private snapshot without an incident/recovery review.
