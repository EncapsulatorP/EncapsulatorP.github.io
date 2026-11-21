/* PaperMapEngine · EncapsulatorP · 21 November 2026
 * Procedural, dependency-free WebGL paper objects. No external assets.
 * The tensegrity graph and force densities preserve buildPrism() from pirate-map.js.
 * The other forms are geometric illustrations, not physical or theorem certificates.
 */
(function () {
  'use strict';
  const TAU = Math.PI * 2, RAD = Math.PI / 180;
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const unit = a => mul(a, 1 / (Math.hypot(a[0], a[1], a[2]) || 1));
  const lerp = (a, b, t) => add(mul(a, 1 - t), mul(b, t));
  const average = points => mul(points.reduce(add, [0, 0, 0]), 1 / points.length);
  const normal = points => unit(cross(sub(points[1], points[0]), sub(points[2], points[0])));
  const palette = {
    paper: [0.945, 0.927, 0.874], ivory: [0.972, 0.956, 0.910],
    edge: [0.792, 0.765, 0.685], back: [0.854, 0.824, 0.742],
    blue: [0.390, 0.550, 0.630], navy: [0.255, 0.388, 0.475],
    copper: [0.744, 0.478, 0.321], floor: [0.957, 0.950, 0.929]
  };
  const material = (color, grid = 0.4, ao = 1, floor = 0) => ({ color, grid, ao, floor });
  const paper = material(palette.paper, 0.50);
  const edge = material(palette.edge, 0, 0.86);
  const back = material(palette.back, 0.12, 0.84);

  function multiply(a, b) {
    const out = new Float32Array(16);
    for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++)
      for (let k = 0; k < 4; k++) out[c * 4 + r] += a[k * 4 + r] * b[c * 4 + k];
    return out;
  }
  function perspective(fov, aspect, near, far) {
    const f = 1 / Math.tan(fov / 2), nf = 1 / (near - far);
    return new Float32Array([f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0]);
  }
  function lookAt(eye, target) {
    const z = unit(sub(eye, target)), x = unit(cross([0, 1, 0], z)), y = cross(z, x);
    return new Float32Array([x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -dot(x, eye), -dot(y, eye), -dot(z, eye), 1]);
  }
  function ortho(size, near, far) {
    return new Float32Array([1 / size, 0, 0, 0, 0, 1 / size, 0, 0, 0, 0, -2 / (far - near), 0, 0, 0, -(far + near) / (far - near), 1]);
  }
  function project(m, p) {
    const x = p[0], y = p[1], z = p[2];
    return [m[0] * x + m[4] * y + m[8] * z + m[12], m[1] * x + m[5] * y + m[9] * z + m[13], m[2] * x + m[6] * y + m[10] * z + m[14], m[3] * x + m[7] * y + m[11] * z + m[15]];
  }
  function tangent(n) {
    const a = unit(cross(Math.abs(n[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0], n));
    return [a, cross(n, a)];
  }

  class Mesh {
    constructor() { this.vertices = []; this.lines = []; this.triangles = []; this.landmarks = []; this.bounds = [[Infinity, Infinity, Infinity], [-Infinity, -Infinity, -Infinity]]; }
    triangle(a, b, c, mat = paper, uv = [[0, 0], [1, 0], [0, 1]]) {
      const n = normal([a, b, c]);
      [a, b, c].forEach((p, i) => {
        this.vertices.push(...p, ...n, ...mat.color, ...uv[i], mat.grid, mat.ao, mat.floor);
        if (!mat.floor) for (let k = 0; k < 3; k++) { this.bounds[0][k] = Math.min(this.bounds[0][k], p[k]); this.bounds[1][k] = Math.max(this.bounds[1][k], p[k]); }
      });
      if (!mat.floor) this.triangles.push([a, b, c]);
    }
    quad(points, mat = paper, uv = [[0, 0], [1, 0], [1, 1], [0, 1]]) {
      this.triangle(points[0], points[1], points[2], mat, [uv[0], uv[1], uv[2]]);
      this.triangle(points[0], points[2], points[3], mat, [uv[0], uv[2], uv[3]]);
    }
    seam(a, b, alpha = 0.15) { this.lines.push(...a, 0.34, 0.39, 0.40, alpha, ...b, 0.34, 0.39, 0.40, alpha); }
    sheet(points, mat = paper, uv, thickness = 0.014) {
      const n = normal(points), lower = points.map(p => sub(p, mul(n, thickness)));
      if (points.length === 3) {
        this.triangle(...points, mat, uv);
        this.triangle(lower[2], lower[1], lower[0], back);
      } else { this.quad(points, mat, uv); this.quad(lower.slice().reverse(), back); }
      for (let i = 0; i < points.length; i++) {
        const j = (i + 1) % points.length;
        this.quad([points[i], lower[i], lower[j], points[j]], edge);
      }
      return n;
    }
    pin(position, n) { this.landmarks.push({ position: add(position, mul(n, 0.012)), normal: n }); }
    tube(a, b, radius, sides, mat, caps = true) {
      const axis = unit(sub(b, a)), [u, v] = tangent(axis);
      const ring = (p, i) => add(p, add(mul(u, radius * Math.cos(i * TAU / sides)), mul(v, radius * Math.sin(i * TAU / sides))));
      for (let i = 0; i < sides; i++) {
        const a0 = ring(a, i), a1 = ring(a, i + 1), b0 = ring(b, i), b1 = ring(b, i + 1);
        this.quad([a0, a1, b1, b0], mat);
        if (caps) { this.triangle(a, a1, a0, edge); this.triangle(b, b0, b1, paper); }
      }
    }
    floor() { this.quad([[-24, -0.025, -24], [-24, -0.025, 24], [24, -0.025, 24], [24, -0.025, -24]], material(palette.floor, 0, 1, 1)); }
  }

  function accordion(fold) {
    const mesh = new Mesh(), columns = 6, angle = 1.23 * fold, width = 0.69;
    const path = [[0, 0]];
    for (let i = 0; i < columns; i++) path.push([path[i][0] + width * Math.cos(angle), path[i][1] + (i % 2 ? -1 : 1) * width * Math.sin(angle)]);
    const span = path[columns][0], tilt = 0.16, cs = Math.cos(tilt), sn = Math.sin(tilt);
    const transform = (p, z) => { const x = p[0] - span / 2; return [x * cs - p[1] * sn, x * sn + p[1] * cs + span * sn / 2 + 0.055, z]; };
    const normals = [];
    for (let i = 0; i < columns; i++) {
      const points = [transform(path[i], -1.13), transform(path[i], 1.13), transform(path[i + 1], 1.13), transform(path[i + 1], -1.13)];
      const color = i === 2 ? palette.blue : i === 4 ? palette.copper : i % 2 ? palette.ivory : palette.paper;
      normals.push(mesh.sheet(points, material(color, i === 2 || i === 4 ? 0.32 : 0.66), [[i / columns, 0], [i / columns, 1], [(i + 1) / columns, 1], [(i + 1) / columns, 0]], 0.018));
      mesh.seam(points[0], points[1], 0.16);
      mesh.seam(points[0], points[3], 0.11);
      mesh.seam(points[1], points[2], 0.11);
    }
    [[0.08, 0.18], [0.29, 0.17], [0.51, 0.18], [0.75, 0.20], [0.93, 0.38], [0.81, 0.75], [0.56, 0.79], [0.31, 0.73], [0.10, 0.67]].forEach(([u, v]) => {
      const panel = Math.min(columns - 1, Math.floor(u * columns)), t = u * columns - panel;
      const p = [path[panel][0] * (1 - t) + path[panel + 1][0] * t, path[panel][1] * (1 - t) + path[panel + 1][1] * t];
      mesh.pin(transform(p, -1.13 + v * 2.26), normals[panel]);
    });
    return mesh;
  }

  function icoFaces(subdivide) {
    const t = (1 + Math.sqrt(5)) / 2;
    const vertices = [[-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0], [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t], [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]].map(unit);
    const faces = [[0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8], [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]].map(f => f.map(i => vertices[i]));
    if (!subdivide) return faces;
    return faces.flatMap(([a, b, c]) => { const ab = unit(add(a, b)), bc = unit(add(b, c)), ca = unit(add(c, a)); return [[a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]]; });
  }
  function globe() {
    const mesh = new Mesh(), faces = icoFaces(true), radius = 1.28, center = [0, 1.34, 0];
    const panels = [];
    faces.forEach((face, i) => {
      const points = face.map(p => add(center, mul(p, radius)));
      const uv = face.map(p => [Math.atan2(p[2], p[0]) / TAU + 0.5, Math.asin(clamp(p[1], -1, 1)) / Math.PI + 0.5]);
      if (Math.max(...uv.map(p => p[0])) - Math.min(...uv.map(p => p[0])) > 0.5) uv.forEach(p => { if (p[0] < 0.5) p[0] += 1; });
      const color = i === 12 || i === 61 ? palette.blue : i === 38 ? palette.copper : i % 5 === 0 ? palette.ivory : palette.paper;
      // Let the folded paper mass read first, especially where meridians meet.
      const grid = 0.36 * (1 - 0.55 * Math.pow(Math.abs(unit(average(face))[1]), 8));
      const n = mesh.sheet(points, material(color, grid, 0.98), uv, 0.012);
      panels.push({ points, normal: n, direction: unit(sub(average(points), center)) });
    });
    const used = new Set();
    [[0.20, 0.45], [0.80, 0.75], [1.35, 0.45], [1.85, 0.05], [2.80, -0.10], [-2.3, 0.35], [-1.25, -0.40], [0.05, -0.45], [1.05, -0.35]].forEach(([lon, lat]) => {
      const direction = [Math.cos(lon) * Math.cos(lat), Math.sin(lat), Math.sin(lon) * Math.cos(lat)];
      let best = -1, score = -Infinity;
      panels.forEach((p, i) => { const d = dot(p.direction, direction); if (!used.has(i) && d > score) { best = i; score = d; } });
      used.add(best); mesh.pin(average(panels[best].points), panels[best].normal);
    });
    return mesh;
  }
  function portal() {
    const mesh = new Mesh(), count = 8, centerY = 1.38 * Math.cos(Math.PI / 8) + 0.055;
    function ring(radius, z, dx = 0, dy = 0) { return Array.from({ length: count }, (_, i) => { const a = i * TAU / count + Math.PI / 8; return [dx + radius * Math.cos(a), centerY + dy + radius * Math.sin(a), z]; }); }
    const front = ring(1.18, 0.51), shoulder = ring(1.38, 0.27), rearShoulder = ring(1.38, -0.30), rear = ring(1.20, -0.52);
    const insideFront = ring(0.68, 0.51, 0.08, 0.02), insideRear = ring(0.62, -0.52, -0.15, 0.10);
    const frontPanels = [], innerPanels = [];
    for (let i = 0; i < count; i++) {
      const j = (i + 1) % count;
      [front, shoulder, rearShoulder].forEach((r, k) => { const next = [shoulder, rearShoulder, rear][k]; mesh.quad([r[i], next[i], next[j], r[j]], material(k === 1 && i === 4 ? palette.blue : i % 3 ? palette.paper : palette.ivory, 0.13)); });
      const face = [front[i], front[j], insideFront[j], insideFront[i]], inside = [insideFront[i], insideFront[j], insideRear[j], insideRear[i]];
      const uv = face.map(p => [(p[0] + 1.5) / 3, (p[1] - centerY + 1.5) / 3]);
      mesh.quad(face, material(i === 6 ? palette.copper : palette.ivory, 0.38), uv);
      mesh.quad([rear[j], rear[i], insideRear[i], insideRear[j]], material(palette.paper, 0.21, 0.90));
      mesh.quad(inside, material(i === 1 ? palette.navy : palette.back, 0.15, 0.68));
      mesh.seam(front[i], front[j], 0.10); mesh.seam(insideFront[i], insideFront[j], 0.18);
      frontPanels.push(face); innerPanels.push(inside);
    }
    frontPanels.forEach(face => mesh.pin(average(face), [0, 0, 1]));
    mesh.pin(average(innerPanels[5]), normal(innerPanels[5]));
    return mesh;
  }

  function buildPrism() {
    const vertices = Array.from({ length: 6 }, (_, i) => {
      const upper = i >= 3;
      const angle = (i % 3) * 2 * Math.PI / 3 + (upper ? Math.PI / 6 : 0);
      return [Math.cos(angle), Math.sin(angle), upper ? 0.775 : -0.775];
    });
    const members = [], ringDensity = 1 / Math.sqrt(3);
    for (let i = 0; i < 3; i++) {
      const next = (i + 1) % 3;
      members.push([i, next, ringDensity], [i + 3, next + 3, ringDensity], [i, i + 3, 1], [i, next + 3, -1]);
    }
    return { vertices, members };
  }
  function tensegrity() {
    const mesh = new Mesh(), prism = buildPrism();
    const vertices = prism.vertices.map(([x, y, z]) => [x * 1.15, (z + 0.775) * 1.15 + 0.10, y * 1.15]);
    const struts = [];
    prism.members.forEach(([i, j, density]) => {
      if (density < 0) { mesh.tube(vertices[i], vertices[j], 0.066, 6, material(palette.ivory, 0.13)); struts.push([vertices[i], vertices[j]]); }
      else mesh.tube(vertices[i], vertices[j], 0.0105, 5, material(i >= 3 ? palette.copper : palette.navy, 0, 1));
    });
    const nodeFaces = icoFaces(false);
    vertices.forEach((p, i) => {
      nodeFaces.forEach(f => mesh.triangle(...f.map(v => add(p, mul(v, 0.072))), material(palette.paper, 0)));
      const n = unit([p[0], i >= 3 ? 0.45 : 0, p[2]]);
      mesh.pin(add(p, mul(n, 0.071)), n);
    });
    struts.forEach(([a, b]) => { const axis = unit(sub(b, a)), n = unit(sub([0, 0, 1], mul(axis, dot(axis, [0, 0, 1])))); mesh.pin(add(average([a, b]), mul(n, 0.067)), n); });
    return mesh;
  }
  function terrace() {
    const mesh = new Mesh(), heights = [[1.67, 1.21, 0.83], [1.18, 0.85, 0.53], [0.72, 0.46, 0.25]];
    for (let row = 0; row < 3; row++) for (let col = 0; col < 3; col++) {
      const x = (col - 1) * 0.81, z = (row - 1) * 0.81, h = heights[row][col], r = 0.383;
      const top = [[x - r, h, z - r], [x - r, h, z + r], [x + r, h, z + r], [x + r, h, z - r]];
      const color = row === 1 && col === 2 ? palette.copper : row === 0 && col === 1 ? palette.blue : palette.ivory;
      mesh.sheet(top, material(color, 0.45), top.map(p => [(p[0] + 1.3) / 2.6, (p[2] + 1.3) / 2.6]), 0.025);
      for (let side = 0; side < 4; side++) {
        const j = (side + 1) % 4, a = [top[side][0], 0.045, top[side][2]], b = [top[j][0], 0.045, top[j][2]];
        mesh.quad([top[side], a, b, top[j]], material(side === 1 && col === 1 ? palette.blue : palette.paper, 0.13, 0.92));
      }
      mesh.seam(top[0], top[1], 0.10); mesh.seam(top[1], top[2], 0.10);
      mesh.pin([x, h, z], [0, 1, 0]);
    }
    return mesh;
  }

  // The voyage family is a composed paper stage, not a physical simulation.
  // All of its subject pins belong to the chart; moving props never own pins.
  const voyageColors = {
    sea: [0.115, 0.325, 0.475], shallows: [0.31, 0.57, 0.65],
    route: [0.91, 0.67, 0.36], coast: [0.88, 0.89, 0.79],
    interior: [0.29, 0.37, 0.40]
  };
  // Body transformations are independent of rendering and animation. The pure
  // registry can also be sampled by the geometry validator / future generator.
  const bodyKeys = { sphere: 'sphere', portal: 'portal', noperthedron: 'noperthedron', neck: 'neck', klein: 'klein', 'voyage-globe': 'sphere', 'voyage-portal': 'portal', 'voyage-noperthedron': 'noperthedron', 'voyage-neck': 'neck', 'voyage-klein': 'klein' };
  const sceneKeys = ['origami', 'sphere', 'portal', 'tensegrity', 'terrace', 'noperthedron', 'neck', 'klein', 'voyage-chart', 'voyage-globe', 'voyage-portal', 'voyage-rigging', 'voyage-islands', 'voyage-noperthedron', 'voyage-neck', 'voyage-klein'];
  const hasShapeLab = () => !!(window.PaperShapeLab && typeof window.PaperShapeLab.build === 'function');
  function bodyMesh(key, progress) {
    const model = window.PaperShapeLab.build(key, clamp(progress, 0, 1)), mesh = new Mesh();
    model.faces.forEach(face => {
      const points = face.points, color = palette[face.colorKey] || palette.paper;
      const mat = material(color, Number.isFinite(face.grid) ? face.grid : 0.22);
      const uv = face.uv || points.map(p => [(p[0] + 3) / 6, (p[2] + 3) / 6]);
      // Some parameter surfaces meet at a pole. Do not submit a zero-area
      // triangle or a zero normal to the lighting and visibility passes.
      for (let i = 1; i < points.length - 1; i++) {
        if (Math.hypot(...cross(sub(points[i], points[0]), sub(points[i + 1], points[0]))) > 1e-10)
          mesh.triangle(points[0], points[i], points[i + 1], mat, [uv[0], uv[i], uv[i + 1]]);
      }
      if (face.seams) for (let i = 0; i < points.length; i++) mesh.seam(points[i], points[(i + 1) % points.length], typeof face.seams === 'number' ? face.seams : 0.10);
    });
    (model.landmarks || []).forEach(mark => { mesh.pin(mark.position, unit(mark.normal)); mesh.landmarks[mesh.landmarks.length - 1].doubleSided = !!mark.doubleSided; });
    mesh.cameraBounds = model.cameraBounds;
    mesh.cameraPoints = model.cameraPoints;
    mesh.cameraFitMargin = 0.84;
    return mesh;
  }
  let accordionEnvelope;
  function openingSheet(progress) {
    const mesh = accordion(1 - progress);
    if (!accordionEnvelope) {
      // A fixed swept envelope prevents the camera from zooming as paper opens.
      const points = [];
      for (let i = 0; i <= 32; i++) {
        const body = accordion(i / 32);
        body.triangles.forEach(tri => tri.forEach(p => points.push(p)));
      }
      const bounds = [[Infinity, Infinity, Infinity], [-Infinity, -Infinity, -Infinity]];
      points.forEach(p => p.forEach((v, axis) => { bounds[0][axis] = Math.min(bounds[0][axis], v - 0.004); bounds[1][axis] = Math.max(bounds[1][axis], v + 0.004); }));
      // These convex box corners contain every sampled fold and the tiny
      // interpolation margin, without including an unrelated floor rectangle.
      const corners = [];
      for (let x = 0; x < 2; x++) for (let y = 0; y < 2; y++) for (let z = 0; z < 2; z++) corners.push([bounds[x][0], bounds[y][1], bounds[z][2]]);
      accordionEnvelope = { points: corners, bounds };
    }
    mesh.cameraPoints = accordionEnvelope.points; mesh.cameraBounds = accordionEnvelope.bounds; mesh.cameraFitMargin = 0.84;
    return mesh;
  }
  const voyageCache = new Map();
  const voyageChartCache = new Map();
  const voyageCameraCache = new Map();
  const voyageRows = [0, 0.018, 0.055, 0.14, 0.35, 0.65, 0.86, 0.945, 0.982, 1];
  function voyagePart(key, make) { if (!voyageCache.has(key)) voyageCache.set(key, make()); return voyageCache.get(key); }
  function mergeMesh(target, source, point, direction) {
    for (let i = 0; i < source.vertices.length; i += 14) {
      const p = point(source.vertices.slice(i, i + 3)), n = unit(direction(source.vertices.slice(i + 3, i + 6)));
      target.vertices.push(...p, ...n, ...source.vertices.slice(i + 6, i + 14));
      for (let k = 0; k < 3; k++) { target.bounds[0][k] = Math.min(target.bounds[0][k], p[k]); target.bounds[1][k] = Math.max(target.bounds[1][k], p[k]); }
    }
    source.triangles.forEach(tri => target.triangles.push(tri.map(point)));
    for (let i = 0; i < source.lines.length; i += 7) target.lines.push(...point(source.lines.slice(i, i + 3)), ...source.lines.slice(i + 3, i + 7));
  }
  function placeMesh(target, source, origin, scale = 1, yaw = 0, pitch = 0, roll = 0, anchor = [0, 0, 0]) {
    const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch), cr = Math.cos(roll), sr = Math.sin(roll);
    const rotate = p => {
      const y = p[1] * cp - p[2] * sp, z = p[1] * sp + p[2] * cp;
      const x = p[0] * cr - y * sr, ry = p[0] * sr + y * cr;
      return [x * cy + z * sy, ry, -x * sy + z * cy];
    };
    mergeMesh(target, source, p => add(origin, mul(rotate(sub(p, anchor)), scale)), rotate);
  }
  function chartSurface(fold, openingAngle = null) {
    const angle = openingAngle === null ? 0.055 + clamp(fold, 0, 1) * 0.34 : openingAngle, columns = 6, width = 5.08 * Math.cos(angle), depth = 3.52;
    const rise = 5.08 / columns * Math.sin(angle);
    const uKnots = Array.from({ length: columns + 1 }, (_, i) => i / columns);
    const curlAt = (t, knots, amplitude, power) => {
      t = clamp(t, 0, 1); let index = 0;
      while (index < knots.length - 2 && t > knots[index + 1]) index++;
      const a = knots[index], b = knots[index + 1], ya = amplitude * Math.pow(Math.abs(a - 0.5) * 2, power), yb = amplitude * Math.pow(Math.abs(b - 0.5) * 2, power);
      return ya + (yb - ya) * (t - a) / (b - a);
    };
    const point = (u, v, lift = 0) => {
      const q = clamp(u, 0, 1) * columns, panel = Math.min(columns - 1, Math.floor(q)), t = q - panel;
      const crease = panel % 2 ? 1 - t : t;
      // The interpolation is identical to the rendered paper facets. Decals,
      // ships and supports therefore use the actual surface, including its lip.
      const curl = curlAt(v, voyageRows, 0.085, 10) + curlAt(u, uKnots, 0.024, 12);
      return [(u - 0.5) * width, 0.075 + crease * rise + curl + lift, (v - 0.5) * depth];
    };
    const up = (u, v) => unit(cross(sub(point(u, v + 0.0005), point(u, v - 0.0005)), sub(point(u + 0.0005, v), point(u - 0.0005, v))));
    return { point, up, width, depth, rise, columns, uKnots, vKnots: voyageRows };
  }
  function chartLine(mesh, chart, a, b, color, alpha = 0.4, lift = 0.006) {
    mesh.lines.push(...chart.point(a[0], a[1], lift), ...color, alpha, ...chart.point(b[0], b[1], lift), ...color, alpha);
  }
  function clipCoordinate(polygon, limit, greater, axis = 0) {
    const out = [];
    for (let i = 0; i < polygon.length; i++) {
      const a = polygon[i], b = polygon[(i + 1) % polygon.length], insideA = greater ? a[axis] >= limit : a[axis] <= limit, insideB = greater ? b[axis] >= limit : b[axis] <= limit;
      if (insideA) out.push(a);
      if (insideA !== insideB) { const t = (limit - a[axis]) / (b[axis] - a[axis]); out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); }
    }
    return out;
  }
  function chartPatch(mesh, chart, polygon, color, lift = 0.003) {
    for (let panel = 0; panel < chart.columns; panel++) {
      let band = clipCoordinate(polygon, panel / chart.columns, true); if (band.length < 3) continue;
      band = clipCoordinate(band, (panel + 1) / chart.columns, false); if (band.length < 3) continue;
      for (let row = 0; row < voyageRows.length - 1; row++) {
        let clipped = clipCoordinate(band, voyageRows[row], true, 1); if (clipped.length < 3) continue;
        clipped = clipCoordinate(clipped, voyageRows[row + 1], false, 1); if (clipped.length < 3) continue;
        for (let i = 1; i < clipped.length - 1; i++) {
          const uv = [clipped[0], clipped[i + 1], clipped[i]], points = uv.map(p => chart.point(p[0], p[1], lift));
          if (Math.hypot(...cross(sub(points[1], points[0]), sub(points[2], points[0]))) > 1e-9) mesh.triangle(...points, material(color, 0, 1), uv);
        }
      }
    }
  }
  function routeUV(theta) {
    const r = 1 + 0.055 * Math.cos(3 * theta + 0.4);
    return [0.5 + 0.385 * r * Math.cos(theta), 0.52 + 0.315 * r * Math.sin(theta)];
  }
  function voyageChart(fold) {
    const mesh = new Mesh(), chart = chartSurface(fold), rows = voyageRows;
    for (let i = 0; i < chart.columns; i++) for (let j = 0; j < rows.length - 1; j++) {
      const uv = [[i / chart.columns, rows[j]], [i / chart.columns, rows[j + 1]], [(i + 1) / chart.columns, rows[j + 1]], [(i + 1) / chart.columns, rows[j]]];
      const points = uv.map(p => chart.point(...p));
      mesh.quad(points, material(i % 2 ? palette.ivory : palette.paper, 0.025), uv);
      mesh.quad(points.map(p => add(p, [0, -0.028, 0])).reverse(), material(palette.back, 0, 0.92));
    }
    // A narrow rounded lip, with side thickness only on the sheet perimeter.
    const rim = [];
    for (let i = 0; i <= chart.columns; i++) rim.push([i / chart.columns, 0]);
    rows.slice(1).forEach(v => rim.push([1, v]));
    for (let i = chart.columns - 1; i >= 0; i--) rim.push([i / chart.columns, 1]);
    rows.slice(1, -1).reverse().forEach(v => rim.push([0, v]));
    rim.forEach((uv, i) => {
      const next = rim[(i + 1) % rim.length], a = chart.point(...uv), b = chart.point(...next);
      const a1 = add(a, [0, -0.006, 0]), b1 = add(b, [0, -0.006, 0]);
      mesh.quad([a, a1, b1, b], material(palette.ivory, 0));
      mesh.quad([a1, add(a, [0, -0.028, 0]), add(b, [0, -0.028, 0]), b1], material(palette.edge, 0, 0.95));
    });
    // Printed ocean: the ink follows each crease rather than floating over it.
    const seaRows = rows.filter(v => v >= 0.055 && v <= 0.945);
    for (let i = 0; i < chart.columns; i++) {
      const a = Math.max(0.035, i / chart.columns), b = Math.min(0.965, (i + 1) / chart.columns);
      for (let j = 0; j < seaRows.length - 1; j++) {
        const v = seaRows[j], w = seaRows[j + 1];
        const uv = [[a, v], [a, w], [b, w], [b, v]];
        mesh.quad(uv.map(p => chart.point(...p, 0.002)), material(voyageColors.sea, 0.045), uv);
      }
    }
    const coasts = [[0.28, 0.34, 0.13, 0.15, 0.4], [0.64, 0.46, 0.16, 0.19, 2.1], [0.77, 0.72, 0.068, 0.075, 1.1], [0.24, 0.73, 0.060, 0.047, 3.0]];
    coasts.forEach(([u, v, ru, rv, phase]) => {
      const points = Array.from({ length: 40 }, (_, i) => { const t = i * TAU / 40, r = 1 + 0.14 * Math.cos(3 * t + phase) + 0.055 * Math.sin(7 * t - phase); return [u + ru * r * Math.cos(t), v + rv * r * Math.sin(t)]; });
      for (let i = 0; i < points.length; i++) chartPatch(mesh, chart, [[u, v], points[i], points[(i + 1) % points.length]], voyageColors.coast, 0.004);
      for (const dilation of [1.07, 1.15, 1.24]) for (let i = 0; i < points.length; i++) {
        const a = points[i], b = points[(i + 1) % points.length];
        chartLine(mesh, chart, [u + (a[0] - u) * dilation, v + (a[1] - v) * dilation], [u + (b[0] - u) * dilation, v + (b[1] - v) * dilation], voyageColors.shallows, 0.27, 0.007);
      }
    });
    for (let i = 0; i < 224; i++) {
      const a = routeUV(i * TAU / 224), b = routeUV((i + 1) * TAU / 224);
      chartLine(mesh, chart, a, b, palette.ivory, 0.30, 0.008);
      if (i % 8 < 5) {
        const pa = chart.point(...a, 0.009), pb = chart.point(...b, 0.009), sideways = mul(unit(cross(sub(pb, pa), [0, 1, 0])), 0.008);
        mesh.quad([add(pa, sideways), sub(pa, sideways), sub(pb, sideways), add(pb, sideways)], material(voyageColors.route, 0));
      }
    }
    for (let i = 0; i < 9; i++) { const uv = routeUV((i / 9 + 0.025) * TAU); mesh.pin(chart.point(...uv, 0.011), chart.up(...uv)); }
    // Fold seams stay restrained; the dark ocean and warm margins carry the map.
    for (let i = 1; i < chart.columns; i++) chartLine(mesh, chart, [i / chart.columns, 0.03], [i / chart.columns, 0.97], palette.ivory, 0.12, 0.010);
    return { mesh, chart };
  }
  function paperBoat(accent) {
    const mesh = new Mesh(), rim = [[-0.62, 0.20, 0], [0, 0.14, 0.28], [0.62, 0.20, 0], [0, 0.14, -0.28]], keel = [[-0.43, 0, 0], [0, 0, 0.09], [0.43, 0, 0], [0, 0, -0.09]];
    const inner = rim.map(([x, y, z]) => [x * 0.94, y, z * 0.94]), bottom = keel.map(([x, , z]) => [x * 0.8, 0.035, z * 0.8]);
    for (let i = 0; i < 4; i++) {
      const j = (i + 1) % 4, bandA = lerp(keel[i], rim[i], 0.40), bandB = lerp(keel[j], rim[j], 0.40);
      mesh.quad([rim[i], bandA, bandB, rim[j]], material(palette.ivory, 0));
      mesh.quad([bandA, keel[i], keel[j], bandB], material(accent, 0));
      mesh.quad([inner[i], inner[j], bottom[j], bottom[i]], material(voyageColors.interior, 0, 0.78));
      mesh.quad([rim[i], rim[j], inner[j], inner[i]], material(palette.paper, 0));
    }
    mesh.quad(keel.slice().reverse(), material(palette.back, 0)); mesh.quad(bottom, material(voyageColors.interior, 0, 0.80));
    const A = [-0.01, 0.15, 0.02], B = [0.46, 0.15, 0], F = [0.22, 0.17, 0.12], P = [0, 0.65, 0.025];
    const C = [-0.46, 0.15, 0], D = [-0.04, 0.15, -0.015], G = [-0.24, 0.17, -0.12], Q = [-0.05, 0.58, -0.025];
    mesh.sheet([A, F, P], material(palette.ivory, 0), undefined, 0.006); mesh.sheet([F, B, P], material(palette.paper, 0), undefined, 0.006);
    mesh.sheet([C, Q, G], material([0.77, 0.87, 0.89], 0), undefined, 0.006); mesh.sheet([G, Q, D], material(palette.ivory, 0), undefined, 0.006);
    mesh.seam(P, F, 0.19); mesh.seam(Q, G, 0.15);
    return mesh;
  }
  function sailBoat(mesh, chart, source, theta, scale) {
    const uv = routeUV(theta), before = chart.point(...routeUV(theta - 0.001)), after = chart.point(...routeUV(theta + 0.001));
    const heading = unit([after[0] - before[0], 0, after[2] - before[2]]), up = [0, 1, 0], port = cross(heading, up), center = chart.point(...uv);
    // Test every folded vertex and every keel-edge crossing of a chart crease.
    // A ridge can sit between the boat centre and its pointed ends.
    let height = -Infinity;
    const clearPoint = ([x, y, z]) => {
      const du = (heading[0] * x + port[0] * z) * scale / chart.width, dv = (heading[2] * x + port[2] * z) * scale / chart.depth;
      height = Math.max(height, chart.point(uv[0] + du, uv[1] + dv)[1] - y * scale);
    };
    for (let i = 0; i < source.vertices.length; i += 14) clearPoint(source.vertices.slice(i, i + 3));
    const keel = [[-0.43, 0, 0], [0, 0, 0.09], [0.43, 0, 0], [0, 0, -0.09]];
    keel.forEach((a, i) => {
      const b = keel[(i + 1) % keel.length];
      for (const [axis, knots, size] of [[0, chart.uKnots, chart.width], [2, chart.vKnots, chart.depth]]) {
        const au = uv[axis === 0 ? 0 : 1] + (heading[axis] * a[0] + port[axis] * a[2]) * scale / size;
        const bu = uv[axis === 0 ? 0 : 1] + (heading[axis] * b[0] + port[axis] * b[2]) * scale / size;
        for (const knot of knots) if ((knot - au) * (knot - bu) < 0) clearPoint(lerp(a, b, (knot - au) / (bu - au)));
      }
    });
    center[1] = height + 0.025;
    const direction = p => add(add(mul(heading, p[0]), mul(up, p[1])), mul(port, p[2]));
    mergeMesh(mesh, source, p => add(center, mul(direction(p), scale)), direction);
  }
  function paperWheel() {
    const mesh = new Mesh(), segments = 20;
    const ring = (r, z, i) => { const a = i * TAU / segments; return [r * Math.cos(a), r * Math.sin(a), z + 0.022 * (i % 2 ? -1 : 1)]; };
    for (let i = 0; i < segments; i++) {
      const j = i + 1, color = i === 3 || i === 4 ? voyageColors.sea : i === 13 ? palette.copper : i % 2 ? palette.ivory : palette.paper;
      const sections = [[0.68, 0.055], [0.72, 0.005], [0.68, -0.055], [0.37, -0.055], [0.33, 0.005], [0.37, 0.055]];
      sections.forEach(([r, z], k) => { const [nr, nz] = sections[(k + 1) % sections.length]; mesh.quad([ring(r, z, i), ring(r, z, j), ring(nr, nz, j), ring(nr, nz, i)].reverse(), material(k === 3 ? palette.back : color, k === 5 ? 0.09 : 0, k === 3 ? 0.78 : 1)); });
    }
    return mesh;
  }
  function foldedStand(mesh, chart, x, z, y, width = 0.65, depth = 0.46, height = 0.20) {
    const foot = (px, pz) => [px, chart.point(px / chart.width + 0.5, pz / chart.depth + 0.5)[1] + 0.009, pz];
    const left = [foot(x - width / 2, z - depth / 2), foot(x - width / 2, z + depth / 2)], ridge = [[x, y + height, z - depth / 2], [x, y + height, z + depth / 2]], right = [foot(x + width / 2, z - depth / 2), foot(x + width / 2, z + depth / 2)];
    mesh.sheet([left[0], left[1], ridge[1], ridge[0]], material(palette.ivory, 0.05), undefined, 0.018);
    mesh.sheet([ridge[0], ridge[1], right[1], right[0]], material(palette.paper, 0.05), undefined, 0.018);
  }
  function paperIsland(mesh, chart, x, z, base, radius, phase) {
    let y = base;
    [0.11, 0.17, 0.23].forEach((height, layer) => {
      const r = radius * (1 - layer * 0.22), count = 14;
      const ring = (scale, altitude) => Array.from({ length: count }, (_, i) => { const a = i * TAU / count, local = r * scale * (1 + 0.11 * Math.sin(3 * a + phase) + 0.05 * Math.cos(5 * a)); return [x + local * Math.cos(a), altitude, z + local * Math.sin(a)]; });
      const bottom = ring(1, y), shoulder = ring(1, y + height - 0.028), top = ring(0.95, y + height), center = [x, y + height, z];
      if (layer === 0) bottom.forEach(p => { p[1] = chart.point(p[0] / chart.width + 0.5, p[2] / chart.depth + 0.5)[1] + 0.007; });
      for (let i = 0; i < count; i++) {
        const j = (i + 1) % count;
        mesh.quad([bottom[i], shoulder[i], shoulder[j], bottom[j]], material(layer === 1 ? voyageColors.shallows : palette.paper, 0, 0.94));
        mesh.quad([shoulder[i], top[i], top[j], shoulder[j]], material(palette.ivory, 0));
        mesh.triangle(center, top[j], top[i], material(palette.ivory, 0.06));
      }
      y += height;
    });
  }
  function copyPaperMesh(source) {
    const mesh = new Mesh();
    mesh.vertices = source.vertices.slice(); mesh.lines = source.lines.slice(); mesh.triangles = source.triangles.slice();
    mesh.landmarks = source.landmarks.slice(); mesh.bounds = source.bounds.map(p => p.slice());
    return mesh;
  }
  function refoldChart(cached, fold, openingAngle = null) {
    const chart = chartSurface(fold, openingAngle), source = cached.mesh, mesh = new Mesh();
    const scaleX = chart.width / cached.chart.width, deltaRise = chart.rise - cached.chart.rise;
    const move = p => {
      const q = clamp(p[0] / cached.chart.width + 0.5, 0, 1) * chart.columns, panel = Math.min(chart.columns - 1, Math.floor(q)), t = q - panel;
      return [p[0] * scaleX, p[1] + (panel % 2 ? 1 - t : t) * deltaRise, p[2]];
    };
    mesh.vertices = source.vertices.slice();
    for (let i = 0; i < mesh.vertices.length; i += 42) {
      const triangle = [0, 14, 28].map(offset => move(source.vertices.slice(i + offset, i + offset + 3))), n = normal(triangle);
      triangle.forEach((p, vertex) => {
        const start = i + vertex * 14;
        for (let axis = 0; axis < 3; axis++) {
          mesh.vertices[start + axis] = p[axis]; mesh.vertices[start + 3 + axis] = n[axis];
          mesh.bounds[0][axis] = Math.min(mesh.bounds[0][axis], p[axis]); mesh.bounds[1][axis] = Math.max(mesh.bounds[1][axis], p[axis]);
        }
      });
      mesh.triangles.push(triangle);
    }
    mesh.lines = source.lines.slice();
    for (let i = 0; i < mesh.lines.length; i += 7) { const p = move(source.lines.slice(i, i + 3)); for (let axis = 0; axis < 3; axis++) mesh.lines[i + axis] = p[axis]; }
    for (let i = 0; i < 9; i++) { const uv = routeUV((i / 9 + 0.025) * TAU); mesh.pin(chart.point(...uv, 0.011), chart.up(...uv)); }
    return { mesh, chart };
  }
  function scalePaperScene(mesh, scale) {
    for (let i = 0; i < mesh.vertices.length; i += 14) for (let axis = 0; axis < 3; axis++) mesh.vertices[i + axis] *= scale;
    for (let i = 0; i < mesh.lines.length; i += 7) for (let axis = 0; axis < 3; axis++) mesh.lines[i + axis] *= scale;
    mesh.triangles = mesh.triangles.map(tri => tri.map(p => mul(p, scale)));
    mesh.landmarks = mesh.landmarks.map(mark => ({ position: mul(mark.position, scale), normal: mark.normal.slice() }));
    mesh.bounds = mesh.bounds.map(p => mul(p, scale));
  }
  function voyageCameraEnvelope(key, propVertices, bodyEnvelope = null) {
    if (voyageCameraCache.has(key)) return voyageCameraCache.get(key);
    const points = [], low = chartSurface(key === 'voyage-chart' ? 0 : 0.28), high = chartSurface(key === 'voyage-chart' ? 1 : 0.28);
    // Chart corners and crests stay low. Empty space above the outer corners is
    // deliberately absent from this stable envelope.
    for (let i = 0; i <= 6; i++) for (const v of [0, 0.14, 0.5, 0.86, 1]) {
      const u = i / 6, x = (u - 0.5) * low.width, z = (v - 0.5) * low.depth;
      points.push([x, low.point(u, v)[1] - 0.035, z], [x, high.point(u, v)[1] + 0.015, z]);
    }
    // A complete boat-route envelope includes both ships at every route phase.
    // The upper ring belongs only to their footprint, not to the entire chart.
    const boatTop = 0.075 + high.rise + 0.035 + 0.025 + 0.65 * 0.43;
    for (let i = 0; i < 48; i++) {
      const uv = routeUV(i * TAU / 48), p = low.point(...uv);
      const tangentUV = routeUV(i * TAU / 48 + 0.001), q = low.point(...tangentUV), t = unit([q[0] - p[0], 0, q[2] - p[2]]), b = cross(t, [0, 1, 0]);
      for (const [x, z] of [[-0.29, -0.14], [-0.29, 0.14], [0.29, -0.14], [0.29, 0.14]]) points.push([p[0] + t[0] * x + b[0] * z, boatTop, p[2] + t[2] * x + b[2] * z]);
    }
    const circle = (radius, y, origin, count = 32) => {
      radius = radius / Math.cos(Math.PI / count) + 0.004;
      for (let i = 0; i < count; i++) { const a = i * TAU / count; points.push([origin[0] + radius * Math.cos(a), y, origin[2] + radius * Math.sin(a)]); }
    };
    const baseLow = low.point(0.5, 0.5)[1] + 0.025, baseHigh = high.point(0.5, 0.5)[1] + 0.025;
    if (bodyEnvelope) {
      // A rotational hull of the complete unfolding keeps every phase framed.
      // This hull is cached per model and never follows the animated mesh.
      const levels = new Map();
      bodyEnvelope.forEach(p => {
        const label = Math.round(p[1] * 40), previous = levels.get(label), radius = Math.hypot(p[0], p[2] + 0.10);
        if (!previous || radius > previous.radius) levels.set(label, { y: label / 40, radius });
      });
      levels.forEach(({ y, radius }) => { circle(radius + 0.008, y - 0.014, [0, 0, -0.10]); circle(radius + 0.008, y + 0.014, [0, 0, -0.10]); });
    } else if (key === 'voyage-chart') {
      for (const [x, z, yaw, pitch] of [[-0.65, -0.23, -0.22, 0.12], [0.64, -0.42, 0.30, -0.09]]) {
        const radius = Math.hypot(0.72, 0.077) * 0.86 / Math.cos(Math.PI / 32) + 0.004;
        const depth = (0.72 * Math.abs(Math.sin(pitch)) + 0.077 * Math.cos(pitch)) * 0.86 + 0.004;
        for (const base of [baseLow, baseHigh]) for (const dz of [-depth, depth]) for (let i = 0; i < 32; i++) {
          const a = i * TAU / 32, dx = radius * Math.cos(a), dy = radius * Math.sin(a);
          points.push([x + dx * Math.cos(yaw) + dz * Math.sin(yaw), base + 0.80 + dy, z - dx * Math.sin(yaw) + dz * Math.cos(yaw)]);
        }
      }
    } else if (key === 'voyage-globe') {
      const radius = 1.28 * 0.66 * 1.025;
      for (let row = 0; row <= 12; row++) for (let col = 0; col < 24; col++) {
        const lat = -Math.PI / 2 + row * Math.PI / 12, lon = col * TAU / 24;
        points.push([radius * Math.cos(lat) * Math.cos(lon), baseLow + 1.04 + radius * Math.sin(lat), -0.15 + radius * Math.cos(lat) * Math.sin(lon)]);
      }
    } else if (key === 'voyage-portal') {
      const source = voyagePart('portal', portal), anchor = average(source.bounds), levels = new Map();
      for (let i = 0; i < source.vertices.length; i += 14) {
        const y = (source.vertices[i + 1] - anchor[1]) * 0.66 + baseLow + 0.99, r = Math.hypot(source.vertices[i] - anchor[0], source.vertices[i + 2] - anchor[2]) * 0.66, label = y.toFixed(5);
        const prior = levels.get(label); if (!prior || r > prior.r) levels.set(label, { y, r });
      }
      levels.forEach(({ y, r }) => { circle(r, y - 0.001, [0, 0, -0.12]); circle(r, y + 0.001, [0, 0, -0.12]); });
    } else if (key === 'voyage-rigging') {
      const source = voyagePart('rigging', tensegrity);
      let radius = 0;
      for (let i = 0; i < source.vertices.length; i += 14) radius = Math.max(radius, Math.hypot(source.vertices[i], source.vertices[i + 2]) * 0.78);
      circle(radius, baseLow + 0.05 + source.bounds[0][1] * 0.78 - 0.01, [0, 0, -0.12]);
      circle(radius, baseLow + 0.05 + source.bounds[1][1] * 0.78 + 0.01, [0, 0, -0.12]);
    } else {
      const unique = new Set();
      for (let i = 0; i < propVertices.length; i += 14) { const p = propVertices.slice(i, i + 3), label = p.map(x => x.toFixed(5)).join(','); if (!unique.has(label)) { unique.add(label); points.push(p); } }
    }
    voyageCameraCache.set(key, points); return points;
  }
  function voyageScene(key, fold, time, openingProgress = null, unfoldProgress = 0) {
    let cached = voyageChartCache.get('master');
    if (!cached) { cached = voyageChart(0.28); voyageChartCache.set('master', cached); }
    // Public setShape normally prepares this envelope first. Preserve the same
    // invariant if an opening is requested before a regular scene is built.
    if (openingProgress !== null && !voyageCameraCache.has(key)) voyageScene(key, fold, time, null, unfoldProgress);
    // Coastline clipping is performed once. Animated folds only transform the
    // existing paper facets, keeping the mobile geometry update bounded.
    const finalFold = key === 'voyage-chart' ? fold : 0.28, normalAngle = 0.055 + finalFold * 0.34;
    const openingAngle = openingProgress === null ? null : normalAngle + (0.98 - normalAngle) * (1 - openingProgress);
    const { chart, mesh } = key === 'voyage-chart' || openingAngle !== null ? refoldChart(cached, finalFold, openingAngle) : { chart: cached.chart, mesh: copyPaperMesh(cached.mesh) };
    const turn = time * TAU / 34, base = chart.point(0.5, 0.5)[1] + 0.025, propStart = mesh.vertices.length;
    let bodyEnvelope = null;
    const labKey = bodyKeys[key];
    if (labKey && hasShapeLab()) {
      const body = bodyMesh(labKey, unfoldProgress), scale = 0.61, origin = [0, base + 0.055, -0.10];
      placeMesh(mesh, body, origin, scale, turn * 0.60 + 0.16);
      if (!voyageCameraCache.has(key)) {
        const b = body.cameraBounds || body.bounds, points = body.cameraPoints || [];
        if (!points.length) for (let x = 0; x < 2; x++) for (let y = 0; y < 2; y++) for (let z = 0; z < 2; z++) points.push([b[x][0], b[y][1], b[z][2]]);
        bodyEnvelope = points.map(p => add(origin, mul(p, scale)));
      }
    } else if (key === 'voyage-chart') {
      const wheel = voyagePart('wheel', paperWheel);
      foldedStand(mesh, chart, -0.65, -0.23, base, 0.58, 0.44, 0.19); foldedStand(mesh, chart, 0.64, -0.42, base, 0.58, 0.44, 0.19);
      placeMesh(mesh, wheel, [-0.65, base + 0.80, -0.23], 0.86, -0.22, 0.12, turn);
      placeMesh(mesh, wheel, [0.64, base + 0.80, -0.42], 0.86, 0.30, -0.09, -turn * 0.84 + 0.24);
    } else if (key === 'voyage-globe') {
      foldedStand(mesh, chart, 0, -0.15, base, 1.05, 0.67, 0.20);
      placeMesh(mesh, voyagePart('globe', globe), [0, base + 1.04, -0.15], 0.66, turn + 0.35, 0.08, 0.12, [0, 1.34, 0]);
    } else if (key === 'voyage-portal') {
      const body = voyagePart('portal', portal), center = average(body.bounds);
      foldedStand(mesh, chart, 0, -0.12, base, 1.12, 0.57, 0.12);
      placeMesh(mesh, body, [0, base + 0.99, -0.12], 0.66, turn * 0.72 - 0.35, 0, 0, center);
    } else if (key === 'voyage-rigging') {
      const body = voyagePart('rigging', tensegrity);
      placeMesh(mesh, body, [0, base + 0.05, -0.12], 0.78, turn * 0.82 + 0.2);
      for (let i = 0; i < 3; i++) {
        const a = i * TAU / 3 - (turn * 0.82 + 0.2), x = Math.cos(a) * 1.15 * 0.78, z = Math.sin(a) * 1.15 * 0.78 - 0.12;
        foldedStand(mesh, chart, x, z, base, 0.24, 0.20, 0.125);
      }
    } else {
      paperIsland(mesh, chart, -0.67, -0.28, base, 0.57, 0.4); paperIsland(mesh, chart, 0.44, -0.23, base, 0.62, 2.1); paperIsland(mesh, chart, 0.24, 0.60, base, 0.36, 1.1);
      // A folded summit creates a distinct pop-up silhouette over the terraces.
      const a = [-0.22, base + 0.51, -0.45], b = [0.67, base + 0.51, -0.44], c = [0.56, base + 0.51, 0.17], peak = [0.31, base + 1.10, -0.18];
      mesh.sheet([a, peak, b], material(palette.ivory, 0.06), undefined, 0.016); mesh.sheet([b, peak, c], material(palette.paper, 0.06), undefined, 0.016); mesh.sheet([c, peak, a], material(voyageColors.shallows, 0.05), undefined, 0.016);
    }
    mesh.cameraPoints = voyageCameraEnvelope(key, voyageCameraCache.has(key) ? [] : mesh.vertices.slice(propStart), bodyEnvelope);
    sailBoat(mesh, chart, voyagePart('boat-blue', () => paperBoat(voyageColors.sea)), time * TAU / 30 + 0.65, 0.43);
    sailBoat(mesh, chart, voyagePart('boat-copper', () => paperBoat(palette.copper)), time * TAU / 30 + 0.65 + Math.PI * 1.12, 0.35);
    // A brief uniform stage reveal accompanies the real hinge opening. All
    // props, boats and pins share it; it makes no physical folding claim about
    // the solid models and leaves the tensegrity graph unchanged.
    if (openingProgress !== null) scalePaperScene(mesh, 0.70 + 0.30 * openingProgress);
    // The bounds provide an initial centre; cameraPoints provide the tight,
    // time-independent fit without fictitious elevated outer corners.
    const normalChart = openingProgress === null ? chart : chartSurface(finalFold), normalBase = normalChart.point(0.5, 0.5)[1] + 0.025;
    const top = key === 'voyage-islands' ? normalBase + 1.30 : key === 'voyage-chart' ? normalBase + 1.57 : Math.max(normalBase + 2.00, ...mesh.cameraPoints.map(p => p[1]));
    mesh.cameraBounds = [[-normalChart.width / 2 - 0.03, 0.02, -normalChart.depth / 2 - 0.03], [normalChart.width / 2 + 0.03, top, normalChart.depth / 2 + 0.03]];
    return mesh;
  }

  function hitTriangle(origin, ray, triangle, distance) {
    const a = triangle[0], b = triangle[1], c = triangle[2];
    const e1 = sub(b, a), e2 = sub(c, a), p = cross(ray, e2), determinant = dot(e1, p);
    if (Math.abs(determinant) < 1e-9) return false;
    const inverse = 1 / determinant, t = sub(origin, a), u = dot(t, p) * inverse;
    if (u < -1e-6 || u > 1.000001) return false;
    const q = cross(t, e1), v = dot(ray, q) * inverse;
    if (v < -1e-6 || u + v > 1.000001) return false;
    const d = dot(e2, q) * inverse;
    return d > 0.02 && d < distance - 0.035;
  }

  const VERTEX = `
    attribute vec3 aPosition; attribute vec3 aNormal; attribute vec3 aColor;
    attribute vec2 aUV; attribute vec3 aMeta;
    uniform mat4 uViewProjection; uniform mat4 uLightProjection;
    varying vec3 vPosition; varying vec3 vNormal; varying vec3 vColor;
    varying vec2 vUV; varying vec3 vMeta; varying vec4 vLight;
    void main(){ vPosition=aPosition; vNormal=aNormal; vColor=aColor; vUV=aUV; vMeta=aMeta;
      vLight=uLightProjection*vec4(aPosition,1.0); gl_Position=uViewProjection*vec4(aPosition,1.0); }`;
  function fragment(derivatives, precision) {
    // Fixed, evenly spread disk samples keep soft penumbrae stable while orbiting.
    // There is no animated noise in the shadow or on the gallery floor.
    const disk = Array.from({ length: 16 }, (_, i) => {
      const radius = Math.sqrt((i + 0.5) / 16), angle = i * 2.399963229728653;
      return `visible+=shadowTest(p,vec2(${(radius * Math.cos(angle)).toFixed(6)},${(radius * Math.sin(angle)).toFixed(6)})*uShadowStep*radius,bias);`;
    }).join('\n');
    return `${derivatives ? '#extension GL_OES_standard_derivatives : enable\n' : ''}precision ${precision} float;
      varying vec3 vPosition; varying vec3 vNormal; varying vec3 vColor;
      varying vec2 vUV; varying vec3 vMeta; varying vec4 vLight;
      uniform sampler2D uShadow; uniform vec2 uShadowStep; uniform vec3 uEye; uniform vec3 uLight; uniform float uPaperFinish;
      float line(float x){ float d=abs(fract(x-0.5)-0.5); float w=${derivatives ? 'max(fwidth(x),0.001)' : '0.032'}; return 1.0-smoothstep(w*0.18,w*0.78,d); }
      float paperHash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float paperNoise(vec2 p){
        vec2 i=floor(p),f=fract(p); f=f*f*(3.0-2.0*f);
        return mix(mix(paperHash(i),paperHash(i+vec2(1.0,0.0)),f.x),mix(paperHash(i+vec2(0.0,1.0)),paperHash(i+vec2(1.0,1.0)),f.x),f.y);
      }
      float shadowDepth(vec2 uv){vec2 encoded=texture2D(uShadow,uv).rg;return encoded.x+encoded.y/255.0;}
      float shadowTest(vec3 p,vec2 offset,float bias){return smoothstep(p.z-bias-0.00035,p.z-bias+0.00035,shadowDepth(p.xy+offset));}
      float shadow(vec3 n,vec3 light){
        vec3 p=vLight.xyz/vLight.w*0.5+0.5;
        if(p.x<=0.0||p.x>=1.0||p.y<=0.0||p.y>=1.0||p.z>=1.0) return 1.0;
        float bias=max(0.00038,0.00105*(1.0-max(dot(n,light),0.0))); float visible=0.0;
        float separation=max(p.z-shadowDepth(p.xy),0.0);
        float radius=2.4+min(separation*210.0,10.0);
        ${disk}
        return visible/16.0;
      }
      void main(){
        vec3 n=normalize(vNormal); if(!gl_FrontFacing)n=-n;
        vec3 light=normalize(uLight-vPosition), view=normalize(uEye-vPosition);
        float ndl=max((dot(n,light)+0.06)/1.06,0.0), shade=shadow(n,light);
        vec3 base=vColor;
        float longitude=line(vUV.x*24.0), latitude=line(vUV.y*16.0);
        float contour=line(vUV.y*8.0+0.32*sin(vUV.x*13.0)+0.14*sin(vUV.x*29.0));
        float ink=max(max(longitude,latitude)*0.55,contour*0.37)*vMeta.x;
        base=mix(base,vec3(0.25,0.39,0.43),ink*0.43);
        float grain=fract(sin(dot(vPosition,vec3(173.13,229.71,317.37)))*43758.5453)-0.5;
        float grainFilter=${derivatives ? '1.0-smoothstep(0.35,1.0,max(length(dFdx(vPosition)),length(dFdy(vPosition)))*220.0)' : '0.0'};
        vec2 paperUV=vec2(dot(vPosition,vec3(0.81,0.39,0.45)),dot(vPosition,vec3(-0.26,0.92,-0.28)));
        float toothFilter=${derivatives ? '1.0-smoothstep(0.20,0.65,max(length(dFdx(paperUV)),length(dFdy(paperUV)))*72.0)' : '0.0'};
        float surface=(paperNoise(paperUV*5.5)-0.5)*0.012+(paperNoise(paperUV*72.0)-0.5)*0.006*toothFilter;
        base+=mix(grain*0.004*grainFilter,surface,uPaperFinish)*(1.0-vMeta.z);
        vec3 linear=pow(max(base,vec3(0.01)),vec3(2.2));
        vec3 ambient=vec3(0.79,0.84,0.91)*(0.30+0.18*max(n.y,0.0));
        ambient+=vec3(1.0,0.87,0.70)*0.06*max(-n.y,0.0);
        vec3 direct=vec3(1.0,0.925,0.80)*ndl*0.70*(0.20+0.80*shade);
        // Broad warm bounce keeps unlit ivory facets from reading as gray.
        // A bounded softbox falloff gives planar faces a gentle light gradient.
        float sky=0.5+0.5*n.y;
        vec3 paperAmbient=mix(vec3(1.0,0.89,0.73),vec3(0.96,0.97,1.0),sky)*(0.35+0.12*sky);
        paperAmbient*=0.83+0.17*smoothstep(0.025,0.50,vPosition.y);
        float softbox=clamp(8.0/length(uLight-vPosition),0.80,1.24);
        vec3 paperDirect=vec3(1.0,0.945,0.85)*ndl*0.66*softbox*(0.16+0.84*shade);
        ambient=mix(ambient,paperAmbient,uPaperFinish); direct=mix(direct,paperDirect,uPaperFinish);
        vec3 color=linear*(ambient+direct)*vMeta.y;
        color+=vec3(1.0,0.93,0.83)*pow(max(dot(n,normalize(light+view)),0.0),mix(16.0,10.0,uPaperFinish))*mix(0.019,0.010,uPaperFinish)*shade;
        color+=linear*mix(0.035,0.023,uPaperFinish)*pow(1.0-max(dot(n,view),0.0),3.0);
        if(vMeta.z>0.5){
          float contact=exp(-dot(vPosition.xz*0.63,vPosition.xz*0.63))*0.025;
          color=linear*(1.0-contact)*mix(vec3(0.77,0.755,0.715),vec3(0.985),shade);
        }
        color=pow(max(color,vec3(0.0)),vec3(1.0/2.2));
        float fog=smoothstep(8.0,19.0,length(vPosition.xz));
        gl_FragColor=vec4(mix(color,vec3(0.957,0.950,0.929),fog),1.0);
      }`;
  }
  const SHADOW_VERTEX = 'attribute vec3 aPosition; uniform mat4 uViewProjection; void main(){gl_Position=uViewProjection*vec4(aPosition,1.0);}';
  const SHADOW_FRAGMENT = 'precision highp float; void main(){vec2 e=fract(min(gl_FragCoord.z,0.99999)*vec2(1.0,255.0));e.x-=e.y/255.0;gl_FragColor=vec4(e,0.0,1.0);}';
  const LINE_VERTEX = 'attribute vec3 aPosition; attribute vec4 aColor; uniform mat4 uViewProjection; varying vec4 vColor; void main(){vColor=aColor;gl_Position=uViewProjection*vec4(aPosition,1.0);}';
  const LINE_FRAGMENT = 'precision mediump float; varying vec4 vColor; void main(){gl_FragColor=vColor;}';

  class PaperMapEngine {
    constructor(canvas, options = {}) {
      if (!canvas || typeof canvas.getContext !== 'function') throw new Error('The paper gallery needs a canvas. The complete map remains available in the list.');
      const settings = { alpha: false, antialias: true, depth: true, premultipliedAlpha: false, powerPreference: 'low-power' };
      let gl;
      try { gl = canvas.getContext('webgl', settings) || canvas.getContext('experimental-webgl', settings); } catch (_) { /* readable fallback below */ }
      if (!gl) throw new Error('This browser could not open the 3D paper gallery. You can still explore every landmark in the map list.');
      this.canvas = canvas; this.gl = gl;
      this.onProject = typeof options.onProject === 'function' ? options.onProject : () => {};
      this.onInteraction = typeof options.onInteraction === 'function' ? options.onInteraction : () => {};
      this._reduced = options.reducedMotion === undefined ? !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) : !!options.reducedMotion;
      this._shape = 'origami'; this._fold = 0.62; this._currentFold = this._fold; this._phase = 0;
      this._voyageTime = 0; this._voyageFrame = -1; this._sceneHz = 24;
      this._opening = null; this._openingFrame = -1;
      this._unfoldProgress = 0.38; this._unfoldAnimation = null; this._unfoldPreview = false; this._unfoldTime = 0; this._unfoldFrame = -1;
      this._yaw = 0.44; this._pitch = 0.60; this._zoom = 1; this._selected = 0;
      this._parallax = [0, 0]; this._parallaxTarget = [0, 0];
      this._motion = !this._reduced; this._motionOverride = false; this._active = true; this._visible = true; this._destroyed = false; this._lost = false;
      this._pausedUntil = 0; this._frameId = 0; this._lastTime = 0; this._distance = 0;
      this._listeners = []; this._resources = []; this._pointers = new Map();
      this._light = [-3.8, 7.5, 4.6]; this._lightMatrix = multiply(ortho(4.15, 0.1, 20), lookAt(this._light, [0, 0.6, 0]));
      this._touchAction = canvas.style.touchAction; this._tabIndex = canvas.getAttribute('tabindex');
      canvas.style.touchAction = 'none'; if (this._tabIndex === null) canvas.tabIndex = 0;
      try { this._setup(); this._makeScene(); } catch (error) { this.destroy(); throw new Error('The 3D paper gallery could not initialize. The map list is still available. ' + error.message); }
      this._events(); this._request();
    }
    _program(vertex, frag) {
      const gl = this.gl, shaders = [];
      for (const [type, source] of [[gl.VERTEX_SHADER, vertex], [gl.FRAGMENT_SHADER, frag]]) {
        const shader = gl.createShader(type); gl.shaderSource(shader, source); gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { const message = gl.getShaderInfoLog(shader); gl.deleteShader(shader); shaders.forEach(s => gl.deleteShader(s)); throw new Error(message); }
        shaders.push(shader);
      }
      const program = gl.createProgram(); shaders.forEach(shader => gl.attachShader(program, shader)); gl.linkProgram(program); shaders.forEach(shader => gl.deleteShader(shader));
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) { const message = gl.getProgramInfoLog(program); gl.deleteProgram(program); throw new Error(message); }
      this._resources.push(['Program', program]);
      return { program, attributes: Object.fromEntries(['aPosition', 'aNormal', 'aColor', 'aUV', 'aMeta'].map(name => [name, gl.getAttribLocation(program, name)])), uniforms: Object.fromEntries(['uViewProjection', 'uLightProjection', 'uShadow', 'uShadowStep', 'uEye', 'uLight', 'uPaperFinish'].map(name => [name, gl.getUniformLocation(program, name)])) };
    }
    _setup() {
      const gl = this.gl;
      const derivatives = !!gl.getExtension('OES_standard_derivatives');
      const high = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
      const precision = high && high.precision > 0 ? 'highp' : 'mediump';
      this._surfaceProgram = this._program(VERTEX, fragment(derivatives, precision));
      this._shadowProgram = this._program(SHADOW_VERTEX, SHADOW_FRAGMENT.replace('highp', precision));
      this._lineProgram = this._program(LINE_VERTEX, LINE_FRAGMENT);
      const buffer = () => { const b = gl.createBuffer(); this._resources.push(['Buffer', b]); return b; };
      this._meshBuffer = buffer(); this._lineBuffer = buffer(); this._selectionBuffer = buffer();
      this._shadowSize = Math.min(1536, gl.getParameter(gl.MAX_TEXTURE_SIZE), gl.getParameter(gl.MAX_RENDERBUFFER_SIZE));
      this._shadowTexture = gl.createTexture(); this._resources.push(['Texture', this._shadowTexture]); gl.bindTexture(gl.TEXTURE_2D, this._shadowTexture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this._shadowSize, this._shadowSize, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      const depth = gl.createRenderbuffer(); this._resources.push(['Renderbuffer', depth]); gl.bindRenderbuffer(gl.RENDERBUFFER, depth); gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this._shadowSize, this._shadowSize);
      this._shadowFBO = gl.createFramebuffer(); this._resources.push(['Framebuffer', this._shadowFBO]); gl.bindFramebuffer(gl.FRAMEBUFFER, this._shadowFBO);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._shadowTexture, 0); gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depth);
      if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error('The graphics device could not create its paper-lighting buffer.');
      gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL); gl.disable(gl.CULL_FACE);
      this._maxAttributes = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
    }
    _makeScene() {
      const makers = { sphere: globe, portal, tensegrity, terrace, noperthedron: globe, neck: globe, klein: portal };
      const opening = this._opening ? this._openingProgress() : null;
      if (this._isVoyage()) this._mesh = voyageScene(this._shape, this._currentFold, this._voyageTime, opening, this._unfoldProgress);
      else if (this._shape === 'origami') this._mesh = openingSheet(this._unfoldProgress);
      else if (bodyKeys[this._shape] && hasShapeLab()) this._mesh = bodyMesh(bodyKeys[this._shape], this._unfoldProgress);
      else this._mesh = makers[this._shape]();
      this._center = average(this._mesh.cameraBounds || this._mesh.bounds);
      // The floor receives shadows but never writes to the shadow map. Including
      // its huge coplanar triangles creates sampling stripes / self-shadow moire.
      this._shadowVertexCount = this._mesh.vertices.length / 14;
      this._mesh.floor();
      const gl = this.gl; gl.bindBuffer(gl.ARRAY_BUFFER, this._meshBuffer); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this._mesh.vertices), gl.DYNAMIC_DRAW);
      gl.bindBuffer(gl.ARRAY_BUFFER, this._lineBuffer); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this._mesh.lines), gl.STATIC_DRAW);
      this._shadowDirty = true; this._selection();
    }
    _selection() {
      const data = [], mark = this._mesh.landmarks[this._selected];
      if (mark) {
        const [a, b] = tangent(mark.normal);
        for (const side of mark.doubleSided ? [1, -1] : [1]) {
          const center = add(mark.position, mul(mark.normal, side > 0 ? 0.006 : -0.030));
          for (let i = 0; i < 48; i++) {
            const p = angle => add(center, add(mul(a, 0.103 * Math.cos(angle)), mul(b, 0.103 * Math.sin(angle))));
            data.push(...p(i * TAU / 48), 0.70, 0.40, 0.18, 0.66, ...p((i + 1) * TAU / 48), 0.70, 0.40, 0.18, 0.66);
          }
        }
      }
      this._selectionCount = data.length / 7;
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this._selectionBuffer); this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(data), this.gl.DYNAMIC_DRAW);
    }
    _bind(program, buffer, lines = false) {
      const gl = this.gl; gl.useProgram(program.program); gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      for (let i = 0; i < this._maxAttributes; i++) gl.disableVertexAttribArray(i);
      const layout = lines ? [['aPosition', 3, 0], ['aColor', 4, 3]] : [['aPosition', 3, 0], ['aNormal', 3, 3], ['aColor', 3, 6], ['aUV', 2, 9], ['aMeta', 3, 11]];
      layout.forEach(([name, size, offset]) => { const location = program.attributes[name]; if (location >= 0) { gl.enableVertexAttribArray(location); gl.vertexAttribPointer(location, size, gl.FLOAT, false, (lines ? 7 : 14) * 4, offset * 4); } });
    }
    _camera(aspect) {
      // Pointer response changes only the view. Surface coordinates and the
      // projection used by the accessible landmark pins remain identical.
      const yaw = this._yaw + this._parallax[0], pitch = clamp(this._pitch + this._parallax[1], 0.10, 1.35);
      const cp = Math.cos(pitch), direction = [Math.sin(yaw) * cp, Math.sin(pitch), Math.cos(yaw) * cp];
      const right = unit(cross([0, 1, 0], direction)), up = cross(direction, right), tan = Math.tan(38 * RAD / 2);
      let center = this._center;
      const envelope = this._mesh.cameraPoints, margin = this._mesh.cameraFitMargin || (envelope || this._shape === 'tensegrity' ? 0.88 : 0.79);
      if (envelope && !this._mesh.cameraFixedCenter) {
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
        envelope.forEach(point => { const p = sub(point, center), x = dot(p, right), y = dot(p, up); minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y); });
        center = add(center, add(mul(right, (minX + maxX) / 2), mul(up, (minY + maxY) / 2)));
      }
      let fit = 1;
      const include = point => {
        const p = sub(point, center), z = dot(p, direction);
        fit = Math.max(fit, z + Math.abs(dot(p, right)) / (tan * aspect * margin), z + Math.abs(dot(p, up)) / (tan * margin));
      };
      if (envelope) envelope.forEach(include);
      else if (this._mesh.cameraBounds) {
        const b = this._mesh.cameraBounds;
        for (let x = 0; x < 2; x++) for (let y = 0; y < 2; y++) for (let z = 0; z < 2; z++) include([b[x][0], b[y][1], b[z][2]]);
      } else this._mesh.triangles.forEach(tri => tri.forEach(include));
      const targetDistance = (fit + 0.12) / this._zoom;
      this._distance = targetDistance;
      const eye = add(center, mul(direction, this._distance));
      return { eye, matrix: multiply(perspective(38 * RAD, aspect, 0.05, 60), lookAt(eye, center)) };
    }
    _draw() {
      const gl = this.gl, rect = this.canvas.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 1.8);
      this._sceneHz = rect.width < 650 ? 18 : 24;
      const width = Math.max(1, Math.round(rect.width * dpr)), height = Math.max(1, Math.round(rect.height * dpr));
      if (this.canvas.width !== width || this.canvas.height !== height) { this.canvas.width = width; this.canvas.height = height; }
      const camera = this._camera(width / height), count = this._mesh.vertices.length / 14;
      gl.depthMask(true); gl.disable(gl.BLEND);
      if (this._shadowDirty) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._shadowFBO); gl.viewport(0, 0, this._shadowSize, this._shadowSize); gl.clearColor(1, 1, 1, 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        this._bind(this._shadowProgram, this._meshBuffer); gl.uniformMatrix4fv(this._shadowProgram.uniforms.uViewProjection, false, this._lightMatrix); gl.drawArrays(gl.TRIANGLES, 0, this._shadowVertexCount); this._shadowDirty = false;
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, width, height); gl.clearColor(...palette.floor, 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      this._bind(this._surfaceProgram, this._meshBuffer); const u = this._surfaceProgram.uniforms;
      gl.uniformMatrix4fv(u.uViewProjection, false, camera.matrix); gl.uniformMatrix4fv(u.uLightProjection, false, this._lightMatrix);
      gl.uniform3fv(u.uEye, camera.eye); gl.uniform3fv(u.uLight, this._light); gl.uniform2f(u.uShadowStep, 1 / this._shadowSize, 1 / this._shadowSize);
      // Preserve the already-reviewed prism lighting; this finish is for paper solids.
      gl.uniform1f(u.uPaperFinish, this._shape === 'tensegrity' ? 0 : 1);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, this._shadowTexture); gl.uniform1i(u.uShadow, 0);
      gl.enable(gl.POLYGON_OFFSET_FILL); gl.polygonOffset(1, 1); gl.drawArrays(gl.TRIANGLES, 0, count); gl.disable(gl.POLYGON_OFFSET_FILL);
      gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); gl.depthMask(false); gl.lineWidth(1);
      if (this._mesh.lines.length) { this._bind(this._lineProgram, this._lineBuffer, true); gl.uniformMatrix4fv(this._lineProgram.uniforms.uViewProjection, false, camera.matrix); gl.drawArrays(gl.LINES, 0, this._mesh.lines.length / 7); }
      if (this._selectionCount) { this._bind(this._lineProgram, this._selectionBuffer, true); gl.uniformMatrix4fv(this._lineProgram.uniforms.uViewProjection, false, camera.matrix); gl.drawArrays(gl.LINES, 0, this._selectionCount); }
      gl.depthMask(true); gl.disable(gl.BLEND); this._project(camera, rect);
    }
    _project(camera, rect) {
      const points = this._mesh.landmarks.map(mark => {
        const p = project(camera.matrix, mark.position), toCamera = sub(camera.eye, mark.position), distance = Math.hypot(...toCamera);
        let visible = p[3] > 0 && distance > 0.01 && (mark.doubleSided || dot(mark.normal, toCamera) > 0.005);
        const x = p[0] / p[3] * 0.5 + 0.5, y = 0.5 - p[1] / p[3] * 0.5, depth = p[2] / p[3] * 0.5 + 0.5;
        visible = visible && x >= 0 && x <= 1 && y >= 0 && y <= 1 && depth > 0 && depth < 1;
        if (visible) { const ray = mul(toCamera, -1 / distance); visible = !this._mesh.triangles.some(tri => hitTriangle(camera.eye, ray, tri, distance)); }
        return { x: Number.isFinite(x) ? clamp(x, 0, 1) : 0.5, y: Number.isFinite(y) ? clamp(y, 0, 1) : 0.5, visible, depth: Number.isFinite(depth) ? clamp(depth, 0, 1) : 1 };
      });
      this._lastProjection = points;
      this.onProject(points, { ...this._viewInfo(rect), status: 'ready', available: true, visiblePins: points.filter(p => p.visible).length });
    }
    _motionEnabled() { return this._motion && (!this._reduced || this._motionOverride); }
    _isVoyage() { return this._shape.startsWith('voyage-'); }
    _isFoldable() { return this._shape === 'origami' || this._shape === 'voyage-chart'; }
    _isUnfoldable() { return this._isFoldable() || (!!bodyKeys[this._shape] && hasShapeLab()); }
    _syncUnfoldFold() { if (this._isFoldable()) { this._currentFold = 1 - this._unfoldProgress; this._fold = this._currentFold; } }
    _cancelUnfold() { this._unfoldAnimation = null; this._unfoldFrame = -1; }
    _previewProgress(time) {
      // Endpoint holds let a visitor read the object before and after opening.
      const phase = ((time % 14) + 14) % 14;
      const smooth = t => t * t * (3 - 2 * t);
      if (phase < 1.5) return 0;
      if (phase < 6) return smooth((phase - 1.5) / 4.5);
      if (phase < 8) return 1;
      if (phase < 12.5) return 1 - smooth((phase - 8) / 4.5);
      return 0;
    }
    _openingProgress() { const t = this._opening ? clamp(this._opening.elapsed / this._opening.duration, 0, 1) : 1; return 1 - Math.pow(1 - t, 3); }
    _cancelOpening(rebuild = true) {
      if (!this._opening) return;
      this._opening = null; this._openingFrame = -1;
      if (rebuild) this._makeScene();
    }
    _viewInfo(rect) {
      return { shape: this._shape, family: this._isVoyage() ? 'voyage' : 'studio', fold: this._currentFold, foldable: this._isFoldable(), opening: !!this._opening, openingProgress: this._openingProgress(), unfoldProgress: this._unfoldProgress, unfoldable: this._isUnfoldable(), unfolding: !!this._unfoldAnimation, unfoldPreview: this._unfoldPreview, yaw: (this._yaw / RAD % 360 + 360) % 360, pitch: this._pitch / RAD, zoom: this._zoom, motion: this._motionEnabled(), active: this._active, width: rect.width, height: rect.height, renderer: 'WebGL' };
    }
    _reportUnavailable(error, status) {
      const points = Array.from({ length: 9 }, (_, i) => ({ ...((this._lastProjection || [])[i] || { x: 0.5, y: 0.5, depth: 1 }), visible: false }));
      this.onProject(points, { ...this._viewInfo(this.canvas.getBoundingClientRect()), status, available: false, motion: false, visiblePins: 0, error });
    }
    _canDraw() { return !this._destroyed && !this._lost && this._active && this._visible && !document.hidden; }
    _request() { if (this._canDraw() && !this._frameId) this._frameId = requestAnimationFrame(time => this._frame(time)); }
    _stop() {
      if (this._frameId) cancelAnimationFrame(this._frameId); this._frameId = 0; this._lastTime = 0;
      this._setParallax(0, 0, true); this._pointers.clear();
    }
    _setParallax(yaw, pitch, immediate = false) {
      this._parallaxTarget[0] = yaw; this._parallaxTarget[1] = pitch;
      // Reduced motion keeps direct pointer control, without a trailing tween.
      if (immediate || (this._reduced && !this._motionOverride)) { this._parallax[0] = yaw; this._parallax[1] = pitch; }
    }
    _followPointer(event) {
      if (!this._canDraw() || event.pointerType !== 'mouse' || event.buttons || this._pointers.size) return;
      const rect = this.canvas.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0 || !Number.isFinite(event.clientX) || !Number.isFinite(event.clientY)) return;
      const x = clamp((event.clientX - rect.left) / rect.width * 2 - 1, -1, 1);
      const y = clamp((event.clientY - rect.top) / rect.height * 2 - 1, -1, 1);
      this._setParallax(x * 0.08, -y * 0.055); this._request();
    }
    _updateParallax(dt) {
      const amount = 1 - Math.exp(-12 * (dt || 1 / 60)); let unsettled = false;
      for (let i = 0; i < 2; i++) {
        this._parallax[i] += (this._parallaxTarget[i] - this._parallax[i]) * amount;
        if (Math.abs(this._parallaxTarget[i] - this._parallax[i]) < 0.00008) this._parallax[i] = this._parallaxTarget[i];
        else unsettled = true;
      }
      return unsettled;
    }
    _frame(time) {
      this._frameId = 0; if (!this._canDraw()) return;
      const dt = this._lastTime ? Math.min((time - this._lastTime) / 1000, 0.05) : 0; this._lastTime = time;
      const moving = this._motionEnabled() && this._pointers.size === 0 && time >= this._pausedUntil;
      let geometryChanged = false;
      if (moving && this._opening) {
        this._opening.elapsed = Math.min(this._opening.duration, this._opening.elapsed + dt);
        const finished = this._opening.elapsed >= this._opening.duration, step = Math.floor(this._opening.elapsed * this._sceneHz);
        if (finished || step !== this._openingFrame) { this._openingFrame = step; if (finished) this._opening = null; geometryChanged = true; }
      }
      if (moving && this._unfoldAnimation) {
        const animation = this._unfoldAnimation;
        animation.elapsed = Math.min(animation.duration, animation.elapsed + dt);
        const t = animation.elapsed / animation.duration, eased = t * t * (3 - 2 * t);
        const step = Math.floor(animation.elapsed * this._sceneHz), finished = t >= 1;
        if (finished || step !== this._unfoldFrame) {
          this._unfoldFrame = step; this._unfoldProgress = animation.from + (animation.to - animation.from) * eased;
          this._syncUnfoldFold(); geometryChanged = true;
          if (finished) this._unfoldAnimation = null;
        }
      } else if (moving && this._unfoldPreview && this._isUnfoldable()) {
        this._unfoldTime += dt;
        const step = Math.floor(this._unfoldTime * this._sceneHz);
        if (step !== this._unfoldFrame) {
          this._unfoldFrame = step;
          const progress = this._previewProgress(this._unfoldTime);
          if (Math.abs(progress - this._unfoldProgress) > 0.00001) { this._unfoldProgress = progress; this._syncUnfoldFold(); geometryChanged = true; }
        }
      }
      if (moving) {
        // A deliberate unfold keeps its camera still; autonomous table previews
        // turn gently while the body opens. Direct manipulation remains exact.
        if (!this._opening && !this._unfoldAnimation) { this._yaw += dt * TAU / 72; this._phase += dt * TAU / 16; }
        if (this._isVoyage()) {
          this._voyageTime += dt;
          const step = Math.floor(this._voyageTime * this._sceneHz);
          if (step !== this._voyageFrame) { this._voyageFrame = step; geometryChanged = true; }
        }
      }
      if (geometryChanged) this._makeScene();
      const parallaxMoving = this._updateParallax(dt);
      this._draw();
      if (this._motionEnabled() || parallaxMoving) this._request();
    }
    _listen(target, name, fn, options) { target.addEventListener(name, fn, options); this._listeners.push(() => target.removeEventListener(name, fn, options)); }
    _interaction(type) { this._cancelOpening(); this._pausedUntil = performance.now() + 3500; this.onInteraction({ type, yaw: this._yaw / RAD, pitch: this._pitch / RAD, fold: this._currentFold, zoom: this._zoom }); this._request(); }
    _events() {
      const canvas = this.canvas;
      this._listen(canvas, 'pointerdown', event => {
        if (!this._canDraw() || (event.pointerType === 'mouse' && event.button !== 0)) return;
        // Begin a drag from the displayed view, without snapping out of hover.
        this._yaw += this._parallax[0]; this._pitch = clamp(this._pitch + this._parallax[1], 0.10, 1.35); this._setParallax(0, 0, true);
        this._pointers.set(event.pointerId, [event.clientX, event.clientY]);
        this._unfoldDrag = !!event.shiftKey && this._isUnfoldable();
        try { canvas.setPointerCapture(event.pointerId); } catch (_) { /* detached canvas */ }
        this._pinch = 0; this._interaction('orbit-start');
      });
      this._listen(canvas, 'pointermove', event => {
        if (!this._canDraw()) return;
        if (!this._pointers.has(event.pointerId)) { this._followPointer(event); return; }
        const before = this._pointers.get(event.pointerId); this._pointers.set(event.pointerId, [event.clientX, event.clientY]);
        if (this._pointers.size === 1) {
          const rect = canvas.getBoundingClientRect();
          if (this._unfoldDrag) this.setUnfold(this._unfoldProgress + (event.clientX - before[0]) / Math.max(rect.width, 1) * 1.8);
          else {
            this._yaw -= (event.clientX - before[0]) / Math.max(rect.width, 1) * TAU;
            this._pitch = clamp(this._pitch + (event.clientY - before[1]) / Math.max(rect.height, 1) * Math.PI, 0.10, 1.35);
          }
        } else {
          const [a, b] = Array.from(this._pointers.values()), distance = Math.hypot(a[0] - b[0], a[1] - b[1]);
          if (this._pinch) this._zoom = clamp(this._zoom * distance / this._pinch, 0.55, 2.1); this._pinch = distance;
        }
        this._interaction('orbit');
      });
      this._listen(canvas, 'pointerleave', () => { this._setParallax(0, 0); this._request(); });
      const release = event => { if (!this._pointers.delete(event.pointerId)) return; this._pinch = 0; this._unfoldDrag = false; if (this._canDraw()) this._interaction('orbit-end'); };
      this._listen(canvas, 'pointerup', release); this._listen(canvas, 'pointercancel', release); this._listen(canvas, 'lostpointercapture', release);
      this._listen(canvas, 'wheel', event => { if (!this._canDraw()) return; event.preventDefault(); const scale = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 400 : 1; this.zoomBy(Math.exp(-event.deltaY * scale * 0.0012)); this._interaction('zoom'); }, { passive: false });
      this._listen(canvas, 'keydown', event => {
        if (!this._canDraw()) return;
        const keys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '+', '=', '-', '_', 'Home', '0']; if (!keys.includes(event.key)) return;
        event.preventDefault();
        if (event.shiftKey && this._isUnfoldable() && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) this.setUnfold(this._unfoldProgress + (event.key === 'ArrowRight' ? 0.05 : -0.05));
        else if (event.key === 'ArrowLeft') this._yaw -= 7 * RAD; else if (event.key === 'ArrowRight') this._yaw += 7 * RAD;
        else if (event.key === 'ArrowUp') this._pitch = clamp(this._pitch + 0.08, 0.10, 1.35); else if (event.key === 'ArrowDown') this._pitch = clamp(this._pitch - 0.08, 0.10, 1.35);
        else if (event.key === '+' || event.key === '=') this.zoomBy(1.1); else if (event.key === '-' || event.key === '_') this.zoomBy(1 / 1.1); else this.reset();
        this._interaction('keyboard');
      });
      this._listen(document, 'visibilitychange', () => { if (document.hidden) this._stop(); else this._request(); });
      this._listen(canvas, 'webglcontextlost', event => { event.preventDefault(); this._lost = true; this._stop(); this._reportUnavailable('The graphics context paused. The landmark list remains available.', 'context-lost'); });
      this._listen(canvas, 'webglcontextrestored', () => { if (this._destroyed) return; try { this._resources = []; this._setup(); this._lost = false; this._makeScene(); this._request(); } catch (_) { this._lost = true; this._stop(); this._reportUnavailable('The 3D view could not restart. Use the landmark list.', 'context-unavailable'); } });
      if (typeof ResizeObserver !== 'undefined') { this._resizeObserver = new ResizeObserver(() => this._request()); this._resizeObserver.observe(canvas); }
      else this._listen(window, 'resize', () => this._request());
      if (typeof IntersectionObserver !== 'undefined') {
        this._intersectionObserver = new IntersectionObserver(entries => { this._visible = entries[0].isIntersecting; if (this._visible) this._request(); else this._stop(); }, { threshold: 0 }); this._intersectionObserver.observe(canvas);
      }
    }
    setShape(key) {
      if (this._destroyed || !sceneKeys.includes(key)) return;
      this._cancelOpening(false); this._cancelUnfold(); this._shape = key; this._distance = 0;
      this._currentFold = this._fold; this._unfoldProgress = this._isFoldable() ? 1 - this._fold : 0;
      this._phase = 0; this._voyageTime = 0; this._voyageFrame = -1; this._unfoldTime = 0;
      if (this._unfoldPreview && this._isUnfoldable() && this._motionEnabled()) { this._unfoldProgress = 0; this._syncUnfoldFold(); }
      this._makeScene(); this._request();
    }
    setSelected(index) { if (this._destroyed || !Number.isInteger(index) || index < 0 || index > 8) return; this._selected = index; this._selection(); this._request(); }
    setFold(value) {
      if (this._destroyed || !Number.isFinite(Number(value))) return;
      this._cancelOpening(false); this._cancelUnfold(); this._fold = clamp(Number(value), 0, 1); this._currentFold = this._fold;
      if (this._isFoldable()) { this._unfoldPreview = false; this._unfoldProgress = 1 - this._fold; }
      this._phase = 0; this._pausedUntil = performance.now() + 2500;
      if (this._isFoldable() || this._isVoyage()) this._makeScene(); this._request();
    }
    setUnfold(value) {
      if (this._destroyed || !this._isUnfoldable() || !Number.isFinite(Number(value))) return false;
      this._cancelOpening(false); this._cancelUnfold(); this._unfoldPreview = false;
      this._unfoldProgress = clamp(Number(value), 0, 1); this._syncUnfoldFold();
      this._pausedUntil = performance.now() + 3500; this._makeScene(); this._request(); return true;
    }
    setUnfoldPreview(value) {
      if (this._destroyed) return;
      this._cancelUnfold(); this._unfoldPreview = !!value; this._unfoldTime = 0;
      if (value && this._isUnfoldable() && this._motionEnabled()) {
        this._cancelOpening(false); this._unfoldProgress = 0; this._syncUnfoldFold(); this._pausedUntil = 0; this._makeScene();
      }
      this._lastTime = 0; this._request();
    }
    playUnfold(direction = 1) {
      if (this._destroyed || !this._isUnfoldable()) return false;
      const to = direction < 0 ? 0 : 1;
      if (!this._motionEnabled()) { this.setUnfold(to); return false; }
      this._cancelOpening(false); this._cancelUnfold(); this._unfoldPreview = false;
      // Replaying at an endpoint starts at the opposite endpoint. Between them,
      // reversing uses the displayed shape and never jumps to another frame.
      if (Math.abs(this._unfoldProgress - to) < 0.00001) this._unfoldProgress = 1 - to;
      this._syncUnfoldFold();
      this._unfoldAnimation = { from: this._unfoldProgress, to, elapsed: 0, duration: Math.max(1.2, Math.abs(to - this._unfoldProgress) * 4.5) };
      this._unfoldFrame = -1; this._pausedUntil = 0; this._lastTime = 0;
      this._makeScene(); this._request(); return true;
    }
    playOpening() {
      if (this._destroyed) return false;
      if (this._isUnfoldable()) {
        this._unfoldPreview = false;
        if (this._reduced && !this._motionOverride || !this._motionEnabled()) { this.setUnfold(1); return false; }
        this._unfoldProgress = 0; this._syncUnfoldFold(); return this.playUnfold(1);
      }
      if (this._reduced && !this._motionOverride || !this._motionEnabled() || !this._isVoyage()) return false;
      this._cancelOpening(false); this._opening = { elapsed: 0, duration: 1.75 };
      this._openingFrame = -1; this._pausedUntil = 0; this._lastTime = 0;
      this._makeScene(); this._request(); return true;
    }
    setMotion(value) {
      if (this._destroyed) return;
      if (!value) { this._fold = this._currentFold; this._phase = 0; }
      // Reduced motion selects the initial state. An explicit Play action is a
      // deliberate override; visibility and activity guards continue to apply.
      this._motion = !!value; this._motionOverride = !!value;
      if (value) this._pausedUntil = 0;
      this._lastTime = 0; this._request();
    }
    setActive(value) { if (this._destroyed) return; this._active = !!value; if (this._active) this._request(); else this._stop(); }
    setYaw(degrees) { if (this._destroyed || !Number.isFinite(Number(degrees))) return; this._cancelOpening(); this._yaw = Number(degrees) * RAD; this._pausedUntil = performance.now() + 2500; this._request(); }
    zoomBy(factor) { if (this._destroyed || !Number.isFinite(Number(factor)) || Number(factor) <= 0) return; this._cancelOpening(); this._zoom = clamp(this._zoom * Number(factor), 0.55, 2.1); this._request(); }
    reset() { if (this._destroyed) return; this._cancelOpening(false); this._cancelUnfold(); this._yaw = 0.44; this._pitch = 0.60; this._zoom = 1; this._distance = 0; this._fold = 0.62; this._currentFold = this._fold; this._unfoldProgress = this._isFoldable() ? 0.38 : 0; this._unfoldTime = 0; this._phase = 0; this._voyageTime = 0; this._voyageFrame = -1; this._setParallax(0, 0, true); this._pausedUntil = performance.now() + 2000; this._makeScene(); this._request(); }
    destroy() {
      if (this._destroyed) return; this._destroyed = true; this._stop();
      (this._listeners || []).forEach(remove => remove()); if (this._resizeObserver) this._resizeObserver.disconnect(); if (this._intersectionObserver) this._intersectionObserver.disconnect();
      (this._resources || []).forEach(([kind, resource]) => { if (resource) this.gl['delete' + kind](resource); }); this._resources = [];
      this.canvas.style.touchAction = this._touchAction;
      if (this._tabIndex === null) this.canvas.removeAttribute('tabindex'); else if (this._tabIndex !== undefined) this.canvas.setAttribute('tabindex', this._tabIndex);
      this._pointers.clear();
    }
  }
  window.PaperMapEngine = PaperMapEngine;
})();
