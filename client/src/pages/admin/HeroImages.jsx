import { useEffect, useState } from 'react';
import { adminApi, adminFetch } from '../../utils/adminFetch';
import { API_BASE } from '../../utils/api';
const empty = { desktop_url: '', mobile_url: '', alt: '', sort_order: 0, is_active: true };
export default function HeroImages() {
  const [images, setImages] = useState([]);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const load = async () => setImages((await adminApi('/hero-images')).images);
  useEffect(() => { load().catch(e => setError(e.message)); }, []);
  async function action(fn) { setBusy(true); setError(''); try { await fn(); await load(); window.dispatchEvent(new Event('hero-updated')); } catch (e) { setError(e.message); } finally { setBusy(false); } }
  async function upload(file, key) {
    if (!file) return;
    await action(async () => {
      if (!['image/jpeg','image/png','image/webp','image/gif'].includes(file.type) || file.size > 5 * 1024 * 1024) throw new Error('Choose JPEG, PNG, WebP or GIF up to 5 MB');
      const body = new FormData(); body.append('image', file);
      const response = await adminFetch(`${API_BASE}/upload?folder=hero`, { method: 'POST', body });
      const data = await response.json(); if (!response.ok) throw new Error(data.error);
      setForm(f => ({ ...f, [key]: data.url }));
    });
  }
  async function move(index, delta) {
    if (!images[index + delta]) return;
    const reordered = [...images]; [reordered[index], reordered[index + delta]] = [reordered[index + delta], reordered[index]];
    await action(async () => { for (let i = 0; i < reordered.length; i++) await adminApi(`/hero-images/${reordered[i].id}`, 'PUT', { ...reordered[i], sort_order: i }); });
  }
  return <div className="max-w-4xl text-gray-900"><h1 className="text-2xl font-bold mb-4">Homepage hero images</h1>
    {error && <p role="alert" className="bg-red-50 text-red-700 p-3 mb-4">{error}</p>}
    <form className="bg-white border rounded-xl p-5 mb-6 space-y-4" onSubmit={e => { e.preventDefault(); action(async () => { await adminApi(`/hero-images${form.id ? '/' + form.id : ''}`, form.id ? 'PUT' : 'POST', form); setForm(empty); }); }}>
      <p>Upload desktop and optional mobile images. The desktop image is used when no mobile image is set. JPEG, PNG, WebP or GIF, up to 5 MB.</p>
      {['desktop_url','mobile_url'].map(key => <div key={key}><label className="block font-medium">{key === 'desktop_url' ? 'Desktop image (required)' : 'Mobile image'}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={busy} onChange={e => { upload(e.target.files[0], key); e.target.value = ''; }} className="block mt-2" /></label>
        {form[key] && <><img src={form[key]} alt="Upload preview" className={`mt-3 object-contain bg-gray-100 rounded max-h-48 ${key === 'mobile_url' ? 'max-w-40' : 'w-full'}`} /><button type="button" onClick={() => setForm({ ...form, [key]: '' })}>Remove image</button></>}
      </div>)}
      <label className="block">Image description<input value={form.alt} onChange={e => setForm({ ...form, alt: e.target.value })} className="border rounded p-2 w-full" /></label>
      <label className="block">Order <input type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: Number(e.target.value) })} className="border p-2 w-20" /></label>
      <label className="block"><input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} /> Active</label>
      <button disabled={busy || !form.desktop_url} className="bg-brand-600 text-white px-4 py-2 rounded">{busy ? 'Working…' : form.id ? 'Save changes' : 'Add hero image'}</button> <button type="button" onClick={() => setForm(empty)}>Cancel</button>
    </form>
    {images.map((image, i) => <div key={image.id} className="bg-white border rounded-lg p-4 mb-3 flex flex-wrap items-center gap-4"><img src={image.desktop_url} alt={image.alt} className="w-32 h-20 object-cover rounded" /><span className="flex-1">{image.alt || 'Hero image'} {!image.is_active && '(inactive)'}</span><button disabled={busy} aria-label="Move image up" onClick={() => move(i,-1)}>↑</button><button disabled={busy} aria-label="Move image down" onClick={() => move(i,1)}>↓</button><button disabled={busy} onClick={() => setForm(image)}>Edit / replace</button><button disabled={busy} className="text-red-600" onClick={() => action(() => adminApi(`/hero-images/${image.id}`, 'DELETE'))}>Remove</button></div>)}
  </div>;
}
