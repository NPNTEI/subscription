import qrcode from 'qrcode-generator';
import { I18N, LANGS } from './i18n.js';
import { DEFAULT_APPS } from './apps.js';

qrcode.stringToBytes = (s) => Array.from(new TextEncoder().encode(s));

/* ---------- icons (static markup only) ---------- */
const svg = (d, extra = '') =>
  `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"${extra}>${d}</svg>`;
const ICONS = {
  shield: svg('<path d="M12 3l7 3v5.5c0 4.4-2.9 8-7 9.5-4.1-1.500-7-5.100-7-9.500V6z"/><path d="M9 12l2.200 2.200L15.200 10"/>'),
  globe: svg('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.600 2.700 2.600 15.300 0 18M12 3c-2.600 2.700-2.600 15.300 0 18"/>'),
  sun: svg('<circle cx="12" cy="12" r="4"/><path d="M12 2.500v2M12 19.500v2M2.500 12h2M19.500 12h2M5.300 5.300l1.400 1.400M17.300 17.300l1.400 1.400M5.300 18.700l1.400-1.400M17.300 6.700l1.400-1.400"/>'),
  moon: svg('<path d="M20 14.500A8.500 8.500 0 0 1 9.500 4 7.500 7.500 0 1 0 20 14.500z"/>'),
  copy: svg('<rect x="8.500" y="8.500" width="12" height="12" rx="2.500"/><path d="M15.500 5.500v-1a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h1"/>'),
  check: svg('<path d="M5 12.500l4.500 4.500L19 7.500"/>'),
  qr: svg('<rect x="3.500" y="3.500" width="6.500" height="6.500" rx="1"/><rect x="14" y="3.500" width="6.500" height="6.500" rx="1"/><rect x="3.500" y="14" width="6.500" height="6.500" rx="1"/><path d="M14 14h2.500v2.500H14zM18 18h2.500v2.500H18zM18 14h2.500M14 18.500v2"/>'),
  x: svg('<path d="M6 6l12 12M18 6L6 18"/>'),
  bell: svg('<path d="M6 16.500V11a6 6 0 1 1 12 0v5.500l1.500 2h-15z"/><path d="M10 21h4"/>'),
  chat: svg('<path d="M4 5.500h16v11H9.500L5.500 20v-3.500H4z"/>'),
  down: svg('<path d="M12 4v11M7.500 11l4.500 4.500 4.500-4.500M5 20h14"/>'),
  refresh: svg('<path d="M20 11a8 8 0 0 0-14.500-4M4 13a8 8 0 0 0 14.500 4"/><path d="M5 3.500V7h3.500M19 20.500V17h-3.500"/>'),
  data: svg('<ellipse cx="12" cy="6" rx="7.500" ry="3"/><path d="M4.500 6v6c0 1.700 3.400 3 7.500 3s7.500-1.300 7.500-3V6M4.500 12v6c0 1.700 3.400 3 7.500 3s7.500-1.300 7.500-3v-6"/>'),
  clock: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5.500l3.500 2"/>'),
  swap: svg('<path d="M7 4v15M3.500 15.500L7 19l3.500-3.500M17 20V5M13.500 8.500L17 5l3.500 3.500"/>'),
  calendar: svg('<rect x="3.500" y="5" width="17" height="15.500" rx="3"/><path d="M3.500 10h17M8 3v4M16 3v4"/>'),
  chart: svg('<path d="M4 20V10M10 20V4M16 20v-7M21 20H3"/>'),
  link: svg('<path d="M10 14a4.500 4.500 0 0 0 6.400 0l3-3a4.500 4.500 0 0 0-6.400-6.400l-1 1"/><path d="M14 10a4.500 4.500 0 0 0-6.400 0l-3 3a4.500 4.500 0 0 0 6.400 6.400l1-1"/>'),
  apps: svg('<rect x="3.500" y="3.500" width="7" height="7" rx="2"/><rect x="13.500" y="3.500" width="7" height="7" rx="2"/><rect x="3.500" y="13.500" width="7" height="7" rx="2"/><rect x="13.500" y="13.500" width="7" height="7" rx="2"/>'),
  server: svg('<rect x="3.500" y="4" width="17" height="7" rx="2.500"/><rect x="3.500" y="13" width="17" height="7" rx="2.500"/><path d="M7.500 7.500h.01M7.500 16.500h.01"/>'),
  bolt: svg('<path d="M13 3L5 13.500h6L10 21l8-10.500h-6z"/>'),
};

