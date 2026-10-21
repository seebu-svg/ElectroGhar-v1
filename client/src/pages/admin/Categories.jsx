import { useEffect, useMemo, useRef, useState } from 'react';
import { adminApi } from '../../utils/adminFetch';
import { categoryMoveUpdates, saveCategoryMove, sortCategories } from '../../utils/categoryActions.mjs';
const empty = { name: '', slug: '', parent_id: '', sort_order: 0, is_active: true };
export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const inFlight = useRef(false);
  const pending = busy || loading;
  const [deleting, setDeleting] = useState(null);
  const [replacement, setReplacement] = useState('');
  useEffect(() => {
    let active = true;
    adminApi('/categories').then(result => { if (active) setCategories(sortCategories(result.categories)); })
      .catch(e => { if (active) setError(e.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  async function action(fn) {
    if (inFlight.current || loading) return;
    inFlight.current = true;
    setError(''); setBusy(true);
    try {
      await fn();
      window.dispatchEvent(new Event('catalog-updated'));
    } catch (e) {
      setError(e.message);
      // A network failure can occur after a write commits. Reconcile on failure
      // rather than refetching after every successful edit.
      try { setCategories(sortCategories((await adminApi('/categories')).categories)); }
      catch { setError(`${e.message} Unable to refresh categories; reload before trying again.`); }
      window.dispatchEvent(new Event('catalog-updated'));
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }
  function applyCategory(category) {
    setCategories(current => sortCategories([...current.filter(item => item.id !== category.id), category]));
  }
  async function save() {
    const { category } = await adminApi(`/categories${form.id ? '/' + form.id : ''}`, form.id ? 'PUT' : 'POST', form);
    applyCategory(category);
    setForm(empty);
  }
  async function move(category, direction) {
    if (!categoryMoveUpdates(categories, category, direction).length) return;
    await action(async () => {
      const saved = await saveCategoryMove(categories, category, direction, adminApi);
      setCategories(saved);
      setForm(current => current.id ? { ...current, sort_order: saved.find(item => item.id === current.id)?.sort_order ?? current.sort_order } : current);
    });
  }
  const { mains, rows, positions, groups } = useMemo(() => {
    const groups = new Map();
    const positions = new Map();
    for (const category of categories) {
      const parent = category.parent_id || null;
      if (!groups.has(parent)) groups.set(parent, []);
      positions.set(category.id, groups.get(parent).length);
      groups.get(parent).push(category);
    }
    const mains = groups.get(null) || [];
    return { mains, rows: mains.flatMap(category => [category, ...(groups.get(category.id) || [])]), positions, groups };
  }, [categories]);
  return <div className="max-w-5xl text-content">
    <h1 className="text-2xl font-bold mb-4">Categories</h1>
    {error && <p role="alert" className="p-3 bg-error/10 text-error mb-4">{error}</p>}
    <form className="p-4 bg-surface-card border rounded-xl flex flex-wrap gap-3 mb-6" onSubmit={e => { e.preventDefault(); action(save); }}>
      <input disabled={pending} aria-label="Category name" placeholder="Category name" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="border rounded p-2" />
      <input aria-label="URL slug" placeholder="URL slug (optional)" disabled={pending || !!form.id} value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className="border rounded p-2" />
      <select disabled={pending} aria-label="Parent category" value={form.parent_id || ''} onChange={e => setForm({ ...form, parent_id: e.target.value })} className="border rounded p-2"><option value="">Main category</option>{mains.filter(c => c.id !== form.id).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
      <label>Order <input disabled={pending} type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: Number(e.target.value) })} className="border rounded p-2 w-20" /></label>
      <label><input disabled={pending} type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} /> Active</label>
      <button disabled={pending} className="bg-action text-content rounded px-4">{form.id ? 'Save changes' : 'Add category'}</button>
      {form.id && <button disabled={pending} type="button" onClick={() => setForm(empty)}>Cancel</button>}
    </form>
    <p className="text-sm text-muted mb-3">Inactive main categories also hide their subcategories. Slugs stay fixed to preserve product references and links.</p>
    {loading && <p role="status" className="text-sm text-muted mb-3">Loading categories…</p>}
    {busy && <p role="status" className="text-sm text-muted mb-3">Saving changes…</p>}
    {rows.map(c => <div key={c.id} className={`bg-surface-card border rounded-lg p-3 mb-2 flex flex-wrap items-center gap-3 ${c.parent_id ? 'ml-6' : ''}`}>
      <span className="flex-1 font-medium">{c.name} {!c.is_active && <span className="text-muted">(inactive)</span>}</span>
      <button disabled={pending || positions.get(c.id) === 0} aria-label={`Move ${c.name} up`} onClick={() => move(c, -1)}>↑</button>
      <button disabled={pending || positions.get(c.id) === groups.get(c.parent_id || null).length - 1} aria-label={`Move ${c.name} down`} onClick={() => move(c, 1)}>↓</button>
      <button disabled={pending} onClick={() => setForm(c)}>Edit</button>
      <button disabled={pending} onClick={() => action(async () => { const { category } = await adminApi(`/categories/${c.id}`, 'PUT', { is_active: !c.is_active }); applyCategory(category); if (form.id === c.id) setForm(current => ({ ...current, is_active: category.is_active })); })}>{c.is_active ? 'Deactivate' : 'Activate'}</button>
      <button disabled={pending} className="text-error" onClick={() => { setDeleting(c); setReplacement(''); }}>Remove</button>
    </div>)}
    {deleting && <div className="fixed inset-0 z-50 bg-midnight/50 flex items-center justify-center p-4"><div className="bg-surface-card rounded-xl p-6 max-w-lg">
      <h2 className="font-bold mb-3">Remove {deleting.name}</h2><p className="mb-3">Remove or move children first. If this category has products, choose an active category to reassign all products before removal.</p>
      <select disabled={pending} aria-label="Reassign products to" value={replacement} onChange={e => setReplacement(e.target.value)} className="border p-2 w-full mb-4"><option value="">No reassignment (empty categories only)</option>{categories.filter(c => c.id !== deleting.id && c.is_active && (!c.parent_id || mains.some(p => p.id === c.parent_id && p.is_active))).map(c => <option key={c.id} value={c.id}>{mains.find(p => p.id === c.parent_id)?.name} / {c.name}</option>)}</select>
      {error && <p role="alert" className="text-error mb-3">{error}</p>}
      <button disabled={pending} className="text-error mr-5" onClick={() => action(async () => { await adminApi(`/categories/${deleting.id}`, 'DELETE', { replacement_id: replacement || null }); setCategories(current => current.filter(c => c.id !== deleting.id)); if (form.id === deleting.id) setForm(empty); setDeleting(null); })}>Reassign and remove</button><button disabled={pending} onClick={() => setDeleting(null)}>Cancel</button>
    </div></div>}
  </div>;
}
