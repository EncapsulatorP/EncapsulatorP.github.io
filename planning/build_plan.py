#!/usr/bin/env python3
"""Validate roadmap.json and generate the browser payload and full reading copy."""
import json
import re
from collections import Counter
from pathlib import Path
from urllib.parse import urlparse, quote

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
plan = json.loads((HERE / 'roadmap.json').read_text())
snapshot = json.loads((HERE / 'repository-snapshot.json').read_text())
repos = plan['repositories']
edges = plan['edges']
by_id = {r['id']: r for r in repos}
stage_ids = {s['id'] for s in plan['stages']}
edge_by_id = {e['id']: e for e in edges}

def require(ok, message):
    if not ok:
        raise ValueError(message)

def https(url):
    u = urlparse(url)
    return u.scheme == 'https' and bool(u.netloc) and not u.username and not u.password

require(len(by_id) == len(repos), 'Duplicate repository IDs')
require(set(by_id) == {r['name'] for r in snapshot['repositories']}, 'Inventory coverage mismatch')
require(sorted(r['rank'] for r in repos) == list(range(1, len(repos)+1)), 'Ranks must cover the inventory once')
require(len(edge_by_id) == len(edges), 'Duplicate edge IDs')
allowed = {'existing-link', 'existing-code', 'shared-object', 'proposed-reuse', 'analogy'}
for r in repos:
    require(r['stage'] in stage_ids, f"Unknown stage: {r['id']}")
    require(r['visibility'] in {'public','private'}, f"Visibility missing: {r['id']}")
    require(all(1 <= v <= 5 for v in r['scores'].values()), f"Invalid score: {r['id']}")
    require(re.fullmatch(r'[0-9a-f]{40}', r['source']['commit']), f"Unpinned source: {r['id']}")
    for key in ['purpose','nextTarget','acceptance','stopOrPivot','effort','rationale']:
        require(bool(r.get(key)), f"Missing {key}: {r['id']}")
    require(https(r['url']) and https(r['source']['url']), f"Unsafe repo URL: {r['id']}")
    require(any(r['id'] in (e['from'],e['to']) for e in edges), f"Unlinked repository: {r['id']}")
    require(all(https(s['url']) for s in r['sources']), f"Unsafe source URL: {r['id']}")
for e in edges:
    require(e['from'] in by_id and e['to'] in by_id and e['from'] != e['to'], f"Invalid endpoints: {e['id']}")
    require(e['kind'] in allowed and e['stage'] in stage_ids, f"Invalid type/stage: {e['id']}")
    require(e['evidence'] and all(https(s['url']) for s in e['evidence']), f"Missing evidence: {e['id']}")
    require(e['mechanism'] and e['nextExperiment'] and e['deliverable'], f"Missing edge work: {e['id']}")
    require(e.get('evidenceLevel') in {'known','proposed','speculative'}, f"Missing evidence level: {e['id']}")
    require(e.get('knownBasis') and e.get('openQuestion'), f"Missing known/open boundary: {e['id']}")
for s in plan['stages']:
    require(all(d in stage_ids and d < s['id'] for d in s['dependencies']), f"Invalid stage ordering: {s['id']}")
for r in plan['routes']:
    require(all(n in by_id for n in r['repositories']), f"Unknown route repo: {r['id']}")
    require(all(e in edge_by_id for e in r['edgeIds']), f"Unknown route edge: {r['id']}")
    require(all(n in r['repositories'] for e in r['edgeIds'] for n in [edge_by_id[e]['from'],edge_by_id[e]['to']]), f"Missing route endpoint: {r['id']}")
for b in plan['externalBridges']:
    require(https(b['url']) and all(n in by_id for n in b['linksTo']), f"Invalid external bridge: {b['id']}")