/* ---------- tiny helpers ---------- */
const $ = (id) => document.getElementById(id);
const root = document.documentElement;

function el(tag, props, ...kids) {
  const node = document.createElement(tag);
  if (props) {
    for (const [k, v] of Object.entries(props)) {
      if (v == null || v === false) continue;
      if (k === 'class') node.className = v;
      else if (k === 'text') node.textContent = v;
      else if (k === 'icon') node.innerHTML = ICONS[v] || '';
      else if (k.startsWith('on')) node.addEventListener(k.slice(2), v);
      else node.setAttribute(k, v === true ? '' : v);
    }
  }
  for (const kid of kids) if (kid != null) node.append(kid);
  return node;
}

const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
};

/* ---------- state ---------- */
const boot = window.__SUB__ || {};
let user = boot.user || null;
const links = (Array.isArray(boot.links) ? boot.links : [])
  .filter((l) => typeof l === 'string')
  .map((l) => l.trim())
  .filter((l) => /^[a-z][a-z0-9+.-]*:\/\/\S+/i.test(l));
const panelApps = (Array.isArray(boot.apps) ? boot.apps : []).filter((a) => a && a.name);
const apps = panelApps.length ? panelApps : DEFAULT_APPS;

const basePath = location.pathname.replace(/\/+$/, '').replace(/\/info$/, '');
const subUrl = location.origin + basePath;

let lang = store.get('sub.lang');
if (!LANGS[lang]) lang = root.getAttribute('data-default-lang');
if (!LANGS[lang]) lang = 'fa';

let theme = store.get('sub.theme');
if (theme !== 'light' && theme !== 'dark') {
  theme = window.matchMedia && matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

let range = '7d';
let linksExpanded = false;
let activePlatform = null;
let headers = {};
let lastUpdate = new Date();
const usageCache = {};

/* ---------- i18n + formatting ---------- */
function t(key, vars) {
  let s = (I18N[lang] && I18N[lang][key]) ?? I18N.en[key] ?? key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, v);
  return s;
}
const locale = () => LANGS[lang].locale;
const num = (n, digits = 0) =>
  new Intl.NumberFormat(locale(), { maximumFractionDigits: digits }).format(n);

function bytes(n) {
  n = Math.max(0, Number(n) || 0);
  const units = ['u_b', 'u_kb', 'u_mb', 'u_gb', 'u_tb'];
  let i = 0;
  while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; }
  const digits = i < 2 ? 0 : n >= 100 ? 0 : n >= 10 ? 1 : 2;
  return { value: num(n, digits), unit: t(units[i]) };
}
const bytesText = (n) => { const b = bytes(n); return `${b.value} ${b.unit}`; };

function toDate(v) {
  if (v == null || v === '' || v === 0) return null;
  if (typeof v === 'number') return new Date(v < 1e12 ? v * 1000 : v);
  let s = String(v);
  if (/^\d+$/.test(s)) return toDate(Number(s));
  if (/^\d{4}-\d\d-\d\d[T ]\d\d:\d\d/.test(s) && !/(Z|[+-]\d\d:?\d\d)$/.test(s)) s = s.replace(' ', 'T') + 'Z';
  const d = new Date(s);
  return isNaN(d) ? null : d;
}
const dateText = (d) => new Intl.DateTimeFormat(locale(), { dateStyle: 'medium' }).format(d);
const timeText = (d) => new Intl.DateTimeFormat(locale(), { hour: '2-digit', minute: '2-digit', hour12: false }).format(d);

function relative(d) {
  const sec = Math.round((d - Date.now()) / 1000);
  const abs = Math.abs(sec);
  const rtf = new Intl.RelativeTimeFormat(locale(), { numeric: 'auto' });
  if (abs < 3600) return rtf.format(Math.round(sec / 60), 'minute');
  if (abs < 86400) return rtf.format(Math.round(sec / 3600), 'hour');
  if (abs < 86400 * 60) return rtf.format(Math.round(sec / 86400), 'day');
  return dateText(d);
}

const enumName = (v, fallback) => {
  const s = String(v ?? '').split('.').pop().toLowerCase();
  return s && s !== 'none' && s !== 'null' ? s : fallback;
};

