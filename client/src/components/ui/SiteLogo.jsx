import { useEffect, useState } from 'react';
import { API_BASE } from '../../utils/api';

export default function SiteLogo({ fallback, ...props }) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const response = await fetch(`${API_BASE}/logo`, { cache: 'no-store' });
        if (!response.ok) return;
        const data = await response.json();
        if (mounted) setUrl(data.url);
      } catch { /* Keep the bundled logo when the API is unavailable. */ }
    };
    load();
    window.addEventListener('logo-updated', load);
    window.addEventListener('focus', load);
    return () => { mounted = false; window.removeEventListener('logo-updated', load); window.removeEventListener('focus', load); };
  }, []);
  return <img {...props} src={url || fallback} onError={() => setUrl(null)} />;
}