paths = plan.get('piratePaths', [])
require(len({p['id'] for p in paths}) == len(paths), 'Duplicate Pirate path IDs')
for path in paths:
    require(len(path['stops']) >= 2 and path.get('summary'), f"Incomplete Pirate path: {path['id']}")
    stops = {s['repo'] for s in path['stops']}
    for stop in path['stops']:
        require(stop['repo'] in by_id and stop.get('target') and stop.get('gate'), f"Invalid Pirate stop: {path['id']}")
        require(stop['stage'] in stage_ids, f"Unknown Pirate stop stage: {path['id']}")
    require(all(e in edge_by_id for e in path.get('edgeIds', [])), f"Unknown Pirate path edge: {path['id']}")
    require(all(edge_by_id[e]['from'] in stops and edge_by_id[e]['to'] in stops for e in path.get('edgeIds', [])), f"Off-path edge endpoint: {path['id']}")

KIND = {'existing-link':'Existing navigation','existing-code':'Existing code dependency','shared-object':'Shared mathematical object','proposed-reuse':'Proposed reuse','analogy':'Analogy'}
def clean(s):
    return str(s).replace('|', '\\|').replace('\n', ' ')
def link(label,url):
    return f'[{label}]({url})'
def rl(r):
    return link(r.get('shortName',r['name']),r['url'])
def src(items):
    return ' · '.join(link(s['label'],s['url']) for s in items)

blocks=[]
near_term = (
    "## Next to build\n\n"
    "1. **Validatron first.** Start with the 48 admissible lanes modulo 210. Retrieve its statement and premises, attempt a Lean proof, "
    "and record the checker result, runtime, and model cost. Use failures to guide a new proof attempt "
    "or a narrower statement.\n"
    "2. **Playable proof applications · planned.** Use the [existing flying cubic quest]"
    "(https://encapsulatorp.github.io/treasure-hunt/quest/) as a prototype. "
    "Players should change a parameter, commit to a prediction, and test where the conclusion survives. "
    "Link each game to the precise statement and proof."
)
blocks.append(f"**Organization decision record · {plan['edition']}**\n\n{plan['summary']}\n\n**{link('Open the interactive Pirates Plan',plan['publicUrl'])}** · {link('Canonical roadmap data','https://github.com/EncapsulatorP/EncapsulatorP.github.io/blob/main/planning/roadmap.json')}\n\n{plan['scope']}")
blocks.append(near_term)
blocks.append('# How we will use this\n\n'+plan['capacity']+'\n\n'+plan['scoring']['description']+'\n\n**Priority bands:** P0 shared foundations; P1 next research queue; P2 conditional follow-on; P3 exploratory or source-recovery work. Every repository is covered. Queue inclusion does not mean all work is active.\n\n**Link labels:** Existing navigation means a checked hyperlink; shared object means inspected independent work on a named object; proposed reuse carries an experiment or adapter to build; analogy preserves an interesting question without asserting an identity. No operational imported computation between the audited organization main branches was established. The optional Goldbach tower adapter remains unresolved.\n\nThe audit reviewed every README and tree plus selected core files. It did not rerun every repository test suite or certify every historical result.')
key=['# Read the connection map','', 'The complete inventory and the research graph answer different questions: every current organization repository is registered, while connections record the documented, proposed and speculative bridges identified so far.','', '| Evidence level | Line pattern | Meaning |','| --- | --- | --- |']
for level in plan.get('evidenceKey', []):
    key.append(f"| {clean(level['label'])} | {clean(level['pattern'])} | {clean(level['meaning'])} |")
