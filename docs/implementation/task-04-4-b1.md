# Task 04.4-B1 — Accounting and collections

Five selected concepts now use the lesson standard: T04.01 accounting equation, T04.05 cash versus accrual accounting, T06.02 cash and cash equivalents, A01 revenue recognition and A02 trade receivables. T06.04 also renders the same receivables package. These are five canonical packages and six navigable pages, not six independently authored lessons.

## What changed

The four new packages contain objectives, named mechanism sections, distinctions, independent worked examples, statement effects, misconception-specific feedback, a prediction checkpoint and a changed-context transfer task. The receivables sample was reviewed for scope, density, terminology and arithmetic, and its existing three questions and record identities were retained. There are eleven distinct embedded questions across B1.

`src/StandardLesson.jsx` renders the packages using the existing expanded lesson layout. Each input row now shows its unit, including months where needed. Broader domain guides and legacy topic quizzes remain separate. Planned labs and the longer Nila case remain labelled planned. Connections preserve master IDs and conditions, including return context. Introductory hover/summary definitions come from the integrated package.

The practice registry names each canonical lesson and question version. New actions identify their canonical owner, preventing another lesson from borrowing a question's identity. The original receivables action format and keys remain supported. First/latest answers, hints, retries and revealed explanations keep their existing meaning. My learning aggregates the eleven questions and shows per-lesson progress without inflating topic quizzes, case clues or completion totals. A02 and T06.04 share one receivables record set. Other deep-reading aliases do not automatically become integrated pages or shared assessments.

## Content review

Review by **Codex (AI content, source and arithmetic review), 19 October 2026**. The package metadata records that method explicitly. This is not independent professional approval or learner-pilot evidence. The lesson scope remains introductory and the examples remain fictional, independent INR lakh scenarios.

| Concept | Mechanism and important distinctions | Independently reconciled worked result |
| --- | --- | --- |
| T04.01 | Resources, obligations and residual ownership; asset exchange, borrowing, supplier credit, earnings and distributions. A balanced statement is not proof of complete or correct measurement. | Cash 67 + inventory 5 = liabilities 24 + equity 48. Profit 11 differs from cash increase 27. |
| T04.05 | Separate performance and settlement; receivables, unpaid wages, prepaid coverage and unfulfilled customer advances. The cash-basis comparison is a scoped operating surplus, not a statutory tax method. | Profit 10 bridges to operating cash +8 using receivables −12, inventory +12, wages payable +2 and prepaid insurance −4. Closing assets 44 reconcile to liabilities 2 + equity 42. |
| T06.02 | Apply purpose, liquidity, known amount and value-risk tests together. Measure short maturity from acquisition. Distinguish cash classification, use restrictions and a hypothetical management buffer. | Reported cash/equivalents 21; usable for the stated decision 17; above the assumed buffer 14. A qualifying internal transfer leaves the total unchanged. |
| A01 | Performance and control transfer versus an order, invoice, advance or collection. Distinguish delivered allocation, receivable, contract liability and gross profit. | Month 1 revenue 24, cost 14, gross profit 10 and closing receivable 7. Cumulative receipts 17 + receivable 7 = revenue 24; current-month receipts are only 5. |
| A02 | Recognition/collection, gross/net, allowance/covered write-off and consistent cash bridges. The loss allowance is not customer cash, and an uncovered write-off may need a new loss. | Gross 23, allowance 3, net 20 and allowance charge 3. The receivables-only bridge reconciles to customer receipts 45 without double-counting a non-cash add-back. |

Every practice task supplies independent data, units and assumptions. The changed-data tests cover a debt-funded equipment purchase, credit sale, wage accrual, insurance prepayment, partly earned advance, eligible cash components, a restricted demand deposit, a price-sensitive fund and advance settlement against a credit delivery. Reflection uses a visible self-check rubric instead of an automatic free-text score.

## Source boundaries

- Public IFRS Foundation Conceptual Framework and IFRS 15 overviews support introductory elements and recognition logic. They are not treated as a review of the complete governing standards.
- AASB's public publication of Conceptual Framework Chapter 1, paragraph 1.17, supports accrual timing. It is explicitly used as conceptual background, not an Indian filing rule.
- The IFRS Foundation IAS 7 overview, the accessible June 2023 AASB 107 definitions and the March 2022 IFRIC agenda-decision text support cash-equivalent conditions and the restricted-demand-deposit distinction. The cash lesson declares an international IFRS reference and defers local adoption, overdraft exceptions and complete presentation/effective-date questions.
- The receivables source links were rechecked. The 2019 staff paper is used only as background quoting the receivable/contract-asset distinction; the 2023 impairment review document is background, not a complete impairment manual.

Specific URLs, supported claims and review dates are in each package. Tax, variable consideration, complex over-time performance, principal-agent issues and specialist measurement remain deferred rather than silently simplified into current legal rules.

## Validation and limits

45 content/session/route/lesson/coverage tests, the production build, four hosting checks and deterministic coverage checks pass. The new checks independently recompute worked and assessment results, render every B1 route and all eleven initial practice states, check checkpoint placement and units, preserve old receivables keys, reject wrong owners/versions, and distinguish help from unassisted answers. Existing checks continue to render all 698 lessons and protect unanswered case detours and solutions.

The extension browser connection timed out. Binding the development server to 127.0.0.1 works around this environment's network-interface enumeration failure, but the cloud browser still cannot reach it (`ERR_CONNECTION_REFUSED`). No new interactive desktop/mobile or screenshot QA is claimed. Rendered-route and reducer checks pass; browser journey, layout and keyboard checks remain release work under 11.1. The existing large-bundle notice remains.

B1 is recorded complete for authored and verified scoped content, with the browser QA limit carried forward. Parent Task 04.4 remains In progress: five further batches still need their own content and review evidence. Next is 04.4-B2 — inventory and cash mechanisms. Session-only progress, persistence boundaries, lab availability and the financial-model roadmap remain unchanged. All code stays in the existing draft PR, unmerged and undeployed.
