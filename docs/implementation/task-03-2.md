# Task 03.2 — Guided entry, activity brief and session resume

Implemented on 13 October 2026. Continues the four-destination design in Task 03.1. Changes remain in draft PR #1; no deployment performed.

## Result

The website now opens on an Atlas entry page with a guided beginner route and free exploration. The header exposes Atlas, Labs, Simulations and My learning. On smaller screens these use a keyboard-operable Menu. Existing statement, connection, topic and source screens remain reachable.

The cash mystery has a separate brief before any run is created. It explains the objective: distinguish reported profit from cash left after reinvestment and calculate free cash flow to the firm. It names the prerequisite arithmetic and cash/accrual concepts, offers three optional full-lesson refreshers, and provides a return-to-brief action.

The duration is **estimated at 10–15 minutes**. This is a planning estimate, not a measured learning result. The learner pilot in Chunk 11 must check it, including learners who open the detailed lessons. There is no timer or account requirement.

When unfinished work exists, the primary next action is Resume. Atlas, the case brief, Simulations and My learning show the most recent unfinished run. My learning also lists other unfinished runs. Resume restores the same run, clue, choices, first-answer history and requested hints. It does not create another run or count the case complete. Start another run and Replay remain explicit actions and preserve earlier histories. Duplicate stale Start commands cannot create two runs.

## Navigation boundary

- The new route helper accepts all six legacy hash views across all 698 existing IDs. Internal links now emit canonical Atlas, lab, simulation and learning routes.
- All 24 original reading trails sit under Atlas with their exact source node order. P02's eight-stop reading trail is distinct from its three-clue playable mystery.
- The P02 brief is reachable without starting a run. Run links resolve existing in-memory records. Missing/malformed runs show recovery text and an explicit Start/Resume action.
- Browser Back/Forward opens the current run record without resetting it, submitting a response or advancing a clue. Finished records open their debrief.
- Labs names the agreed customer-collection, equipment-investment and financing-comparison labs as planned, with existing reference lessons available. The six-round Nila Homeware case is also labelled planned.
- Atlas entry is not counted as concept exploration. Detailed Atlas lessons keep their expanded default.

The dedicated wider lesson route, full activity-to-concept return-context contract, focused task layout and independent scrolling refinement remain in Task 03.3. Save versions, import/export/reset and cross-session resume remain in 05.1–05.2. This task keeps progress only while the current page remains open.

## Verification

- **17 content, session and route tests passed.** Checks cover every original ID through all six aliases, canonical statement tabs, all trail stops, invalid routes/runs, fresh start versus resume, retained wrong answers/hints, duplicate-start protection, and server-rendered entry/brief/resume/recovery screens. Existing regression tests render all 698 lessons in unanswered, correct and both wrong-answer states.
- **Production build passed**, producing the client, Worker entry and hosting manifest. The existing large-bundle warning remains.
- **Four hosting tests passed.** Hosting scaffolding is unchanged.
- **Live Chrome walkthrough passed at the default 1440-pixel viewport:** guided entry → brief → optional accrual refresher → return → Start → wrong answer → My learning → Resume, preserving that wrong selection and first response. Corrected clue 1, requested a clue-2 lesson hint, left and resumed with the same hint/current clue, completed clue 3 and explicitly finished. My learning showed three case clues, one distinct solved case and one completed run. Browser Back opened the completed debrief; Replay opened a clean second run without prior feedback or selections.
- **390 × 844 responsive check passed:** the mobile Menu opened with Enter, all four destinations were reachable, Atlas showed the correct resume action, and the document width equalled the viewport with no horizontal overflow. Temporary viewport override was reset.
- **Additional live checks passed:** A02's revenue-again misconception received the correct explanation, Retry cleared its selection while retaining history, a missing run opened recovery instead of starting, and refreshing reset the session as described.

These are representative browser checks, not a full accessibility audit or a learner pilot. The focused layout and complete return-context walkthrough are next in 03.3.

## Tracker and next task

This task includes the delayed 03.1 tracker writeback, using its saved design at commit faa1032 as evidence. The workbook records 03.1 and 03.2 separately and keeps the original release scope, formulas and task order.

Next: **03.3 — Create a focused lesson and task layout**.
