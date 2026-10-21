# Task 02.2 — Protect mystery answer discovery

Implemented on 13 October 2026 after Task 02.1 (`cba7b6556146c692f36d2ba804802583d0a7663f`).

## Result

- The mission landing card shows “To discover” instead of the final ₹7 lakh figure.
- The case introduction asks the learner to calculate the remaining cash without supplying the result.
- Early working-capital fact notes describe the input neutrally rather than giving the first clue's explanation.
- Each clue's solution is mounted only after a valid answer selection or a deliberate hint request. Wrong attempts receive the explanation too; a correct choice is still required to advance.
- The companion full lesson and quiz are also gated: the FCFF worked example otherwise discloses the same final answer beside the unanswered clue. Hidden lessons are not mounted, so their answer text is absent from the rendered page rather than merely concealed with styling.
- An explicit “Open full lesson (reveals hint)” action makes detailed reading available before an answer. Hints are recorded separately per clue, reset when the mystery restarts, and never count as an answer or advance the case.
- The final question retains all its numerical inputs and candidate answers. Its ₹7 lakh candidate is not identified as correct before an attempt. The solved case retains the complete calculation and explanatory debrief.
- Atlas lessons retain their existing expanded reading default.

## Verification

`npm run test:content`: all 7 tests passed. The mystery regression checks the opening, each unattempted clue, hint, incorrect and correct states, disabled progression, invalid attempts, prior-clue hint isolation, companion lesson concealment and the solved debrief. Existing checks still cover all 698 lesson pages and both wrong selections for every topic quiz.

`npm run build`, all 4 `npm run test:sites` checks and `git diff --check` passed.

Verification uses the rendered React markup, including status and pressed-state attributes. Live browser playback and screen-reader inspection remain pending under the previously recorded environment limitation and release checks. This task does not claim a deployment.

## Next task

02.3 — Make progression and counts understandable, distinguish topic questions from case clues, and retain first attempts without duplicate completion records.
