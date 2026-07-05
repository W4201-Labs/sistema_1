# Rundown: Agnostic QMS

**Date**: 2026-07-05

## Current State

- M3 controls and cycles implemented on branch `m3`.
- Pull request opened: https://github.com/W4201-Labs/sistema_1/pull/3
- M2 controlled documents remains implemented and verified.
- Engine now supports data-first control rules and workflow/closure evaluation.
- Convex now has tenant-scoped modules for controls, evaluations, workflows, audit cycles, and snapshots.
- Controls and Cycles pages now show MVP workflow surfaces instead of placeholders.

## Critical Technical Context

- Convex is not linked; temporary `convex/_generated/*` placeholders remain.
- Clerk env vars are not configured; local fallback remains active.
- UI uses demo data because live Convex provider/client wiring waits on Convex setup.
- Verification passed: typecheck, Vitest, lint, agnosticism guard, build, Playwright.
- Avoid running `next build` concurrently with Playwright; run them in series.
- Pre-existing untracked planning/source docs and `tsconfig.tsbuildinfo` are still intentionally uncommitted.

## Next Steps

1. Configure Convex with `npx convex dev` and regenerate Convex types.
2. Configure Clerk keys in `.env.local`.
3. Replace demo data with live Convex queries/mutations.
4. Start M4 readiness, coverage, and dashboard only after explicit user request.

## Branch Status

- Branch: `m3`
- Status: pushed to `origin/m3`; PR #3 open against `phase-m2-controlled-documents`.
- Pending changes: pre-existing untracked planning/source docs and `tsconfig.tsbuildinfo` only.
