import { useState } from 'react';
import { adminFetch } from '../../utils/adminFetch';
import { API_BASE } from '../../utils/api';
import SiteLogo from '../ui/SiteLogo';

export default function LogoSettings() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  async function replace(file) {
    if (!file) return;
    setBusy(true); setError(''); setSuccess('');
    try {
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type) || file.size > 5 * 1024 * 1024) throw new Error('Choose JPEG, PNG, WebP or GIF up to 5 MB');
      const body = new FormData(); body.append('image', file);
      const response = await adminFetch(`${API_BASE}/upload?folder=logo`, { method: 'POST', body });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Logo replacement failed');
      window.dispatchEvent(new Event('logo-updated'));
      setSuccess('Website logo replaced successfully.');
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  return <section className="bg-surface-card rounded-xl border border-line p-5 space-y-4">
    <h2 className="text-sm font-bold text-content uppercase tracking-wider">Website logo</h2>
    <SiteLogo alt="Current ElectroGhar logo" className="h-20 max-w-full object-contain bg-surface-card rounded p-2" />
    <p className="text-sm text-muted">Replace the logo used across the website. PNG with a transparent background is recommended. JPEG, PNG, WebP or GIF, up to 5 MB.</p>
    {error && <p role="alert" className="text-error">{error}</p>}
    {success && <p role="status" className="text-success">{success}</p>}
    <label className="block text-sm font-medium">{busy ? 'Replacing logo…' : 'Replace logo'}<input type="file" disabled={busy} accept="image/jpeg,image/png,image/webp,image/gif" className="block mt-2" onChange={e => { replace(e.target.files[0]); e.target.value = ''; }} /></label>
  </section>;
}
