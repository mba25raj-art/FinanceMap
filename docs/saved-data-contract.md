# Local learning save contract — version 1

Task 05.1 · 19 October 2026

The first release saves learning on the current browser and site origin. It has no account, server upload, cloud synchronisation or cross-device promise. Browser settings, private browsing, clearing site data, storage denial and quota failures can remove or prevent retention. Export is the portable user-controlled backup. This document specifies the behaviour before task 05.2 enables it.

## Stored record

Use the single application-owned key `finance-atlas.learning.v1`. The JSON envelope identifies `format: "finance-atlas-learning"`, integer `schemaVersion: 1`, an ISO `savedAt` and the `progress` payload. The checked authoring schema is `content/standards/learning-save.v1.schema.json`; the empty example contains no learner data.

| Payload | Persisted facts | Rebuilt on restore |
| --- | --- | --- |
| Concepts | Saved IDs, distinct explored IDs and the recent navigation trail, all from the master inventory. | Counts and next actions; a visit remains exploration, not mastery. |
| Topic quizzes | Concept ID, trusted-definition question version, selected choice or null, ordered submitted choices. | Correctness, first/latest results and retry state. No imported score is accepted. |
| Lesson practice | Canonical concept/content/question identity and versions, selected choice or null, requested hint indices and ordered choices. | Correctness and revealed state from current trusted definitions plus attempts/help. A02/T06.04 keeps one canonical record. |
| P02 runs | Stable activity/scenario version, current clue index, per-clue selections, requested hints, ordered responses with help-before-answer observations, and explicit finish flag. Array order is retained because current run routes use its index. | Trusted clue definitions, answer correctness, allowed progression and distinct finished-case counts. A correct answer alone does not substitute for Finish. |
| Simulations | Versioned scenario ID/type, current period and ordered committed decisions when a registered implementation exists. | Transactions, balances, statements, forecasts, valuation and completion from validated deterministic replay. LAB-COLLECTIONS 1.0.0 stores sale inputs, a pre-reveal prediction/payment date and an optional ungraded explanation. Its period equals the number of committed stages (0–3); replay reconstructs all balances. LAB-EQUIPMENT 1.0.0 stores timing/life/acquisition-day predictions and an optional ungraded explanation (stages 0–2). LAB-FINANCING 1.0.0 stores terms, common operating scenario, pre-reveal predictions and an optional ungraded recommendation (stages 0–2). Its separate NILA-FUNDING opening scenario is not the roadmap case opening. CASE-NILA-HOMEWARE 1.0.0 replays all six rounds: disclosed base/late-receipt setup, ordered staged hints, predictions, financial commitments, ungraded explanations and an explicit Finish action. Its period is completed rounds (0–6); action revision is decision count, independent of period. A replay action marks prior exposure at a restarted round; earlier completed-round actions are copied into a new record while the source is retained. Existing three-round preview prefixes remain valid and resume at round four. PRACTICE-FINANCE-CHECK 1.0.0 stores a starter/alternate dataset, timestamped raw responses with question versions, ordered question-scoped hint stages, and explicit Finish; its period counts distinct submitted tasks, not correct answers. Recompute all checks and misconception feedback from installed definitions. Reconstruct requested-help and worked-answer-before-response chronology; later hints never alter earlier attempts. Keep explanations ungraded. Unknown activity versions remain recovery data. |
| Navigation | Last canonical hash, validated against current routes and the restored runs. | The current run/clue resolves from its record, never from an obsolete snapshot. |

Do not save search text, an open menu/dialog, hover, graph coordinates, input drafts, pending hint consent, generated answer keys, scores, derived financial balances, browser identity or personal/account data. Keep scroll snapshots in memory. Import never requests a network resource from the file. Imported text is parsed as JSON and rendered as text, never evaluated.

## Identity and compatibility

