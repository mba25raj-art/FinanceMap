# Task 03.3 — Focused task and full lesson layout

The P02 case now keeps one current clue in its main workspace. Full topic explanations, worked examples and topic quizzes open on demand in a separate, wider Atlas lesson route. The existing Atlas statement, map, topic and trail lessons remain expanded by default.

## Implemented experience

- Desktop: an independently scrolling current-task pane and a concise lesson-support pane. The support pane describes how to read or retry without disclosing an unanswered clue's worked solution. Each pane retains its scroll position on a lesson detour.
- At 900px and below: one natural page scroll, with the lesson action inside the task. No second scrolling sidebar is required to answer the clue.
- Full lessons: `#atlas/lessons/{stable-concept-id}` reuses the existing detailed content, types, worked examples, area guide, topic quiz and relationship cards. Content has a wider reading area without a nested lesson scrollbar. All 698 IDs are valid.
- Location: case breadcrumbs show activity, run and current clue (or debrief). Full lessons show Atlas, lesson and concept. A sticky return action identifies the original run and its current clue across connected lessons, maps, statements, trails and destination screens.

## Return and hint contract

`returnRun` is a validated, one-based navigation reference in the URL. It resolves an existing P02 record from this page's session; it is not a copied answer or clue snapshot. Return uses the run's current clue and choices, resumes that run and never starts or replays it. A later return from an old link therefore cannot roll back a progressed run. Finished runs return to their debrief.

Opening a lesson before any attempt or hint requires a deliberate hint action. The focused workspace labels that action “Open lesson as a hint”. Search and other reference detours instead open a native dialog with “Keep trying” initially focused, keyboard Escape cancellation and focus restoration. Search Enter prevents its browser default action so it cannot accidentally activate the new dialog. An accepted hint records the originating run and current clue without submitting an answer or advancing progress. Once an attempt has revealed the explanation, reading after Retry does not become a newly requested hint.

Browser Back/Forward selects routes and current records without starting, answering or advancing a case. Route-specific page and pane scroll positions remain available in this session. Reference destinations reached through browser navigation from an unanswered case also use the hint gate. A direct reference route with an unanswered return context renders the gate instead of mounting the worked lesson. Missing return records show recovery text; missing playable-run records still open the brief. Neither invents prior progress.

## Verification

- `npm run test:content`: 20 passing tests. Includes every detailed lesson, six legacy views, all 698 concept IDs, all 24 ordered master trails, full-lesson routes, return-reference round trips, invalid indices, unchanged histories, stale clue references, replay, finished-run return, and server-rendered spoiler protection.
- `npm run build` and `npm run test:sites`: production packaging and all four hosting checks pass. Hosting scaffold is unchanged.
- Chrome at normal desktop size, 1024×768 and 390×844: no horizontal overflow; separate desktop pane scrolling; mobile page layout and lesson controls; explicit hint before an answer; search Enter gate with Escape cancellation; wrong first response, connected lesson detour and exact return; Back/Forward and retained reading position; final Finish, valuation detour and return to debrief.
- A development refresh also exercised missing-return recovery, with full Atlas reading still available. The session-only boundary is intentional.

## Remaining boundary

This task does not implement a financial model, simulation periods, new labs, the longer Nila case or cross-session saves. P02 has clues rather than simulation periods; its current clue is the state retained here. The future model/version/save contract belongs to the later roadmap tasks. No financial content, formulas, stable IDs or relationship meanings changed. Specialist lessons remain introductory study coverage.

All changes remain in draft PR #1. No production rollout, learner pilot, cross-browser certification or publication is claimed. Next: Task 04.1, define the lesson structure.
