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
    const sfx = el.dataset.sfx || '';
    if (reduce) { el.textContent = fmt(target) + sfx; return; }
    const st = performance.now() + 900, dur = 1800;
    const tick = t => {
      const p = Math.min(1, Math.max(0, (t - st) / dur));
      el.textContent = fmt(target * ease(p)) + sfx;
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

  // «заливка» блока дохода при скролле
  const income = $('.income');
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

  // ---------- маска телефона ----------
  $$('input[type="tel"]').forEach(input => input.addEventListener('input', e => {
    let v = e.target.value.replace(/\D/g, '');
    if (!v) { e.target.value = ''; return; }
    if (v.startsWith('8')) v = '7' + v.slice(1);
    if (!v.startsWith('7')) v = '7' + v;
    v = v.slice(0, 11);
    let out = '+7';
    if (v.length > 1) out += ' (' + v.slice(1, 4);
    if (v.length >= 4) out += ') ' + v.slice(4, 7);
    if (v.length >= 7) out += '-' + v.slice(7, 9);
    if (v.length >= 9) out += '-' + v.slice(9, 11);
    e.target.value = out;
  }));

  // ---------- 7 ловушек: самопроверка ----------
  const traps = $$('#trapList input'), trapN = $('#trapN'), trapMsg = $('#trapMsg'), trapBar = $('#trapBar');
  const score = $('.traps__score');
  const msgs = [
    'Отметьте пункты, которые узнали.',
    'Пока всё неплохо, но один пункт уже может стоить денег.',
    'Два пункта: самое время свериться с юристом.',
    'Три пункта: ситуация требует внимания.',
    'Четыре пункта: риск уже реальный, не откладывайте.',
    'Пять пунктов: гайд и консультация вам нужны.',
    'Шесть пунктов — это уже привычка, от неё стоит избавляться.',
    'Все семь: давайте разберёмся с вашей ситуацией прямо сейчас.'
  ];
  const updTraps = () => {
    const n = traps.filter(i => i.checked).length;
    trapN.textContent = n;
    trapMsg.textContent = msgs[n];
    trapBar.style.transform = 'scaleX(' + n / 7 + ')';
    score.classList.toggle('is-hot', n >= 5);
  };
  traps.forEach(i => i.addEventListener('change', updTraps));
  updTraps();

  // ---------- отправка форм → Cloudflare Worker → Telegram ----------
  const send = async (form, msgEl, extra, okText, onOk) => {
    const btn = form.querySelector('button[type="submit"]');
    const label = btn.querySelector('span');
    const orig = label.textContent;
    const payload = {};
    new FormData(form).forEach((v, k) => { payload[k] = v; });
    if (payload._gotcha) return;
    const say = (t, ok) => { msgEl.textContent = t; msgEl.className = 'form__msg ' + (ok ? 'ok' : 'err'); };
    if (!payload.name || !payload.phone || payload.phone.replace(/\D/g, '').length < 11) return say('Укажите имя и телефон полностью', false);
    if (!form.agree.checked) return say('Нужно согласие на обработку данных', false);
    delete payload.agree;
    Object.assign(payload, extra);
    btn.disabled = true;
    label.textContent = 'Отправляем…';
    try {
      const resp = await fetch(LEAD_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      say(okText, true);
      form.reset();
      onOk?.();
    } catch (err) {
      console.error(err);
      say('Не получилось отправить. Напишите нам в Telegram: @Rapid_Pravo1', false);
    } finally {
      setTimeout(() => { label.textContent = orig; btn.disabled = false; }, 2500);
    }
  };

  const form = $('#leadForm');
  form?.addEventListener('submit', e => {
    e.preventDefault();
    send(form, $('#formMsg'), { source: 'rapid-pravo: консультация' }, 'Заявка отправлена. Юрист свяжется с вами.');
  });

  const magnet = $('#magnetForm');
  magnet?.addEventListener('submit', e => {
    e.preventDefault();
    const n = traps.filter(i => i.checked).length;
    send(magnet, $('#magnetMsg'), { source: 'rapid-pravo: гайд «7 ловушек»', trap_score: n + ' из 7' }, 'Готово! Гайд открыт, мы также свяжемся с вами.', () => {
      const open = $('#magnetOpen');
      open.hidden = false;
      try { sessionStorage.setItem('rp_guide', '1'); } catch (_) {}
    });
  });
})();
