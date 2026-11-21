# Evidence-order comparison

Status: implemented. **Collector delivery has not been verified; no audience result or winning variant is claimed.**

## Question and treatment

Does opening with a compact Coordinate Primer or with the identities, asymptotics and kernels lead more readers to open an argument or run the displayed mathematical check?

- **A:** Coordinate Primer first.
- **B:** Identities, asymptotics and kernels first.

Both versions contain the same content, cards, links, rails and colours. The longer coordinate construction and its argument sit inside a collapsed detail in the Coordinate Primer, so they do not pre-empt the comparison. Only the order of those two sections changes. The study is about presentation, not the truth, novelty or relative mathematical importance of a result. It is conditional on readers reaching the Math overview; it does not measure the arrival-map conversion rate.

## Assignment and denominator

Eligible browser tab-sessions receive a 50/50 cryptographic random assignment, retained in sessionStorage across reloads. Each can contribute at most one exposure and one primary engagement. Closing the tab ends this local assignment; it is not a unique-person measurement or a claim to match GA4's session definition. Shared devices and repeated visits can contribute more than once. A browser duplicating a tab may inherit sessionStorage and therefore suppress an additional exposure.

Exposure requires at least 50% of the introduction to the two sections to be in view for one continuous second, the Math overview to be active, the document visible, and the map dialog closed. An interrupted dwell resets. Primary engagement counts a user-initiated argument or verification-source link, the coordinate exhibit link, or the tower's finite-check button after that exposure. These are **intentional opens/runs**, not proof that a visitor understood an argument.

Preview links, `atlas_qa=1`, `atlas_preview`, Global Privacy Control, Do Not Track, and unavailable session storage are excluded from telemetry. Preview interactions are visible only in local diagnostics. No user identifier, mathematical input or query string is sent by this experiment. The existing analytics deployment remains responsible for its consent behaviour; no new vendor or bypass is added.

## Events and collection

`assets/evidence-experiment.js` sends these through `assets/atlas-study-analytics.js` to the dedicated Atlas study destination `G-1PTRMLFW2R`, using the existing `gtag` / dataLayer on the main site. A queued event is **not** evidence of successful GA4 collection.

| Meaning | A | B |
| --- | --- | --- |
| One eligible exposure | `atlas_ev_v2_a_exposed` | `atlas_ev_v2_b_exposed` |
| One intentional open/run | `atlas_ev_v2_a_engaged` | `atlas_ev_v2_b_engaged` |
| First stress-rail expansion | `atlas_ev_v2_a_stress` | `atlas_ev_v2_b_stress` |
| First finite-check run | `atlas_ev_v2_a_interactive` | `atlas_ev_v2_b_interactive` |

The primary rate is engaged event count / exposed event count **within the same arm and reporting window**. Secondary events describe usage and do not replace the primary outcome. Names encode the arm, so the basic aggregate does not require a custom dimension. Parameters additionally include `experiment_id=evidence_order_v2` and `evidence_variant=a|b`.

The main site retains its existing Google tag. A dedicated Atlas study web stream was created for `https://encapsulatorp.github.io` on 21 November 2026. Its enhanced measurement is off. The study adapter configures only this destination with automatic page views off and routes its events explicitly with `send_to`. It strips query strings and referrers from the study payload and excludes privacy signals. The QA route loads the study tag only when an explicit probe is requested.

`atlas_ev_probe_a` and `atlas_ev_probe_b` are diagnostic-only names with `debug_mode` and `validation_only`; they never enter the primary denominator. Successful queuing alone does not establish end-to-end receipt. Browser-side blockers, delivery loss and nonconsenting traffic can affect the observed population and event ratios. Existing collection and consent settings remain in force.

The earlier unverified v1 queue is not pooled with this v2 implementation.

## Decision rule before collecting a result

1. Verify both variants' event names in the intended property and verify that excluded previews do not arrive. Record the verified start date here, and start a fresh experiment version and storage key so pre-start deduplication cannot suppress official exposures.
2. Choose a fixed review window spanning at least two weekly cycles, a minimum practical improvement, and a sample-size target using the observed baseline. They are not filled with invented traffic numbers. Do not declare a winner until those choices are recorded.
3. At that fixed review, inspect the exposure allocation for a sample-ratio mismatch and inspect engagement / exposure per arm with uncertainty intervals. If allocation, collection or denominators fail, repair the experiment and use a new version identifier.
4. With valid data, retain the current default if the estimated improvement is too small or too uncertain. Do not repeatedly peek and stop at the first favourable comparison. Any estimate applies to this entry point and visitor population.

Default when assignment is unavailable: **B**, giving the stronger results the first position while keeping the elementary coordinates close by.

## Preview and maintain

- [A, excluded preview](https://encapsulatorp.github.io/?evidence=elementary&atlas_preview=1#evidence-start)
- [B, excluded preview](https://encapsulatorp.github.io/?evidence=asymptotics&atlas_preview=1#evidence-start)
- [QA guide](../qa/evidence-order.html)

Add `&atlas_qa=1` to show the local event receipt. It never sends experiment events. Review the DOM order, continuous exposure dwell, inactive-room/modal suppression, deduplication, privacy exclusion, and collector status when changing the experiment. A content or assignment change requires a new experiment version; do not pool incompatible versions.