key += ['', 'A proved cross-repository implication requires a proof artifact and explicit assumptions. A shared object, a reported numerical match and a working hyperlink retain their narrower meanings. Every connection below states its known basis and open question.', '', '**Pirate path:** orange dash-dot arrows and numbered stops show the proposed work order. They do not assert a mathematical implication between consecutive repositories.']
blocks.append('\n'.join(key))
for path in paths:
    itinerary=['# Pirate path · '+path['title'],'',path['summary'],'',link('Follow this expedition on the map',plan['publicUrl']+'?path='+quote(path['id'],safe='')),'']
    for i, stop in enumerate(path['stops'],1):
        itinerary += [f"## {i}. {stop['title']}",'',rl(by_id[stop['repo']])+f" · earliest review {stop['stage']}",'','**Next treasure:** '+stop['target'],'','**Advance or pivot:** '+stop['gate'],'']
    blocks.append('\n'.join(itinerary))
st=['# Stages and decision windows','']
for s in plan['stages']:
    st += [f"## {s['id']} · {s['title']}",'',f"**{s['window']} · {s['effort']}**",'',s['target'],'','**Advance when:** '+s['gate'],'','**Depends on:** '+(', '.join(s['dependencies']) or 'Publication work in this session.'),'']
blocks.append('\n'.join(st))
rank=['# Full ranked repository register','','M/I/R = meaningfulness / importance / ROI, each 1–5. Effort is the first target estimate, not an allocated calendar commitment.','','| Rank | Repository | Priority / earliest window | M/I/R | First-target effort |','| ---: | --- | --- | --- | --- |']
for r in sorted(repos,key=lambda x:x['rank']):
    sc=r['scores']
    rank.append(f"| {r['rank']} | {rl(r)} · {r['visibility']} | {r['priority']} · {r['stage']} | {sc['meaningfulness']}/{sc['importance']}/{sc['roi']} | {clean(r['effort'])} |")
blocks.append('\n'.join(rank))
blocks.append('# Searchable research routes\n\nLocal search includes repo names, concepts and edge work. GitHub code search depends on the reader’s source permissions.')
for r in plan['routes']:
    nodes=' → '.join(rl(by_id[n]) for n in r['repositories'])
    blocks.append(f"## {r['id']} · {r['title']}\n\n**Question:** {r['question']}\n\n{nodes}\n\n**Target (review from {r['stage']}):** {r['target']}\n\n**Connections:** {', '.join(r['edgeIds'])}\n\n{link('Search this route in Pirates Plan',r['localUrl'])} · {link('Search organization code',r['searchUrl'])}")
blocks.append('# Repository purposes and next targets')
for r in sorted(repos,key=lambda x:x['rank']):
    sc=r['scores']
    blocks.append(f"## {r['rank']}. {r.get('shortName',r['name'])}\n\n**{link(r['name'],r['url'])}** · {r['visibility']} · {r['family']} · {r['priority']} · {r['stage']} ({r['reviewWindow']})\n\n**Purpose:** {r['purpose']}\n\n**Current source state:** {r['currentState']}\n\n**Planning status:** {r['status']}. M/I/R: {sc['meaningfulness']}/{sc['importance']}/{sc['roi']}. {r['rationale']}\n\n**Next target ({r['effort']}):** {r['nextTarget']}\n\n**Acceptance:** {r['acceptance']}\n\n**Stop or pivot:** {r['stopOrPivot']}\n\n**Connections:** {', '.join(r['links'])}\n\n**Sources:** {src(r['sources'])}\n\n**Reviewed commit:** {link(r['source']['commit'][:12],r['url']+'/commit/'+r['source']['commit'])} · {link('Open this graph neighborhood',plan['publicUrl']+'?repo='+quote(r['id'],safe=''))}")
blocks.append('# Inter-repository link ledger\n\nDirection records proposed artifact flow or the source of a hyperlink. A shared-object edge does not imply a theorem transfer. Each connection includes its next work.')
for kind in ['existing-link','shared-object','proposed-reuse','analogy','existing-code']:
    selected=[e for e in edges if e['kind']==kind]
    if not selected:continue
    lines=[f"## {KIND[kind]}",'']
    for e in selected:
        lines += [f"### {e['id']} · {e['label']}",'',f"**{rl(by_id[e['from']])} → {rl(by_id[e['to']])}** · review from {e['stage']}",'',e['mechanism'],'',f"**Evidence level:** {e['evidenceLevel']}. **Known basis:** {e['knownBasis']}",'',f"**Open question:** {e['openQuestion']}",'',f"**Status:** {e['status']}",'',f"**Next experiment:** {e['nextExperiment']}",'',f"**Output:** {e['deliverable']}",'',f"**Evidence:** {src(e['evidence'])}",'']
    blocks.append('\n'.join(lines))
