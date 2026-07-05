# Rundown: Agnostic QMS

**Date**: 2026-07-05

## Current State

- M2/Controlled documents implemented and verified.
- M1/Tenancy & standards remains implemented and verified.
- Engine requirements module exists with tree rollups and applicability governance.
- Engine documents lifecycle module exists with fixed state transitions, immutable official guard, official PDF requirement, and preparer/approver segregation.
- Convex M1 backend modules exist for organizations, standards, generic import, and applicability decisions.
- Convex M2 backend module exists for documents, document versions, typed requirement links, transitions, metadata immutability guard, and audit entries.
- Admin, Processes, Standards, Documents, and Dashboard pages now show MVP workflow surfaces instead of placeholders.
- Two generic standard-pack seed files exist under `seeds/standard-packs/`.

## Critical Technical Context

- Git repository is present at `/home/w182/w421/sistema_1`.
- Convex is not linked; temporary `convex/_generated/*` placeholders remain.
- Clerk env vars are not configured; local fallback remains active.
- UI currently uses demo data because live Convex provider/client wiring waits on Convex setup.
- Verification passed: typecheck, Vitest, agnosticism guard, lint, build, Playwright.
- Avoid running `next build` concurrently with Playwright; run them in series.

## Next Steps

1. Configure Convex with `npx convex dev` and regenerate Convex types.
2. Configure Clerk keys in `.env.local`.
3. Replace demo data with live Convex queries/mutations.
4. Start M3 controls and cycles only after explicit user request.

## Branch Status

- Branch: repository present
- Status: M2 changes committed after verification
- Pending changes: source documents may remain untracked if not intentionally added
