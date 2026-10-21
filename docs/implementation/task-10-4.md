# Task 10.4 — Loading and mobile preparation

Status: **Waiting in the ordered backlog; implementation prepared while 10.3's external verification remains open.** Raj requested all remaining steps on 20 October. This prepares independent source improvements without treating the predecessor, physical-device checks or pilot as complete.

## What changed

The browser previously received every detailed lesson and area guide in its initial JavaScript. The generator now keeps compact navigation/assessment/save-validation metadata in `lesson-summaries.json`, and writes forty domain study bundles. The full topic/area material loads when its study component is actually mounted. Concurrent topic and area requests share a promise; successful loads are cached, failed/malformed responses leave no poisoned application cache, and obsolete responses cannot replace another selected area's content.

The server-render path still loads complete material synchronously. All 698 rendered-page checks continue to inspect the actual detailed content, rather than a loading placeholder. A generated-content test compares every deferred record/guide with the original complete authored output. Content/assessment versions and raw learning records are unchanged.

Loading and failure notices keep their place in the lesson and offer a retry. They do not replace, reset or submit learning records. Initial bundle failures also have a small HTML fallback and an explicit retry action; saved browser data is not changed by that fallback. Mobile source refinements let fieldsets, legends, long headings and action text shrink/wrap within their containers. These source changes are not evidence of a physical-device or zoom pass.

## Measured build footprint

`npm run check:loading` inspects the production manifest, verifies HTML/stylesheet references, and rejects a study bundle in the initial static dependency graph. Exact current values are in `loading-build.json`.

The measured initial JavaScript fell from approximately 3,718.70 KB / 789.58 KB gzip to 2,683.68 KB / 484.43 KB gzip. The gzip estimate is about 39% smaller. Forty deferred bundles total about 1.08 MB; the largest is about 51 KB. Initial CSS is about 39 KB. The remaining initial bundle is still large and is not claimed to be optimised completely.

These are built byte counts and gzip estimates, **not measured phone load time, throughput, INP or responsiveness**. The exposed browser is Chrome/CDP, at 1348 × 936 CSS pixels, with no configured CPU/network throttle. Browser Performance timings, a supported viewport/orientation controller and enabled reduced-motion testing were not exposed. No unsupported device/network performance claim is made.

## Verification and remaining work

- The original desktop learning record, complete mystery, six-round case, practice and transfer remain usable; the full render and model gates are retained.
- Production-preview loading/recovery results and any limitations are recorded with task 11.1. A failed QA setup is not counted as an application or learner pass.
- Actual 320 CSS-pixel, portrait, landscape, 200%/400% zoom and stated mobile/network timing checks remain required. The fieldset/wrapping source changes do not close them.
- Existing numerical, accessibility and storage gates stay ahead of publication. No public deployment has been made by this task.