function safeUrl(u, webOnly) {
  if (typeof u !== 'string' || !u.trim()) return null;
  try {
    const p = new URL(u.trim(), location.href);
    const scheme = p.protocol.toLowerCase();
    if (webOnly) return scheme === 'https:' || scheme === 'http:' ? p.href : null;
    if (['javascript:', 'data:', 'vbscript:', 'file:', 'blob:'].includes(scheme)) return null;
    return u.trim();
  } catch {
    return null;
  }
}

/* ---------- toast + clipboard ---------- */
let toastTimer;
function toast(msg, bad) {
  const box = $('toast');
  box.textContent = msg;
  box.classList.toggle('bad', !!bad);
  box.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => box.classList.remove('show'), 1800);
}

async function copy(text, btn) {
  let ok = false;
  try {
    await navigator.clipboard.writeText(text);
    ok = true;
  } catch {
    const ta = el('textarea', { style: 'position:fixed;opacity:0;top:0;left:0', readonly: true });
    ta.value = text;
    document.body.append(ta);
    ta.select();
    try { ok = document.execCommand('copy'); } catch { ok = false; }
    ta.remove();
  }
  toast(ok ? t('copied') : t('copyFail'), !ok);
  if (ok && btn) {
    const slot = btn.querySelector('[data-icon]') || btn;
    const prev = slot.innerHTML;
    slot.innerHTML = ICONS.check;
    btn.classList.add('ok');
    setTimeout(() => { slot.innerHTML = prev; btn.classList.remove('ok'); }, 1400);
  }
}

/* ---------- QR modal ---------- */
function qrSvg(text) {
  let code = null;
  for (const level of ['M', 'L']) {
    try {
      const q = qrcode(0, level);
      q.addData(text, 'Byte');
      q.make();
      code = q;
      break;
    } catch { /* try a lower correction level */ }
  }
  if (!code) return null;
  const n = code.getModuleCount();
  let d = '';
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) if (code.isDark(y, x)) d += `M${x} ${y}h1v1h-1z`;
  }
  const ns = 'http://www.w3.org/2000/svg';
  const s = document.createElementNS(ns, 'svg');
  s.setAttribute('viewBox', `-2 -2 ${n + 4} ${n + 4}`);
  s.setAttribute('shape-rendering', 'crispEdges');
  const bg = document.createElementNS(ns, 'rect');
  bg.setAttribute('x', -2); bg.setAttribute('y', -2);
  bg.setAttribute('width', n + 4); bg.setAttribute('height', n + 4);
  bg.setAttribute('fill', '#fff');
  const path = document.createElementNS(ns, 'path');
  path.setAttribute('d', d);
  path.setAttribute('fill', '#0b1020');
  s.append(bg, path);
  return s;
}

let modalText = '';
function openQr(title, text) {
  modalText = text;
  $('modal-title').textContent = title;
  $('modal-text').textContent = text;
  const holder = $('qr');
  holder.textContent = '';
  const code = qrSvg(text);
  if (code) holder.append(code);
  else holder.append(el('p', { class: 'qr-err', text: t('qrTooLong') }));
  $('modal').hidden = false;
  document.body.classList.add('locked');
}
function closeQr() {
  $('modal').hidden = true;
  document.body.classList.remove('locked');
}

/* ---------- hero ---------- */
const RING = 2 * Math.PI * 53;
const clamp = (n) => Math.max(0, Math.min(100, n));

