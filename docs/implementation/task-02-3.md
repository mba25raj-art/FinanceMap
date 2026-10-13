# Task 02.3 — Make progression and counts understandable

Implemented on 13 October 2026 in the Chunk 02 draft PR. Publication remains a later release step.

## Result

Topic quizzes and mystery clues now have separate records and counters. Before this change, topic retry deleted the only answer record, replay cleared the solved-case indicator, and the generic “Decisions answered correctly” total omitted case clues without explaining that distinction.

Now each submission is retained for the open page session. Retry clears the selected option for practice and keeps earlier submissions. Changing a selected answer records a new submission; clicking the unchanged selected option does not. Topic practice filters continue to follow the current selection, so a cleared retry appears under Unanswered. My learning uses the latest **submitted** answer and labels this explicitly.

## Counter definitions

| Display | Definition |
| --- | --- |
| Concepts explored | Unique concepts visited this session; not a mastery measure. |
| Topic quizzes answered | Unique topic IDs with at least one submitted response. |
| Case clues answered | Unique case ID + clue index pairs with a submitted response, across runs. A hint alone is not a response. |
| Distinct cases solved | Unique case IDs explicitly finished after every clue has a correct current selection. |
| Latest correct | The most recent submitted response to each topic or case clue is correct. Clearing a selection does not erase this response. A replay may change the latest case-clue result. |
| First correct — topic | The first submitted response to a topic was correct. Later corrections never replace it. |
| First correct — case | The first submitted response to that clue in the session was correct, before a requested hint. Later runs never replace it. |
| Completed runs | Number of finished plays, including replays; shown separately from unique cases. |

The companion lesson’s topic quiz does not answer the case clue. Counters explain this distinction. First-answer credit records performance on this question; it does not demonstrate broad topic mastery or exclude prior study.

## Controls and records

- **Retry topic question:** clears that topic selection while preserving first and latest submitted responses. **Next connected topic question:** opens a connected lesson without submitting an answer.
- **Retry this case clue:** clears the current clue selection, retains the run’s responses and hint record, and requires another correct choice before progression. Its already revealed explanation remains available and is not mislabeled as a new hint.
- **Continue to case clue N of 3:** advances exactly one clue after a correct choice. Commands carry the rendered run and step, so repeated or stale events cannot skip clues.
- **Finish case:** records completion only after all three clues have correct current selections. Answering the final clue alone does not finish. Repeated finish events do not add records.
- **Replay case (keeps your record):** creates a fresh run with no selections or hints. Prior runs and the distinct-case completion remain. Earlier solutions are not mounted in the new clue.
- **My learning:** shows definitions, first versus latest performance, all submitted topic answers, and case runs with first answers and subsequent responses. A first wrong answer stays visible after correction and replay.

The progress bar counts correct current clue selections in the current run and has an accessible label. Stats use four columns on larger screens and two on small screens; answer summaries stack on small screens. No financial inputs, curriculum IDs, hosting setup or lesson content changed.

## Verification

- `npm run test:content`: **11 passing tests**, including the entire mystery sequence (wrong → retry → correct → next clues → finish → replay → finish), stale/double events, hint-only behaviour, invalid inputs, separate counters, retained first responses, and session reset. Existing tests render all 698 topics in unanswered, correct and both wrong-answer states.
- Mystery and dashboard server-rendered checks verify control labels, disabled progression, retained first-answer text, explicit Finish, progress value, history review, separate counts, and fresh replay with no feedback or selected answer.
- `npm run build`: passed; emits the client bundle, Worker entry and hosting manifest. Existing large-bundle warning remains.
- `npm run test:sites`: **4 passing hosting tests**.
- Local Vite starts, but a separate HTTP readiness check cannot reach its loopback port in this environment. Live client event playback, keyboard focus and responsive visual QA remain unverified; server-rendered checks are not browser QA. No deployment performed.

## Boundaries and next task

All records remain in React memory for this page session; refreshing or closing resets them. Accounts and cross-session storage remain in their planned later tasks. Only the existing P02 mystery is playable, and distinct-case counting uses its stable ID.

Next: **03.1 — Design the four learning destinations**. Chunk 02’s implementation checks are complete; its live browser demonstration remains pending.
