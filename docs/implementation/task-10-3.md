# Task 10.3 — Accessibility implementation prepared; live verification pending

Status: **In progress**, not complete. The user-requested retry on 20 October 2026 successfully opened the supported managed preview at `http://terminal.local:4173/`. Live desktop keyboard verification is now available. The previous connected-browser timeout, unreachable manual loopback and URL-policy refusal are historical results; the successful retry used the documented managed preview URL through the same supported cloud-browser API, with no security bypass, raw browser commands, alternate host or public deployment.

The full keyboard company journey, replay/comparison, all mixed-practice formats and the complete transfer packet were exercised. Two observed defects were fixed and retested: Reset cancellation now returns focus to its invoking button, and company-story acknowledgments no longer compete with the activity status region. Destination titles now identify the catalogue rather than an unrelated selected concept. Remaining live checks below keep the task In progress; browser access itself is no longer the blocker.

All 214 automated checks (120 content, 36 case, 19 assessment, 29 model, four hosting, three accessibility unit/markup and three loading checks) pass after the accessibility source changes. Build and coverage freshness also pass. These are automated/source results only.

Source improvements prepared:

- A first-focus Skip to main content action and destination-aware document title.
- Route changes focus main content; activity actions focus the new task heading, committed explanation, feedback or requested hint. A persistent polite status region announces saved responses, assistance and ungraded explanations. These focus effects still require live keyboard/screen-reader testing.
- Native statement controls expose the short definition through aria-describedby. Hover/focus/tap equivalents retain the full concept action; Escape dismisses a tooltip, and the pointer can remain over it.
- Explicit visible focus for search, summary and textarea controls, plus reduced-motion behavior for programmatic lesson scrolling and CSS animation/transition rules.
- Existing native forms, button alternatives to canvas/dragging, text/table causal paths and labelled units are retained.

### Source review continuation · 20 October 2026

The user authorized continuing with the needed permissions. The existing browser URL-policy refusal remains in force; this continuation made no browser attempt and does not claim that general permission overrides it.

- Corrected a concrete focus defect: the activity wrapper previously assigned `tabindex=-1` even to the native explanation textarea after a commitment. The shared focus helper now preserves existing native Tab order, and only adds a programmatic focus target to non-focusable reading content.
- Added labelled feedback targets to all three labs and a saved-reflection target after their explanations. Practice-task selection moves focus to its new heading without requiring a new saved answer. Import/load replacement can programmatically focus My learning, including when that destination was already open.
- Use one persistent activity announcement region rather than competing inner status regions. Restoring a saved record starts with an empty announcement instead of announcing its old response as newly saved. New responses carry a changing response count so repeated submissions produce a distinct status message; counts do not disclose financial answers or imply competency.
- `npm run test:accessibility` checks the native-focus contract, restored/repeated announcement messages and rendered feedback/table semantics for all six applied/assessment workspaces. It runs in the existing release build job. The tests use unit objects and server-rendered markup; they do not execute a keyboard, render zoom or observe assistive speech. The later live verification below supersedes the earlier Not run entries where evidence was actually obtained.

Calculated contrast ratios from explicit source tokens (not rendered/composited-state measurements): body #101f38 on #fcfbf8 15.91; muted #5d6b7b on #fcfbf8 5.26; white text on primary #116c72 6.16; teal #116c72 on paper 5.95; focus #246657 on paper 6.52; focus on white 6.75; body text on story #f0f5f1 14.93. These cover those exact pairs only and are not an accessibility conformance claim.

## Live desktop evidence · 20 October 2026

Tested the source at `45d3772` and the follow-up fixes included in this commit, served from the same checkout with hot reload. Browser identified by the control surface: Chrome/CDP; exact browser version and operating-system version were not exposed. CSS viewport measured from the rendered document: **1348 × 936**. All created responses explicitly identify technical QA and do not represent learner-pilot, consent, independent-learning or reviewed-competency evidence.

Input used Tab, Shift+Tab, arrow keys, Home/End, Enter, Escape and the search shortcut. The six company-round choices were reached through Tab traversal, with no mouse clicks. DOM/accessibility-tree observations establish focus, labels and structure; they are not actual screen-reader speech.

