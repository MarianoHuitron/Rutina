/* Motor de figuras animadas: esqueleto 2D por cinemática directa + catálogo de ejercicios.
   Ángulos absolutos en grados: 0 = abajo, 90 = adelante (derecha), 180 = arriba, -90 = atrás. */
(function () {
  'use strict';
  const R = Math.PI / 180, G = 232;
  const L = { torso: 58, upper: 30, fore: 28, thigh: 40, shin: 38, foot: 13, neck: 19 };
  const dir = (a, l) => [Math.sin(a * R) * l, Math.cos(a * R) * l];
  const add = (a, b) => [a[0] + b[0], a[1] + b[1]];

  const BASE = {
    hip: [190, 154], torso: 180, neck: 0, sx: 0, hx: 0, shr: 0, tk: 1, rel: 0, w: 0,
    aA: [0, 0, 1, 1], aB: null, lA: [0, 0, 90, 1], lB: null
  };
  const pad4 = a => { a = a.slice(); while (a.length < 4) a.push(1); return a; };
  function norm(base, p) {
    const o = Object.assign({}, BASE, base, p);
    o.aA = pad4(o.aA); o.aB = pad4(o.aB || o.aA); o.lA = pad4(o.lA); o.lB = pad4(o.lB || o.lA);
    return o;
  }
  function mix(a, b, t) {
    const r = {};
    for (const k in a) {
      const x = a[k], y = b[k];
      r[k] = Array.isArray(x) ? x.map((v, i) => v + (y[i] - v) * t) : (typeof x === 'number' ? x + (y - x) * t : x);
    }
    return r;
  }
  function solve(p) {
    const t = p.torso, hip = p.hip, rel = p.rel ? t - 180 : 0;
    const sh = add(hip, dir(t, L.torso * p.tk));
    const perp = [Math.cos(t * R), -Math.sin(t * R)];
    const head = add(sh, dir(t + p.neck, L.neck));
    const side = (s, arm, leg) => {
      const S = [sh[0] + perp[0] * p.sx * s, sh[1] + perp[1] * p.sx * s - p.shr];
      const el = add(S, dir(rel + arm[0], L.upper * arm[2]));
      const wr = add(el, dir(rel + arm[1], L.fore * arm[3]));
      const H = [hip[0] + perp[0] * p.hx * s, hip[1] + perp[1] * p.hx * s];
      const kn = add(H, dir(leg[0], L.thigh * leg[3]));
      const an = add(kn, dir(leg[1], L.shin));
      const to = add(an, dir(leg[2], L.foot));
      return { S, el, wr, H, kn, an, to };
    };
    return { hip, sh, head, A: side(1, p.aA, p.lA), B: side(-1, p.aB, p.lB), w: p.w, sx: p.sx, hx: p.hx };
  }

  /* ---------- helpers de dibujo ---------- */
  const n1 = v => Math.round(v * 10) / 10;
  const ln = (a, b, c = 'm', w) => `<line class="${c}" x1="${n1(a[0])}" y1="${n1(a[1])}" x2="${n1(b[0])}" y2="${n1(b[1])}"${w ? ` stroke-width="${w}"` : ''}/>`;
  const rc = (x, y, w, h, c = 'mf', r = 4) => `<rect class="${c}" x="${n1(x)}" y="${n1(y)}" width="${w}" height="${h}" rx="${r}"/>`;
  const ci = (p, r, c) => `<circle class="${c}" cx="${n1(p[0])}" cy="${n1(p[1])}" r="${r}"/>`;
  const cable = (a, b) => ln(a, b, 'cb');
  const pulley = p => ci(p, 6, 'pl');
  const handle = p => ci(p, 5, 'h');
  const stack = (x, y, lift) => {
    let s = ln([x + 16, y - 4], [x + 16, y + 76], 'm', 3);
    for (let i = 0; i < 9; i++) s += rc(x, y + i * 8 - (i <= 3 ? lift * 16 : 0), 32, 7, i <= 3 ? 'plate on' : 'plate', 2);
    return s;
  };
  // pila a la izquierda con cable que sube a la polea alta px
  const highRigL = (px, w) => stack(30, 46, w) + ln([46, 42 - 16 * w], [46, 26], 'cb') + ln([46, 26], [px, 26], 'cb') + ln([30, 22], [px + 20, 22], 'm', 4) + pulley([px, 26]);
  // pila a la derecha con cable a polea alta px
  const highRigR = (px, w) => stack(340, 46, w) + ln([356, 42 - 16 * w], [356, 26], 'cb') + ln([356, 26], [px, 26], 'cb') + ln([px - 20, 22], [370, 22], 'm', 4) + pulley([px, 26]);
  // pila a la derecha con cable que baja a polea baja pl
  const lowRigR = (pl, w) => stack(340, 80, w) + ln([356, 76 - 16 * w], [356, 20], 'cb') + ln([356, 20], [366, 20], 'cb') + ln([356, 20], [356, 150], 'cb') + ln([356, 224], [pl[0], 224], 'm', 3) + pulley(pl);
  const lowRigL = (pl, w) => stack(30, 80, w) + ln([46, 224], [pl[0], 224], 'm', 3) + pulley(pl);
  const floorSeat = hip => rc(hip[0] - 26, hip[1] + 8, 58, 9, 'mf', 4) + ln([hip[0] + 4, hip[1] + 17], [hip[0] + 4, G], 'm', 6) + ln([hip[0] - 22, G], [hip[0] + 30, G], 'm', 5);
  const backPad = (hip, t, len = 76) => {
    const off = dir(t + 90, 13);
    return ln(add(add(hip, off), dir(t, -6)), add(add(hip, off), dir(t, len)), 'padl');
  };

  /* ---------- catálogo ---------- */
  const SEATED = { hip: [150, 194], torso: 183, lA: [92, 3, 90] };
  const STAND = { hip: [190, 154], torso: 180, lA: [0, 0, 90] };
  const FSEAT = { hip: [200, 184], torso: 180, sx: 22, hx: 15, lA: [-6, 0, -90, 0.25], lB: [6, 0, 90, 0.25] };
  const FSTAND = { hip: [200, 154], torso: 180, sx: 22, hx: 11, lA: [0, 0, -90], lB: [0, 0, 90] };

  const pulldown = (sup) => ({
    base: Object.assign({}, SEATED, { torso: 190, lA: [88, 5, 90] }),
    poses: [
      { aA: [170, 175], w: 0 },
      { aA: sup ? [2, 150] : [-5, 160], w: 1 }
    ],
    bg: () => floorSeat([150, 194]) + backPad([150, 194], 190, 70),
    fg: (j) => [
      '',
      highRigL(165, j.w) + cable([165, 26], j.A.wr) + ci([180, 186], 8, 'pd') + handle(j.A.wr)
    ]
  });

  const walkPoses = (t) => {
    const a = { hip: [190, 156], torso: t, lA: [26, 10, 70], lB: [-24, -50, 55], aA: [-28, 20], aB: [30, 75] };
    const b = { hip: [190, 152], torso: t, lA: [2, -2, 90], lB: [18, -48, 90], aA: [-4, 30], aB: [6, 50] };
    const c = { hip: [190, 156], torso: t, lA: a.lB, lB: a.lA, aA: a.aB, aB: a.aA };
    const d = { hip: [190, 152], torso: t, lA: b.lB, lB: b.lA, aA: b.aB, aB: b.aA };
    return [a, b, c, d];
  };

  const DEFS = {
    press: {
      base: Object.assign({}, SEATED, { aA: [-70, 85] }),
      poses: [{ aA: [-70, 85], w: 0 }, { aA: [88, 92], w: 1 }],
      bg: () => floorSeat([150, 194]) + backPad([150, 194], 183, 84) + ln([128, 40], [128, G], 'm', 6),
      fg: (j) => [ln([128, 118], j.A.wr, 'm', 4), stack(30, 70, j.w) + handle(j.A.wr)]
    },
    fly: {
      base: Object.assign({}, FSEAT),
      poses: [{ aA: [-90, 180, 1, 1], aB: [90, 180, 1, 1] }, { aA: [-90, 180, 0.15, 1], aB: [90, 180, 0.15, 1] }],
      bg: () => rc(176, 100, 48, 84, 'pd', 10) + rc(170, 190, 60, 9, 'mf', 4) + ln([200, 199], [200, G], 'm', 6) + ln([172, G], [228, G], 'm', 5) + ln([200, 40], [200, 100], 'm', 6),
      fg: (j) => ['', ln(j.A.el, j.A.wr, 'padl') + ln(j.B.el, j.B.wr, 'padl')]
    },
    pulldown: pulldown(false),
    pulldownSup: pulldown(true),
    row: {
      base: { hip: [120, 212], torso: 168, lA: [100, 82, 150] },
      poses: [
        { torso: 168, aA: [84, 82], w: 0 },
        { torso: 184, aA: [-30, 92], w: 1 }
      ],
      bg: () => rc(94, 220, 56, 9, 'mf', 4) + ln([122, 229], [122, G], 'm', 6) + rc(204, 190, 8, 42, 'mf', 3) + ln([90, G], [330, G], 'm', 5),
      fg: (j) => ['', lowRigR([320, 205], j.w) + cable(j.A.wr, [320, 205]) + handle(j.A.wr)]
    },
    rowProne: {
      base: { hip: [120, 212], torso: 168, lA: [100, 82, 150] },
      poses: [
        { torso: 168, aA: [84, 82], w: 0 },
        { torso: 184, aA: [-80, 60], w: 1 }
      ],
      bg: () => rc(94, 220, 56, 9, 'mf', 4) + ln([122, 229], [122, G], 'm', 6) + rc(204, 190, 8, 42, 'mf', 3) + ln([90, G], [330, G], 'm', 5),
      fg: (j) => ['', lowRigR([320, 205], j.w) + cable(j.A.wr, [320, 205]) + ln(add(j.A.wr, [0, -9]), add(j.A.wr, [0, 9]), 'h', 5) ]
    },
    pushdown: {
      base: { hip: [190, 154], torso: 178, lA: [0, 0, 90] },
      poses: [{ aA: [6, 105], w: 0 }, { aA: [6, 8], w: 1 }],
      bg: () => '',
      fg: (j) => ['', highRigR(225, j.w) + cable([225, 26], j.A.wr) + handle(j.A.wr)]
    },
    curl: {
      base: { hip: [160, 154], torso: 180, lA: [0, 0, 90] },
      poses: [{ aA: [4, 8], w: 0 }, { aA: [4, 150], w: 1 }],
      bg: () => '',
      fg: (j) => ['', lowRigR([285, 222], j.w) + cable([285, 222], j.A.wr) + handle(j.A.wr)]
    },
    legext: {
      base: Object.assign({}, SEATED, { aA: [10, 60] }),
      poses: [{ lA: [92, 5, 95], w: 0 }, { lA: [92, 85, 150], w: 1 }],
      bg: () => floorSeat([150, 194]) + backPad([150, 194], 183, 84),
      fg: (j) => [ln([186, 206], j.A.an, 'm', 4), stack(30, 70, j.w) + ci(add(j.A.an, [-2, -4]), 8, 'pd')]
    },
    legcurlSeat: {
      base: Object.assign({}, SEATED, { aA: [10, 60] }),
      poses: [{ lA: [88, 82, 150], w: 0 }, { lA: [88, -12, 90], w: 1 }],
      bg: () => floorSeat([150, 194]) + backPad([150, 194], 183, 84),
      fg: (j) => [ln([168, 182], j.A.an, 'm', 4), stack(30, 70, j.w) + ci(add(j.A.an, [-2, -7]), 8, 'pd') + ci([176, 182], 8, 'pd')]
    },
    legcurlStand: {
      base: { hip: [190, 154], torso: 175, aA: [95, 100], lB: [0, 0, 90] },
      poses: [{ lA: [-2, 0, 90], w: 0 }, { lA: [-6, -110, -20], w: 1 }],
      bg: () => ln([253, 60], [253, G], 'm', 6),
      fg: (j) => ['', lowRigR([320, 224], j.w) + cable([320, 224], j.A.an) + ci(j.A.an, 4, 'h')]
    },
    legpress: {
      base: { hip: [100, 196], torso: 222, aA: [100, 100] },
      poses: [{ lA: [125, 55, 150], w: 0 }, { lA: [108, 100, 150], w: 1 }],
      bg: () => rc(40, 205, 150, 9, 'mf', 4) + ln([60, 214], [60, G], 'm', 6) + ln([170, 214], [170, G], 'm', 6) + ln([150, 212], [240, 150], 'm', 5) + ln([40, 205], [120, 205], 'm', 3) + backPad([100, 196], 222, 70),
      fg: (j) => {
        const c = add(j.A.an, [10, -2]), d = [0.85 * 26, 0.52 * 26];
        return [ '', ln([c[0] - d[0], c[1] - d[1]], [c[0] + d[0], c[1] + d[1]], 'padl') + stack(330, 70, j.w) + ln([346, 66 - 16 * j.w], [346, 40], 'cb') ];
      }
    },
    squat: {
      base: { hip: [183, 151], torso: 180, aA: [85, 90], lA: [0, 0, 90] },
      poses: [{ hip: [183, 151], torso: 180, lA: [0, 0, 90], w: 0 }, { hip: [150, 185], torso: 150, lA: [80, -10, 90], w: 1 }],
      bg: () => ln([300, 40], [300, G], 'm', 6),
      fg: (j) => ['', cable([300, 60], j.A.wr) + pulley([300, 60]) + handle(j.A.wr)]
    },
    glute: {
      base: { hip: [150, 154], torso: 155, aA: [100, 105], lB: [0, 0, 90] },
      poses: [{ lA: [12, 6, 70], w: 0 }, { lA: [-32, -32, 60], w: 1 }],
      bg: () => ln([232, 60], [232, G], 'm', 6) + ln([218, 60], [246, 60], 'm', 5),
      fg: (j) => ['', lowRigR([300, 224], j.w) + cable([300, 224], j.A.an) + ci(j.A.an, 4, 'h')]
    },
    roman: {
      base: { hip: [150, 140], torso: 180, aA: [0, 90] },
      poses: [{ lA: [3, 0, 100] }, { lA: [90, 72, 160] }],
      bg: () => rc(137, 70, 9, 100, 'pd', 4) + ln([136, 170], [136, G], 'm', 6) + ln([205, 118], [205, G], 'm', 6) + rc(140, 114, 66, 8, 'mf', 4) + ln([120, G], [225, G], 'm', 5),
      fg: () => ['', '']
    },
    cablecrunch: {
      base: { hip: [170, 186], torso: 176, rel: 1, aA: [26, 146], lA: [0, -90, -90] },
      poses: [{ torso: 176, w: 0 }, { torso: 108, w: 1 }],
      bg: () => rc(150, 226, 60, 6, 'pd', 3),
      fg: (j) => ['', highRigR(200, j.w) + cable([200, 26], j.A.wr) + handle(j.A.wr)]
    },
    plank: {
      base: { torso: 102, aA: [0, 90], lA: [-78, -78, 5] },
      poses: [{ hip: [158, 209] }, { hip: [158, 205] }],
      pauses: [200, 200], seg: 1800,
      bg: () => rc(150, 226, 100, 5, 'pd', 3),
      fg: () => ['', '']
    },
    sideplank: {
      base: { torso: -102, sx: 9, hx: 3, aA: [0, 90, 1, 0.2], aB: [180, 180], lA: [78, 78, 20], lB: [78, 78, 20] },
      poses: [{ hip: [250, 205] }, { hip: [250, 199] }],
      pauses: [200, 200], seg: 1800,
      bg: () => rc(120, 228, 160, 4, 'pd', 2),
      fg: () => ['', '']
    },
    latraise: {
      base: Object.assign({}, FSTAND, { aA: [-4, -4] }),
      poses: [{ aB: [8, 8], w: 0 }, { aB: [88, 80], w: 1 }],
      bg: () => '',
      fg: (j) => ['', lowRigL([60, 224], j.w) + cable([60, 224], j.B.wr) + handle(j.B.wr)]
    },
    reardelt: {
      base: Object.assign({}, FSEAT),
      poses: [{ aA: [-90, -90, 0.2, 0.2], aB: [90, 90, 0.2, 0.2] }, { aA: [-90, -80, 1, 1], aB: [90, 80, 1, 1] }],
      bg: () => rc(176, 100, 48, 84, 'pd', 10) + rc(170, 190, 60, 9, 'mf', 4) + ln([200, 199], [200, G], 'm', 6) + ln([172, G], [228, G], 'm', 5) + rc(194, 40, 12, 60, 'mf', 4),
      fg: (j) => [ln([200, 96], j.A.wr, 'm', 4) + ln([200, 96], j.B.wr, 'm', 4), ci(j.A.wr, 6, 'h') + ci(j.B.wr, 6, 'h')]
    },
    shrug: {
      base: Object.assign({}, FSTAND, { aA: [0, 0], aB: [0, 0] }),
      poses: [{ shr: 0, w: 0 }, { shr: 12, w: 1 }],
      bg: () => '',
      fg: (j) => ['', pulley([j.A.wr[0], 226]) + pulley([j.B.wr[0], 226]) + cable([j.A.wr[0], 226], j.A.wr) + cable([j.B.wr[0], 226], j.B.wr) + handle(j.A.wr) + handle(j.B.wr)]
    },
    calf: {
      base: { hip: [190, 154], torso: 180, aA: [3, 6] },
      poses: [{ hip: [190, 154], lA: [0, 0, 90] }, { hip: [193.8, 144.8], lA: [0, 0, 45] }],
      bg: () => '',
      fg: (j, p, j0) => ['', pulley([j0.A.wr[0], 226]) + cable([j0.A.wr[0], 226], j.A.wr) + handle(j.A.wr)]
    },
    twist: {
      base: { hip: [160, 226], torso: 215, lA: [128, 55, 150], aB: null },
      poses: [
        { sx: 9, aA: [60, 80] },
        { sx: -9, aA: [30, 55] }
      ],
      bg: () => '',
      fg: (j) => {
        const c = [(j.A.wr[0] + j.B.wr[0]) / 2, (j.A.wr[1] + j.B.wr[1]) / 2];
        return ['', ci(c, 10, 'h')];
      }
    },
    legsHold: {
      base: { hip: [200, 220], torso: -90, aA: [80, 80], lB: null },
      poses: [{ lA: [172, 172, 262] }, { lA: [115, 115, 205] }],
      pauses: [300, 1200], seg: 1500,
      bg: () => '',
      fg: () => ['', '']
    },
    legsScissors: {
      base: { hip: [200, 220], torso: -90, aA: [80, 80] },
      poses: [{ lA: [108, 108, 198], lB: [128, 128, 218] }, { lA: [128, 128, 218], lB: [108, 108, 198] }],
      pauses: [0, 0], seg: 700,
      bg: () => '',
      fg: () => ['', '']
    },
    adduct: {
      base: Object.assign({}, FSTAND, { aA: [-30, -20], aB: [30, 20] }),
      poses: [{ lB: [0, 0, 90], w: 0 }, { lB: [-26, -26, 90], w: 1 }],
      bg: () => '',
      fg: (j) => ['', lowRigR([340, 224], j.w * 0) + cable([340, 224], j.B.an) + ci(j.B.an, 4, 'h')]
    },
    abduct: {
      base: Object.assign({}, FSTAND, { aA: [-30, -20], aB: [30, 20] }),
      poses: [{ lB: [0, 0, 90], w: 0 }, { lB: [30, 30, 90], w: 1 }],
      bg: () => '',
      fg: (j) => ['', lowRigL([60, 224], j.w) + cable([60, 224], j.B.an) + ci(j.B.an, 4, 'h')]
    },
    walkIncline: {
      base: {}, poses: walkPoses(172), seq: [0, 1, 2, 3], seg: 380, pauses: [0, 0, 0, 0],
      floor: false,
      bg: () => ln([70, 248], [330, 211], 'm', 8) + `<line class="belt" x1="70" y1="243" x2="330" y2="206"/>` + ln([335, 206], [335, 118], 'm', 6) + rc(314, 100, 44, 26, 'mf', 5) + ln([335, 140], [250, 150], 'm', 4),
      fg: () => ['', '']
    },
    walkFlat: {
      base: {}, poses: walkPoses(180), seq: [0, 1, 2, 3], seg: 420, pauses: [0, 0, 0, 0],
      floor: false,
      bg: () => `<g class="scroll">${[0, 1, 2, 3, 4, 5, 6].map(i => `<g transform="translate(${i * 110 - 10} 0)"><rect class="mf" x="-3" y="160" width="6" height="40" rx="2"/><circle class="tree" cx="0" cy="150" r="22"/></g>`).join('')}</g><line class="fl" x1="0" y1="232" x2="400" y2="232"/><line class="belt" x1="0" y1="238" x2="400" y2="238"/>`,
      fg: () => ['', '']
    }
  };

  // Ejercicios con varias animaciones (selector de variante)
  const VARIANTS = {
    legcurl: [{ label: 'Sentado', def: 'legcurlSeat' }, { label: 'De pie (polea)', def: 'legcurlStand' }],
    legpress: [{ label: 'Prensa', def: 'legpress' }, { label: 'Sentadilla asistida', def: 'squat' }],
    legsFloor: [{ label: 'Sostenida', def: 'legsHold' }, { label: 'Tijeras', def: 'legsScissors' }],
    addabd: [{ label: 'Abductores', def: 'abduct' }, { label: 'Aductores', def: 'adduct' }]
  };

  /* ---------- tiempo -> pose ---------- */
  const ease = t => t * t * (3 - 2 * t);
  function compile(def) {
    if (def._c) return def._c;
    const P = def.poses.map(p => norm(def.base, p));
    const seq = def.seq || P.map((_, i) => i);
    const seg = def.seg || 1500, pauses = def.pauses || [];
    const durs = seq.map((_, i) => (pauses[i] != null ? pauses[i] : 350) + seg);
    const total = durs.reduce((a, b) => a + b, 0);
    return (def._c = { P, seq, seg, pauses, durs, total });
  }
  function poseAt(def, time) {
    const c = compile(def);
    let t = time % c.total, i = 0;
    while (t >= c.durs[i]) { t -= c.durs[i]; i++; }
    const pause = c.pauses[i] != null ? c.pauses[i] : 350;
    const a = c.P[c.seq[i]], b = c.P[c.seq[(i + 1) % c.seq.length]];
    if (t < pause) return mix(a, a, 0);
    return mix(a, b, ease((t - pause) / c.seg));
  }

  /* ---------- figura ---------- */
  const NS = 'http://www.w3.org/2000/svg';
  const d = pts => 'M' + pts.map(q => n1(q[0]) + ' ' + n1(q[1])).join('L');

  function create(host, key, label) {
    let defs = VARIANTS[key] ? VARIANTS[key].map(v => DEFS[v.def]) : [DEFS[key]];
    if (!defs[0]) throw new Error('Animación desconocida: ' + key);
    let cur = defs[0];
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 400 260');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'Animación: ' + (label || key));
    svg.innerHTML =
      '<g class="g-bg"></g><path class="p far" /><path class="p far leg"/><path class="p tor"/><path class="p shl"/><path class="p shl hl"/>' +
      '<path class="p near leg"/><path class="p near"/><circle class="hd" r="10"/><g class="g-b"></g><g class="g-f"></g>';
    const q = s => svg.querySelectorAll(s);
    const gbg = svg.querySelector('.g-bg'), gb = svg.querySelector('.g-b'), gf = svg.querySelector('.g-f');
    const paths = svg.querySelectorAll('path');
    const [farArm, farLeg, tor, shl, hl, nearLeg, nearArm] = paths;
    const head = svg.querySelector('.hd');
    host.appendChild(svg);

    function setVariant(i) {
      cur = defs[i];
      const c = compile(cur);
      cur._j0 = solve(c.P[0]);
      gbg.innerHTML = (cur.floor === false ? '' : `<line class="fl" x1="10" y1="${G}" x2="390" y2="${G}"/>`) + cur.bg();
      render(0);
    }
    function render(time) { draw(poseAt(cur, time)); }
    function snap(i) { draw(compile(cur).P[i]); }
    function draw(p) {
      const j = solve(p);
      farArm.setAttribute('d', d([j.B.S, j.B.el, j.B.wr]));
      farLeg.setAttribute('d', d([j.B.H, j.B.kn, j.B.an, j.B.to]));
      tor.setAttribute('d', d([j.hip, j.sh]));
      shl.setAttribute('d', j.sx > 0 ? d([j.A.S, j.B.S]) : '');
      hl.setAttribute('d', j.hx > 0 ? d([j.A.H, j.B.H]) : '');
      nearLeg.setAttribute('d', d([j.A.H, j.A.kn, j.A.an, j.A.to]));
      nearArm.setAttribute('d', d([j.A.S, j.A.el, j.A.wr]));
      head.setAttribute('cx', n1(j.head[0])); head.setAttribute('cy', n1(j.head[1]));
      const f = cur.fg(j, p, cur._j0);
      gb.innerHTML = f[0]; gf.innerHTML = f[1];
    }
    setVariant(0);
    return { svg, setVariant, render, snap, variants: VARIANTS[key] || null };
  }

  window.Figures = { create, DEFS, VARIANTS, has: k => !!(DEFS[k] || VARIANTS[k]) };
})();
