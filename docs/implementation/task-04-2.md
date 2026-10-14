# Task 04.2 — Receivables anchor lesson

The receivables sample now uses the lesson standard as an actual reading and practice experience. It expands recognition, gross/net balances, collections, expected-credit-loss allowances, covered write-offs, ageing, statement effects and cash interpretation around the fictional Nila Homeware teaching business.

## Implemented boundary

- One canonical versioned package renders on A02 and T06.04. The existing concept IDs, master edges and legacy topic quizzes remain valid. Other lessons retain their existing detailed format.
- A collection prediction appears between mechanism sections. A fully reconciled worked month follows the distinctions; two changed-data tasks then test gross/net reconciliation and a fully covered write-off. Each scenario is explicitly independent, with visible inputs, INR lakh units and assumptions.
- Worked reading stays expanded. Practice solutions and option feedback are absent from the initial DOM. Directional help leaves the solution hidden; a requested worked solution reveals it without submitting an answer. Retry preserves first/latest responses and revealed feedback.
- Trusted authored definitions determine correctness. Unsupported item/content versions and invalid choices are rejected. A02 and the grouped page share records, preventing duplicate practice credit.
- My learning displays three lesson-practice items separately from topic quizzes, case clues and finished cases. It distinguishes first unassisted success, latest success and requested help. Reflection has a visible self-check rubric and no automatic free-text grade.
- Source context, framework limitations and separate domain guidance remain labelled. The cash mystery is linked through its brief; the customer-collection lab is still planned. The existing unanswered-case hint gate and return context apply to the new lesson. The sticky return link now uses the measured sticky-header height so it remains visible while reading at either breakpoint.

## Financial review

The worked month has opening gross 20 and allowance 2, credit sales 50, collections 45, a fully covered write-off 2 and a required closing allowance 3. Gross closes at 23, net at 20, and the new allowance charge is 3. The receivables-only income-to-receipts bridge reconciles to the actual receipts of 45. The example also diagnoses a double-counted non-cash add-back; it is not presented as whole-company operating cash flow.

Independent tasks use different amounts. A covered write-off changes gross and allowance together; its assumed absence of a new charge is conditional on sufficient prior allowance. Framework-specific measurement, tax, significant financing and complete credit-risk estimation are deferred rather than represented by this introductory example.

IFRS Foundation revenue background, an IFRS Interpretations Committee paper quoting the receivable/contract-asset distinction, and IASB impairment-review background were checked on 14 October 2026. Links and supported claims are recorded in the package. The review paper is identified as background, not the complete governing standard. The sample remains in draft status for learner/content-density review before batch conversion.

## Validation and tracker recovery

- 31 content/session/navigation/contract/receivables tests pass, including all 698 detailed renders, independent arithmetic, first/latest records, separate counts, help, version guards and server-rendered solution protection.
- Production build and all four hosting checks pass. Package validation also runs during content preparation. No new dependency or hosting-scaffold changes.
- Chrome desktop/mobile checks cover wrong answer/correction/retry, shared records across A02/T06.04, directional versus worked help, separate My learning totals, case hint cancellation/acceptance, exact return and mobile reading without horizontal overflow.
- The pending 04.1 bookkeeping issue was traced to strict ordered readiness: 04.3 was correctly Waiting until 04.2 was recorded. The final tracker marks 04.1 and 04.2 Done, reconciles 11 completed / 27 first-release tasks remaining, and makes 04.3 Ready. All existing formulas and workbook structure are retained.

All application changes remain in draft PR #1; not merged or deployed. Progress remains session-only. Next: Task 04.3 — Build the topic coverage register.
