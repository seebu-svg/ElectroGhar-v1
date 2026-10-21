import { useEffect, useSyncExternalStore } from 'react';
import { API_BASE } from '../../utils/api';
import { createLogoStore } from '../../utils/siteLogo.mjs';

const store = createLogoStore({
  async fetchLogo() {
    const response = await fetch(`${API_BASE}/logo`, { cache: 'no-store', signal: AbortSignal.timeout(3000) });
    if (!response.ok) throw new Error('Logo unavailable');
    return (await response.json()).url;
  },
  preload(src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = resolve;
      image.onerror = reject;
      image.src = src;
    });
  },
});

// Replacements are explicit. Focus events must not change branding mid-visit.
if (typeof window !== 'undefined') window.addEventListener('logo-updated', () => { void store.load(true); });

export default function SiteLogo({ className = '', alt = 'ElectroGhar', ...props }) {
  const url = useSyncExternalStore(store.subscribe, store.getSnapshot, () => null);
  useEffect(() => { void store.load(); }, []);
  if (!url) return <span role="img" aria-label={alt} className={`inline-block aspect-[1659/948] ${className}`} />;
  return <img {...props} className={className} alt={alt} src={url} />;
}
