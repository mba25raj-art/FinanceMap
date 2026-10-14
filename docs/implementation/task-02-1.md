# Task 02.1 — Correct wrong-answer feedback

Implemented on 13 October 2026 from baseline commit `c4e504c626c19423f0f5030015acef0b942096da`.

## Result

The shared renderer now uses distinct correct and incorrect outcome messages. It removes the leading affirmation from existing answer explanations before displaying them, so a wrong answer cannot produce “Not quite. Exactly.” or “Not quite. Correct.”

Wrong feedback identifies the selected choice, names the supported answer and explains it using the lesson feedback and misconception warning. Fourteen authored choice-specific explanations cover both distractors on A02, T04.01, A08, A11, T02.01, T03.12 and T17.05. The other questions use the shared explanation fallback; this is not a claim of individually authored distractor reasoning for every lesson.

For A02, selecting “Revenue rises again” explains that collection settles a sale already recognised. Selecting “Profit falls” explains that collection is neither an expense nor a write-off. Both preserve the ₹5 lakh increase in cash and decrease in receivables.

The content preparation step validates authored explanations against actual incorrect option text, so choice rotation cannot attach a misconception to the wrong answer. The accounting-equation quiz now explains its own ₹5 collection rather than relying on a separate worked-example figure.

## Verification

- `npm run test:content`: 6 tests passed, including all 698 initial/correct renderings and both wrong selections for every lesson (1,396 wrong states).
- Initial feedback remains hidden, wrong states expose Retry and the status announcement, and corrected states use the success branch.
- Choice-specific receivables, basis-point and NPV regressions passed.
- `npm run build`: passed and produced the client and hosting artifacts.
- `npm run test:sites`: all 4 checks passed after building.
- `git diff --check`: passed.

The local preview was started, but this environment's browser could not reach its loopback address. These are rendered-state and automated checks; browser click/retry playback remains part of the outstanding live checks recorded for 11.1. No deployment is claimed by this task.

## Next task

02.2 — Remove the mystery's final answer from its introduction and early preview, while retaining the question data and post-attempt explanation.
