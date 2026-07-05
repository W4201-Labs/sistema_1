# Rundown: Agnostic QMS

**Date**: 2026-07-05

## Current State

- M1/Tenancy & standards implemented and verified.
- Engine requirements module exists with tree rollups and applicability governance.
- Convex M1 backend modules exist for organizations, standards, generic import, and applicability decisions.
- Admin, Processes, Standards, and Dashboard pages now show M1 workflow surfaces instead of placeholders.
- Two generic standard-pack seed files exist under `seeds/standard-packs/`.

## Critical Technical Context

- No Git repository is present at `/home/w182/w421/sistema_1`.
- Convex is not linked; temporary `convex/_generated/*` placeholders remain.
- Clerk env vars are not configured; local fallback remains active.
- UI currently uses demo data because live Convex provider/client wiring waits on Convex setup.
- Verification passed: typecheck, Vitest, agnosticism guard, lint, build, Playwright.
- Avoid running `next build` concurrently with Playwright; run them in series.

## Next Steps

1. Configure Convex with `npx convex dev` and regenerate Convex types.
2. Configure Clerk keys in `.env.local`.
3. Replace M1 demo data with live Convex queries/mutations.
4. Start M2 documents lifecycle only after explicit user request.

## Branch Status

- Branch: Not a git repository
- Status: Not a git repository
- Pending changes: unavailable because this workspace is not inside Git
