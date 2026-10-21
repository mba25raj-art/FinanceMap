# Finance Atlas — remaining accessibility review

Prepared 21 October 2026. **No reviewer results have been entered.**

Application candidate: `1895c1e156f7e0de64653d0505f0636d893383a5`, draft PR #1 in `mba25raj-art/FinanceMap`. Later documentation-only commits may contain this form without changing that application candidate. Record the actual tested source SHA and preview URL below. The public Pages site is not evidence that this candidate is deployed.

## Prepare the session

Use a disposable test profile with technical answers. Export any record that matters before import/reset checks. A clear learning record is useful for first-attempt and announcement checks; do not erase an existing learner's record. No participant recruitment or personal information is needed for this technical review.

Open a candidate preview supplied by the maintainer. A developer reviewing on their own computer can check out this repository at the candidate SHA, run `npm ci`, `npm run build`, then `npm run preview` and use the local URL printed by Vite. A localhost URL on a computer does not make the app available to a phone. Physical-device checks need an approved reachable candidate preview; record that URL and its source version before testing. Do not substitute an older public release or deploy a new release to fill this form.

| Session field | Reviewer entry |
| --- | --- |
| Date and reviewer initials | Unfilled |
| Source SHA and preview URL | Unfilled |
| Device, operating system and version | Unfilled |
| Browser and version | Unfilled |
| Screen reader and version; spoken language | Unfilled |
| Screen size, orientation and CSS viewport if available | Unfilled |
| Actual browser zoom percentages tested | Unfilled |
| Actual reduced-motion setting | Unfilled |
| Fresh profile or technical-record backup used | Unfilled |

For each check record **Pass, Fail, Blocked, or Not run**. Pass requires a real observation on the recorded setup. Record the observed words when speech is relevant; an accessibility-tree label alone is not spoken output. A blocked check is not a pass. These acceptance expectations guide this project review; this form does not certify general accessibility conformance.

## Check sequence

Append the route fragments below to the same verified candidate preview URL. Use visible navigation to return to an existing record: attempt numbers depend on the records in that browser.

