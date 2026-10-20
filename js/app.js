(function () {
  'use strict';
  const { EX, days } = window.PLAN;
  const $ = (s, r = document) => r.querySelector(s);
  const el = (tag, attrs, html) => {
    const e = document.createElement(tag);
    if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (html != null) e.innerHTML = html;
    return e;
  };
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (_) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (_) { /* sin almacenamiento */ } }
  };

  let done = store.get('rutina.done', {});
  let paused = store.get('rutina.paused', null);
  if (paused === null) paused = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- figuras (un solo bucle, solo las visibles) ---------- */
  const figs = new Set();
  const io = 'IntersectionObserver' in window ? new IntersectionObserver(es => {
    es.forEach(e => { e.target._fig.visible = e.isIntersecting; });
  }, { rootMargin: '80px' }) : null;

  function mountFigure(host, key, label) {
    const fg = Figures.create(host, key, label);
    const rec = { fg, visible: !io, t: 0 };
    host._fig = rec; figs.add(rec);
    if (io) io.observe(host);
    return rec;
  }
  let last = 0;
  function loop(now) {
    const dt = Math.min(now - last, 100); last = now;
    if (!paused) figs.forEach(r => { if (r.visible) { r.t += dt; r.fg.render(r.t); } });
    requestAnimationFrame(loop);
  }

  /* ---------- tarjetas ---------- */
  function exerciseCard(item, idx, dayId) {
    const meta = EX[item.ex];
    const key = dayId + ':' + item.ex;
    const card = el('article', { class: 'card' + (done[key] ? ' done' : '') });
    const stage = el('div', { class: 'stage' });
    stage.appendChild(el('span', { class: 'num' }, String(idx)));
    card.appendChild(stage);
    const rec = mountFigure(stage, meta.anim, meta.name);
    if (rec.fg.variants) {
      const vs = el('div', { class: 'variants', role: 'group', 'aria-label': 'Variante del ejercicio' });
      rec.fg.variants.forEach((v, i) => {
        const b = el('button', { type: 'button', 'aria-pressed': String(i === 0) }, v.label);
        b.addEventListener('click', () => {
          vs.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', 'false'));
          b.setAttribute('aria-pressed', 'true');
          rec.fg.setVariant(i); rec.t = 0;
        });
        vs.appendChild(b);
      });
      stage.appendChild(vs);
    }
    const body = el('div', { class: 'cbody' });
    body.appendChild(el('h4', null, meta.name));
    body.appendChild(el('p', { class: 'muscle' }, meta.muscles));
    const chips = el('div', { class: 'chips' });
    chips.appendChild(el('span', { class: 'chip' }, `<b>${item.sets}</b> series`));
    chips.appendChild(el('span', { class: 'chip' }, `<b>${item.reps}</b>${/seg|\(/.test(item.reps) ? '' : ' reps'}`));
    const rb = el('button', { type: 'button', class: 'chip rest', title: 'Iniciar cuenta regresiva de descanso' }, `⏱ Descanso ${item.rest} seg`);
    rb.addEventListener('click', () => startTimer(item.rest, meta.name));
    chips.appendChild(rb);
    body.appendChild(chips);
    body.appendChild(el('div', { class: 'station' }, 'Estación: ' + meta.station));
    body.appendChild(el('ul', { class: 'cues' }, meta.cues.map(c => `<li>${c}</li>`).join('')));
    const lab = el('label', { class: 'check' });
    const cb = el('input', { type: 'checkbox' });
    cb.checked = !!done[key];
    cb.addEventListener('change', () => {
      if (cb.checked) done[key] = 1; else delete done[key];
      store.set('rutina.done', done);
      card.classList.toggle('done', cb.checked);
      updateProgress(dayId); updateDots();
    });
    lab.appendChild(cb); lab.appendChild(el('span', null, 'Serie(s) completadas'));
    body.appendChild(lab);
    card.appendChild(body);
    return card;
  }

  function cardioCard(c) {
    const card = el('article', { class: 'card cardio' });
    const grid = el('div', { class: 'cardio-grid' });
    const stage = el('div', { class: 'stage' });
    grid.appendChild(stage);
    mountFigure(stage, c.anim, c.name);
    const body = el('div', { class: 'cbody' });
    body.appendChild(el('h4', null, c.name));
    body.appendChild(el('div', { class: 'statrow' }, c.stats.map(s => `<div class="stat"><span>${s[0]}</span><b>${s[1]}</b></div>`).join('')));
    body.appendChild(el('p', { style: 'margin:0' }, c.note));
    grid.appendChild(body);
    card.appendChild(grid);
    return card;
  }

  function restInfo() {
    const wrap = el('div', { class: 'cols', style: 'margin-top:22px' });
    wrap.innerHTML = `
      <div class="info"><h3>Descanso completo</h3><ul>
        <li>Permite la supercompensación muscular y la recuperación del sistema nervioso central.</li>
        <li>Mantén la hidratación y el plan de alimentación en déficit calórico.</li></ul></div>
      <div class="info"><h3>Recordatorios del día</h3><ul>
        <li><b>Proteína:</b> ≈ 130 – 162 g al día (1.6 – 2.0 g por kg con 81 kg).</li>
        <li><b>Agua:</b> 2.5 – 3.5 litros.</li>
        <li><b>Sueño:</b> 7 – 8 horas.</li></ul></div>`;
    return wrap;
  }

  function guide() {
    const w = el('div');
    w.innerHTML = `
    <div class="dayhead"><div><h2>Guía y claves</h2><p>Perfil, mitos y hábitos que sostienen el plan.</p></div></div>
    <div class="cols">
      <section class="info"><h3>Perfil del atleta</h3><ul>
        <li><b>Nombre:</b> Mariano</li><li><b>Edad:</b> 29 años</li><li><b>Peso:</b> 81 kg · <b>Estatura:</b> 173 cm</li>
        <li><b>Objetivo:</b> pérdida de grasa abdominal manteniendo y tonificando la masa muscular.</li>
        <li><b>Equipo:</b> caminadora de hogar y multifuncional Marcy MWM-4965SC.</li></ul></section>
      <section class="info"><h3>Reducción localizada: un mito</h3>
        <p style="margin:0">No es posible reducir grasa de forma localizada solo con abdominales. Los ejercicios de abdomen fortalecen y dan firmeza a la pared abdominal, pero la grasa disminuye con un déficit calórico sostenido y un gasto energético constante.</p></section>
      <section class="info"><h3>Valor de la caminata inclinada</h3><ul>
        <li><b>Preserva músculo:</b> bajo impacto y menor riesgo de usar aminoácidos musculares como combustible.</li>
        <li><b>Oxida grasa:</b> la frecuencia cardíaca moderada (Zona 2) optimiza el uso de ácidos grasos.</li>
        <li><b>Menos fatiga central:</b> te deja rendir fuerte en la multifuncional.</li></ul></section>
      <section class="info"><h3>Hábitos fundamentales</h3><ul>
        <li><b>Nutrición:</b> 1.6 – 2.0 g de proteína por kg (≈ 130 – 162 g) con déficit calórico.</li>
        <li><b>Hidratación:</b> 2.5 – 3.5 litros de agua al día.</li>
        <li><b>Sueño:</b> 7 – 8 horas; dormir poco eleva el cortisol, favorece la retención de líquidos y frena la pérdida de grasa abdominal.</li></ul></section>
    </div>
    <section class="info" style="margin-top:16px"><h3>Remo sentado en polea baja: guía de agarres</h3>
      <div class="tablewrap"><table>
        <thead><tr><th>Agarre</th><th>Énfasis muscular</th><th>Mecánica y beneficio</th></tr></thead>
        <tbody>
          <tr><td><b>Doble D</b> (neutro y estrecho)</td><td>Dorsal ancho (zona media y baja)</td><td>Codos pegados al torso: más rango de movimiento y enfoque en el grosor de la espalda. Muy seguro para muñecas y hombros.</td></tr>
          <tr><td><b>Barra corta</b> (prono o supino)</td><td>Prono: trapecio, romboides y deltoides posterior.<br>Supino: más bíceps y dorsal inferior.</td><td>Prono abierto: codos ligeramente hacia afuera para enfatizar la espalda alta y mejorar la postura.</td></tr>
        </tbody></table></div></section>`;
    return w;
  }

  /* ---------- progreso ---------- */
  const dayKeys = d => d.blocks.flatMap(b => (b.items || []).map(i => d.id + ':' + i.ex));
  function updateProgress(id) {
    const d = days.find(x => x.id === id); if (!d) return;
    const keys = dayKeys(d), n = keys.filter(k => done[k]).length;
    const p = $('#prog'); if (!p || !keys.length) return;
    $('.bar i', p).style.width = (100 * n / keys.length) + '%';
    $('.n', p).textContent = `${n} de ${keys.length} ejercicios`;
  }
  function updateDots() {
    days.forEach((d, i) => {
      const keys = dayKeys(d), tab = $('#tab-' + d.id);
      const full = keys.length && keys.every(k => done[k]);
      const dot = tab && tab.querySelector('.dot');
      if (dot) dot.hidden = !full;
    });
  }

  /* ---------- vistas ---------- */
  const main = $('#main'), tabsEl = $('#tabs');
  const views = days.map(d => ({ id: d.id, label: d.tab, sub: d.tabSub })).concat([{ id: 'guia', label: 'Guía', sub: 'Claves' }]);

  function show(id) {
    figs.forEach(r => { if (io) io.unobserve(r.fg.svg.parentNode); });
    figs.clear();
    main.innerHTML = '';
    tabsEl.querySelectorAll('.tab').forEach(t => t.setAttribute('aria-selected', String(t.dataset.id === id)));
    store.set('rutina.tab', id);
    if (id === 'guia') { main.appendChild(guide()); return; }
    const d = days.find(x => x.id === id);
    const head = el('div', { class: 'dayhead' });
    head.appendChild(el('div', null, `<h2>${d.title}</h2><p>${d.sub}</p>`));
    const keys = dayKeys(d);
    if (keys.length) {
      const p = el('div', { class: 'progress', id: 'prog' }, '<div class="lbl"><span class="n"></span><button type="button" class="linkbtn">Reiniciar</button></div><div class="bar"><i></i></div>');
      $('.linkbtn', p).addEventListener('click', () => { keys.forEach(k => delete done[k]); store.set('rutina.done', done); show(id); updateDots(); });
      head.appendChild(p);
    }
    main.appendChild(head);
    let n = 0;
    d.blocks.forEach(b => {
      const sec = el('section', { class: 'block' }, `<h3>${b.title}</h3><p class="sub">${b.sub || ''}</p>`);
      if (b.cardio) sec.appendChild(cardioCard(b.cardio));
      else {
        const g = el('div', { class: 'grid' });
        b.items.forEach(it => g.appendChild(exerciseCard(it, ++n, d.id)));
        sec.appendChild(g);
      }
      main.appendChild(sec);
    });
    if (d.rest) main.appendChild(restInfo());
    updateProgress(id);
    window.scrollTo({ top: 0 });
  }

  views.forEach(v => {
    const b = el('button', { class: 'tab', role: 'tab', id: 'tab-' + v.id, type: 'button' }, `${v.label}<span class="dot" hidden></span><small>${v.sub}</small>`);
    b.dataset.id = v.id;
    b.addEventListener('click', () => { show(v.id); b.scrollIntoView({ inline: 'center', block: 'nearest' }); });
    tabsEl.appendChild(b);
  });

  /* ---------- controles ---------- */
  const animBtn = $('#anim');
  function applyPause() {
    document.body.classList.toggle('paused', paused);
    animBtn.textContent = paused ? '▶ Animar' : '⏸ Pausar';
    animBtn.setAttribute('aria-pressed', String(paused));
    store.set('rutina.paused', paused);
  }
  animBtn.addEventListener('click', () => {
    paused = !paused;
    applyPause();
  });

  const themeBtn = $('#theme');
  const savedTheme = store.get('rutina.theme', null);
  if (savedTheme) document.documentElement.dataset.theme = savedTheme;
  themeBtn.addEventListener('click', () => {
    const cur = document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next; store.set('rutina.theme', next);
  });

  /* ---------- temporizador de descanso ---------- */
  const timer = $('#timer'), tval = $('#tval'), tlbl = $('#tlbl');
  let tint = null, tend = 0, actx = null;
  const fmt = s => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  function beep() {
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      [0, .25, .5].forEach(t => {
        const o = actx.createOscillator(), g = actx.createGain();
        o.frequency.value = 880; o.connect(g); g.connect(actx.destination);
        g.gain.setValueAtTime(.15, actx.currentTime + t); g.gain.exponentialRampToValueAtTime(.001, actx.currentTime + t + .18);
        o.start(actx.currentTime + t); o.stop(actx.currentTime + t + .2);
      });
    } catch (_) { /* sin audio */ }
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
  }
  function stopTimer() { clearInterval(tint); tint = null; timer.classList.remove('on', 'end'); }
  function startTimer(sec, name) {
    clearInterval(tint);
    try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === 'suspended') actx.resume(); } catch (_) { }
    tend = Date.now() + sec * 1000;
    timer.classList.remove('end'); timer.classList.add('on');
    tlbl.textContent = 'Descanso · ' + name;
    const tick = () => {
      const left = Math.max(0, Math.ceil((tend - Date.now()) / 1000));
      tval.textContent = fmt(left);
      if (left === 0) { clearInterval(tint); tint = null; timer.classList.add('end'); tlbl.textContent = '¡A la siguiente serie!'; beep(); setTimeout(() => { if (!tint) stopTimer(); }, 6000); }
    };
    tick(); tint = setInterval(tick, 250);
  }
  $('#tstop').addEventListener('click', stopTimer);

  /* ---------- arranque ---------- */
  applyPause();
  const saved = store.get('rutina.tab', 'd1');
  show(views.some(v => v.id === saved) ? saved : 'd1');
  updateDots();
  requestAnimationFrame(loop);
})();
