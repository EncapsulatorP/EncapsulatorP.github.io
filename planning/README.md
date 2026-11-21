# Pirates Plan maintenance

The public organization roadmap lives at **[Pirates Plan](https://encapsulatorp.github.io/#pirates-plan)**, titled **Next treasures hunt planning**.

## Canonical records

- `roadmap.json`: reviewed purposes, priorities, next targets, typed connections, evidence levels, stages, research routes, Pirate paths and external bridges.
- `repository-snapshot.json`: the complete organization inventory and source commits inspected for this edition.
- `next-treasures-hunt.md`: generated complete reading copy.
- `../assets/pirates-plan-data.js`: generated local browser payload.
- `room.html`: the bounded room fragment used by `integrate_plan.py`; the live fragment belongs in the root `index.html`.

Run `python3 planning/build_plan.py` after changing the canonical data. It checks complete inventory coverage, ranks, source pins, link endpoints, route membership, evidence boundaries, Pirate path stops and stage dependencies before generating the reading copy and browser payload. `page-blocks.json` is a local export for synchronizing the editable owner Page and does not need to be committed.

The owner Page is [Next treasures hunt planning](https://chatgpt.com/space/page_39c69fa6cd188191a9de30b945850662). Page access follows its sharing settings; the full research roadmap is independently public on the website.

## Update rules

1. Inspect and pin a source before changing a factual implementation-state claim.
2. Keep existing navigation, imported code, shared mathematical objects, proposed reuse and analogies distinct. A repository name or shared word is not a dependency.
3. Put the mechanism, evidence level, known basis, open question, next experiment and deliverable on every edge. Record a useful null result instead of silently dropping an unsuccessful connection. Evidence level is independent of connection kind: a reported manual comparison or numerical match can remain proposed or speculative even when a shared object exists.
4. Keep original and changed mathematical statements linked. Do not turn finite observations into universal claims or conditional results into unconditional ones.
5. Stage labels are earliest review windows. The published capacity assumption limits work to two active capsules; lower-ranked items remain queued until a slot opens.
6. Synchronize the generated views, the owner Page and the [organization Decision Targets](https://github.com/EncapsulatorP/.github/blob/main/DECISION_TARGETS.md) after a stage review.
7. Keep orange dash-dot Pirate path arrows separate from mathematical edges: they express suggested work order and gates. A proved-implication label requires a specific proof artifact and assumptions; the current audit does not certify any cross-repository equivalence merely from a shared object or working code.

For room-markup changes, fetch a fresh `index.html`, then run `python3 planning/integrate_plan.py`. It changes only the bounded planning room and its navigation, aliases and asset includes. Preserve concurrent work elsewhere in the site.

## Validation scope

The initial edition reviewed all 32 repository READMEs and recursive trees, selected core implementations, and the listed upstream controls. It did not run every repository's experiments or test suite. The source audit documents the specific small Rupert reproductions; upstream Noperthedron formal proofs were inspected, not rerun.

Private repository purposes, research links and planned work were disclosed with the owner's authorization. Their source links continue to require repository access. Raw audit caches, credentials and unrelated personal content are not part of this publication.
