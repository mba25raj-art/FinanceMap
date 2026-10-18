# Finance Atlas lesson standard — version 1

Task 04.1 · 13 October 2026 · Authoring specification

Every lesson should help a learner explain an idea, distinguish its forms, use it with stated data and follow a meaningful connection. A short hover definition is an entry point. It never substitutes for the full explanation.

The reference site has detailed introductory material for 698 IDs. Selected first-release concepts are converted in six batches of five. `content/coverage-policy.json` identifies actual integrated lesson packages; the generated coverage register gives current counts and individual review status. A02 and T06.04 share one integrated receivables package and practice record set. Other aliases do not imply package integration. Review records name the reviewer and method, distinguishing AI content/source/arithmetic checks from professional approval and learner-pilot evidence. JSON in `content/standards/` remains non-published authoring material.

## 1. What the learner sees

| Layer | Contents and purpose | Reading behaviour |
|---|---|---|
| Hover or keyboard focus | One or two plain sentences defining the concept; relevant unit or basis where necessary. Aim for about 40 words, without sacrificing accuracy. | Same definition on hover, focus and tap-accessible help. No hidden essential data. |
| Orientation | A concrete question, learning objectives, prerequisites, scope and unfamiliar abbreviations. | Explain what the learner will be able to do. Let them choose reading or practice. |
| Topic mechanism | Ordered explanations of what changes, why, when and under which conditions. Define every formula term, sign and timing convention. | Full Atlas explanations remain expanded; sections can be collapsed for quick practice. |
| Types and distinctions | Relevant categories, similar-but-different concepts, when each applies and why confusing them changes a decision. | Do not invent categories just to fill a template. Principles can use distinctions instead of “types”. |
| Prediction checkpoint | A self-contained question between mechanism sections, requiring a prediction, classification or calculation. | Question data are visible. Its answer, feedback and worked solution appear after a submission or a deliberate hint. |
| Worked example | Scenario, input table, explicit assumptions, ordered calculations, result and interpretation. Include relevant statement effects and a reconciliation. | Keep detailed study available. Use different data from the independent checkpoint so reading does not disclose the identical answer. |
| Independent transfer attempt | A changed-number or changed-context task aligned with an objective, including a “why” or interpretation requirement. | No preselected answer. Retry retains the first response. Reading an answer-revealing hint is assisted practice. |
| Misconceptions | A plausible wrong interpretation, its correction and the observation that distinguishes them. | Feedback identifies the learner's actual mistake instead of repeating a generic answer key. |
| Connections | Stable linked concepts, relationship direction, purpose and conditions. | Explain why the next idea matters. Preserve the originating activity's return context. |
| Deeper study | Exceptions, advanced methods, specialist limitations and optional preparation links. | Separate this from the required introductory objective. Broader domain guidance has its own label. |

The recommended flow is orientation → mechanism segment → prediction → further mechanism → distinctions → worked example → transfer attempt → misconceptions → connections → deeper study and sources. A checkpoint identifies the mechanism segment after which it belongs. The future renderer must interleave it there; a JSON file alone does not implement that interaction.

## 2. Objectives, depth and scope

Use an observable action with a condition and expected evidence. “Understand receivables” is too vague. “Given an invoice and subsequent payment, explain the change in cash and receivables without recording a second sale” identifies a task and its causal explanation.

Each package has stable local objective IDs. Selected first-release lessons also map to the existing outcomes: LO1 transactions; LO2 profit and cash; LO3 liquidity timing; LO4 financing; LO5 investment; LO6 valuation. Topics outside that case still need local objectives; do not force them into these six outcomes. The 30-concept selection remains the reference for the applied release.

Depth is determined by the concept's mechanism and distinctions, not by an arbitrary word count. An author must cover the declared scope completely and state what is deferred. Explain an unfamiliar term where it first appears and add it to the glossary. Do not use the broader domain guide as the topic's mechanism. Grouped topics should cover their named components or explicitly identify an introductory boundary.

The coverage label remains **introductory study**. A structurally valid package is not financial editorial approval, a completed professional course or evidence that a learner has mastered the topic.

## 3. Example and reporting rules

Use fictional INR lakh examples by default. Every example declares its company or entity, unit, period/date, whether it is an isolated fixture or part of a shared case, and assumptions. Separate examples must be labelled separately; their opening and closing balances must not be presented as consecutive rounds of one company.

A worked example contains visible inputs, sequential reasoning, a result and an interpretation. Show account/statement changes where relevant; if a topic has no direct statement effect, explain that rather than inventing entries. Numerical examples must reconcile, use consistent stock/flow periods, distinguish percentages from currency and show sign conventions. Author reviews independently recompute material results; a schema check cannot certify arithmetic or economic validity.

Framework metadata distinguishes a conceptual teaching simplification from a framework-specific rule. A reporting-specific lesson names the framework, jurisdiction and applicable period. Its governing claims require primary sources, a source review date and an explicit statement of limitations. Do not present a hypothetical tax rate, supplied WACC or teaching convention as a current legal rule or market estimate. Expand abbreviations such as NOPAT and WACC before relying on them.

Further-reading links and sources supporting specific claims are separate roles. Record the claim or section supported by a source. A familiar official URL is not proof that it supports every sentence. Time-sensitive legal, reporting and market claims require current primary-source verification when authored or reviewed.

## 4. Practice and feedback contract

Each newly converted lesson has at least one checkpoint and one transfer attempt, mapped to its objectives. Version 1 specifies single-choice items with stable option IDs; it does not introduce automatic free-text grading. Use structured interpretation choices and a reflection prompt with a visible rubric where reasoning matters. More response types need a separately implemented contract.

