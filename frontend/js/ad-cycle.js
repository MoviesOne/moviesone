/* MovieBox ad-cycle UI. Monetag zone scripts must be supplied separately.
 * Client storage is for UX only; it is not secure enforcement of ad policy.
 */
(() => {
  'use strict';
  const STORAGE_KEY = 'movieboxAdCycleV1';
  const ADS_WINDOW_MS = 10 * 60 * 1000;
  const AD_FREE_MS = 10 * 60 * 60 * 1000;
  const IDLE_LIMIT_MS = 0; // 0 means no inactivity timeout; visibility still pauses Ads Window.
  let state;
  let lastInteraction = Date.now();
  let lastTick = Date.now();
  let saveAt = 0;

  const readState = () => {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (parsed && (parsed.phase === 'ads' || parsed.phase === 'free')) return parsed;
    } catch (_) {}
    return { phase: 'ads', adsRemainingMs: ADS_WINDOW_MS, freeUntil: 0 };
  };
  const saveState = () => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) {}
  };
  const ensureFreshCycle = now => {
    if (state.phase === 'free' && now >= Number(state.freeUntil || 0)) {
      state = { phase: 'ads', adsRemainingMs: ADS_WINDOW_MS, freeUntil: 0 };
      saveState();
    }
  };
  const format = ms => {
    const s = Math.max(0, Math.ceil(ms / 1000));
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    return h ? `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}` : `${m}:${String(sec).padStart(2,'0')}`;
  };
  const paint = now => {
    const badge = document.getElementById('ad-cycle-badge');
    if (!badge) return;
    ensureFreshCycle(now);
    if (state.phase === 'free') {
      badge.textContent = 'Ad-Free';
      badge.setAttribute('aria-label', 'Ad-Free');
      badge.dataset.phase = 'free';
    } else {
      badge.textContent = `Ads Window: ${format(Number(state.adsRemainingMs) || 0)}`;
      badge.setAttribute('aria-label', `Ads window remaining ${format(Number(state.adsRemainingMs) || 0)}`);
      badge.dataset.phase = 'ads';
    }
  };
  const visibleAndActive = () => document.visibilityState === 'visible' && (IDLE_LIMIT_MS === 0 || Date.now() - lastInteraction <= IDLE_LIMIT_MS);
  const tick = () => {
    const now = Date.now();
    ensureFreshCycle(now);
    const delta = Math.min(2000, Math.max(0, now - lastTick));
    lastTick = now;
    if (state.phase === 'ads' && visibleAndActive()) {
      state.adsRemainingMs = Math.max(0, Number(state.adsRemainingMs ?? ADS_WINDOW_MS) - delta);
      if (state.adsRemainingMs <= 0) state = { phase: 'free', adsRemainingMs: 0, freeUntil: now + AD_FREE_MS };
      if (now - saveAt > 1000 || state.phase === 'free') { saveState(); saveAt = now; }
    }
    paint(now);
  };
  const noteInteraction = () => { lastInteraction = Date.now(); };
  const init = () => {
    state = readState();
    ensureFreshCycle(Date.now());
    const badge = document.getElementById('ad-cycle-badge');
    if (badge) badge.hidden = false;
    ['click','scroll','keydown','touchstart','mousemove'].forEach(type => document.addEventListener(type, noteInteraction, { passive: true, capture: true }));
    document.addEventListener('visibilitychange', () => { lastTick = Date.now(); });
    window.addEventListener('storage', event => {
      if (event.key === STORAGE_KEY) { state = readState(); lastTick = Date.now(); paint(Date.now()); }
    });
    paint(Date.now());
    window.setInterval(tick, 1000);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true }); else init();
})();
