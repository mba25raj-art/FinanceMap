# Prototype Instructions

- The user authorised continuing tasks one after another on 19 October 2026. Follow backlog order, verify and save each completed task, and continue without requiring a separate “next”. Do not fabricate learner participation or bypass actual external blockers.

## Project decisions

- Use the light Statement Explorer mockup as the primary visual direction; maintain the shared workspace for the connection map and missions.
- Keep the user informed about decisions that affect navigation, content coverage, example data, or persistence.
- Preserve the master atlas IDs and distinguish financial relationships from preparation/navigation relationships.
- Label incomplete lessons as mapped topics. Use illustrative INR lakh company figures; do not imply they come from an actual company.
- Local browser persistence is designed and implemented in 05.1/05.2. Save only the validated versioned learning record; unavailable storage falls back to memory with a visible message. No account/cloud or cross-device promise.

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

## Selected curriculum conversion complete (Task 04.4)

- All six ordered batches are integrated: thirty selected canonical packages, 31 pages including A02/T06.04, and 61 independent practice questions. Preserve each canonical concept/content/question version and the original receivables keys. Do not infer other alias integration.
- B3 separates dated forecasts, assumed liquidity buffers, principal financing and ordinary-equity ownership. B4 separates capital expenditure, depreciation, EBIT/NOPAT and incremental cash. B5–B6 match rates, periods and claims; require WACC greater than perpetual growth; keep excess cash and included claims explicit and counted once.
- Every batch records Codex AI content/source/arithmetic review with independent numerical checks. Professional approval and learner-pilot evidence remain separate. Interactive browser QA is still outstanding under 11.1. Curriculum completion does not implement a financial-model engine or planned activities.
- Continue to 05.1 before enabling cross-session persistence. First-release saves are local to the browser, with versioned validation, export/import and explicit reset confirmation. Accounts/cloud synchronisation are deferred.

## Local save and resume (Tasks 05.1–05.2)

- `docs/saved-data-contract.md` and the v1 schema define the browser-owned record. `learning-save.js` validates imported identities, versions, choice bounds, hint history and progression; it reconstructs correctness and completion from installed definitions. Never trust imported scores or answer keys.
- Preserve topic/lesson/case first/latest attempts, help and retry state, explicit Finish, run order and canonical A02 keys. Generate assessment fingerprints from actual question/data/option/answer definitions. Unknown versions remain recovery data rather than credited progress.
- Save only the app key; never call localStorage.clear(). Corrupt/unsupported storage pauses overwrite. Failed or conflicting writes keep the last stored bytes and current memory record with honest export/recovery controls. Reset and Import replacement need their learner-facing confirmations.
- Browser restore precedes run-link resolution and retains the unanswered-detour hint gate. Do not autosave an empty record immediately after Reset. Scroll remains in memory; future model saves must replay validated registered decisions rather than trust imported balances.
- Automated storage/SSR evidence does not establish interactive reload, native file chooser, mobile or keyboard QA. The extension connection timed out again in this task; carry browser verification under 11.1 without marking it passed.

## My learning (Task 05.3)

- Lead with the latest unfinished run, then recorded difficulties, then an available brief/selected lesson. Resume never starts or replays. Keep manual browsing and optional directed preparation available.
- Keep explored visits, submitted practice and independent first transfer-result observations separate. The 01.2 specification requires a result plus explanation for demonstrated work. Ungraded self-check reflections do not award demonstrated understanding; reasoning evidence follows Chunk 09.
- Aggregate case first/latest evidence across replays, retain corrected first mistakes for review, and keep A02 aliases canonical. Suggestions are derived views of validated records, not imported mastery flags. Extend activity recommendations only when their verified implementations become available.

## Verified company model (Tasks 06.1–06.4)

- Nila model 1.0.0 preserves the roadmap opening cash/receivables/inventory/equipment 20/30/50/100 and payables/debt/equity 25/75/100. Added dates, rates, useful lives, tax and shares are labelled hypothetical. Keep the core reference free of depreciation, interest and tax.
- Internal journals use integer paise, immutable posting and actual event provenance. Explicit references settle partial outstanding items without repeated income/expense. Negative executed cash is rejected with a funding requirement; the minimum-cash policy is a separate signal. Failed decisions leave state untouched.
- Three statements, indirect cash and equity reconcile from the same dated history. Monthly depreciation, Actual/365 interest and positive-income hypothetical tax close separately and only once. Rebuild sealed history through deterministic replay.
- Daily cash forecasts may show unfunded negative cash; they never execute loans. Keep financing outside FCFF. NPV includes each investment once; DCF uses supplied matching WACC, growth below WACC, sustainable terminal cash, explicit excess cash and each claim once. Navigation edges do not become calculation rules.

## Customer collection lab (Task 07.1)

