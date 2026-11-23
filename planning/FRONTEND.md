# Pirates Plan frontend

The public room opens from Rooms → Pirates Plan. [room.html](room.html) is a styled standalone preview and contains the bounded template used in the main page.

## Integrate against fresh source

Fetch the current default branch, then run:

    python3 planning/integrate_plan.py --root .

The integrator replaces the marked planning fragment and checks its hash routes and data scripts. The shared site shell owns the navigation. The optional `--expected-sha256` checks the local input before writing.

After changing a CSS source used by Home, refresh its stylesheet:

    python3 assets/build_home_css.py

The maintainer must still use the current remote parent/blob when publishing. Other contributors were updating the same site during this addition. Preserve all existing Gemini/Claude content and router aliases.

## Data

The renderer reads window.ENCAPSULATOR_PLAN from assets/pirates-plan-data.js. Canonical content remains planning/roadmap.json; the full reading copy is planning/next-treasures-hunt.md.

The page supports repositories, stages, routes, typed edges, decisions, externalBridges, rupertMilestones, and an optional pageUrl. A nonempty pageUrl displays the native Planning Page link with a sharing-access hint. The Rupert milestones appear in the full expanded collatz_rupert_delay_embedding plan.

All display text uses textContent. Source URLs must use HTTP or HTTPS. Links that open another origin use noopener and noreferrer.

The scientific atlas catalogue is not modified by this renderer. The five connection types are:

- Existing navigation: a verified hyperlink, not a code dependency.
- Existing code link: available as a distinct type, only use after proving the dependency.
- Shared mathematical object.
- Proposed reuse.
- Analogy to test.

## Interaction

- Whole portfolio map: all repositories grouped by research family.
- Select a node, the repo chooser, or a keyboard-list button: focus its direct neighbourhood.
- Select a route: focus its repository and edge subset.
- Graph short labels use shortName; full names remain in title, aria-label and the equivalent text controls.
- Every edge opens its mechanism, current evidence, next experiment, deliverable and sources.
- Evidence level is independent of relationship kind: `known` uses solid cyan, `proposed` long gold dashes and `speculative` purple dots. The ledger also shows each edge's known basis and open question. Explicit source qualifications override the relationship-kind fallback.
- `?evidence=speculative` filters the graph; `?edge=E44` highlights a connection and its endpoint repositories. The labelled connection selector provides the same interaction without requiring a precise SVG click.
- `?path=next-treasures` and `?path=newton-lidar` show numbered expeditions. Orange dash-dot arrows are suggested work order, not mathematical implications. Each stop has a target, gate and stage; focusing a stop preserves the itinerary and offers a return control.
- The reset restores the whole graph and its initial internal scroll position. Search debounce callbacks cannot navigate away from another room. Reading selected-edge evidence clears a ledger search that would otherwise hide it.
- Register search includes repository content, incident-edge metadata, linked external bridges and research-route keywords.
- Connection search includes labels, endpoint names, mechanism, status, next experiment, deliverable, keywords and sources.
- Filter the register by family, priority and source visibility; sort by rank, meaningfulness, importance, ROI or name.
- Direct repository links use #pirates-plan?repo= followed by the encoded exact repository ID.
- Direct concept links use #pirates-plan?q= followed by the encoded search string.
- Initial deep links scroll to the selected map or search results after data rendering. Subsection aliases retain their expected position after rendering.

The graph is deterministic SVG with no external layout dependency. On narrow screens its overflow stays inside the labelled, focusable graph region; the repository chooser and text-node list offer the same navigation. Motion is not required.

## Verification performed

The JavaScript passes Node syntax checking. Pure checks against the final 32-repository/43-edge data confirmed:

- All 32 repository nodes receive positions inside the map bounds.
- All 12 private repositories are included by the private-source filter.
- Research-route filtering returns the declared repository subset.
- Repository IDs and queries survive URL encode/decode, including punctuation.
- DNA, Mahler, Norpert, coolie starter, Lyapunov and LiDAR all recover related work through the combined search index.
- The index integrator is idempotent, preserves content outside its markers when reintegrating, retains existing rooms and assets, and rejects a stale expected local hash.

No browser success is claimed by these local checks. Local Chromium could not start because socket creation was denied in the runtime. The publishing agent handles live browser review.

Recommended live review: direct repository and concept links; all 32 nodes; full and focused graphs; each connection-kind filter; an expanded Rupert plan with seven milestones; private/public filters; one empty search and reset; a route; keyboard selection; Page link; existing room navigation; and phone-width overflow. The static SVG has ordinary text/control equivalents, so the programme is still navigable without pointer interaction.
