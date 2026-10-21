# Task 11.4 — Release and rollback preparation

Status: **Waiting; no merge, Pages publication or public verification performed.** The user requested all remaining steps; no new general publication-permission question is pending. Verification and actual learner-pilot gates are still open.

## Concrete release candidate

Use draft PR #1 and its final pushed commit, recorded in the implementation backlog. The existing workflow is `.github/workflows/deploy-pages.yml`; it builds/deploys main pushes or an explicit workflow dispatch. No replacement hosting project is required.

The candidate retains all 698 lessons, thirty selected canonical packages, the three labs, six-round case, practice/transfer separation and browser-local saves. Detailed study is deferred in forty bundles; build, content, numerical, accessibility, loading and hosting gates must pass together. An existing large initial bundle remains a performance limitation even after the measured byte reduction.

Before publication, resolve actual screen-reader/device/preference checks, run the willing-learner pilot and record resulting fixes or a specific reviewed scope exclusion. Preparation, source review and technical QA do not supply those decisions.

## Execution checklist once the gates are resolved

1. Review the concrete candidate and its issue register. Record the exact approved scope and candidate SHA.
2. Verify the last successful public Pages deployment and retain its deployed SHA/artifact. Main's source was verified on 20 October as `c4e504c626c19423f0f5030015acef0b942096da`; **that is a rollback source candidate, not proof of what is currently deployed**.
3. Use the existing PR/workflow with the publication authorisation available at that time. Do not bypass failed checks or force-push main.
4. Verify the actual successful deployment commit, returned public URL, generated asset paths and forty deferred study files. A local build or source push is not publication evidence.
5. On the public build, test a stable lesson link, Cash flow tab, wrong/correct/retry, local save and reload, the complete company case and recovery controls. Confirm download paths and a fresh study-bundle request. Record browser/device/version and findings.
6. Record the release version, actual deployed SHA, limitations and verified URL in the backlog.

## Rollback method

If the published candidate introduces a blocker, use a normal revert commit/PR for the release merge on main, run the same workflow and verify that the restored public assets/journey match the retained prior deployment. Preserve later saved browser records; do not instruct learners to clear their data as a rollback. Keep Export available and retain unsupported records rather than silently overwriting them.

The rollback has not been executed. The preceding public deployment and final public URL still require verification at release time.

## Explicit publication instruction · 21 October

Raj requested “make it live and check” after being told the updated candidate was still a draft and the device/assistive/performance/pilot checks were open. The instruction authorises publishing the verified current candidate now through existing GitHub Pages. Those human checks and pilot results remain unperformed and must not be marked complete. The earlier hold on publication is superseded for this release; implementation/backlog status and observed results remain separate.

Before publication, main is `c4e504c626c19423f0f5030015acef0b942096da`; retain it as the preceding source. A source SHA alone is not proof of the preceding deployed build. The final application candidate passed 214 checks and both root/Pages-prefix builds. This continuation changes publication records only. Actual merge, workflow, deployed SHA, returned URL and post-deploy findings will be recorded after execution.
