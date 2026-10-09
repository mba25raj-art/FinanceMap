# Prototype Instructions

## Project decisions

- Use the light Statement Explorer mockup as the primary visual direction; maintain the shared workspace for the connection map and missions.
- Keep the user informed about decisions that affect navigation, content coverage, example data, or persistence.
- Preserve the master atlas IDs and distinguish financial relationships from preparation/navigation relationships.
- Label incomplete lessons as mapped topics. Use illustrative INR lakh company figures; do not imply they come from an actual company.
- Progress is session-only until cross-session storage is explicitly designed.

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

## Lesson expansion decisions

- Every one of the 698 stable concept IDs now has a foundational explanation, an illustrative worked example, and a quiz with feedback. This is introductory coverage, not a claim of complete professional courses for every specialist topic.
- Grouped lessons explain distinctions within the original heading. Keep domain analysis guides explicitly separate from topic-specific mechanics.
- Quizzes must include the data needed in their visible question or scenario. Never reveal the answer key before a selection.
- Practice filters use the latest session answer: unanswered, correct, or retry. Connected-question navigation prioritises existing atlas links and then the same domain.
- Hypothetical tax rates, ownership structures, and simplified examples must be labelled as assumptions; current legal or filing rules require country and period-specific primary sources.

## Detailed curriculum requirement

- The user requires clear explanations of mechanisms, types and distinctions, and comprehensive worked examples for every topic. Preserve short hover definitions, but do not treat them as complete lessons.
- Detailed lessons use authored, topic-specific material in `content/deep-lessons/*.deep`, with a case setup, sequential reasoning, result, interpretation, and application checklist. Broader domain guidance remains labelled separately. Track detailed coverage honestly until all IDs are expanded.

- Full lessons open by default and appear before the topic quiz. Keep the disclosure for quick practice and preserve short statement hover definitions. Detailed coverage is derived dynamically from authored files rather than hard-coded in the UI.

- All 698 IDs now have detailed topic material, using 678 authored topic records and explicit aliases for the 20 overlapping anchors. Require complete detailed coverage in tests. Continue to describe specialist material as introductory study coverage rather than complete professional manuals.