| Check | Observed result | Status |
| --- | --- | --- |
| Keyboard entry and primary destinations | First Tab reaches Skip; Enter focuses main with a visible outline. Search shortcut/results and Atlas, Labs, Simulations and My learning operate by keyboard. Catalogue titles corrected and Labs title retested. Mobile menu not exercised. | Partial: desktop verified |
| Statement short definition | Tab reaches receivables; its visible focus definition reads “Money customers owe for sales already recorded.” The matching aria-describedby target exists, and Escape dismisses the tooltip without moving focus. Touch and pointer-over-tooltip behavior not exercised. | Partial |
| Cash-mystery dialog | Explicit hint study remains available. On the next unanswered clue, search/Enter opens the confirmation without accepting it. Keep trying receives initial focus; Escape closes it and returns focus to search. Transfer study guard behaves the same way. | Pass within tested desktop scope |
| Full company case by keyboard | Completed all six rounds, all explanations and explicit Finish. Round one retained wrong-first 0/20, a hint and corrected 8/0. Feedback/task focus moved; explanation textarea remained at native tabindex 0 and could be revisited by Shift+Tab/Tab. Funding 19.70, project NPV 15.64 and first annual FCFF 23.30 matched. | Pass within tested desktop scope |
| Company replay and comparison | Keyboard restarted round six into a second record; prior exposure was displayed. Alternative selected 12% WACC/0% growth; both finished records compared at common 10%/3%, EV 271.16 and equity 180.18. Original record retained; reload restored the completed fork and comparison. | Pass within tested desktop scope |
| Mixed practice and transfer | Completed all eight practice tasks (15/15 objective checks) using native numeric/select/text controls and explicit Finish. New task headings received focus. Completed all thirteen transfer fields (13/13) and its ungraded recommendation/Finish. Cancelled study guard left the packet unanswered until submission. Actual speech/intelligibility not observed. | Partial: keyboard verified |
| Local save controls | Reload retained finished company records. Reset confirmation initially focused Cancel; its observed body-focus return defect was fixed by closing the captured dialog and returning focus on the next frame. Escape retest returned to Reset, with all four technical records retained. Later continuation verified Export, real file-picker selection, import preview/cancellation, explicit replacement and retained four applied records. The preview now includes applied-record counts. | Partial |
| Screen-reader journey | Headings, form names, captions, column/row headers, units and text/table alternatives are exposed in the observed tree. No actual screen reader, speech capture or assistive reviewer was available. | Not run; required |
| Zoom and reflow | Ctrl+plus and Ctrl+equal did not alter the measured 1348 × 936 viewport or rendered page scale. This is not a successful zoom test. No supported viewport/orientation control was exposed. 200%/400%, 320 CSS-pixel, portrait and landscape checks remain outstanding. | Not verified; required |
| Rendered contrast and non-colour cues | Measured visible computed colours on My learning: body 15.91, lead 5.94, primary 6.16, secondary 5.95, text link on its actual panel 5.62 and Reset focus outline against its actual background 3.49. Receivables selection had visible text/bold/focus cues; feedback used explicit text/check counts. Full hover/error/selected-state inventory remains outstanding. | Partial; no conformance claim |
| Reduced motion | Actual platform preference was false. No supported preference-setting control was exposed, so the enabled-preference journey was not performed. Unit/source checks of the conditional auto-scroll behavior still pass. | Not run; required |

The rendered samples were: body rgb(16,31,56) on rgb(252,251,248); lead rgb(82,99,120) on that paper; white on primary rgb(17,108,114); secondary teal on paper; text-link teal on rgb(240,246,241); Reset outline rgb(80,143,145) on rgb(247,249,246). Ratios were computed from those observed pairs only. They do not validate every state or compositing condition.

Remaining verification needs an approved surface with actual screen-reader speech, zoom/viewport/orientation and preference controls, plus the outstanding local file and pointer/touch journeys. Do not replace these with SSR, source inspection or a successful desktop case. Task 10.4 remains Waiting in strict backlog order.

Default technical case controls: qualifying-sale prediction profit eight/cash zero; settlement revenue zero/operating cash ten; all-credit inventory profit zero/payables ten; choose 30-day credit, early agent, cash stock, debt for expansion, buy now and WACC 10%/growth 3%. Supported funding 19.70, project NPV 15.64 and first annual FCFF 23.30. These are reference checks for the tester, not a pre-answer learner screen.

