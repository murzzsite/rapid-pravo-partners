const LEAD_ENDPOINT = 'https://lead-relay.leestygpt.workers.dev/lead/HRBWHQU48A';

(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches && !/motion=1/.test(location.search);
  const root = document.documentElement;
  if (reduce) root.classList.add('still');
  const fmt = n => Math.round(n).toLocaleString('ru-RU').replace(/ /g, ' ');
  const ease = p => 1 - Math.pow(1 - p, 3);

  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---------- меню ----------
  const burger = $('#burger'), menu = $('#menu');
  burger?.addEventListener('click', () => {
    const open = menu.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(open));
    burger.textContent = open ? 'Закрыть' : 'Меню';
  });
  $$('a', menu).forEach(a => a.addEventListener('click', () => {
    menu.classList.remove('is-open');
    burger?.setAttribute('aria-expanded', 'false');
    if (burger) burger.textContent = 'Меню';
  }));

  // плавный якорь
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (href.length <= 1) return;
    const t = $(href);
    if (!t) return;
    e.preventDefault();
    window.scrollTo({ top: Math.max(0, t.getBoundingClientRect().top + scrollY - 64), behavior: reduce ? 'auto' : 'smooth' });
  }));

  // ---------- хедер и прогресс ----------
  const header = $('#header'), bar = $('#progress');
  let lastY = 0;
  const onScroll = () => {
    const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    header.classList.toggle('scrolled', y > 10);
    header.classList.toggle('hide', y > lastY && y > 480 && !menu.classList.contains('is-open'));
    lastY = y;
    if (bar) bar.style.transform = 'scaleX(' + (max > 0 ? y / max : 0) + ')';
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---------- вход героя ----------
  $$('.hero__title .ln > span').forEach((s, i) => s.style.setProperty('--i', i));
  const dialSegs = $$('.dial__seg');
  const days = [1, 5, 7, 2, 5], total = 20;
  const dialNum = $('#dialNum');
  const setDial = () => {
    let acc = 0;
    dialSegs.forEach((c, i) => {
      const len = days[i] / total * 100;
      c.style.strokeDasharray = (len - 1.4) + ' ' + (100 - len + 1.4);
      c.style.strokeDashoffset = -acc;
      acc += len;
    });
  };
  setDial();
  const dialAnimate = () => {
    if (reduce) { dialNum.textContent = total; return; }
    const start = performance.now() + 1300, dur = 2600;
    dialSegs.forEach(c => { c.style.opacity = 0; });
    const tick = t => {
      const p = Math.min(1, Math.max(0, (t - start) / dur));
      const v = ease(p) * total;
      dialNum.textContent = Math.round(v);
      let acc = 0;
      dialSegs.forEach((c, i) => {
        const a = acc / total, b = (acc + days[i]) / total;
        c.style.opacity = v / total >= a ? 1 : 0;
        acc += days[i];
      });
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const hero = $('.hero');
  requestAnimationFrame(() => requestAnimationFrame(() => { hero.classList.add('is-loaded'); dialAnimate(); }));

  // ---------- reveal ----------
  const revs = $$('.reveal');
  $$('.pillars, .cases__grid, .reviews__grid, .faq__list').forEach(g => $$('.reveal', g).forEach((el, i) => el.style.setProperty('--dl', (i % 3) * 0.1 + 's')));
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
  }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revs.forEach(el => reduce ? el.classList.add('is-visible') : io.observe(el));

  // ---------- счётчики ----------
  const counters = $$('[data-count]');
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, target = +el.dataset.count;
    cio.unobserve(el);
    if (reduce) { el.textContent = target; return; }
    const st = performance.now() + 900, dur = 1800;
    const tick = t => {
      const p = Math.min(1, Math.max(0, (t - st) / dur));
      el.textContent = fmt(target * ease(p));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }), { threshold: 0.4 });
  counters.forEach(el => cio.observe(el));

  // ---------- фото героя: лёгкий параллакс ----------
  const photo = $('.hero__photo img'), block = $('.hero__block');
  if (!reduce && photo) {
    addEventListener('scroll', () => {
      const y = Math.min(scrollY, 900);
      photo.style.transform = 'scale(1.12) translateY(' + (y * 0.06) + 'px)';
      if (block) block.style.translate = '0 ' + (y * -0.05) + 'px';
    }, { passive: true });
  }

  // ---------- магнитные кнопки ----------
  if (!reduce && matchMedia('(hover: hover)').matches) {
    $$('.magnetic').forEach(b => {
      b.addEventListener('pointermove', e => {
        const r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.18) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.28) + 'px)';
      });
      b.addEventListener('pointerleave', () => { b.style.transform = ''; });
    });
  }

  // ---------- подсветка карточек за курсором ----------
  $$('.case').forEach(c => c.addEventListener('pointermove', e => {
    const r = c.getBoundingClientRect();
    c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    c.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }));

  // ---------- sticky-сценарий «как это работает» ----------
  const flow = $('#flow'), steps = $$('#flowSteps .fstep'), fnum = $('#flowNum'), ffill = $('#flowFill');
  let flowIdx = -1;
  const updateFlow = () => {
    if (!flow || innerWidth <= 900) return;
    const r = flow.getBoundingClientRect();
    const span = flow.offsetHeight - innerHeight;
    const p = Math.min(1, Math.max(0, -r.top / span));
    const idx = Math.min(steps.length - 1, Math.floor(p * steps.length * 0.999));
    if (ffill) ffill.style.transform = 'scaleX(' + (0.06 + p * 0.94) + ')';
    if (idx !== flowIdx) {
      flowIdx = idx;
      steps.forEach((s, i) => { s.classList.toggle('is-on', i === idx); s.classList.toggle('is-past', i < idx); });
      if (fnum) fnum.textContent = String(idx + 1).padStart(2, '0');
    }
  };
  addEventListener('scroll', updateFlow, { passive: true });
  addEventListener('resize', updateFlow);
  updateFlow();

  // ---------- калькулятор ----------
  const inN = $('#inN'), inC = $('#inC'), inR = $('#inR');
  const vN = $('#vN'), outM = $('#outM'), outY = $('#outY'), goalBar = $('#goalBar'), goalTxt = $('#goalTxt');
  let shownM = 0, shownY = 0, anim = 0;
  const calc = () => {
    const n = +inN.value, c = Math.max(0, +inC.value || 0), r = Math.min(100, Math.max(0, +inR.value || 0));
    vN.textContent = n;
    inN.style.setProperty('--fill', ((n - 1) / 59 * 100) + '%');
    const m = n * c * r / 100, y = m * 12;
    const fromM = shownM, fromY = shownY, st = performance.now();
    cancelAnimationFrame(anim);
    const step = t => {
      const p = reduce ? 1 : Math.min(1, (t - st) / 600);
      shownM = fromM + (m - fromM) * ease(p);
      shownY = fromY + (y - fromY) * ease(p);
      outM.textContent = fmt(shownM) + ' ₽';
      outY.textContent = fmt(shownY) + ' ₽';
      if (p < 1) anim = requestAnimationFrame(step);
    };
    anim = requestAnimationFrame(step);
    goalBar.style.transform = 'scaleX(' + Math.min(1, n / 50) + ')';
    goalTxt.textContent = n >= 50 ? 'Это уровень нашей цели — 50 клиентов в месяц' : 'До цели в 50 клиентов в месяц — ещё ' + (50 - n);
  };
  [inN, inC, inR].forEach(i => i?.addEventListener('input', calc));
  calc();

  // «заливка» блока дохода при скролле
  const income = $('#income');
  const flood = () => {
    if (!income) return;
    const r = income.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight * 0.9)));
    income.style.setProperty('--flood', reduce ? 1 : ease(p));
  };
  addEventListener('scroll', flood, { passive: true });
  flood();

  // ---------- FAQ: закрываем соседние ----------
  const dets = $$('.faq details');
  dets.forEach(d => d.addEventListener('toggle', () => {
    if (d.open) dets.forEach(o => { if (o !== d) o.open = false; });
  }));

  // ---------- форма → Cloudflare Worker → Telegram ----------
  const form = $('#leadForm'), msg = $('#formMsg');
  form?.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const label = btn.querySelector('span');
    const orig = label.textContent;
    const payload = {};
    new FormData(form).forEach((v, k) => { payload[k] = v; });
    if (payload._gotcha) return;
    const say = (t, ok) => { msg.textContent = t; msg.className = 'form__msg ' + (ok ? 'ok' : 'err'); };
    if (!payload.name || !payload.contact) return say('Заполните имя и контакт для связи', false);
    if (!form.agree.checked) return say('Нужно согласие на обработку данных', false);
    delete payload.agree;
    payload.source = 'rapid-pravo-partners';
    btn.disabled = true;
    label.textContent = 'Отправляем…';
    try {
      const resp = await fetch(LEAD_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      say('Заявка отправлена. Менеджер свяжется с вами и расскажет условия.', true);
      form.reset();
    } catch (err) {
      console.error(err);
      say('Не получилось отправить. Напишите нам в Telegram: @Rapid_Pravo1', false);
    } finally {
      setTimeout(() => { label.textContent = orig; btn.disabled = false; }, 2500);
    }
  });
})();