rup=['# Rupert / Noperthedron restart','','The first win is a reliable geometry instrument and reusable witnesses. A Collatz-convergence/Rupert equivalence remains an unproved target, with no proof deadline. The audit reproduced origin-dependent translation search and zero-clearance boundary acceptance in the current proxy.','','| Target | Review window | Concrete output |','| --- | --- | --- |']
for m in plan['rupertMilestones']:
    rup.append(f"| {m['id']} · {m['target']} | {m['window']} | {clean(m['output'])} |")
rup += ['', '**Exact small lemma:** standard integer Collatz consecutive triples lie on three affine lines (split even inputs modulo 4 and odd inputs). Their support, convex hull and the implemented time-augmented embedding are different objects.', '', '**Control sources:** '+link('Steininger–Yurkevich paper','https://arxiv.org/html/2508.18475v2')+' · '+link('Authors’ source','https://github.com/Jakob256/Rupert')+' · '+link('Lean formalization','https://github.com/jcreedcmu/Noperthedron')+'. Inspected, not rerun during this audit.']
blocks.append('\n'.join(rup))
ext=['# External bridges and recovered threads','','Outside the 32-repository count. Private source URLs retain their existing access requirements.','']
for b in plan['externalBridges']:
    ext += [f"## {b['id']} · {b['title']}",'',b['purpose'],'',f"**State:** {b['status']}",'',f"**Next target:** {b['nextTarget']}",'','**Organization links:** '+', '.join(rl(by_id[n]) for n in b['linksTo']),'','**Sources:** '+link('Primary thread',b['url'])+(' · '+src(b['sources']) if b['sources'] else ''),'']
blocks.append('\n'.join(ext))
dec=['# Decision Targets','']
for d in plan['decisions']:
    dec += [f"## {d['id']} · {d['title']}",'',d['decision'],'',f"**Gate ({d['stage']}):** {d['gate']}",'']
blocks.append('\n'.join(dec))
blocks.append('# Claim boundaries and maintenance\n\n'+'\n'.join('- '+x for x in plan['claimBoundaries'])+'\n\n'+plan['maintenance']+'\n\n**Research direction:** Zolton aka Inge / EncapsulatorP. **First portfolio recovery and implementation:** ChatGPT · GPT-6 Astra Pro, 21 November 2026. Existing source authorship and credits remain with their repositories.')
md='# '+plan['title']+'\n\n'+'\n\n'.join(blocks)+'\n'
(HERE/'next-treasures-hunt.md').write_text(md)
payload=json.dumps(plan,ensure_ascii=False,separators=(',',':')).replace('<','\\u003c').replace('\u2028','\\u2028').replace('\u2029','\\u2029')
(ROOT/'assets/pirates-plan-data.js').write_text('/* Generated by planning/build_plan.py. */\nwindow.ENCAPSULATOR_PLAN = '+payload+';\n')
(HERE/'page-blocks.json').write_text(json.dumps(blocks,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'repositories':len(repos),'visibility':dict(Counter(r['visibility'] for r in repos)),'edges':len(edges),'edgeKinds':dict(Counter(e['kind'] for e in edges)),'evidenceLevels':dict(Counter(e['evidenceLevel'] for e in edges)),'routes':len(plan['routes']),'piratePaths':len(paths),'externalBridges':len(plan['externalBridges']),'pageBlocks':len(blocks),'readingCopyBytes':len(md.encode())}))
