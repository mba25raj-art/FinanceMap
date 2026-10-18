# Prototype Instructions

- The user authorised continuing tasks one after another on 19 October 2026. Follow backlog order, verify and save each completed task, and continue without requiring a separate “next”. Do not fabricate learner participation or bypass actual external blockers.

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

## Focused workspace (Task 03.3)

- P02 displays its current clue with concise support; open detailed companion content on demand in the wider Atlas lesson view. The case workspace itself never mounts that full lesson or its topic quiz. Existing Atlas lessons remain expanded by default.
- Carry the validated originating P02 run through reference links. Return resolves its current record, preserves choices, first responses, hints and clue, and never creates a run or restores an obsolete clue snapshot. Completed runs return to their debrief.
- Unanswered lesson detours require explicit hint opt-in, including search and browser-history navigation. Keep trying receives initial dialog focus; prevent search Enter from activating a dialog action. Escape cancels without changing hint state. Reading after an earlier attempt or retry does not add a requested hint.
- Preserve per-route page, task and support reading positions in this session. Desktop panes scroll independently; at 900px and below, the task uses the page scroll and an inline lesson action.
- Missing return context shows recovery without fabricating progress. Cross-session storage, financial-model periods and versioned save contracts remain deferred. P02 retains its current clue rather than a nonexistent simulation period.

## Lesson standard (Task 04.1)

- Follow `docs/lesson-standard.md` for conversion: short hover entry, observable objectives, complete topic mechanics, relevant distinctions, explicitly scoped worked example, embedded prediction and independent transfer practice, misconceptions, conditions on connections and separate deeper/domain material.
- The version 1 packages in `content/standards/` are authoring artefacts, not current renderer inputs. Structural validation does not establish editorial review, financial correctness, rendered spoiler protection or professional mastery. All 698 existing detailed lessons retain their current format until individually converted and reviewed.
- New practice scenarios have distinct IDs and fresh data from the worked example. Each declares all inputs, units, assumptions, stable option/question versions, objective mapping, option-specific feedback and hint/reveal policy. Reflection uses a visible self-check rubric, not unvalidated automatic free-text grading.
- Framework-specific claims require named framework, jurisdiction, period and reviewed primary support. Conceptual examples state their simplifications. Keep topic mechanism distinct from the labelled domain guide; preserve stable edges and the planned availability of future labs/cases.
- Apply the standard first to receivables in 04.2; review that sample before batch conversion. Coverage registration is 04.3, not an automatic consequence of creating the standard.

## Receivables sample (Task 04.2)

- `content/lesson-packages/receivables.v1.json` is the first integrated package override for A02 and its grouped page T06.04. Keep their navigation IDs and legacy topic quizzes; both share one canonical set of versioned lesson-practice records. Other lessons remain in their existing format.
- Nila Homeware is fictional. The worked month and each question are explicitly separate scenarios, with visible units, inputs and assumptions. Cover recognition/collection, gross/net, allowances, covered versus uncovered write-offs, statement effects, ageing and consistent cash bridges. Do not mistake accounting reductions for cash received or double-count credit-loss add-backs with net working-capital movements.
- The three embedded questions have scoped directional/worked help, hidden initial solutions, misconception-specific feedback and first/latest response records through retry and navigation. Show their totals separately in My learning; they do not inflate topic quiz counts, case clues or case completion. Any requested help makes the first response assisted for this lesson-practice counter.
- The case hint/return gate still protects unanswered activity detours. Full Atlas study remains expanded. Keep broader domain guidance separately labelled, and the collection lab labelled planned. Self-check reflection is not automatically graded.
- The sample is integrated for depth/density review in the draft PR, not a claim that every lesson has been converted or reviewed. Primary-source background and independent arithmetic checks are recorded in the package and tests. Cross-session storage and the longer company model remain deferred.
- Backlog Next action formulas follow strict task order. After completing 04.1 alone, 04.2 is Ready while 04.3 remains Waiting. After 04.2 is recorded, 04.3 becomes Ready. Preserve those formulas rather than overriding them to model parallel technical dependencies.

## Coverage register (Task 04.3)

- `content/coverage-register.json`, `docs/topic-coverage.csv`, `docs/relationship-coverage.csv` and `docs/topic-coverage.md` are generated by `scripts/prepare-coverage.mjs` during content preparation. Run `npm run check:coverage` to reject stale outputs. Update authored sources instead of generated records.
- `content/lesson-aliases.json` is the shared mapping for reused deep-reading content. Preserve all concept IDs. A deep-reading alias does not automatically share quiz or lesson-practice evidence. Explicit integrated package mappings live in `content/coverage-policy.json` and must match the renderer and actual record identities.
- Keep existence, standard conversion, editorial review and specialist scope separate. An unpublished authoring fixture is not integrated coverage. Reviews require explicit reviewer, date and evidence; structural checks cannot award review or mastery.
- `content/first-release-scope.json` preserves the verified 30-concept selection and six five-concept batches. Keep outcome IDs, exact titles and applied scope aligned with the implementation backlog. Work in the backlog's strict order.
- Activity records distinguish assessed concepts, supporting references and planned applications. P02 reference trails do not imply playable case coverage. Planned labs/cases have no playable route. Financial relationship records retain master direction/conditions and remain uncomputed until separately implemented and verified by model tasks.

## First conversion batch (Task 04.4-B1)

- `src/lesson-packages.js` maps actual integrated packages through the coverage policy. B1 covers T04.01, T04.05, T06.02, A01 and A02. Only the receivables package additionally renders on T06.04. Deep-reading aliases do not imply package integration or shared evidence.
- Use `src/StandardLesson.jsx` for the common structure while authoring topic-specific mechanisms, distinctions and independent scenarios. Keep unit labels on every input row. Preserve expanded Atlas study, legacy quizzes, separate domain guides and the case hint/return gate.
- Practice records include canonical lesson, content version and question version. Preserve A02's existing keys and legacy action support. New lesson actions must identify their canonical owner. My learning counts each canonical question once and shows per-lesson results separately from topic/case counts.
- B1 package reviews name Codex and `ai-content-source-arithmetic` explicitly. These are scoped AI content reviews, not independent professional approval, professional completeness or learner-pilot evidence. Keep specialist deferrals and source limitations visible.
- B1 is one of six batches. Keep 04.4 In progress until all batches have their own review/evidence. Interactive desktop/mobile QA was unavailable in this environment and remains a release check under 11.1; do not claim new browser verification from the SSR tests.

## Inventory and cash batch (Task 04.4-B2)

- B2 explicitly integrates A03, A04, A05, A06 and T07.14 through the shared renderer. Its five packages add ten independent questions; B1 and B2 together have ten canonical packages, eleven navigable pages and 21 questions. Only A02/T06.04 share an integrated package. Other deep-reading aliases remain unchanged.
- Keep supplier purchases, cost sold, credit notes and settlement separate. Define operating working capital before using its change. Reconcile direct cash, the indirect bridge and the complete balance sheet. A write-down is non-cash: if added back explicitly, remove it from the related balance movement to avoid a second reversal.
- The B2 net-profit bridge is conceptual. Do not present it as a universal statutory starting subtotal. IAS 7/IFRS 18 effective-period and jurisdiction questions, interest/dividends, supplier finance and specialist inventory rules remain explicit deferrals.
- Reviews are explicitly scoped Codex AI content/source/arithmetic checks. B2 completion does not complete 04.4: four batches remain, with B3 next. Interactive browser QA remains outstanding under 11.1; do not turn SSR/reducer checks into a browser or learner-pilot claim.