| ID | Route and action | Expected behaviour to assess | Result |
| --- | --- | --- | --- |
| A01 | `#atlas`: with the actual screen reader enabled, use Tab to Skip to main content, activate it, then visit Labs, Simulations and My learning. Use the screen reader's heading navigation. | Skip is first reachable; focus reaches main. Page title and heading identify the chosen destination. Each destination and search control has a useful spoken name. No focus trap or unexplained loss of focus. | Not run |
| A02 | `#atlas/statements/balance/A02`: reach Trade receivables using keyboard, then separately using physical touch. Read the short definition; dismiss it with Escape on keyboard. Move a pointer into the definition where a pointer is available. | The definition is available without relying on hover, remains usable while interacting with it, and can be dismissed without losing the initiating control. The selected concept has text/structural cues as well as colour. | Not run |
| A03 | `#atlas/lessons/A02`, `#learning`, and the collection form below: use the browser's actual **200% and 400% page zoom**, recording the displayed percentage. Read and operate the page, including dialogs. | Text, labels, inputs and actions remain available without clipping or overlap. Focus remains visible and usable. A keypress that leaves zoom unchanged does not count as a zoom test. | Not run |
| A04 | `#atlas/topics/A02`, `#labs/LAB-COLLECTIONS`, `#atlas/map/A02`, and My learning: test 320 CSS-pixel width with a real resize or supported viewport control. Also use a physical phone in portrait and landscape. Open the compact navigation menu. | A single task remains readable and operable. Navigation can open, be used and close. Fields, long labels and actions fit. Wide financial tables/graphs may use their own bounded scrolling with accessible text/table alternatives; surrounding reading and actions must not require page-wide horizontal scrolling. Record every exception. | Not run |
| A05 | Enable the device's actual reduced-motion preference, then open the full receivables explanation from a topic/statement and return to the task. Repeat after restoring the ordinary preference. | Reduced-motion navigation uses immediate rather than animated lesson scrolling; controls and focus remain usable. Record the setting actually enabled and the visible behaviour. Source/unit checks do not replace this observation. | Not run |
| A06 | `#labs/LAB-COLLECTIONS`: read the selling-price and inventory-cost fields with the screen reader. Commit the default 20/12 sale, then inspect the prediction fields and submit a deliberate error before correcting it. | Names and INR-lakh units are spoken together clearly; native fields work by keyboard/touch. New feedback is reachable, intelligible and associated with the response. It retains the distinction between a sale and its collection. Record the exact announcements and any duplicate speech. | Not run |
| A07 | `#simulations/CASE-NILA-HOMEWARE`: start a technical case, submit a deliberately wrong round-one prediction, request a hint, correct it, choose the contract and enter an explanation. Reopen that record through My learning and reload. | Each new task/feedback/explanation target receives useful focus. One saved-response announcement is intelligible; focus does not skip the explanation field's native Tab position. Reload must not announce an old response as newly saved. Corrections retain first-attempt evidence. These are technical responses, not learner results. | Not run |
| A08 | `#learning/practice/PRACTICE-FINANCE-CHECK`: start a technical dataset and navigate between numeric, select and explanation tasks. Attempt an empty required submission, then enter a response. Separately inspect the unfamiliar transfer entry without using its result as learner evidence. | Required-field errors are perceivable and associated with a named field; the user can find and correct them. Task headings and feedback remain reachable. Units, table captions and row/column associations are understandable in actual speech. Ungraded reasoning and guided/transfer results stay distinguishable. | Not run |
| A09 | `#learning`: open Reset, inspect it, then **cancel**. Select a technical JSON backup for Import, inspect the preview, then **cancel**. Exercise confirmed replacement only with a disposable profile and an exported backup. | Initial focus enters the dialog; keyboard stays within the active modal. Cancel/Escape closes it and returns focus to the invoking control. Speech identifies the consequence and record counts. Cancellation does not remove or replace saved work. Never confirm Reset on a record that matters for this check. | Not run |
| A10 | On the preceding routes, inspect default, hover, keyboard focus, selected, incorrect, corrected, validation and dialog states. Include placeholders, choice indicators, icons/graph alternatives and native dropdowns where measurable. | Record actual foreground/background pairs and compositing conditions. Project thresholds: ordinary text 4.5:1; large text 3:1 (24px regular or about 18.67px bold); meaningful component/focus boundaries 3:1 against adjacent colours. Error/selection meaning must also be available without colour. Existing sampled contrast ratios do not establish a pass for unmeasured states. | Not run |
| A11 | On a physical touch device, complete one lab prediction and explanation. Open a concept and return; open/close navigation and the cancel-only dialogs above. Check with the on-screen keyboard visible, then rotate. | No hover-only action or drag-only requirement blocks the task. Focused fields/actions remain reachable when the keyboard reduces space. Rotation does not lose saved responses or hide the return action. Record device-specific failures rather than inferring touch behaviour from desktop clicks. | Not run |

## Observation record

Copy one record per check and each distinct failure. Screenshots or speech notes should contain technical records only; do not collect learner identities or private information.

| Field | Entry |
| --- | --- |
| Check ID and result | Unfilled |
| Exact route, starting record/phase and settings | Unfilled |
| Reproduction actions | Unfilled |
| Expected behaviour | Unfilled |
| Actual visible behaviour and actual spoken output | Unfilled |
| Evidence filename or timestamp | Unfilled |
| Impact: blocked task, incorrect meaning, hard to use, or minor | Unfilled |
| Issue, responsible role and proposed repair | Unfilled |
| Retested candidate/setup, result and evidence | Unfilled |

## Completion and next work

The builder reconciles observations with `docs/implementation/task-10-3.md`, repairs failures, and retests the affected journey on the reported setup. Leave unsupported or unobserved checks open. Record any scope decision explicitly with the maintainer; do not silently exclude a blocker.

Task 10.3 remains In progress until the required assistive/device/preference and remaining rendered-state checks have actual evidence. This checklist is preparation only. Task 10.4 separately needs actual device/network loading and interaction measurements; built byte counts are not timings. The real 5–10 learner pilot remains separate and uses `docs/pilot-protocol.md` with willing participants and observation consent. No invitations, pilot sessions, release or deployment are implied by this review form.
