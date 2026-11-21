/* Pirates Plan. Local data, ordinary DOM, deterministic SVG; no network requests. */
(function () {
  'use strict';
  var KINDS = {
    'existing-link': { label: 'Existing navigation', color: '#cfdf9b' },
    'existing-code': { label: 'Existing code link', color: '#a6e6bf' },
    'shared-object': { label: 'Shared mathematical object', color: '#94ccd8' },
    'proposed-reuse': { label: 'Proposed reuse', color: '#d9c182' },
    'analogy': { label: 'Analogy to test', color: '#c7addf' }
  };
  var PLAN_ROUTES = ['pirates-plan', 'plan-timeline', 'plan-routes', 'repo-interlinks', 'repo-register', 'decision-targets', 'plan-bridges'];
  function list(value) { return Array.isArray(value) ? value : []; }
  function plain(value) {
    if (value === undefined || value === null) return '';
    if (Array.isArray(value)) return value.map(plain).filter(Boolean).join(' · ');
    if (typeof value === 'object') return Object.keys(value).map(function (key) { return key + ': ' + plain(value[key]); }).join(' · ');
    return String(value);
  }
  function normal(value) { return plain(value).normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); }
  function number(value, fallback) { var n = Number(value); return Number.isFinite(n) ? n : fallback; }
  function unique(values) { return Array.from(new Set(values)); }
  function repoText(repo) {
    return normal([repo.id, repo.name, repo.family, repo.purpose, repo.currentState, repo.status, repo.priority,
      repo.stage, repo.nextTarget, repo.acceptance, repo.stopOrPivot, repo.rationale, repo.keywords, repo.sources]);
  }
  function queryMatches(text, query) {
    var terms = normal(query).trim().split(/\s+/).filter(Boolean);
    return terms.every(function (term) { return text.indexOf(term) !== -1; });
  }
  function buildSearchIndex(data) {
    var index = new Map();
    list(data.repositories).forEach(function (repo) { index.set(repo.id, repoText(repo)); });
    function append(ids, value) {
      list(ids).forEach(function (id) { if (index.has(id)) index.set(id, index.get(id) + ' ' + normal(value)); });
    }
    list(data.edges).forEach(function (edge) {
      append([edge.from, edge.to], [edge.from, edge.to, edge.label, edge.kind, edge.mechanism, edge.status, edge.nextExperiment, edge.deliverable, edge.keywords, edge.evidence]);
    });
    list(data.externalBridges).forEach(function (bridge) { append(bridge.linksTo, [bridge.title, bridge.purpose, bridge.nextTarget, bridge.status, bridge.keywords, bridge.sources]); });
    list(data.routes).forEach(function (route) { append(route.repositories, [route.title, route.question, route.target, route.keywords]); });
    append(['collatz_rupert_delay_embedding'], data.rupertMilestones);
    return index;
  }
  function filterRepositories(repositories, state, route, searchIndex) {
    var allowed = route ? new Set(list(route.repositories)) : null;
    return repositories.filter(function (repo) {
      return (!allowed || allowed.has(repo.id)) && (!state.family || repo.family === state.family) &&
        (!state.priority || repo.priority === state.priority) && (!state.visibility || normal(repo.visibility) === state.visibility) &&
        queryMatches(searchIndex && searchIndex.get(repo.id) || repoText(repo), state.q);
    }).slice().sort(function (a, b) {
      if (state.sort === 'name') return plain(a.name || a.id).localeCompare(plain(b.name || b.id));
      if (['roi', 'meaningfulness', 'importance'].includes(state.sort)) {
        var difference = number((b.scores || {})[state.sort], -1) - number((a.scores || {})[state.sort], -1);
        if (difference) return difference;
      }
      return number(a.rank, 9999) - number(b.rank, 9999) || plain(a.name || a.id).localeCompare(plain(b.name || b.id));
    });
  }
  function parseHash(hash) {
    var raw = (hash || '').replace(/^#/, ''), question = raw.indexOf('?');
    var route = question === -1 ? raw : raw.slice(0, question);
    var params = new URLSearchParams(question === -1 ? '' : raw.slice(question + 1));
    var state = { active: PLAN_ROUTES.includes(route), repo: '', route: '', q: '', eq: '', family: '', priority: '', visibility: '', kind: '', sort: 'rank' };
    ['repo', 'route', 'q', 'eq', 'family', 'priority', 'visibility', 'kind', 'sort'].forEach(function (key) {
      if (params.has(key)) state[key] = params.get(key).slice(0, 600);
    });
    if (!['rank', 'roi', 'meaningfulness', 'importance', 'name'].includes(state.sort)) state.sort = 'rank';
    return state;
  }
  function hashFor(state) {
    var params = new URLSearchParams();
    ['repo', 'route', 'q', 'eq', 'family', 'priority', 'visibility', 'kind', 'sort'].forEach(function (key) {
      if (state[key] && !(key === 'sort' && state[key] === 'rank')) params.set(key, state[key]);
    });
    return '#pirates-plan' + (params.toString() ? '?' + params.toString() : '');
  }
  function wrapLabel(value, size, maxLines) {
    var text = plain(value), lines = [], remaining = text;
    while (remaining.length && lines.length < maxLines) {
      if (remaining.length <= size) { lines.push(remaining); break; }
      if (lines.length === maxLines - 1) { lines.push(remaining.slice(0, size - 1) + '…'); break; }
      var chunk = remaining.slice(0, size), at = Math.max(chunk.lastIndexOf('_'), chunk.lastIndexOf('-'), chunk.lastIndexOf(' '));
      var take = at > size * .45 ? at + 1 : size;
      lines.push(remaining.slice(0, take).trim()); remaining = remaining.slice(take).trim();
    }
    return lines.length ? lines : ['Untitled'];
  }
  function portfolioLayout(repositories) {
    var families = new Map(), columns = [44, 44, 44], boxes = [], positions = new Map();
    repositories.forEach(function (repo) {
      var family = repo.family || 'Research';
      if (!families.has(family)) families.set(family, []);
      families.get(family).push(repo);
    });
    Array.from(families.entries()).sort(function (a, b) { return b[1].length - a[1].length || a[0].localeCompare(b[0]); }).forEach(function (entry) {
      var column = columns.indexOf(Math.min.apply(null, columns)), x = 20 + column * 392, y = columns[column];
      var height = 53 + Math.ceil(entry[1].length / 2) * 72;
      boxes.push({ x: x, y: y, w: 376, h: height, title: entry[0] });
      entry[1].sort(function (a, b) { return number(a.rank, 999) - number(b.rank, 999); }).forEach(function (repo, index) {
        positions.set(repo.id, { x: x + 15 + (index % 2) * 179, y: y + 45 + Math.floor(index / 2) * 72, w: 167, h: 54 });
      });
      columns[column] += height + 22;
    });
    return { width: 1200, height: Math.max(330, Math.max.apply(null, columns) + 10), boxes: boxes, positions: positions };
  }
  function neighborhoodLayout(repositories, edges, selected) {
    var incoming = [], outgoing = [];
    repositories.forEach(function (repo) {
      if (repo.id === selected) return;
      if (edges.some(function (edge) { return edge.from === selected && edge.to === repo.id; })) outgoing.push(repo);
      else incoming.push(repo);
    });
    var height = Math.max(390, Math.max(incoming.length, outgoing.length) * 76 + 105), positions = new Map();
    positions.set(selected, { x: 468, y: height / 2 - 40, w: 264, h: 80 });
    [incoming, outgoing].forEach(function (group, side) {
      var start = height / 2 - (group.length * 76 - 20) / 2;
      group.forEach(function (repo, index) { positions.set(repo.id, { x: side ? 868 : 38, y: start + index * 76, w: 294, h: 56 }); });
    });
    return { width: 1200, height: height, boxes: [], positions: positions,
      notes: [{ x: 185, text: 'INCOMING LINKS' }, { x: 1015, text: 'OUTGOING / SHARED LINKS' }] };
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = {
    normal: normal, queryMatches: queryMatches, buildSearchIndex: buildSearchIndex, filterRepositories: filterRepositories, parseHash: parseHash,
    hashFor: hashFor, portfolioLayout: portfolioLayout, neighborhoodLayout: neighborhoodLayout, wrapLabel: wrapLabel
  };
  if (typeof document === 'undefined') return;
  function init() {
    var root = document.querySelector('[data-page="pirates-plan"]');
    if (!root || root.dataset.ppReady) return;
    root.dataset.ppReady = 'true';
    var data = window.ENCAPSULATOR_PLAN, loading = document.getElementById('pp-loading');
    if (!data || !Array.isArray(data.repositories)) {
      if (loading) loading.textContent = 'The interactive plan data could not load. Open the complete reading copy linked above.';
      return;
    }
    var repositories = data.repositories.slice(), byId = new Map(repositories.map(function (repo) { return [repo.id, repo]; })), searchIndex = buildSearchIndex(data);
    var edges = list(data.edges).filter(function (edge) { return byId.has(edge.from) && byId.has(edge.to) && edge.from !== edge.to; });
    var stages = list(data.stages), routes = list(data.routes), state = parseHash(location.hash);
    var stageById = new Map(stages.map(function (stage) { return [stage.id, stage]; }));
    var routeById = new Map(routes.map(function (route) { return [route.id, route]; }));
    var oldTitle = document.title, ns = 'http://www.w3.org/2000/svg', openRepos = new Set(), openEdges = new Set();
    function get(id) { return document.getElementById(id); }
    function node(tag, className, text) {
      var element = document.createElement(tag);
      if (className) element.className = className;
      if (text !== undefined && text !== null) element.textContent = plain(text);
      return element;
    }
    function put(id, value) { var target = get(id); if (target) target.textContent = plain(value); }
    function clear(id) { var target = get(id); if (target) target.replaceChildren(); return target; }
    function safeLink(url, text, className) {
      if (!url) return null;
      var parsed;
      try { parsed = new URL(url, location.href); } catch (_) { return null; }
      if (!['https:', 'http:'].includes(parsed.protocol)) return null;
      var link = node('a', className || '', text || url); link.href = parsed.href;
      if (parsed.origin !== location.origin) { link.target = '_blank'; link.rel = 'noopener noreferrer'; }
      return link;
    }
    function addLink(parent, url, text, className) { var link = safeLink(url, text, className); if (link) parent.append(link); return link; }
    function button(label, handler, className) {
      var element = node('button', className || 'pp-button pp-button-light', label); element.type = 'button';
      element.addEventListener('click', handler); return element;
    }
    function field(parent, label, value) {
      if (!plain(value)) return;
      parent.append(node('span', 'pp-detail-label', label), node('p', '', value));
    }
    function sources(parent, values, label) {
      var seen = new Set(), links = node('ul', 'pp-detail-links');
      list(values).forEach(function (source) {
        if (!source || seen.has(source.url)) return;
        var link = safeLink(source.url, source.label || source.url); if (!link) return;
        seen.add(source.url); var item = node('li'); item.append(link); links.append(item);
      });
      if (links.children.length) { parent.append(node('span', 'pp-detail-label', label || 'Sources'), links); }
    }
    function stageTitle(value) { var stage = stageById.get(value); return stage ? stage.id + ' · ' + stage.title : plain(value); }
    function description(parent, values) {
      var dl = node('dl', 'pp-repo-metadata');
      values.forEach(function (pair) { if (plain(pair[1])) dl.append(node('dt', '', pair[0]), node('dd', '', pair[1])); });
      parent.append(dl);
    }
    function badge(text, className) { return node('span', 'pp-badge' + (className ? ' ' + className : ''), text); }
    function repoName(id) { var repo = byId.get(id); return repo ? repo.name || repo.id : id; }
    function validState() {
      if (!byId.has(state.repo)) state.repo = '';
      if (!routeById.has(state.route)) state.route = '';
      if (state.kind && !KINDS[state.kind]) state.kind = '';
    }
    function saveState(push) {
      var hash = hashFor(state);
      if (hash !== location.hash) history[push ? 'pushState' : 'replaceState'](null, '', hash);
      updateTitle();
    }
    function updateTitle() {
      var active = PLAN_ROUTES.includes((location.hash || '').replace(/^#/, '').split('?')[0]);
      document.title = active ? (data.title || 'Next treasures hunt planning') + ' — EncapsulatorP' : oldTitle;
    }
    function scrollTo(id, focus) {
      var target = get(id); if (!target) return;
      target.scrollIntoView({ block: 'start', behavior: 'auto' });
      if (focus) { target.tabIndex = -1; target.focus({ preventScroll: true }); }
    }
    function restoreRoutePosition() {
      if (!state.active) return;
      var base = (location.hash || '').replace(/^#/, '').split('?')[0];
      var destination = base !== 'pirates-plan' && PLAN_ROUTES.includes(base) ? base :
        state.repo || state.route ? 'pp-map-title' : state.q ? 'pp-register-title' : '';
      if (destination) requestAnimationFrame(function () { scrollTo(destination, false); });
    }
    function selectRepo(id, scroll) {
      if (!byId.has(id)) return;
      state.repo = id; state.route = ''; saveState(true); renderDynamic();
      if (scroll) scrollTo('pp-map-title', true);
    }
    function selectRoute(id) {
      if (!routeById.has(id)) return;
      state.route = id; state.repo = ''; state.q = ''; state.eq = ''; state.family = ''; state.priority = ''; state.visibility = '';
      saveState(true); renderDynamic(); scrollTo('pp-map-title', true);
    }
    function showRegister(id) {
      state.repo = id; state.route = ''; state.q = ''; state.family = ''; state.priority = ''; state.visibility = '';
      saveState(false); renderDynamic();
      var target = get('pp-repo-' + encodeURIComponent(id));
      if (target) { target.open = true; target.scrollIntoView({ block: 'start', behavior: 'auto' }); target.querySelector('summary').focus({ preventScroll: true }); }
    }
    function appendScores(parent, repo) {
      var dl = node('dl', 'pp-score-row'), scores = repo.scores || {};
      [['Meaningfulness', 'meaningfulness'], ['Importance', 'importance'], ['Research ROI', 'roi']].forEach(function (pair) {
        var item = node('div'); item.append(node('dt', '', pair[0]), node('dd', '', scores[pair[1]] === undefined ? '—' : scores[pair[1]])); dl.append(item);
      });
      parent.append(dl);
    }
    function addOptions(id, values) {
      var select = get(id); if (!select) return;
      values.forEach(function (value) { var option = node('option', '', value.label || value); option.value = value.value || value; select.append(option); });
    }
    function renderStatic() {
      put('pp-edition', data.edition || data.asOf); put('pp-summary', data.summary || 'A complete repository map, a ranked research programme, and the next piece of work on every connection.');
      if (data.pageUrl) {
        var pageAccess = node('span', 'pp-page-access');
        var pageLink = addLink(pageAccess, data.pageUrl, 'Planning Page ↗', 'pp-reading-link');
        if (pageLink) {
          var hint = node('small', '', 'Access follows the Page’s sharing settings.'); hint.id = 'pp-page-access-hint';
          pageAccess.append(hint); pageLink.setAttribute('aria-describedby', hint.id);
          var heroActions = get('pp-hero-actions') || root.querySelector('.pp-hero-actions');
          if (heroActions) heroActions.append(pageAccess);
          var footerLinks = get('pp-footer-links') || root.querySelector('.pp-colophon p:last-child');
          var footerPage = footerLinks ? addLink(footerLinks, data.pageUrl, 'Planning Page ↗') : null;
          if (footerPage) footerPage.setAttribute('aria-describedby', hint.id);
        }
      }
      var stats = clear('pp-stats'), privateCount = repositories.filter(function (repo) { return normal(repo.visibility) === 'private'; }).length;
      [[repositories.length, 'Repositories', (repositories.length - privateCount) + ' public · ' + privateCount + ' private'],
        [edges.length, 'Documented connections', 'with planned work'], [routes.length, 'Research routes', 'across the portfolio'], [stages.length, 'Programme stages', 'with decision gates']].forEach(function (item) {
        var box = node('div'), dd = node('dd', '', item[0]); dd.append(node('span', '', item[2])); box.append(node('dt', '', item[1]), dd); stats.append(box);
      });
      [['pp-scope', 'Coverage', data.scope], ['pp-capacity', 'Capacity assumption', data.capacity]].forEach(function (item) {
        var target = clear(item[0]); if (plain(item[2])) target.append(node('h4', '', item[1]), node('p', '', item[2])); else target.hidden = true;
      });
      put('pp-scoring-description', (data.scoring || {}).description || 'Scores are planning judgments, revised as evidence arrives.');
      var timeline = clear('pp-stages');
      stages.forEach(function (stage) {
        var card = node('article', 'pp-stage'); card.id = 'pp-stage-' + encodeURIComponent(stage.id);
        card.append(node('h4', '', stage.title || stage.id), node('span', 'pp-window', stage.window));
        var dl = node('dl');
        [['Target', stage.target], ['Decision gate', stage.gate], ['Effort', stage.effort], ['Depends on', list(stage.dependencies).map(stageTitle)]].forEach(function (pair) {
          if (plain(pair[1])) dl.append(node('dt', '', pair[0]), node('dd', '', pair[1]));
        });
        card.append(dl); timeline.append(card);
      });
      var routeRoot = clear('pp-routes');
      routes.forEach(function (route, index) {
        var card = node('article', 'pp-route'); card.dataset.route = route.id;
        card.append(node('span', 'pp-route-label', String(index + 1).padStart(2, '0') + ' / ' + stageTitle(route.stage)), node('h4', '', route.title), node('p', '', route.question));
        var pills = node('div', 'pp-route-repos');
        list(route.repositories).forEach(function (id) {
          var repo = byId.get(id), pill = node('span', '', repo && repo.shortName || repoName(id));
          pill.title = repoName(id); pills.append(pill);
        }); card.append(pills);
        var target = node('p', 'pp-route-target'); target.append(node('strong', '', 'The next result'), document.createTextNode(plain(route.target))); card.append(target);
        card.append(button('Trace this route ↗', function () { selectRoute(route.id); }, 'pp-button pp-button-quiet'));
        if (route.searchUrl) { var search = safeLink(route.searchUrl, 'Search route source code ↗', 'pp-reading-link'); if (search) card.append(search); }
        if (list(route.keywords).length) card.append(button('Find related plans ↓', function () {
          state.route = ''; state.repo = ''; state.q = plain(route.keywords[0]); state.family = ''; state.priority = ''; state.visibility = '';
          saveState(true); renderDynamic(); scrollTo('pp-register-title', true);
        }, 'pp-text-button pp-route-search'));
        routeRoot.append(card);
      });
      var decisions = clear('pp-decisions');
      list(data.decisions).forEach(function (decision, index) {
        var card = node('article', 'pp-decision');
        card.append(node('span', 'pp-route-label', (decision.id || 'D' + (index + 1)) + (decision.stage ? ' / ' + stageTitle(decision.stage) : '')), node('h4', '', decision.title));
        field(card, 'Decision', decision.decision); field(card, 'Evidence needed', decision.gate); decisions.append(card);
      });
      var bridges = clear('pp-bridges');
      list(data.externalBridges).forEach(function (bridge) {
        var card = node('article', 'pp-bridge'); card.append(node('h4', '', bridge.title));
        if (bridge.status) card.append(node('span', 'pp-edge-kind', bridge.status));
        field(card, 'Purpose', bridge.purpose); field(card, 'Next target', bridge.nextTarget);
        if (list(bridge.linksTo).length) {
          card.append(node('span', 'pp-detail-label', 'Connects to'));
          var linked = node('ul', 'pp-detail-links');
          bridge.linksTo.forEach(function (id) {
            if (!byId.has(id)) return;
            var item = node('li'), link = node('a', '', repoName(id)); link.href = '#pirates-plan?repo=' + encodeURIComponent(id);
            link.addEventListener('click', function (event) { event.preventDefault(); selectRepo(id, true); }); item.append(link); linked.append(item);
          });
          card.append(linked);
        }
        sources(card, bridge.sources, 'Additional sources');
        var actions = node('div', 'pp-actions'); addLink(actions, bridge.url, 'Open external source ↗', 'pp-inline-link'); card.append(actions); bridges.append(card);
      });
      if (!list(data.externalBridges).length) get('plan-bridges').hidden = true;
      addOptions('pp-map-repo', repositories.slice().sort(function (a, b) { return plain(a.name || a.id).localeCompare(plain(b.name || b.id)); }).map(function (repo) { return { value: repo.id, label: repo.name || repo.id }; }));
      addOptions('pp-family', unique(repositories.map(function (repo) { return repo.family; }).filter(Boolean)).sort());
      addOptions('pp-priority', unique(repositories.map(function (repo) { return repo.priority; }).filter(Boolean)).sort());
      var kindSelect = get('pp-edge-kind');
      if (!Array.from(kindSelect.options).some(function (option) { return option.value === 'existing-link'; })) {
        var option = node('option', '', KINDS['existing-link'].label); option.value = 'existing-link'; kindSelect.append(option);
      }
      var legend = clear('pp-map-legend');
      Object.keys(KINDS).forEach(function (kind) {
        if (!edges.some(function (edge) { return edge.kind === kind; })) return;
        var item = node('span'); item.dataset.kind = kind; item.append(node('i'), document.createTextNode(KINDS[kind].label)); legend.append(item);
      });
      if (loading) loading.hidden = true;
    }
    function visibleGraphData() {
      var currentEdges = edges.filter(function (edge) { return !state.kind || edge.kind === state.kind; });
      var ids, route = routeById.get(state.route), title, desc;
      if (state.repo) {
        currentEdges = currentEdges.filter(function (edge) { return edge.from === state.repo || edge.to === state.repo; });
        ids = new Set([state.repo]);
        currentEdges.forEach(function (edge) { ids.add(edge.from); ids.add(edge.to); });
        title = repoName(state.repo); desc = 'Focused neighbourhood · select a neighbour to continue the research trail.';
      } else if (route) {
        ids = new Set(list(route.repositories)); var edgeIds = new Set(list(route.edgeIds));
        currentEdges = currentEdges.filter(function (edge) { return ids.has(edge.from) && ids.has(edge.to) && (!edgeIds.size || edgeIds.has(edge.id)); });
        title = route.title; desc = route.question || 'The repositories and edges in this research route.';
      } else {
        ids = new Set(repositories.map(function (repo) { return repo.id; }));
        title = 'Whole portfolio'; desc = 'Grouped by research family. Select any node to replace the overview with its immediate connections.';
      }
      return { repositories: repositories.filter(function (repo) { return ids.has(repo.id); }), edges: currentEdges, title: title, description: desc };
    }
    function svgNode(tag, attributes, text) {
      var element = document.createElementNS(ns, tag);
      Object.keys(attributes || {}).forEach(function (key) { element.setAttribute(key, attributes[key]); });
      if (text !== undefined) element.textContent = plain(text); return element;
    }
    function edgePath(a, b) {
      var ac = { x: a.x + a.w / 2, y: a.y + a.h / 2 }, bc = { x: b.x + b.w / 2, y: b.y + b.h / 2 };
      if (Math.abs(ac.x - bc.x) < 40) {
        var direction = bc.y > ac.y ? 1 : -1, sx = ac.x, sy = ac.y + direction * (a.h / 2 + 3), ex = bc.x, ey = bc.y - direction * (b.h / 2 + 6);
        var bend = Math.max(34, Math.abs(ey - sy) * .25);
        return 'M' + sx + ',' + sy + ' C' + (sx + bend) + ',' + (sy + direction * 20) + ' ' + (ex + bend) + ',' + (ey - direction * 20) + ' ' + ex + ',' + ey;
      }
      var right = bc.x > ac.x, x1 = right ? a.x + a.w + 3 : a.x - 3, x2 = right ? b.x - 6 : b.x + b.w + 6;
      var midpoint = (x1 + x2) / 2;
      return 'M' + x1 + ',' + ac.y + ' C' + midpoint + ',' + ac.y + ' ' + midpoint + ',' + bc.y + ' ' + x2 + ',' + bc.y;
    }
    function renderGraph() {
      var view = visibleGraphData(), svg = get('pp-graph');
      var layout = state.repo ? neighborhoodLayout(view.repositories, view.edges, state.repo) : portfolioLayout(view.repositories);
      svg.replaceChildren();
      svg.classList.toggle('pp-graph-focus', Boolean(state.repo));
      svg.setAttribute('viewBox', '0 0 ' + layout.width + ' ' + layout.height);
      svg.append(svgNode('title', { id: 'pp-graph-title' }, view.title + ' — repository connection map'),
        svgNode('desc', { id: 'pp-graph-description' }, view.repositories.length + ' selectable repositories and ' + view.edges.length + ' directed connections. Select a node with Enter or Space to inspect its neighbourhood. Equivalent controls appear in the repository chooser and text list.'));
      var defs = svgNode('defs');
      Object.keys(KINDS).forEach(function (kind) {
        var marker = svgNode('marker', { id: 'pp-arrow-' + kind, markerWidth: 6, markerHeight: 6, refX: 5, refY: 3, orient: 'auto', markerUnits: 'strokeWidth' });
        marker.append(svgNode('path', { d: 'M0,0 L6,3 L0,6 Z', fill: KINDS[kind].color })); defs.append(marker);
      });
      svg.append(defs);
      layout.boxes.forEach(function (box) {
        svg.append(svgNode('rect', { x: box.x, y: box.y, width: box.w, height: box.h, rx: 12, class: 'pp-family-zone' }));
        svg.append(svgNode('text', { x: box.x + 17, y: box.y + 25, class: 'pp-family-title' }, wrapLabel(box.title, 44, 1)[0]));
      });
      list(layout.notes).forEach(function (note) { svg.append(svgNode('text', { x: note.x, y: 30, 'text-anchor': 'middle', class: 'pp-node-note' }, note.text)); });
      view.edges.forEach(function (edge) {
        var from = layout.positions.get(edge.from), to = layout.positions.get(edge.to); if (!from || !to) return;
        var kind = KINDS[edge.kind] ? edge.kind : 'proposed-reuse';
        svg.append(svgNode('path', { d: edgePath(from, to), class: 'pp-network-edge' + (state.repo ? ' is-focus' : ''), 'data-kind': kind, 'marker-end': 'url(#pp-arrow-' + kind + ')' }));
      });
      view.repositories.forEach(function (repo) {
        var p = layout.positions.get(repo.id); if (!p) return;
        var selected = repo.id === state.repo, group = svgNode('g', {
          transform: 'translate(' + p.x + ',' + p.y + ')', class: 'pp-node' + (selected ? ' is-selected' : ''),
          role: 'button', tabindex: 0, 'aria-label': 'Focus ' + repoName(repo.id) + (repo.rank ? ', programme rank ' + repo.rank : ''), 'aria-pressed': String(selected), 'data-repo': repo.id
        });
        group.append(svgNode('title', {}, repoName(repo.id) + '\n' + plain(repo.purpose)), svgNode('rect', { width: p.w, height: p.h, rx: 7, class: 'pp-node-box' }));
        var labels = wrapLabel(repo.shortName || repoName(repo.id), p.w > 220 ? 37 : 23, 2);
        var start = (p.h - labels.length * 13) / 2 + 10;
        labels.forEach(function (label, i) { group.append(svgNode('text', { x: 13, y: start + i * 13, class: 'pp-node-title' }, label)); });
        if (selected && repo.priority) group.append(svgNode('text', { x: 13, y: p.h - 10, class: 'pp-node-rank' }, repo.priority + ' · rank ' + repo.rank));
        group.addEventListener('click', function () { selectRepo(repo.id, false); });
        group.addEventListener('keydown', function (event) {
          if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); selectRepo(repo.id, false); get('pp-map-repo').focus({ preventScroll: true }); }
        });
        svg.append(group);
      });
      put('pp-map-view-title', view.title); put('pp-map-view-description', view.description);
      put('pp-map-count', view.repositories.length + ' repositories · ' + view.edges.length + ' links');
      var textNodes = clear('pp-node-list');
      view.repositories.slice().sort(function (a, b) { return repoName(a.id).localeCompare(repoName(b.id)); }).forEach(function (repo) {
        var control = button(repoName(repo.id), function () { selectRepo(repo.id, false); get('pp-map-repo').focus({ preventScroll: true }); }, '');
        control.setAttribute('aria-pressed', String(repo.id === state.repo)); textNodes.append(control);
      });
      var graphScroll = get('pp-graph-scroll');
      if (state.repo && layout.positions.has(state.repo)) {
        requestAnimationFrame(function () {
          graphScroll.scrollLeft = Math.max(0, (svg.getBoundingClientRect().width - graphScroll.clientWidth) / 2);
          var selectedPosition = layout.positions.get(state.repo);
          if (selectedPosition) graphScroll.scrollTop = Math.max(0, (selectedPosition.y + selectedPosition.h / 2) * svg.getBoundingClientRect().width / layout.width - graphScroll.clientHeight / 2);
        });
      } else graphScroll.scrollLeft = 0;
    }
    function renderSelected() {
      var target = clear('pp-selected-repo'), repo = byId.get(state.repo);
      target.hidden = !repo; if (!repo) return;
      var left = node('div'), right = node('div');
      left.append(node('span', 'pp-route-label', 'Selected repository / ' + (repo.priority || '') + (repo.rank ? ' · rank ' + repo.rank : '')), node('h4', '', repoName(repo.id)), node('p', '', repo.purpose));
      var actions = node('div', 'pp-actions');
      actions.append(button('Open its full plan ↓', function () { showRegister(repo.id); }));
      addLink(actions, repo.url, 'Repository ↗', 'pp-inline-link'); left.append(actions);
      field(right, 'Next target', repo.nextTarget); field(right, 'Pass condition', repo.acceptance);
      target.append(left, right);
    }
    function renderEdges() {
      get('pp-edges').querySelectorAll('details[data-edge]').forEach(function (detail) { if (detail.open) openEdges.add(detail.dataset.edge); else openEdges.delete(detail.dataset.edge); });
      var view = visibleGraphData(), matching = view.edges.filter(function (edge) {
        return queryMatches(normal([repoName(edge.from), repoName(edge.to), edge.label, edge.kind, edge.mechanism, edge.status, edge.nextExperiment, edge.deliverable, edge.keywords, edge.evidence]), state.eq);
      });
      var container = clear('pp-edges');
      matching.forEach(function (edge) {
        var card = node('details', 'pp-edge'); card.dataset.edge = edge.id; card.open = openEdges.has(edge.id);
        var summary = node('summary'), tag = node('span', 'pp-edge-kind', (KINDS[edge.kind] || {}).label || edge.kind);
        tag.dataset.kind = edge.kind; summary.append(tag, node('h5', '', edge.label || 'A connection to develop'), node('p', 'pp-edge-pair', repoName(edge.from) + ' → ' + repoName(edge.to)));
        var body = node('div', 'pp-edge-body');
        field(body, 'What connects them', edge.mechanism);
        field(body, 'Current evidence', edge.status);
        field(body, 'Next experiment', edge.nextExperiment);
        field(body, 'Deliverable', edge.deliverable);
        field(body, 'Earliest stage', stageTitle(edge.stage));
        sources(body, edge.evidence, 'Evidence for the connection');
        var actions = node('div', 'pp-actions');
        actions.append(button('Focus source', function () { selectRepo(edge.from, true); }), button('Focus destination', function () { selectRepo(edge.to, true); }));
        body.append(actions); card.append(summary, body); container.append(card);
      });
      put('pp-edge-count', matching.length + ' of ' + view.edges.length + ' connections' + (state.repo ? ' touching ' + repoName(state.repo) : state.route ? ' on this route' : ' in the portfolio'));
      put('pp-edge-context', state.repo ? 'All links touching ' + repoName(state.repo) + '. Open a connection for its evidence and planned work.' : state.route ? 'The work on each connection in the selected research route.' : 'The mechanism, evidence, next experiment, and deliverable for each link.');
      get('pp-edge-empty').hidden = matching.length > 0;
    }
    function renderRepositories() {
      get('pp-repositories').querySelectorAll('details[data-repo]').forEach(function (detail) { if (detail.open) openRepos.add(detail.dataset.repo); else openRepos.delete(detail.dataset.repo); });
      var route = routeById.get(state.route), visible = filterRepositories(repositories, state, route, searchIndex), container = clear('pp-repositories');
      visible.forEach(function (repo) {
        var card = node('details', 'pp-repo-card' + (state.repo === repo.id ? ' is-selected' : '')); card.id = 'pp-repo-' + encodeURIComponent(repo.id); card.dataset.repo = repo.id;
        card.open = repo.id === state.repo || openRepos.has(repo.id);
        var summary = node('summary'), main = node('div', 'pp-repo-summary-main'), badges = node('div', 'pp-badges');
        main.append(node('h4', '', repoName(repo.id)), node('p', '', repo.purpose));
        if (repo.priority) badges.append(badge(repo.priority, 'pp-badge-priority'));
        if (repo.visibility) badges.append(badge(repo.visibility + ' source', normal(repo.visibility) === 'private' ? 'pp-badge-private' : ''));
        if (repo.family) badges.append(badge(repo.family));
        summary.append(node('span', 'pp-rank', String(repo.rank === undefined ? '—' : repo.rank).padStart(2, '0')), main, badges);
        var body = node('div', 'pp-repo-body'), left = node('div'), right = node('div');
        if (state.q && !queryMatches(repoText(repo), state.q)) {
          var matchedBridges = list(data.externalBridges).filter(function (bridge) { return list(bridge.linksTo).includes(repo.id) && queryMatches(normal(bridge), state.q); });
          var matchedEdges = edges.filter(function (edge) { return (edge.from === repo.id || edge.to === repo.id) && queryMatches(normal(edge), state.q); });
          var contextLabels = matchedBridges.map(function (bridge) { return bridge.title; }).concat(matchedEdges.map(function (edge) { return edge.label; }));
          field(left, 'Matched through its connections', contextLabels.length ? contextLabels : 'A related research route. Follow its connections to inspect the shared question.');
        }
        field(left, 'Current state', repo.currentState);
        field(left, 'Next target', repo.nextTarget); field(left, 'Acceptance criterion', repo.acceptance);
        field(left, 'Stop or pivot', repo.stopOrPivot);
        if (repo.rationale) field(left, 'Why it has this priority', repo.rationale);
        appendScores(right, repo);
        description(right, [['Status', repo.status], ['Stage', stageTitle(repo.stage)], ['Review', repo.reviewWindow], ['Effort', repo.effort], ['Owner', repo.owner]]);
        var evidence = list(repo.sources).slice();
        if (repo.source && repo.source.url) evidence.unshift({ label: repo.source.commit ? 'Repository snapshot · ' + repo.source.commit.slice(0, 8) : 'Repository snapshot', url: repo.source.url });
        sources(right, evidence, 'Source trail');
        var actions = node('div', 'pp-actions');
        actions.append(button('Follow its connections ↑', function () { selectRepo(repo.id, true); }));
        addLink(actions, repo.url, 'Open repository ↗', 'pp-inline-link');
        addLink(actions, repo.searchUrl, 'Search source ↗', 'pp-inline-link');
        var direct = node('a', 'pp-inline-link', 'Link to this plan'); direct.href = '#pirates-plan?repo=' + encodeURIComponent(repo.id);
        direct.addEventListener('click', function (event) { event.preventDefault(); selectRepo(repo.id, true); }); actions.append(direct);
        left.append(actions); body.append(left, right);
        if (repo.id === 'collatz_rupert_delay_embedding' && list(data.rupertMilestones).length) {
          var milestones = node('section', 'pp-rupert-plan');
          milestones.append(node('h5', '', 'The Rupert restart · ' + data.rupertMilestones.length + ' bounded targets'));
          var steps = node('ol', 'pp-rupert-milestones');
          data.rupertMilestones.forEach(function (milestone) {
            var item = node('li'), heading = node('div');
            heading.append(node('span', 'pp-milestone-window', milestone.id + ' / ' + milestone.window), node('h6', '', milestone.target));
            item.append(heading, node('p', '', milestone.output)); steps.append(item);
          });
          milestones.append(steps); body.append(milestones);
        }
        card.append(summary, body); container.append(card);
      });
      put('pp-repo-count', visible.length + ' of ' + repositories.length + ' repositories' + (route ? ' · route: ' + route.title : '') + (state.q ? ' · matching “' + state.q + '”' : ''));
      get('pp-repo-empty').hidden = visible.length > 0; get('pp-clear-route').hidden = !route;
    }
    function syncControls() {
      [['pp-map-repo', 'repo'], ['pp-edge-kind', 'kind'], ['pp-edge-search', 'eq'], ['pp-search', 'q'], ['pp-family', 'family'], ['pp-priority', 'priority'], ['pp-visibility', 'visibility'], ['pp-sort', 'sort']].forEach(function (pair) {
        var control = get(pair[0]); if (control && control.value !== state[pair[1]]) control.value = state[pair[1]];
      });
      root.querySelectorAll('[data-route]').forEach(function (card) { card.setAttribute('aria-current', String(card.dataset.route === state.route)); });
    }
    function renderDynamic() {
      validState(); syncControls(); renderGraph(); renderSelected(); renderEdges(); renderRepositories(); updateTitle();
    }
    renderStatic(); renderDynamic(); restoreRoutePosition();
    get('pp-map-repo').addEventListener('change', function () {
      state.repo = this.value; state.route = ''; saveState(true); renderDynamic();
    });
    get('pp-edge-kind').addEventListener('change', function () { state.kind = this.value; saveState(false); renderGraph(); renderEdges(); });
    get('pp-map-reset').addEventListener('click', function () { state.repo = ''; state.route = ''; state.kind = ''; state.eq = ''; saveState(true); renderDynamic(); });
    get('pp-filters').addEventListener('submit', function (event) { event.preventDefault(); });
    var searchTimer, edgeTimer;
    get('pp-search').addEventListener('input', function () {
      state.q = this.value; clearTimeout(searchTimer); searchTimer = setTimeout(function () { saveState(false); renderRepositories(); }, 100);
    });
    get('pp-edge-search').addEventListener('input', function () {
      state.eq = this.value; clearTimeout(edgeTimer); edgeTimer = setTimeout(function () { saveState(false); renderEdges(); }, 100);
    });
    [['pp-family', 'family'], ['pp-priority', 'priority'], ['pp-visibility', 'visibility'], ['pp-sort', 'sort']].forEach(function (pair) {
      get(pair[0]).addEventListener('change', function () { state[pair[1]] = this.value; saveState(false); renderRepositories(); });
    });
    get('pp-clear').addEventListener('click', function () {
      state.q = ''; state.family = ''; state.priority = ''; state.visibility = ''; state.sort = 'rank'; state.route = '';
      saveState(false); syncControls(); renderRepositories(); renderGraph(); renderEdges(); get('pp-search').focus({ preventScroll: true });
    });
    get('pp-clear-route').addEventListener('click', function () { state.route = ''; saveState(false); renderDynamic(); });
    function hashChanged() {
      var next = parseHash(location.hash);
      if (next.active) { state = next; renderDynamic(); restoreRoutePosition(); } else updateTitle();
    }
    window.addEventListener('hashchange', hashChanged);
    window.addEventListener('popstate', hashChanged);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
