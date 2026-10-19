# 06.2 — transactions and account balances

Pure immutable posting now implements owner funding, inventory, qualifying credit sale and assigned cost, invoice collection, consumed operating costs, equipment and borrowing. Referenced partial supplier/equipment/accrual/principal settlements and explicit equity issues/distributions share the same journal. Each line retains event, date and cash classification. No graph navigation edge becomes an accounting rule.

Seven posting checks plus the seven contract controls pass. The roadmap's exact snapshots, direct cash categories and deterministic replay match; stock/reference/duplicate/date/funding failures leave the previous state unchanged. Cash below the policy minimum remains a visible policy issue; negative executed cash is rejected with an explicit funding requirement.

Next, 06.3 derives period statements and close adjustments from this journal. No interest, depreciation or tax accrual is silently posted by a transaction. Review is scoped Codex AI numerical/code review, not professional or pilot evidence. Browser activity QA remains under 11.1.
