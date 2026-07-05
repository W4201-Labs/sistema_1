# Rundown: Agnostic QMS

**Date**: 2026-07-05

## Current State

- M2/Controlled documents implemented, verified, and committed as `d6a601f feat(documents): implement M2 lifecycle`.
- M1/Tenancy & standards remains implemented and verified.
- Engine documents lifecycle module exists with fixed state transitions, immutable official guard, official PDF requirement, and preparer/approver segregation.
- Convex M2 backend module exists for documents, document versions, typed requirement links, transitions, metadata immutability guard, and audit entries.
- Admin, Processes, Standards, Documents, and Dashboard pages now show MVP workflow surfaces instead of placeholders.

## Critical Technical Context

- Branch `main` is ahead of `origin/main` by 3 commits.
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

- Branch: `main`
- Status: ahead of `origin/main` by 3 commits
- Pending changes: saver log updates plus pre-existing untracked planning/source docs and `tsconfig.tsbuildinfo`
