import { BRANDING } from './branding.mjs';

// One resolution per page load, shared by every logo. Never cache a mutable
// upload URL in localStorage, and never display a stale placeholder while waiting.
export function createLogoStore({ fetchLogo, preload }) {
  let url = null;
  let pending;
  const listeners = new Set();
  const notify = () => listeners.forEach(listener => listener());
  return {
    getSnapshot: () => url,
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    load(force = false) {
      if (url && !force) return Promise.resolve();
      if (pending) return pending;
      pending = (async () => {
        let next;
        try { next = await fetchLogo() || BRANDING.logo; }
        catch { next = url || BRANDING.logo; }
        try { await preload(next); }
        catch {
          // A broken replacement must not hide the last working approved logo.
          next = url || BRANDING.logo;
          await preload(next).catch(() => {});
        }
        url = next;
        notify();
      })().finally(() => { pending = null; });
      return pending;
    },
  };
}
