# Task 04.3 — Topic coverage register

The register now contains one record for each of the 698 stable concept IDs. It links existing explanations, worked examples and quizzes to their source files, preserves the 20 deep-reading aliases, and identifies the 30 first-release concepts in their six ordered five-concept batches. Exact titles, outcome IDs and applied scopes were recovered from version 6 of the implementation backlog.

## What the register establishes

- All 698 concepts have existing detailed introductory material and topic quizzes. Historical `Mapped` / `Not authored` labels in the master inventory are not used as current evidence of authored coverage.
- A02 and T06.04 render one integrated receivables package with three shared practice questions. The package remains a draft. The unpublished accounting-equation authoring fixture does not count as an integrated lesson.
- No concept is automatically marked editorially reviewed. The package's explicit review metadata and any future documented legacy reviews remain separate from existence and structural validation. Specialist completeness is unassessed outside an explicitly scoped package.
- P02 has three implemented assessed concepts: A05, A08 and A11. Optional reference lessons and the 24 reading trails do not create applied-assessment coverage. The three labs and six-round Nila case remain planned, with no playable route. Planned application links are visible independently of current coverage.
- All 2,520 edge IDs, endpoints, types, directions, explanations and conditions are preserved. The 2,127 learning links remain separate from the 393 financial relationships. No conceptual edge is asserted to be an implemented model dependency.

## Refresh and inspect

`npm run prepare:content` regenerates the structured register, concept and relationship CSVs and the domain/batch summary. `npm run check:coverage` recomputes them without writing and rejects stale files. A source fingerprint covers the compiled content, inventory, aliases, release selection, policy and integrated packages.

See [the generated summary](../topic-coverage.md), [concept CSV](../topic-coverage.csv), [relationship CSV](../relationship-coverage.csv) and [structured register](../../content/coverage-register.json). The authored integration/activity policy is `content/coverage-policy.json`; the verified first-release selection is `content/first-release-scope.json`. These records are authoring and review tools. This task does not change learner navigation, session progress or the financial model.

## Verification

- 38 content, route, session, lesson and coverage tests pass, including the rendered checks for all 698 existing lessons. New checks cover missing-content gaps, unsupported review claims, canonical practice identities, exact selection, activity availability, relationship preservation and deterministic regeneration.
- Production build and all four hosting checks pass. Hosting scaffold is intact. The existing large-bundle notice remains.
- The local development server starts. This environment's browser cannot reach the local preview (`ERR_CONNECTION_REFUSED`), so no new interactive browser verification is claimed. This task changes no rendered UI or authored financial lesson. Existing SSR journey and solution-protection checks pass.

The repository and latest persisted workbook both stopped at 04.2 when recovered. An earlier conversation reported 04.3 work in progress, but no corresponding commit or workbook update had been saved. This task supplies that missing implementation and evidence. All changes remain on the existing draft PR branch. Nothing is merged or deployed.

Next in the strict task order: 04.4, beginning with batch B1 — the accounting equation, cash versus accrual accounting, cash and cash equivalents, revenue recognition and trade receivables. The existing receivables sample still needs depth/density review when preparing that batch. Parent completion requires evidence for all six batches.