- LAB-COLLECTIONS 1.0.0 commits sale inputs, a payment-date/account/category prediction and an optional ungraded explanation. Derive model results by registered replay; never import balances or scores. The stage equals committed decision count (0–3). Keep initial collection results concealed until the prediction.
- Preserve every experiment and resume its exact record from My learning or a lesson return link. Reject stale duplicate commits. Export objects and new decisions must not share mutable nested data with the active profile.
- The fixed operating/supplier payments belong to a disclosed separate forecast, not the lab ledger. Payment timing changes the funding path, not sale profit. Guided predictions and ungraded prose award no demonstrated-understanding label.
- Collection is available; equipment and financing remain planned pending their own ordered tasks. Continue 07.2 next. Browser/keyboard/mobile QA remains outstanding under 11.1; do not claim it from SSR/reducer tests.

## Equipment investment lab (Task 07.2)

- LAB-EQUIPMENT 1.0.0 registers timing/life/acquisition-day predictions and an optional ungraded explanation. Periods 0–2 correspond to committed stages. Resume and lesson returns select the existing record; derived statements are never imported.
- Isolate new-equipment depreciation/profit against an identically closed no-purchase baseline. Acquisition, free one-month supplier credit, cash settlement and availability are distinct events. Useful lives are 24/36 months, residual zero; no invisible capacity benefit is inferred from depreciation.
- Explicitly disclose 100 additional annual orders and hypothetical net receipts six at the first two availability anniversaries. The two-receipt project window assumes no later cash, additional working capital or terminal proceeds even if accounting carrying value remains. Both branches use the same terms and Actual/365 discounting from 1 January 2026.
- Default buy-now NPV is 0.41322314 but its separate cash forecast needs eight before June receipts. July delay avoids that early funding gap while reducing present value. Value, affordability and decision quality remain separate; no branch receives a mastery label. Financing is still planned until 07.3.

## Financing comparison lab (Task 07.3)

- LAB-FINANCING 1.0.0 uses the separate NILA-FUNDING mini-case (cash/equipment/equity 20/20/40, no opening debt). Never substitute it for the roadmap company opening or imply it is a cumulative round. Both financing routes raise ten and buy identical equipment for ten.
- Preserve the pre-reveal classification/profit/ownership prediction and ungraded recommendation. One-year simple loan service, negotiated ordinary-equity dilution, dated cash need and conditional DCF use the shared verified functions. All three labs have their own available catalog/concept links and replayable record versions.
- Common supplied FCFF is cash after operating tax/reinvestment before loan service; it is not the operating-cash statement subtotal. Reserve 18 supports the stipulated operations, leaving explicitly excess cash two. At the post-investment valuation date, do not deduct the already-paid investment twice. Hold supplied WACC fixed only to isolate effects, and disclose that real financing can change risk/returns.
- Pre-money is an independent negotiated assumption, not a book-equity or DCF claim. No interest tax shield, fee, guaranteed dividend, automatic refinancing or hidden debt is assumed. Cash shortfalls remain forecasts rather than silently posted payments. Neither conditional founder value nor a lucky result awards decision quality. Continue to the complete six-round script in 08.1 before implementing further case events.

## Complete Nila script (Task 08.1)

- `content/cases/nila.v1.json` and `docs/nila-case-script.md` define all six rounds before new runtime events. All thirty selected concepts and six outcomes are mapped. The case remains planned until runtime integration; do not turn an authoring file into a playable or professional-review claim.
- Case-specific NILA-COMPANY-CASE 1.0.0 preserves the roadmap's 200/200 opening while explicitly authoring existing debt at 8%, annual coupon and 2029 maturity. Keep the original NILA-HOMEWARE reference and NILA-FUNDING mini-case intact. New funding has disclosed 12% annual coupons, limit sixty and stipulated pre-money hundred; minimum cash three is policy, not law.
- Each round is predict, then inspect/informed financial commitment, then explain. Reveal calculated gap/terms before a binding funding choice and NPV/eligibility before purchase. A wrong prediction can continue with retained evidence. Explanations remain ungraded; Finish and demonstrated competence are separate.
- Quarter cash uses the actual posted cutoff and only future known commitments. Reference fixtures independently check sixteen branches; default full-plan need is 19.7. No-funding eligibility depends on the selected plan. Do not execute a forecast overdraft or automatic loan.
- Project assumptions produce five annual flows 2.8/12.8/12.8/12.8/22.8, including final standalone working-capital release. Continuing-company terminal FCFF does not liquidate working capital. Normalize sustaining capex/depreciation explicitly, start from actual operating balances, keep quarter/annual/project perimeters separate and deduct each claim once.
- The alternate replay variant shifts every customer receipt thirty calendar days with unchanged contractual due dates/fees and no random score. Comparisons within a variant hold conditions fixed. Runtime proceeds first through rounds 1–3 (08.2), then 4–6 (08.3), then forks/variant UI (08.4). Run `npm run test:case` and `npm run test:model` for case/model changes; automated evidence is separate from browser and learner-pilot QA.

## First company rounds (Task 08.2)