Stable concept IDs remain unchanged. Legacy topic questions receive a deterministic version digest of their authored prompt/options/answer definition; correctness always comes from the installed definition. Integrated questions already have canonical concept/content/question versions. P02 begins at scenario version `1.0.0` with stable clue IDs P02-C1, P02-C2 and P02-C3; its manifest also fingerprints the authored clue definitions. A changed definition requires explicit compatibility/migration review rather than automatic score carry-over.

Validate the root format/schema, record identity, versions, choices, hint bounds, uniqueness, run indices and progression. Rebuild from whitelisted fields into new objects; never spread unknown objects into state. Unknown/future schemas, unavailable activity versions and incompatible question versions produce a recovery result, not credited progress. Preserve the original stored bytes and existing valid in-memory record. There is no known earlier cross-session save format to migrate silently. A version-0 fixture must therefore receive an explicit unsupported-version recovery message without a crash or overwrite.

Limit import text to 5 MiB and bound record/response arrays before processing. Reject malformed/non-finite/out-of-range inputs and impossible progression. Imported `correct`, `score`, answer-key or derived-balance fields cannot award credit. Completion requires the trusted current answers and explicit finish evidence. This is local self-reported practice history, not a tamper-proof credential.

## Save and return

Save after committed answers, retries, hint requests, start/advance/finish/replay, saved-topic changes, actual exploration and committed simulation decisions once available. Draft input is not a committed decision. Use an atomic key replacement. Keep the last successful record if serialisation/storage fails and show that current changes remain in memory with Export available. Never show “Saved” after a failed write.

On startup, read and validate before resolving a saved run link. An explicit current URL takes precedence; otherwise restore the last validated route. An invalid/missing run link opens recovery and never starts or replays a run. Restoring an unanswered lesson detour preserves the explicit hint gate; no saved route bypasses it. Resume retains current period, choices, first responses and hints. Refresh does not create another run or duplicate completion.

If storage is unavailable, continue in memory with an honest retention message and Export. Corrupt/unsupported stored data pauses automatic overwrite. Provide recovery/export of the original and an explicit fresh-start/reset action. A newer change in another tab also pauses conflicting writes; do not silently merge or overwrite histories. Compare the last-read raw record before writes and respond to the browser storage event.

## Export, Import and Reset

Export downloads the versioned JSON record with a clear date-based filename. It contains local learning/decision records and no correctness keys; it is a backup, not a mastery certificate. Export does not send data anywhere.

Import first parses and validates a selected local JSON file. Show a concise preview of saved concepts, attempts and runs. Only an explicit **Replace this browser’s learning record** action replaces existing data. Invalid imports leave the current record intact. Imports replace rather than merge, preserving history order, canonical question identity and run links. Recompute all scores from trusted definitions. A concurrent newer record requires renewed review instead of silent replacement.

Reset opens a labelled confirmation describing that local saved concepts, attempts, hints and activity records will be deleted from this browser. Cancel changes nothing. Confirm deletes only the application-owned key and resets its in-memory learning state and activity return context. It does not clear unrelated site data or existing downloaded exports. Do not immediately recreate an empty record; save again on the next meaningful learning action. Focus returns to a useful control, and the status confirms the outcome or the storage error.

## Review and implementation boundary

The scoped design review checks current state ownership, version identity, first/latest evidence, hint timing, duplicate completion, navigation gating, local-only wording and deletion scope. User authorisation to complete tasks sequentially covers implementing this contract; no separate chat approval is introduced. The app itself still requires explicit learner confirmation for Import replacement and Reset.

Task 05.2 must demonstrate round-trip preservation, fresh/denied/quota storage, corruption, version mismatch, old/future schema, invalid imports, wrong-first/correct-latest/retry, hinted answers, multiple runs, deduplicated completion, reset cancellation and confirmation. Simulation persistence must be extended with the registered model/activity versions when those tasks are implemented. This design does not claim persistence is enabled or browser QA has passed.
