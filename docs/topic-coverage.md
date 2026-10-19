# Topic coverage register

Task 04.3. Generated from the master inventory, compiled lessons, explicit package integrations and first-release selection. Run `npm run prepare:content` to refresh and `npm run check:coverage` to detect stale output.

Content existence does not establish editorial review, professional completeness or learner mastery.

| Measure | Current coverage |
| --- | ---: |
| Stable concept records | 698 |
| Explanations / worked examples / topic quizzes | 698 / 698 / 698 |
| Integrated lesson pages / canonical packages | 31 / 30 |
| Distinct embedded practice questions | 61 |
| Editorially reviewed concept records | 31 |
| Selected first-release concepts | 30 |
| Selected integrated / reviewed | 30 / 30 |
| Playable labs / planned labs | 3 / 0 |
| Playable cases / planned cases | 2 / 0 |
| Concepts with playable applied assessment | 26 |
| Concepts without playable applied assessment | 672 |
| Learning / financial relationships | 2127 / 393 |
| Computed model dependencies | 0 |

A02 and T06.04 share the receivables package and three practice records. They remain two navigable concepts. Deep-content aliases describe reused reading material and do not merge concept IDs or independent question records. The separate accounting-equation authoring fixture is excluded from converted coverage; its integrated lesson has its own package.

Review records name the reviewer and method. Converted-package reviews are AI content, source and arithmetic checks, not independent professional approval or learner-pilot evidence. Page totals include the receivables alias, which shares one canonical package and review.

A playable applied assessment means an implemented case question mapped to that concept. A reference lesson or reading-trail stop does not establish applied assessment. P02 as a case and P02 as a reference trail are kept separate. Planned activities have no playable route.

## First-release batches

| Batch | Focus | Concept IDs | Integrated pages | Reviewed concepts |
| --- | --- | --- | ---: | ---: |
| 04.4-B1 | Accounting and collections | T04.01, T04.05, T06.02, A01, A02 | 5 | 5 |
| 04.4-B2 | Inventory and cash mechanisms | A03, A04, A05, A06, T07.14 | 5 | 5 |
| 04.4-B3 | Liquidity and financing | T14.03, T14.04, T14.15, A18, T07.09 | 5 | 5 |
| 04.4-B4 | Equipment and operating profit | A07, A08, A09, A10, T12.05 | 5 | 5 |
| 04.4-B5 | Investment and FCFF valuation | T03.01, T03.12, A11, A13, A19 | 5 | 5 |
| 04.4-B6 | Valuation interpretation | T17.12, T17.18, A15, A16, T17.04 | 5 | 5 |

## Domain coverage

| Domain | Concepts | Existing detailed mechanisms | Integrated pages | Reviewed concepts |
| --- | ---: | ---: | ---: | ---: |
| D01: Foundations of finance | 15 | 15 | 0 | 0 |
| D02: Mathematics and quantitative foundations | 15 | 15 | 0 | 0 |
| D03: Time value of money | 15 | 15 | 2 | 2 |
| D04: Accounting foundations | 17 | 17 | 3 | 3 |
| D05: Income statement: every major component | 22 | 22 | 2 | 2 |
| D06: Balance sheet: every major component | 23 | 23 | 5 | 5 |
| D07: Cash-flow statement and three-statement connections | 19 | 19 | 5 | 5 |
| D08: Advanced accounting and reporting | 16 | 16 | 0 | 0 |
| D09: Financial statement analysis | 19 | 19 | 0 | 0 |
| D10: Earnings quality, forensic accounting, and fraud | 15 | 15 | 0 | 0 |
| D11: Business economics and unit economics | 15 | 15 | 0 | 0 |
| D12: Corporate finance and capital allocation | 15 | 15 | 1 | 1 |
| D13: Cost of capital and capital structure | 20 | 20 | 1 | 1 |
| D14: Working capital and treasury management | 17 | 17 | 4 | 4 |
| D15: Financial planning, budgeting, and management accounting | 15 | 15 | 0 | 0 |
| D16: Financial modelling | 16 | 16 | 0 | 0 |
| D17: Valuation foundations and discounted cash flow | 25 | 25 | 8 | 8 |
| D18: Relative valuation and specialist valuation | 18 | 18 | 0 | 0 |
| D19: Equity markets and equity research | 17 | 17 | 0 | 0 |
| D20: Fixed income and debt markets | 17 | 17 | 0 | 0 |
| D21: Derivatives and structured products | 19 | 19 | 0 | 0 |
| D22: Portfolio management and asset allocation | 19 | 19 | 0 | 0 |
| D23: Investment vehicles and alternative assets | 19 | 19 | 0 | 0 |
| D24: Banking and credit analysis | 20 | 20 | 0 | 0 |
| D25: Financial risk management | 16 | 16 | 0 | 0 |
| D26: Mergers, acquisitions, and restructuring | 19 | 19 | 0 | 0 |
| D27: Startup and entrepreneurial finance | 17 | 17 | 0 | 0 |
| D28: Real estate, infrastructure, and project finance | 18 | 18 | 0 | 0 |
| D29: Insurance and actuarial finance | 16 | 16 | 0 | 0 |
| D30: Personal finance and wealth management | 18 | 18 | 0 | 0 |
| D31: Taxation in finance | 16 | 16 | 0 | 0 |
| D32: Macroeconomics, monetary policy, and public finance | 16 | 16 | 0 | 0 |
| D33: International finance and foreign exchange | 16 | 16 | 0 | 0 |
| D34: Market infrastructure, regulation, and governance | 15 | 15 | 0 | 0 |
| D35: Behavioural finance and financial decision-making | 14 | 14 | 0 | 0 |
| D36: Fintech, payments, and digital finance | 17 | 17 | 0 | 0 |
| D37: Sustainable finance and specialised financial systems | 14 | 14 | 0 | 0 |
| D38: Computational finance, financial data, and AI | 18 | 18 | 0 | 0 |
| D39: Industry-specific finance | 22 | 22 | 0 | 0 |
| D40: Applied cases, financial history, and integrated practice | 18 | 18 | 0 | 0 |

## Inspect individual records

- [Concept CSV](topic-coverage.csv): filter all 698 records by domain, batch, content, review and activities.
- [Relationship CSV](relationship-coverage.csv): all 2,520 stable edges with direction, conditions and learning/financial classification.
- [Structured register](../content/coverage-register.json): individual source paths, package versions, practice IDs, deferred scope, prerequisites, activity roles and gaps.

The register does not change the learner interface or progress records. Existing introductory content is not relabelled reviewed. Future reviews require explicit reviewer, date and evidence in the authored package or coverage policy. Specialist scope remains unassessed outside an explicitly scoped package. Financial edges describe conceptual relationships; none is asserted to be an implemented numerical dependency.

Sources: `content/master-network.json`; `content/lesson-aliases.json`; authored `.lesson` and `.deep` files through `src/data/complete-lessons.json`; `content/coverage-policy.json`; `content/first-release-scope.json`; integrated packages listed in the policy. Source fingerprints and deterministic generation detect stale records.