- The company case is an available three-round preview, distinct from the P02 cash mystery and the three labs. Preserve the exact roadmap opening and case-specific hypothetical terms. A preview completed at 3/6 is not a finished company case.
- Company records save only setup, hints, numerical attempts, contracts and ungraded explanations. Period counts explained rounds; stale-action protection uses decision-history length. Preserve existing version 1 prefixes as later rounds are implemented.
- Show all financial terms before binding commitment, reveal numerical feedback after an attempt or requested worked hint, and retain first/latest/help chronology. Do not grade prose or award competency from these guided checks.
- Actual journal postings, future cash commitments and later month-end accruals remain separate. Resume and Atlas return select the same global activity index. Automated checks do not replace the outstanding live-browser and pilot evidence.

## Complete company case (Task 08.3)

- All six Nila rounds are available with an explicit Finish after six saved explanations. Existing 08.2 version 1 prefixes continue at round four. Company completion is separate from P02 and is not a competency award.
- Compute funding from the exact prior choices and disclosed dates. Show exact service, dilution and constraints before committing. Reject no funding with a positive gap and equipment purchase that breaches the full-quarter reserve. Deferring equipment does not cancel issued debt or equity.
- Close January before the annual FCFF prediction. Forecast from actual closing operating working capital. Keep actual statements, quarter cash, standalone project NPV and continuing-company DCF separate. Subtract initial equipment once; do not recycle project liquidation into company terminal value or double-count payables/claims.
- Stated financing and tax terms are hypothetical. The first new-debt coupon spans 365 days; later Actual/365 coupons can differ for a 366-day interval. Keep all later obligations visible even though the quarter cash check excludes them.

## Company replay and comparison (Task 08.4)

- Restart from an actual saved contract decision into a new record. Preserve the original and prior completed-round history. Mark prior exposure from the restarted round onward; do not describe replay observations as fresh independent evidence.
- The alternate scenario shifts all customer receipts exactly thirty calendar days while retaining invoice dues, fee dates and all other terms. Disclose it before setup and keep it visible. No random event or lucky-outcome score.
- Compare finished records only within the same receipt scenario and version. Use common supplied valuation rates in the comparison, keeping original chosen rates in their records. Explain cash, service, dilution and assumed operating differences; larger conditional values do not grade decision quality.

## Mixed practice (Task 09.1)

- My learning includes an eight-task mixed-format practice record with starter and alternate datasets. Keep it separate from applied lab/case coverage and existing topic, lesson and cash-mystery totals.
- Numerical tolerance is 0.01 lakh or 0.01 percentage point for ownership. Each objective field earns one check, with no pass threshold or competency label. Exact selects use stated choices; written reasoning is ungraded. No drag-only controls.
- Save dataset and timestamped, versioned raw responses, reconstruct checks, preserve first/latest, and require explicit Finish after all submissions. Resume must not create a new record or erase mistakes.

## Feedback and help (Task 09.2)

- Mixed-practice feedback diagnoses the failed field's calculation pattern or mechanism; do not infer a learner belief as a psychological fact. Company feedback names failed recognition, timing, funding and valuation mechanisms.
- Direction and mechanism hints precede an explicit worked-answer reveal. Save question/version, stage and timestamp in order. Recompute help/worked-reveal-before-response per attempt; later help cannot retroactively change the first response. New records have no hints.
- Written-judgment rubrics are visible before writing, and defensible conditional alternatives appear after an attempt or requested worked hint. No automatic free-text correctness or competency credit. Keep guided unassisted observations separate from later independent transfer evidence.

## Review and unfamiliar transfer (Task 09.3)

- Review suggestions are optional product hypotheses: one day after a latest mistake, three after a corrected or helped response, seven after a correct guided response. Use actual response times, expose future-clock uncertainty, preserve untimed older records and allow due-review deferral.
- Tamarind Catering is a distinct complete-packet transfer assessment. Keep its thirteen objective fields, numerical tolerance, fictional terms and ungraded recommendation separate from guided totals. Its financing quote is not the computed budget requirement or the separately stated valuation debt.
- Protect unanswered transfer packets from worked study, including search/history/restored routes. An explicit study action records assistance for all open unanswered packets. Keep first response, later feedback/revisions, requested help, replay exposure and scenario version separate. Local history cannot prove absence of outside help.
- Independently reviewed competencies remain a separate empty category until actual explanation review exists. Do not accept imported awards, grade unsupported prose or combine guided correction counts with transfer understanding.

## Purposeful company story (Task 10.1)

- Character messages restate a concrete disclosed interest or obligation for the current decision. Story cannot alter the model, introduce an undisclosed event or leak a numerical prediction answer.
- Acknowledge saved explanations and observed numerical corrections without grading prose or rewarding a lucky balance/value. Endings retain actual funding contracts after deferral and label future demand as assumed.
- Optional event cards describe the deterministic preselected receipt variant. Keep hints, retries and saved-decision forks available without timers, streak penalties or winner labels.
