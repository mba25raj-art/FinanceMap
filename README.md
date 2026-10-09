# Finance Atlas

An interactive first build of the finance guide, grounded in the master Finance Connection Atlas. It uses React and Vite, with a D3 force layout for the data-driven network and Heroicons for UI icons.

## Run locally

```sh
npm install
npm run dev -- --host 0.0.0.0 --port 4173
```

## Build and verify

```sh
npm run prepare:content
npm run build
npm run test:content
npm run test:sites
```

The starter's Worker and Sites packaging are preserved. The public website is deployed to https://mba25raj-art.github.io/FinanceMap/.

## Experience

- Balance sheet, income statement, and cash-flow statement with hover or keyboard-focus definitions and clickable rows.
- A contextual concept pane with an introductory definition, formula, question feedback, worked example, assumptions, source links, related topics, and back navigation.
- A local concept graph and a 40-area overview. Graph nodes also appear as keyboard-operable buttons.
- A searchable catalog of all 698 concepts, with finance-area, depth, and session-practice filters.
- One complete three-clue cash-flow case and 24 selectable learning journeys from the atlas.
- Session-only exploration history, answered decisions, saved concepts, unanswered/retry filters, and connected-question navigation. Visits are never presented as mastery.
- Downloads of the original PDF and workbook.

## Content model

`content/master-network.json` is the unchanged canonical atlas export. It contains 678 original topic units, 20 atomic anchors, 2,520 relationships and 24 journeys. Stable IDs connect every entry point.

`scripts/prepare-content.mjs` derives the smaller browser dataset, validates counts and referential integrity, and keeps unused authoring metadata out of the client bundle. Update the canonical source, then regenerate; do not edit the derived `src/data/network.json` by hand.

`content/lessons/` contains 678 topic-specific foundational lessons, examples, and quizzes. `content/domain-guides.json` provides 40 explicitly labelled analysis guides. Self-contained prompt and calculation-feedback overrides are in `quiz-prompts.json` and `quiz-feedback.json`. The 20 expanded atomic lessons and additional statement examples remain in `src/data/lessons.js`.

`scripts/prepare-lessons.mjs` validates complete coverage and compiles `src/data/complete-lessons.json`. The generated file is excluded from git; development, builds and content tests regenerate it from the authored sources. Do not edit it directly. `content/lesson-coverage.json` records the current website status separately from the historical atlas metadata. Every one of the 698 concept IDs has a foundational explanation, illustrative example, and quiz. This is introductory coverage across the complete map, not a complete professional course for every specialist subject.

Examples are illustrative, not company filings or live market data. Tax rates are assumptions; legal and reporting rules require the applicable country, period, and framework. Financial links remain distinct from preparation links. Progress uses the latest answer within the open session, and is not evidence of mastery.

## Next implementation boundaries

Longer specialist modules, additional quiz difficulty levels, and source-specific company cases can extend the foundations. Cross-session progress needs a deliberate persistence/account design. The public website is deployed to https://mba25raj-art.github.io/FinanceMap/.

## Verification

See `design-qa.md` and `qa/` for browser evidence and visual comparison. The first screen uses the light Statement Explorer mockup. The network's dark canvas borrows the complementary Connection Atlas direction while keeping the shared light workspace and typography.

## GitHub Pages

Automatic deployment is configured in `.github/workflows/deploy-pages.yml`. See [GitHub Pages setup](GITHUB_PAGES_SETUP.md) for repository setup and publishing.

## Expanded teaching material

All 698 concept pages now have individually authored detailed lessons: mechanisms, types and important distinctions, a topic-specific case with ordered steps, result and interpretation, and application checks. All 678 original topics and 20 anchors are covered by `content/deep-lessons/` and the compiler's explicit anchor aliases. Each page also retains its foundational explanation, original example and self-contained quiz. The 40 broader area guides remain clearly labelled and separate from the individual lessons. This is detailed introductory coverage across the full map; specialist subjects still have scope for additional advanced modules, real-company cases and jurisdiction-specific material.

Full lessons open by default. The teaching material precedes the topic quiz; feedback stays hidden until a selection. Use **Jump to the full explanation & examples** to move directly from the definition to the reader, or collapse it for quick practice.