function renderHero() {
  const u = user || {};
  const name = u.username || '—';
  $('username').textContent = name;
  $('avatar').textContent = name.replace(/[^\p{L}\p{N}]/gu, '').slice(0, 2).toUpperCase() || '•';

  const status = enumName(u.status, 'active');
  const chip = $('status');
  chip.className = `chip status s-${status}`;
  chip.textContent = t(`st_${status}`);
  $('hero').setAttribute('data-status', status);

  const online = toDate(u.online_at);
  const onl = $('online');
  if (online) {
    const live = Date.now() - online < 90000;
    onl.hidden = false;
    onl.classList.toggle('live', live);
    onl.textContent = live ? t('online') : t('lastSeen', { t: relative(online) });
  } else onl.hidden = true;

  /* data */
  const used = Number(u.used_traffic) || 0;
  const limit = Number(u.data_limit) || 0;
  const ring = $('ring');
  ring.style.strokeDasharray = RING;
  const pctChip = $('gauge-pct');
  if (limit > 0) {
    const pct = clamp((used / limit) * 100);
    const left = bytes(Math.max(0, limit - used));
    const level = pct >= 90 ? 'high' : pct >= 70 ? 'mid' : 'ok';
    $('gauge').classList.remove('inf');
    $('gauge-value').textContent = left.value;
    $('gauge-unit').textContent = left.unit;
    pctChip.hidden = false;
    pctChip.textContent = t('pctUsed', { n: num(pct) });
    ring.style.strokeDashoffset = RING * (pct / 100);
    ring.setAttribute('data-level', level);
    $('m-data').style.width = `${pct}%`;
    $('m-data').parentNode.setAttribute('data-level', level);
    $('m-data').parentNode.classList.remove('inf');
    $('m-data-v').textContent = `${bytesText(used)} / ${bytesText(limit)}`;
    $('t-used-sub').textContent = t('ofTotal', { total: bytesText(limit) });
  } else {
    $('gauge').classList.add('inf');
    $('gauge-value').textContent = '∞';
    $('gauge-unit').textContent = t('unlimited');
    pctChip.hidden = true;
    ring.style.strokeDashoffset = 0;
    ring.setAttribute('data-level', 'ok');
    $('m-data').style.width = '100%';
    $('m-data').parentNode.setAttribute('data-level', 'ok');
    $('m-data').parentNode.classList.add('inf');
    $('m-data-v').textContent = t('unlimited');
    $('t-used-sub').textContent = t('noLimit');
  }
  $('t-used').textContent = bytesText(used);

  /* time */
  const exp = toDate(u.expire);
  const created = toDate(u.created_at);
  const hold = Number(u.on_hold_expire_duration) || 0;
  const timeBar = $('m-time');
  const expV = $('t-exp');
  expV.classList.remove('warn', 'bad');
  timeBar.parentNode.classList.remove('inf');
  $('t-exp-k').textContent = t(status === 'on_hold' ? 'duration' : 'expiry');
  if (status === 'on_hold' && hold > 0) {
    const days = Math.floor(hold / 86400);
    const txt = days >= 1
      ? t('daysLeft', { n: num(days) })
      : t('hoursLeft', { n: num(Math.max(1, Math.round(hold / 3600))) });
    expV.textContent = txt;
    $('t-exp-sub').textContent = t('afterFirstUse');
    $('m-time-v').textContent = txt;
    timeBar.style.width = '0%';
  } else if (exp) {
    const ms = exp - Date.now();
    let txt;
    if (ms <= 0) txt = t('expiredAgo');
    else if (ms < 86400000) txt = t('hoursLeft', { n: num(Math.max(1, Math.ceil(ms / 3600000))) });
    else txt = t('daysLeft', { n: num(Math.ceil(ms / 86400000)) });
    expV.textContent = txt;
    expV.classList.toggle('warn', ms > 0 && ms < 3 * 86400000);
    expV.classList.toggle('bad', ms <= 0);
    $('t-exp-sub').textContent = t('until', { date: dateText(exp) });
    $('m-time-v').textContent = ms > 86400000 ? t('daysRemain', { n: num(Math.ceil(ms / 86400000)) }) : txt;
    const span = created && exp > created ? exp - created : 30 * 86400000;
    const tp = clamp(100 - (ms / span) * 100);
    timeBar.style.width = `${tp}%`;
    timeBar.parentNode.setAttribute('data-level', ms <= 0 || tp >= 90 ? 'high' : tp >= 75 ? 'mid' : 'ok');
  } else {
    expV.textContent = t('unlimited');
    $('t-exp-sub').textContent = created ? t('since', { date: dateText(created) }) : '';
    $('m-time-v').textContent = t('unlimited');
    timeBar.style.width = '100%';
    timeBar.parentNode.setAttribute('data-level', 'ok');
    timeBar.parentNode.classList.add('inf');
  }

  const strategy = enumName(u.data_limit_reset_strategy, 'no_reset');
  $('t-reset').textContent = t(`reset_${strategy}`);
  $('t-reset-sub').textContent = t(strategy === 'no_reset' ? 'noReset' : 'nextReset');
  $('t-life').textContent = bytesText(Math.max(Number(u.lifetime_used_traffic) || 0, used));
  $('t-life-sub').textContent = created ? t('since', { date: dateText(created) }) : t('allTime');
  $('updated').textContent = t('updated', { t: timeText(lastUpdate) });
}

