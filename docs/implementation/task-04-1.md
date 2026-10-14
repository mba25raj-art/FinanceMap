# Task 04.1 — Define the lesson structure

The authoring standard now specifies how a complete concept explanation and integrated practice fit together. It preserves short hover entries and substantial full reading, while keeping topic mechanics, domain guidance and optional specialist depth distinct.

## Deliverables

- `docs/lesson-standard.md`: lesson anatomy, objective/evidence rules, example units and assumptions, framework metadata, abbreviations, independent practice, misconceptions, connections, hints, editorial review and legacy migration boundaries.
- `content/standards/lesson-package.v1.template.json`: reusable authoring field layout with explicit unfinished placeholders.
- `content/standards/examples/accounting-equation.v1.json`: a non-published, draft format example. Its worked example, checkpoint and transfer task are separate scenarios. The numerical identities were independently recomputed in the contract tests. It is not the receivables anchor rewrite or a cumulative Nila case ledger.
- `scripts/lesson-standard.mjs`: authoring validation with a direct CLI. Incomplete placeholders, unknown concept/edge IDs, missing question data, unsupported reveal policies, mistaken relationship classification and false activity availability fail. Structural success explicitly does not confer financial review or publication approval.
- `tests/lesson-standard.test.mjs`: six checks of populated/draft packages, incomplete templates, scenario separation and assessment references, master links, framework/editorial metadata and activity availability.

## Scope and acceptance

The roadmap, page 7, requires a template with a short definition, objective, mechanism, types, worked example, independent attempt, misconceptions and deeper material. It also requires separate domain guidance and explicit units, assumptions, reporting framework and abbreviations. All are specified in the standard and represented in the authoring contract.

Newly converted lessons have an interleaved checkpoint and a changed-data or changed-context transfer attempt. Solutions must be gated by an attempt or deliberate hint; first/latest evidence, assistance and self-check reflection are described honestly. The future renderer must implement these behaviours when a package is integrated. This task does not claim those new lesson interactions are already active.

The current `.lesson`/`.deep` compiler and all 698 existing detailed introductory lessons remain in use. The new package is not imported by the website. The next anchor lesson is receivables (04.2); the coverage register is 04.3. Sample review precedes the batches in 04.4. The reconciled three-lab scope is customer collection, equipment investment and financing comparison; they remain planned.

## Validation

- Six lesson-standard tests and the populated-package CLI pass.
- The complete content/session/navigation/contract suite passes 26 tests, including all 698 detailed lesson renders and preserved master IDs/trails.
- Production build and all four hosting checks pass. Hosting scaffold is unchanged.
- The local Atlas entry was opened in Chrome and loads normally. This is a smoke check, not validation of the future interleaved lesson renderer.
- No additional dependencies, simulation model, persistence or publication were introduced. Vite still reports the existing large content bundle.

Saved to the existing draft PR #1. Next in logical order: 04.2 — Rewrite the first anchor lesson, using receivables.