Task 10.4 remains Waiting in strict backlog order. Builder has recorded the desktop checks above; remaining assistive verification requires an available screen-reader surface or accessibility reviewer. No learner participation, observation consent or screen-reader result is assumed.

## Available-check continuation · 20 October

Exported the technical browser record through the real backup control. Its real downloaded file was selected through the native file-chooser API. Import preview initially focused Cancel; Escape returned focus to the file input and left records unchanged. Explicit replacement restored all four applied records. The preview now names the applied-record count alongside cash-mystery records. A reconstructed 08.2-compatible scenario-v1 three-round prefix resumed at round four; the complete original backup was then restored. This is a compatibility fixture, not a claimed historical participant file.

Pointer selection and a click inside the visible short definition were also exercised. Physical touch remains unverified. The baseline cash-flow tab, remaining two mystery clues, wrong-first/retry/correct, explicit Finish, My learning and reload checks passed; technical records remain excluded from the learner pilot. See task-11-1.md for the current build/recovery checks.

Actual assistive speech, 200%/400%/mobile/orientation, enabled reduced-motion and the remaining rendered-state inventory remain required. No browser capability for those device/preference controls was exposed. The task stays In progress; independent later implementation and pilot preparation do not alter its completion evidence.

## Rendered contrast continuation · 20 October

Sampled nine production desktop states (2,160 text instances across repeated states): My learning, Labs, collection setup, guided entry, the initial topic catalogue, selected receivables/full lesson, wrong and corrected topic feedback, and the Reset confirmation. This is a bounded colour-pair sample, not the complete state inventory. Details and exclusions are in `contrast-desktop.json`.

Three concrete style problems were repaired:

| Target | Before | Retested after |
| --- | --- | --- |
| Collection input boundary, inside/outside | 2.78 / 2.68 | 4.14 / 4.01 |
| Catalogue dropdown boundary, inside/outside | 1.35 / 1.33 | 4.08 / 4.01 |
| Relationship dropdown boundary | 1.27 | 4.01 |
| Statement context caption, 18px regular | 4.42 | 5.26 |

Editable controls share `--control-line: #6b817e`; the search frame uses it too. The statement caption now uses the existing muted-text token. Decorative separators are unchanged. The control border changes do not replace existing keyboard focus outlines or selected-state colours.

Retested six production states (1,883 text instances): My learning, collection setup, catalogue filters, selected receivables, incorrect topic feedback and corrected feedback. All sampled ordinary/large text pairs and the visible sampled form/dropdown boundaries meet their respective 4.5/3 and 3 contrast thresholds. This does not cover every hover/focus/native popup, placeholder, icon/graph, clipping/occlusion or modal backdrop condition. No new conformance claim is made.

The three accessibility regression tests, production build, loading dependency/manifest check and coverage freshness check pass for this CSS-only follow-up. The prior full 214-check run is attached to `3d6b8f8`; it was not represented as a new full-suite run for this style change. The isolated preview was stopped before the final rebuild and refreshed with its exact current HTML, manifest and stylesheet before retesting.

Task 10.3 stays In progress. Actual assistive speech, zoom/mobile/orientation, enabled reduced motion, physical touch and the rest of the rendered-state inventory remain open. The real learner pilot and public release are still pending.

## Reviewer preparation · 21 October

The restored local Browser connection timed out while requesting its documented API. The supported cloud Chrome browser still exposed no browser capabilities for zoom, viewport/orientation, assistive speech or motion preferences; no device or speech test was claimed from that capability check. No new application interaction was performed.

`docs/accessibility-review.md` now supplies an unfilled A01–A11 technical review sequence, candidate/version and environment fields, exact route fragments, expected behaviour, observations and repair/retest records. It covers actual speech, zoom/reflow, motion preference, native input/error states, dialogs, remaining contrast states and physical touch. It distinguishes desktop localhost from a preview reachable by a phone and does not imply that this candidate is publicly deployed. All reviewer results are Not run. The next required evidence comes from a real available device/screen-reader setup; there is no general permission request pending.
