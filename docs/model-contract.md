# Nila Homeware model contract — 1.0.0

Task 06.1 · fictional INR lakh distributor · 19 October 2026

Use one reproducible ledger for the company activities. `content/model/nila.v1.json` defines its opening state and assumptions. `references.v1.json` preserves the roadmap's exact sequence and the separately labelled 01.2 assessment fixtures. These are teaching assumptions, not a real entity, current tax rule, market quotation or reporting-compliance opinion.

## Opening position and scope

At 1 January 2026: cash 20, receivables 30, inventory 50 and net equipment 100; trade payables 25, principal debt 75 and total equity 100. Both sides total 200, exactly as the roadmap page 16. Opening equity is represented as contributed capital 100 and opening retained earnings zero. Ten lakh ordinary shares, opening invoice due dates, equivalent remaining equipment cost/life and opening loan terms are authored extensions. The roadmap did not specify those details.

The model reports calendar months from January 2026 through December 2027. Dates are ISO calendar dates interpreted in UTC, with no local-time/DST inference. Store currency internally as integer INR paise; one lakh is 10,000,000 paise. Display INR lakh to two decimals after calculation. Exact journal balance is required internally; source illustrative totals use the 0.01 lakh learning tolerance. Do not make floating-point equality a rounding substitute.

The chart separates cash, customer claims, stock, equipment cost/accumulated depreciation, ordinary supplier and equipment creditors, operating accruals, principal debt, interest/tax payables, contributed capital, opening retained earnings, distributions, revenue and each expense. Journal debits are positive and credits negative. Asset/expense/contra-equity balances are naturally debit; liability/equity/income/contra-asset balances naturally credit. Keep provenance per posting: source event ID/type/date, account and amount.

## Recognition and timing

| Mechanism | Specified rule |
| --- | --- |
| Owner funding | Explicit cash/capital entry; never revenue. Simple existing-owner contributions precede any new-investor issue. New equity funding uses a supplied pre-money value and current share count. |
| Stock purchase | Qualifying inventory cost on the receipt date. Explicit cash-paid portion and ordinary trade payable for the rest, with a due date. |
| Credit sale | Stated completed qualifying delivery recognises selling price in revenue/receivables and the supplied assigned stock cost in cost sold/inventory. Cost cannot exceed available inventory. No manufacturing, returns, impairment or hidden costing method. |
| Collection/settlement | An explicit invoice/payable reference and amount reduce its remaining balance. No repeated revenue/expense. Reject over-collection/over-payment and preserve partial balances/provenance. |
| Operating costs | A direct payment expenses a newly consumed cost; an explicit prior-accrual reference settles the obligation without repeating expense. |
| Equipment | Recognise qualifying cost on acquisition. State cash paid, any equipment creditor, availability date, residual and life. Payment before acquisition needs a deposit capability outside this scope; do not backdate or invent one. |
| Depreciation | Straight-line depreciable amount over supplied months, apportioned by available days in each calendar month, inclusive of availability date. Cap at cost less residual. Existing equipment starts with the equivalent remaining cost/life supplied in the scenario. |
| Debt/interest | Principal receipts/repayments affect debt and cash. The supplied rate uses simple Actual/365, including funding day and excluding the accrual end boundary. Accrue interest separately and settle the recorded payable. Do not compound unless a new contract says so. |
| Tax | Hypothetical 20% on positive period pre-tax income, no loss benefit or deferred tax. Accrual and later payment are separate. The reference-core sequence switches this and interest/depreciation off. |
| Period close | Generated accruals have deterministic period IDs and cannot be posted twice. Close seals the period; changing earlier choices requires replay from the original scenario. |

Transactions carry stable IDs and nondecreasing dates; same-date order is explicit. A failed operation leaves the prior state unchanged. Reject duplicate IDs, unsupported fields, invalid dates, non-finite/negative/over-limit inputs and inconsistent settlement/availability dates. `src/model/contract.js` provides current input validation and field-specific messages before the posting rules in 06.2. Outstanding-balance, stock and cash checks belong to that posting stage.

Cash cannot become negative in an executed ledger; return a funding problem with the unmet amount and buffer requirement, without inventing a loan or partially posting. The hypothetical minimum cash 3 is a separate policy signal. A funded transaction can be bank-affordable while missing that policy buffer. Activities must state/enforce their selected constraints. Forecasts may show negative unfunded cash explicitly as a funding need, not an executed balance.

## Statement and cash perimeter

Build all statements from the same journal history. Income is period revenue less cost sold, operating expense, depreciation, interest and tax. The closing balance sheet includes cumulative earnings in retained equity and owner distributions separately. No artificial revenue is created at collection or borrowing.

For this conceptual scenario, customer/supplier, operating-cost, interest and tax cash are operating; equipment settlement is investing; principal, equity funding and owner distributions are financing. Non-cash additions/accruals are excluded from cash categories and separately traceable. This is not a universal statutory interest/dividend policy or a claim about local IFRS/Ind AS adoption.

The operating working-capital perimeter is receivables + inventory − ordinary trade payables − accrued operating costs. Interest and tax payables have separate reconciliation lines; equipment creditors are excluded. The introductory lesson with only three balances remains a simpler explicitly stated perimeter. Cash reconciliation, accrual movements, opening equity/profit/distributions and assets = liabilities + equity must all agree. Depreciation is reversed once and no other non-cash adjustment is silently assumed.

## Forecast and valuation handoff

Task 06.4 implements dated receipts/payments and cumulative funding to an explicit minimum, project NPV, forecast operating drivers/reinvestment and a scoped FCFF DCF. FCFF uses operating tax/earnings before debt service and excludes borrowing; reported operating cash and total cash remain different measures. Match cash-flow/rate currency, period and claims; require WACC greater than perpetual growth. Add only explicitly excess cash under the operating perimeter and deduct each included claim once.

Preserve the independent 01.2 controls: cash forecast 6→1→−2 needs cumulative funding 2 then 5 to hold minimum 3; loan 10 at 12% for one year costs 1.2, while equity 10 at pre-money 40 dilutes new ownership to 20%; project −10/+6/+6 has NPV about 0.41322 at 10%; FCFF 10/12 with growth 3% gives enterprise 164.93506 at WACC 10% and 127.97619 at 12%. These fixtures are not cumulative company rounds.

## Verification and persistence

The roadmap core must produce: credit sale 20/cost 12 → profit 8 and assets 208; collection 10 → cash 30/receivables 40 with unchanged profit; borrowing 20 then equipment payment 30 → cash 20, equipment 130, debt 95, equity 108 and assets 228. Operating +10, investing −30 and financing +20 reconcile to cash change zero. Disable tax/interest/depreciation for this exact reference.

Additional independent fixtures cover accrual settlement, full-month depreciation, annual interest and hypothetical tax before those rules are enabled in 06.3. Posting, close and deterministic replay tests must pass before labs teach model output. A failed invariant must surface as an error rather than a lesson result.

Saves retain the registered scenario/version, current period and committed decisions. Rebuild journals, statements and valuation through validated deterministic replay; never accept imported balances or scores. Curriculum relationships remain distinct from the calculation rules. Only explicit documented model rules may support causal traces; no learning/navigation edge automatically becomes a dependency.

Review is a scoped Codex AI contract/source/arithmetic check. It is not professional approval, current legal guidance or learner-pilot evidence. Sources: retrieved implementation roadmap page 16 and 01.2 learner/outcome specification; conceptual IAS 7/IAS 16 background already bounded in the relevant lesson packages. Tasks 06.2–06.4 implement posting, statements, close, forecasts and valuation; their numerical checks are recorded separately.
