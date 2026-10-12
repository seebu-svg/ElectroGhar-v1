import { useEffect, useState } from 'react';
import { adminApi } from '../../utils/adminFetch';
const empty = { name: '', slug: '', parent_id: '', sort_order: 0, is_active: true };
export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [replacement, setReplacement] = useState('');
  const load = async () => setCategories((await adminApi('/categories')).categories);
  useEffect(() => { load().catch(e => setError(e.message)); }, []);
  async function action(fn) {
    setError(''); setBusy(true);
    try { await fn(); await load(); window.dispatchEvent(new Event('catalog-updated')); }
    catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }
  async function move(category, direction) {
    const siblings = categories.filter(c => c.parent_id === category.parent_id);
    const index = siblings.findIndex(c => c.id === category.id);
    if (!siblings[index + direction]) return;
    const reordered = [...siblings];
    [reordered[index], reordered[index + direction]] = [reordered[index + direction], reordered[index]];
    await action(async () => { for (let i = 0; i < reordered.length; i++) await adminApi(`/categories/${reordered[i].id}`, 'PUT', { ...reordered[i], sort_order: i }); });
  }
  const mains = categories.filter(c => !c.parent_id);
  const rows = mains.flatMap(c => [c, ...categories.filter(s => s.parent_id === c.id)]);
  return <div className="max-w-5xl text-gray-900">
    <h1 className="text-2xl font-bold mb-4">Categories</h1>
    {error && <p role="alert" className="p-3 bg-red-50 text-red-700 mb-4">{error}</p>}
    <form className="p-4 bg-white border rounded-xl flex flex-wrap gap-3 mb-6" onSubmit={e => { e.preventDefault(); action(async () => { await adminApi(`/categories${form.id ? '/' + form.id : ''}`, form.id ? 'PUT' : 'POST', form); setForm(empty); }); }}>
      <input aria-label="Category name" placeholder="Category name" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="border rounded p-2" />
      <input aria-label="URL slug" placeholder="URL slug (optional)" disabled={!!form.id} value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className="border rounded p-2" />
      <select aria-label="Parent category" value={form.parent_id || ''} onChange={e => setForm({ ...form, parent_id: e.target.value })} className="border rounded p-2"><option value="">Main category</option>{mains.filter(c => c.id !== form.id).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
      <label>Order <input type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: Number(e.target.value) })} className="border rounded p-2 w-20" /></label>
      <label><input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} /> Active</label>
      <button disabled={busy} className="bg-brand-600 text-white rounded px-4">{form.id ? 'Save changes' : 'Add category'}</button>
      {form.id && <button type="button" onClick={() => setForm(empty)}>Cancel</button>}
    </form>
    <p className="text-sm text-gray-500 mb-3">Inactive main categories also hide their subcategories. Slugs stay fixed to preserve product references and links.</p>
    {rows.map(c => <div key={c.id} className={`bg-white border rounded-lg p-3 mb-2 flex flex-wrap items-center gap-3 ${c.parent_id ? 'ml-6' : ''}`}>
      <span className="flex-1 font-medium">{c.name} {!c.is_active && <span className="text-gray-400">(inactive)</span>}</span>
      <button disabled={busy} aria-label={`Move ${c.name} up`} onClick={() => move(c, -1)}>↑</button>
      <button disabled={busy} aria-label={`Move ${c.name} down`} onClick={() => move(c, 1)}>↓</button>
      <button disabled={busy} onClick={() => setForm(c)}>Edit</button>
      <button disabled={busy} onClick={() => action(() => adminApi(`/categories/${c.id}`, 'PUT', { ...c, is_active: !c.is_active }))}>{c.is_active ? 'Deactivate' : 'Activate'}</button>
      <button disabled={busy} className="text-red-600" onClick={() => { setDeleting(c); setReplacement(''); }}>Remove</button>
    </div>)}
    {deleting && <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"><div className="bg-white rounded-xl p-6 max-w-lg">
      <h2 className="font-bold mb-3">Remove {deleting.name}</h2><p className="mb-3">Remove or move children first. If this category has products, choose an active category to reassign all products before removal.</p>
      <select aria-label="Reassign products to" value={replacement} onChange={e => setReplacement(e.target.value)} className="border p-2 w-full mb-4"><option value="">No reassignment (empty categories only)</option>{categories.filter(c => c.id !== deleting.id && c.is_active && (!c.parent_id || mains.some(p => p.id === c.parent_id && p.is_active))).map(c => <option key={c.id} value={c.id}>{mains.find(p => p.id === c.parent_id)?.name} / {c.name}</option>)}</select>
      {error && <p role="alert" className="text-red-600 mb-3">{error}</p>}
      <button disabled={busy} className="text-red-600 mr-5" onClick={() => action(async () => { await adminApi(`/categories/${deleting.id}`, 'DELETE', { replacement_id: replacement || null }); setDeleting(null); })}>Reassign and remove</button><button disabled={busy} onClick={() => setDeleting(null)}>Cancel</button>
    </div></div>}
  </div>;
}