/* ---------- announcement + support (response headers of /info) ---------- */
function decodeAnnounce(raw) {
  if (!raw) return '';
  if (raw.startsWith('base64:')) {
    try {
      const bin = atob(raw.slice(7).trim());
      return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
    } catch {
      return raw.slice(7);
    }
  }
  try { return decodeURIComponent(raw); } catch { return raw; }
}

function renderHeaders() {
  const text = decodeAnnounce(headers.announce || '').trim();
  const url = safeUrl(headers['announce-url'], true);
  $('announce').hidden = !(text || url);
  $('announce-text').textContent = text;
  const link = $('announce-link');
  link.hidden = !url;
  if (url) link.href = url;

  const support = safeUrl(headers['support-url'], false);
  const btn = $('support');
  btn.hidden = !support;
  if (support) btn.href = support;
}

/* ---------- subscription link ---------- */
function renderSub() {
  $('sub-url').textContent = subUrl;
}

/* ---------- apps ---------- */
const PLATFORM_ORDER = ['ios', 'android', 'windows', 'macos', 'linux', 'appletv', 'androidtv', 'other'];

function detectPlatform() {
  const ua = navigator.userAgent.toLowerCase();
  if (/android/.test(ua)) return /tv/.test(ua) ? 'androidtv' : 'android';
  if (/iphone|ipad|ipod/.test(ua)) return 'ios';
  if (/macintosh|mac os x/.test(ua)) return navigator.maxTouchPoints > 1 ? 'ios' : 'macos';
  if (/windows/.test(ua)) return 'windows';
  if (/linux|x11/.test(ua)) return 'linux';
  return 'other';
}

function appGroups() {
  const groups = {};
  for (const a of apps) {
    const key = enumName(a.platform, 'other');
    (groups[key] = groups[key] || []).push(a);
  }
  const keys = Object.keys(groups).sort((a, b) => {
    const ia = PLATFORM_ORDER.indexOf(a), ib = PLATFORM_ORDER.indexOf(b);
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
  });
  return { groups, keys };
}

function appCard(a) {
  const iconUrl = safeUrl(a.icon_url, true);
  const icon = el('div', { class: 'app-icon' });
  if (iconUrl) {
    const img = el('img', { src: iconUrl, alt: '', loading: 'lazy', referrerpolicy: 'no-referrer' });
    img.addEventListener('error', () => { img.remove(); icon.textContent = (a.name || '?').charAt(0); });
    icon.append(img);
  } else icon.textContent = (a.name || '?').charAt(0);

  const desc = a.description && typeof a.description === 'object'
    ? a.description[lang] || a.description.en || Object.values(a.description)[0]
    : typeof a.description === 'string' ? a.description : '';

  const all = Array.isArray(a.download_links) ? a.download_links.filter((d) => d && safeUrl(d.url, true)) : [];
  let dls = all.filter((d) => enumName(d.language, '') === lang);
  if (!dls.length) dls = all.filter((d) => enumName(d.language, '') === 'en');
  if (!dls.length) dls = all;

  const actions = el('div', { class: 'app-actions' });
  let imp = typeof a.import_url === 'string'
    ? a.import_url
      .replace('{url_enc}', encodeURIComponent(subUrl))
      .replace('{url}', subUrl)
      .replace('{name}', encodeURIComponent((user && user.username) || 'sub'))
    : '';
  imp = safeUrl(imp, false);
  if (imp) {
    actions.append(el('a', { class: 'btn small primary', href: imp, rel: 'noopener noreferrer' },
      el('span', { icon: 'bolt' }), el('span', { text: t('addToApp') })));
  }
  for (const d of dls) {
    actions.append(el('a', { class: 'btn small', href: safeUrl(d.url, true), target: '_blank', rel: 'noopener noreferrer' },
      el('span', { icon: 'down' }), el('span', { text: d.name || t('download') })));
  }

  return el('article', { class: 'app' },
    el('div', { class: 'app-top' },
      icon,
      el('div', { class: 'app-meta' },
        el('div', { class: 'app-name' },
          el('span', { text: a.name }),
          a.recommended ? el('span', { class: 'badge', text: t('recommended') }) : null),
        desc ? el('p', { class: 'app-desc', text: desc }) : null)),
    actions);
}

