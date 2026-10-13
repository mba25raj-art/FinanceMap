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
- Practice filters use the current session selection: unanswered, correct, or retry. Clearing a selection with Retry puts the question back in unanswered; the submitted-answer history remains in My learning. Connected-question navigation prioritises existing atlas links and then the same domain.
- Hypothetical tax rates, ownership structures, and simplified examples must be labelled as assumptions; current legal or filing rules require country and period-specific primary sources.

## Detailed curriculum requirement

- The user requires clear explanations of mechanisms, types and distinctions, and comprehensive worked examples for every topic. Preserve short hover definitions, but do not treat them as complete lessons.
- Detailed lessons use authored, topic-specific material in `content/deep-lessons/*.deep`, with a case setup, sequential reasoning, result, interpretation, and application checklist. Broader domain guidance remains labelled separately. Track detailed coverage honestly until all IDs are expanded.

- Full lessons open by default and appear before the topic quiz. Keep the disclosure for quick practice and preserve short statement hover definitions. Detailed coverage is derived dynamically from authored files rather than hard-coded in the UI.

- During an unanswered mystery clue, do not mount its companion worked lesson or quiz: they can disclose the case solution. Reveal them after a valid answer attempt or an explicit hint request. Hints are scoped to each clue, reset on replay, and do not advance the case. Atlas lessons retain their existing full-lesson default.

- All 698 IDs now have detailed topic material, using 678 authored topic records and explicit aliases for the 20 overlapping anchors. Require complete detailed coverage in tests. Continue to describe specialist material as introductory study coverage rather than complete professional manuals.

## Session records and progression

- Topic quizzes and case clues have separate unique-question totals. Count correct first submissions separately from correct latest submissions; retry clears a selection without deleting the response history. Neither count is a claim of mastery.
- Case clue first-answer credit means correct before any requested hint. Preserve clue responses and hint use per run; replay begins with no answers or hints but retains earlier runs. First-answer session totals use the original response across replays.
- A case becomes solved only through Finish after all clues have correct current selections. Count each stable case ID once per session; repeated finish events and replays cannot inflate this total. Bind progression events to a run and clue to reject stale double-clicks.
- Once an explanation has been revealed by an answer attempt, keep it available on retry and do not relabel it as a requested hint. Never preselect answers or reveal prior solutions in a new replay.

## Planned navigation (Task 03.1)

- Primary destinations are Atlas, Labs, Simulations and My learning. Task 03.2 implements entry/catalogue, statement/map/topic/source routes, reading trails and the P02 brief/run routes. The wider full-lesson and complete return-context workspace remain in 03.3. Follow docs/implementation/task-03-1.md and task-03-2.md for the implemented boundary.
- Atlas holds statements, detailed lessons, maps, reading trails and sources. The playable P02 three-clue case belongs in Simulations. Preserve all 24 master journey IDs and ordered nodes. Distinguish P02 reference trail and playable case by activity kind.
- Use the reconciled three-lab scope: customer collection, equipment investment and financing comparison. The longer Nila Homeware activity has its own proposed case ID so short-mystery completion cannot imply longer-case completion.
- Preserve all six legacy hash views, stable concept IDs and financial versus learning relationships. Displayed relationships are not automatically calculated model dependencies.
- Lesson detours carry validated originating activity/run context through concept links. Return and Resume open that existing run without calling new-start/replay. Keep unanswered-case full lessons behind explicit hint opt-in.
- Keep Atlas explanations expanded. Enable labs and the longer case only after their planned implementation passes. Cross-session progress remains deferred until the save contract and persistence tasks pass.

## Guided entry (Task 03.2)

- The default entry offers a guided beginner route and free exploration without an account. Optional prerequisite lessons return to the mystery brief. Keep the brief spoiler-free and describe the objective, prerequisites and estimated 10–15 minute duration. This is a planning estimate awaiting learner-pilot verification.
- Resume selects an existing P02 run without adding a run or resetting choices, first responses, hints or the current clue. My learning exposes every unfinished run. Only explicit Start/Replay creates a new run; stale duplicate start commands are rejected.
- Keep the six old hash view entry points valid. Unknown or missing run links open the brief with recovery text instead of silently creating progress. Browser Back/Forward selects routes/current records without advancing clues.
- Atlas entry alone does not count as exploring a concept. The three planned labs and the longer Nila case must stay labelled planned, with reference lessons available and no false playable actions.