For each item supply its own scenario, all inputs, assumptions, objective IDs, question, distinct options, correct option ID, option-specific feedback, an explained solution and hints. Distractors should diagnose an error in timing, sign, classification, assumptions or interpretation. Link misconception-specific distractors to the corresponding misconception record. Do not make speed or memorising answer positions the goal.

Worked examples and assessment scenarios have different IDs and independent data. Even if a formula is taught openly, the practice answer must still require applying it. Use a changed condition in the transfer attempt, not merely reordered options. On topics without numerical calculations, use classification, comparison, evidence selection or a decision under stated conditions.

The future interaction has these states:

| State | Visible response | Record implication |
|---|---|---|
| Unattempted | Question, inputs and available hints; no solution, correctness feedback or selected answer. | No answer credit. |
| Hint requested | Requested help and, when requested, the worked solution; choice remains the learner's. | Record assistance for this item. A hint does not submit an answer. |
| Submitted | Feedback tied to the submitted option; show calculations and causal reasoning. | Append response; keep first and latest submissions separate. |
| Retry | Clear the current choice while keeping revealed explanations and earlier responses. | Do not erase the first attempt or relabel earlier feedback as a new hint. |
| Transfer | New scenario and response history for that versioned item. | Evidence of transfer is separate from correcting the original question. |

An author may provide a non-revealing directional hint before a worked step, but must label whether it reveals the answer. The learner can choose to read the worked explanation instead of attempting; show that honestly as assisted practice. Do not claim the current topic-quiz reducer already records all these future states. Existing case hints and session records remain governed by Tasks 02 and 03.

Question solutions must not be mounted in visible or accessibility content before an attempt or hint. This is a learning interaction rule, not a claim that client-side answer keys are secret from developer tools. Full reference reading remains available through a deliberate reading action, and the 03.3 case hint gate still applies to unanswered case detours.

## 5. Connections, aliases and activities

Reuse the master concept and edge IDs. A relationship's endpoints, type, direction and financial-versus-learning classification must match the master inventory. Preserve the explanation and conditions. A prerequisite, shared-topic link or deeper-study link is not a numerical model dependency.

The new authoring examples identify links by their existing edge IDs. Version 1 marks them `computed: false`; numerical dependency claims need a verified model and scenario version in the later model tasks. The 20 anchor aliases can reuse authored material without changing navigation IDs. Reusing content does not justify awarding duplicate independent evidence for one response.

Activity links declare their kind and availability. P02 is the playable three-clue case. Customer collection, equipment investment, financing comparison and the longer Nila Homeware case are planned activities. A planned link may explain its intended application or open supporting reference material; it cannot promise a playable lab or count completion. A02's applied lesson will link to the appropriate collection activity in 04.2.

## 6. Authoring package and checks

Start from `content/standards/lesson-package.v1.template.json`. Fill every author placeholder. The non-published accounting-equation fixture illustrates the contract with two distinct practice scenarios and an isolated worked example. It is not the receivables sample or a new case round.

| Field | Authoring responsibility |
|---|---|
| Identity and versions | Existing concept ID, content version and separate question versions. |
| Scope and objectives | Covered/deferred boundaries, observable evidence and optional applied outcome mapping. |
| Context | Fictional entity, units, timing, assumptions, framework basis and glossary. |
| Topic sections | Mechanism segments, distinctions, worked example, statement effects and misconceptions. |
| Practice | Checkpoint and transfer placement, independent data, feedback, solution and hint policy. |
| Connections and deeper study | Existing edges and concept IDs, conditions and explicitly separate domain guide. |
| Sources and review | Source roles and support claims; editorial status, reviewer, date and evidence notes. |

Run `node scripts/lesson-standard.mjs PATH_TO_PACKAGE.json` to check a populated package. The validator checks structure, identity, duplicate IDs, objective references, practice data, reveal policy, source roles and relationship classification. It does not migrate records, render questions, grade learner work, verify a source's contents or certify financial correctness. Template placeholders intentionally fail this command.

Before marking a lesson reviewed, verify: (1) declared mechanism and distinctions are complete; (2) terms and framework are precise; (3) numerical answers are independently recomputed; (4) inputs, units and timing are visible; (5) distractors and feedback agree; (6) linked concepts and activities have honest availability; (7) study and practice do not disclose the same unanswered solution; (8) domain material is separate. Record reviewer, date and evidence in the package. Browser checks follow when that package is integrated into a renderer.

## 7. Existing content and next handoff

The existing `.lesson`, `.deep`, quiz prompt and feedback files remain the general renderer's inputs. The explicit package overrides are validated during content preparation and retain their legacy topic quizzes and separately labelled domain guidance. Their summary maps to hover, deep explanations to mechanism, categories to distinctions, worked-case fields to example, and traps/option feedback to misconceptions. New objectives, explicit reporting metadata, interleaved checkpoints, transfer variants and editorial evidence require authoring during conversion. The legacy compiler must not label all 698 pages converted merely because it can populate some fields.

The authoring contract, receivables sample and coverage register are implemented. Batches 04.4-B1 and B2 convert and review the first ten selected concepts with 21 distinct embedded practice questions. Next is 04.4-B3, covering liquidity and financing. Parent completion requires evidence for all six batches. Learner piloting, persistence and the financial model remain separate roadmap tasks.

Source basis: implementation roadmap, page 7; Task 01.2 learner/outcome specification; current master inventory and lesson compiler; the reconciled lab scope in the backlog. This is an authored product standard, not a learner-study finding. No publication or website behaviour change is part of this task.