function renderApps() {
  const sec = $('sec-apps');
  if (!apps.length) { sec.hidden = true; return; }
  sec.hidden = false;
  const { groups, keys } = appGroups();
  if (!activePlatform || !groups[activePlatform]) {
    const mine = detectPlatform();
    activePlatform = groups[mine] ? mine : keys[0];
  }
  const tabs = $('app-tabs');
  tabs.textContent = '';
  tabs.hidden = keys.length < 2;
  for (const k of keys) {
    tabs.append(el('button', {
      type: 'button',
      class: `tab${k === activePlatform ? ' on' : ''}`,
      text: I18N.en[`p_${k}`] ? t(`p_${k}`) : k,
      onclick: () => { activePlatform = k; renderApps(); },
    }));
  }
  const list = $('app-list');
  list.textContent = '';
  const sorted = [...groups[activePlatform]].sort((a, b) => (b.recommended ? 1 : 0) - (a.recommended ? 1 : 0));
  for (const a of sorted) list.append(appCard(a));
}

/* ---------- config links ---------- */
function b64utf8(s) {
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  const bin = atob(s);
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

function describe(link) {
  const proto = link.slice(0, link.indexOf('://')).toLowerCase();
  let name = '';
  let host = '';
  let port = '';
  const tags = [];
  if (proto === 'vmess') {
    try {
      const j = JSON.parse(b64utf8(link.slice(8).split('#')[0]));
      name = j.ps || '';
      host = j.add || '';
      port = j.port || '';
      if (j.net) tags.push(String(j.net));
      if (j.tls && j.tls !== 'none') tags.push(String(j.tls));
    } catch { /* not base64 json */ }
  }
  const hash = link.indexOf('#');
  if (!name && hash >= 0) {
    const raw = link.slice(hash + 1);
    try { name = decodeURIComponent(raw); } catch { name = raw; }
  }
  const body = hash >= 0 ? link.slice(0, hash) : link;
  if (!host) {
    const m = body.match(/@(\[[^\]]+\]|[^:/?#]+)(?::(\d+))?/);
    if (m) { host = m[1]; port = m[2] || ''; }
  }
  const q = body.indexOf('?');
  if (q >= 0 && !tags.length) {
    const params = new URLSearchParams(body.slice(q + 1));
    const type = params.get('type');
    const sec = params.get('security');
    if (type) tags.push(type);
    if (sec && sec !== 'none') tags.push(sec);
  }
  if (!name) name = host || proto.toUpperCase();
  const label = { shadowsocks: 'ss', hysteria2: 'hy2', wireguard: 'wg' }[proto] || proto;
  return { proto, label, name: name.trim(), addr: host ? (port ? `${host}:${port}` : host) : '', tags: tags.slice(0, 2) };
}

const LINKS_COLLAPSED = 5;

function renderLinks() {
  const sec = $('sec-links');
  if (!links.length) { sec.hidden = true; return; }
  sec.hidden = false;
  $('links-count').textContent = num(links.length);
  const list = $('link-list');
  list.textContent = '';
  const shown = linksExpanded ? links : links.slice(0, LINKS_COLLAPSED);
  for (const link of shown) {
    const info = describe(link);
    const copyBtn = el('button', { class: 'icon-btn', type: 'button', icon: 'copy', 'aria-label': t('copy') });
    copyBtn.addEventListener('click', () => copy(link, copyBtn));
    list.append(el('div', { class: 'link' },
      el('span', { class: `proto p-${info.proto}`, text: info.label }),
      el('div', { class: 'link-body' },
        el('span', { class: 'link-name', text: info.name, dir: 'auto' }),
        el('span', { class: 'link-meta', dir: 'ltr' },
          info.addr ? el('span', { class: 'addr', text: info.addr }) : null,
          ...info.tags.map((tag) => el('em', { text: tag })))),
      el('div', { class: 'link-actions' },
        copyBtn,
        el('button', { class: 'icon-btn', type: 'button', icon: 'qr', 'aria-label': t('qr'), onclick: () => openQr(info.name, link) }))));
  }
  const more = $('links-more');
  more.hidden = links.length <= LINKS_COLLAPSED;
  more.textContent = linksExpanded ? t('showLess') : t('showAll', { n: num(links.length) });
}

/* ---------- usage chart ---------- */
const RANGES = {
  '24h': { count: 24, period: 'hour', step: 3600e3 },
  '7d': { count: 7, period: 'day', step: 86400e3 },
  '30d': { count: 30, period: 'day', step: 86400e3 },
};

function renderRangeTabs() {
  const seg = $('range');
  seg.textContent = '';
  for (const key of Object.keys(RANGES)) {
    seg.append(el('button', {
      type: 'button',
      class: key === range ? 'on' : '',
      text: t(`r_${key}`),
      onclick: () => { range = key; renderRangeTabs(); loadUsage(); },
    }));
  }
}

function pointLabel(d, period) {
  if (period === 'hour') return timeText(d);
  return new Intl.DateTimeFormat(locale(), { month: 'short', day: 'numeric' }).format(d);
}

const bucketKey = (d, period) =>
  `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}${period === 'hour' ? `-${d.getHours()}` : ''}`;

// Always returns one slot per hour/day of the range, so a single data point never fills the chart.
function toBuckets(raw, cfg) {
  const now = new Date();
  const end = cfg.period === 'hour'
    ? new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours())
    : new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const slots = [];
  const index = new Map();
  for (let i = cfg.count - 1; i >= 0; i--) {
    const d = new Date(end);
    if (cfg.period === 'hour') d.setHours(d.getHours() - i);
    else d.setDate(d.getDate() - i);
    const slot = { d, v: 0 };
    index.set(bucketKey(d, cfg.period), slot);
    slots.push(slot);
  }
  for (const p of raw) {
    const slot = index.get(bucketKey(p.d, cfg.period));
    if (slot) slot.v += p.v;
    else if (p.d < slots[0].d) slots[0].v += p.v;
    else slots[slots.length - 1].v += p.v;
  }
  return slots;
}

function drawUsage(points, cfg) {
  const chart = $('chart');
  const axis = $('chart-axis');
  const grid = $('chart-grid');
  chart.textContent = '';
  axis.textContent = '';
  grid.textContent = '';
  const setKpis = (a, b, c) => { $('k-total').textContent = a; $('k-avg').textContent = b; $('k-peak').textContent = c; };
  if (points === 'loading') {
    chart.append(el('p', { class: 'chart-msg', text: t('loading') }));
    setKpis('—', '—', '—');
    return;
  }
  const total = (points || []).reduce((s, p) => s + p.v, 0);
  if (!points || !points.length || total <= 0) {
    chart.append(el('p', { class: 'chart-msg', text: t('noData') }));
    setKpis(bytesText(0), '—', '—');
    return;
  }
  const max = Math.max(...points.map((p) => p.v));
  setKpis(bytesText(total), bytesText(total / points.length), bytesText(max));
  for (const frac of [1, 0.5]) {
    grid.append(el('div', { class: 'grid-line', style: `bottom:${frac * 100}%` },
      el('span', { text: bytesText(max * frac) })));
  }
  chart.setAttribute('data-n', points.length);
  for (const p of points) {
    chart.append(el('div', { class: `bar${p.v === max ? ' peak' : ''}`, tabindex: '0' },
      el('i', { style: `height:${p.v > 0 ? Math.max(2.500, (p.v / max) * 100) : 0}%` }),
      el('span', { class: 'tip' },
        el('b', { text: bytesText(p.v) }),
        el('em', { text: pointLabel(p.d, cfg.period) }))));
  }
  const n = points.length;
  const picks = [0, Math.floor((n - 1) / 3), Math.floor(((n - 1) * 2) / 3), n - 1];
  for (const i of [...new Set(picks)]) axis.append(el('span', { text: pointLabel(points[i].d, cfg.period) }));
}

async function loadUsage() {
  const cfg = RANGES[range];
  const key = range;
  if (usageCache[key]) { drawUsage(usageCache[key], cfg); return; }
  drawUsage('loading');
  let points = [];
  try {
    const start = new Date(Date.now() - cfg.count * cfg.step).toISOString();
    const res = await fetch(`${subUrl}/usage?start=${encodeURIComponent(start)}&period=${cfg.period}`);
    if (!res.ok) throw new Error(res.status);
    const body = await res.json();
    const raw = [];
    const stats = body && body.stats;
    const series = Array.isArray(stats) ? [stats] : stats && typeof stats === 'object' ? Object.values(stats) : [];
    for (const list of series) {
      for (const p of list || []) {
        const d = toDate(p && p.period_start);
        if (d) raw.push({ d, v: Number(p.total_traffic) || 0 });
      }
    }
    points = toBuckets(raw, cfg);
    usageCache[key] = points;
    setTimeout(() => { delete usageCache[key]; }, 60000);
  } catch { /* the chart simply shows "no data" */ }
  if (key === range) drawUsage(points, cfg);
}

/* ---------- live refresh ---------- */
async function refresh() {
  try {
    const res = await fetch(`${subUrl}/info`, { headers: { Accept: 'application/json' } });
    if (!res.ok) return;
    const body = await res.json();
    if (body && typeof body === 'object' && body.username) {
      user = body;
      lastUpdate = new Date();
    }
    headers = {};
    for (const h of ['announce', 'announce-url', 'support-url']) {
      const v = res.headers.get(h);
      if (v) headers[h] = v;
    }
    renderHero();
    renderHeaders();
  } catch { /* offline: keep the server-rendered snapshot */ }
}

/* ---------- theme + language ---------- */
function applyTheme() {
  root.setAttribute('data-theme', theme);
  const btn = $('btn-theme');
  btn.innerHTML = ICONS[theme === 'dark' ? 'sun' : 'moon'];
  btn.setAttribute('aria-label', t(theme === 'dark' ? 'light' : 'dark'));
}

function renderLangMenu() {
  const menu = $('lang-menu');
  menu.textContent = '';
  for (const [code, meta] of Object.entries(LANGS)) {
    menu.append(el('button', {
      type: 'button',
      class: code === lang ? 'on' : '',
      text: meta.name,
      onclick: () => { lang = code; store.set('sub.lang', code); menu.hidden = true; renderAll(); },
    }));
  }
}

function renderAll() {
  root.lang = lang;
  root.dir = LANGS[lang].dir;
  document.querySelectorAll('[data-i18n]').forEach((n) => { n.textContent = t(n.getAttribute('data-i18n')); });
  $('btn-lang').setAttribute('aria-label', t('language'));
  $('btn-refresh').setAttribute('aria-label', t('refresh'));
  $('modal-close').setAttribute('aria-label', t('close'));
  applyTheme();
  renderLangMenu();
  renderHero();
  renderHeaders();
  renderSub();
  renderApps();
  renderLinks();
  renderRangeTabs();
  drawUsage(usageCache[range] || [], RANGES[range]);
}

/* ---------- wire up ---------- */
document.querySelectorAll('[data-icon]').forEach((n) => { n.innerHTML = ICONS[n.getAttribute('data-icon')] || ''; });

$('btn-theme').addEventListener('click', () => {
  theme = theme === 'dark' ? 'light' : 'dark';
  store.set('sub.theme', theme);
  applyTheme();
});
$('btn-refresh').addEventListener('click', async () => {
  const btn = $('btn-refresh');
  btn.classList.add('spin');
  for (const k of Object.keys(usageCache)) delete usageCache[k];
  await Promise.all([refresh(), loadUsage()]);
  setTimeout(() => btn.classList.remove('spin'), 500);
});
$('btn-lang').addEventListener('click', (e) => {
  e.stopPropagation();
  $('lang-menu').hidden = !$('lang-menu').hidden;
});
document.addEventListener('click', (e) => {
  if (!e.target.closest('.menu-host')) $('lang-menu').hidden = true;
});
$('sub-copy').addEventListener('click', () => copy(subUrl, $('sub-copy')));
$('sub-qr').addEventListener('click', () => openQr(t('subLink'), subUrl));
$('links-copy-all').addEventListener('click', () => copy(links.join('\n'), $('links-copy-all')));
$('links-more').addEventListener('click', () => { linksExpanded = !linksExpanded; renderLinks(); });
$('modal-close').addEventListener('click', closeQr);
$('modal-copy').addEventListener('click', () => copy(modalText, $('modal-copy')));
$('modal').addEventListener('click', (e) => { if (e.target === $('modal')) closeQr(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeQr(); $('lang-menu').hidden = true; } });

renderAll();
loadUsage();
refresh();
setInterval(() => { if (!document.hidden) refresh(); }, 60000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
