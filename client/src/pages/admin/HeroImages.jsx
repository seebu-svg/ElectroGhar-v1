import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowRight, Check, Eye, Film, ImagePlus, LoaderCircle, Monitor, Pause, Pencil, Play, Plus, Save, Smartphone, Trash2, Upload, X } from 'lucide-react';
import { adminApi, adminFetch } from '../../utils/adminFetch';
import { API_BASE } from '../../utils/api';
import { DEFAULT_SLIDES } from '../../utils/heroSlides';

const empty = { desktop_url: '', mobile_url: '', video_url: '', mobile_video_url: '', alt: '', eyebrow: '', title: '', description: '', button_label: '', button_url: '', desktop_position: '65% center', mobile_position: '65% center', overlay_opacity: 10, sort_order: 0, is_active: true };
const input = 'mt-2 w-full rounded-xl border border-control bg-surface-card px-3 py-2.5 text-sm text-content placeholder:text-muted focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-control/15 disabled:bg-surface';
const button = 'inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-line bg-surface-card px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-control disabled:opacity-40 disabled:cursor-not-allowed';
const primary = 'inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-brand-600 bg-action px-4 py-2 text-sm font-medium text-content transition-colors hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-control disabled:opacity-40 disabled:cursor-not-allowed';

function MediaUpload({ name, label, hint, value, video, busy, uploading, onUpload, onRemove }) {
  return <div className="min-w-0 rounded-xl border border-line p-4">
    <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-content">{video ? <Film size={16} className="text-muted" /> : <ImagePlus size={16} className="text-muted" />}{label}</div>
    {value && <div className="mb-3 overflow-hidden rounded-lg bg-surface-card">{video ? <video src={value} controls muted playsInline preload="metadata" className="h-32 w-full object-contain" /> : <img src={value} alt={`${label} preview`} className="h-32 w-full object-contain" />}</div>}
    <label className={`relative flex min-h-24 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-surface p-3 text-center transition-colors focus-within:ring-2 focus-within:ring-control ${busy ? 'opacity-60' : 'cursor-pointer hover:border-brand-400 hover:bg-error/10'}`}>
      {uploading ? <LoaderCircle size={20} className="animate-spin text-brand-300" /> : <Upload size={20} className="text-muted" />}
      <span className="text-sm font-medium text-muted">{uploading ? 'Uploading…' : value ? 'Replace file' : 'Choose a file'}</span>
      <span className="text-xs text-muted">{video ? 'MP4 or WebM · up to 20 MB' : 'JPG, PNG, WebP, GIF · up to 5 MB'}</span>
      <input type="file" aria-label={label} accept={video ? 'video/mp4,video/webm' : 'image/jpeg,image/png,image/webp,image/gif'} disabled={busy} className="absolute inset-0 w-full cursor-pointer opacity-0 disabled:cursor-wait" onChange={e => { onUpload(e.target.files[0], name); e.target.value = ''; }} />
    </label>
    <p className="mt-2 text-xs leading-5 text-muted">{hint}</p>
    {value && <button type="button" disabled={busy} onClick={onRemove} className="mt-2 inline-flex min-h-9 items-center gap-1 text-xs font-medium text-error hover:text-error disabled:opacity-40"><X size={14} />Remove {video ? 'video' : 'image'}</button>}
  </div>;
}

function SlidePreview({ form, fallback }) {
  const [mobile, setMobile] = useState(false);
  const [playing, setPlaying] = useState(false);
  const video = mobile ? form.mobile_video_url || form.video_url : form.video_url;
  const poster = (mobile ? form.mobile_url || form.desktop_url : form.desktop_url) || fallback.desktop_url;
  const position = (mobile ? form.mobile_position : form.desktop_position) || '65% center';
  return <aside className="min-w-0 self-start overflow-hidden rounded-2xl border border-line bg-surface-card xl:sticky xl:top-6">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-5"><div><h3 className="flex items-center gap-2 text-sm font-semibold text-content"><Eye size={16} />Live preview</h3><p className="mt-1 text-xs text-muted">Updates as you edit</p></div><div className="flex rounded-lg bg-surface-card p-1">{[[false, Monitor, 'Desktop'], [true, Smartphone, 'Mobile']].map(([value, Icon, label]) => <button type="button" key={label} aria-label={`${label} preview`} aria-pressed={mobile === value} onClick={() => setMobile(value)} className={`rounded-md p-2 focus-visible:outline-2 focus-visible:outline-control ${mobile === value ? 'bg-surface-card text-content shadow-sm' : 'text-muted'}`}><Icon size={17} /></button>)}</div></div>
    <div className="bg-surface-card p-4 sm:p-5">
      <div className={`relative isolate mx-auto flex overflow-hidden rounded-xl bg-surface-card text-content ${mobile ? 'min-h-[460px] max-w-[290px]' : 'min-h-[330px]'}`}>
        <img src={poster} alt="" style={{ objectPosition: position }} className="absolute inset-0 -z-20 h-full w-full object-cover" />
        {video && playing && <video key={video} src={video} poster={poster} muted loop autoPlay playsInline style={{ objectPosition: position }} className="absolute inset-0 -z-20 h-full w-full object-cover" />}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-midnight/85 via-midnight/35 to-transparent" /><div className="absolute inset-0 -z-10 bg-midnight" style={{ opacity: Number(form.overlay_opacity ?? 10) / 100 }} /><div className="absolute inset-0 -z-10 bg-gradient-to-t from-midnight/65 via-transparent to-midnight/15" />
        <div className="flex w-full flex-col justify-center px-6 py-12"><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-content">{form.eyebrow || fallback.eyebrow}</p><p className={`mt-4 max-w-[260px] font-heading font-bold leading-tight tracking-tight ${mobile ? 'text-3xl' : 'text-[32px]'}`}>{form.title || fallback.title}</p><p className="mt-4 max-w-[250px] text-xs leading-5 text-content">{form.description || fallback.description}</p><div className="mt-5 flex flex-wrap gap-2"><span className="inline-flex items-center gap-2 rounded-lg bg-action px-3 py-2 text-[11px] font-semibold">{form.button_label || fallback.button_label}<ArrowRight size={12} /></span><span className="rounded-lg border border-line px-3 py-2 text-[11px]">Ask our team</span></div></div>
      </div>
    </div>
    <div className="space-y-3 p-5">{video && <button type="button" className={button} onClick={() => setPlaying(!playing)}>{playing ? <Pause size={15} /> : <Play size={15} />}{playing ? 'Pause video preview' : 'Play video preview'}</button>}<p className="break-all text-xs leading-5 text-muted"><span className="font-medium text-muted">Button destination: </span>{form.button_url || fallback.button_url}</p><p className="text-xs leading-5 text-muted">Preview is scaled to fit this panel. Blank content uses the default copy for the slide’s homepage position.</p></div>
  </aside>;
}

export default function HeroImages() {
  const [images, setImages] = useState([]);
  const [form, setForm] = useState(empty);
  const [baseline, setBaseline] = useState(empty);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState('');
  const lock = useRef(false);
  const editor = useRef(null);
  const dirty = editing && JSON.stringify(form) !== JSON.stringify(baseline);
  const pending = busy || loading;
  const active = images.filter(image => image.is_active);
  const previewOrder = [...images.filter(image => image.id !== form.id), { ...form, id: form.id || 'draft' }].filter(image => image.is_active).sort((a, b) => Number(a.sort_order) - Number(b.sort_order));
  const slot = previewOrder.findIndex(image => image.id === (form.id || 'draft'));
  const fallback = DEFAULT_SLIDES[Math.min(Math.max(slot, 0), 2)];
  useEffect(() => {
    let mounted = true;
    adminApi('/hero-images').then(result => { if (mounted) setImages(result.images || []); }).catch(e => { if (mounted) setError(e.message); }).finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);
  useEffect(() => {
    if (!dirty) return;
    const warn = e => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  const patch = (key, value) => { setForm(f => ({ ...f, [key]: value })); setErrors(e => ({ ...e, [key]: '' })); setNotice(''); };
  function begin(image) {
    if (pending) return;
    if (!image && images.length >= 3) { setError('Maximum 3 hero slides allowed, including images and videos. Edit or remove an existing slide.'); return; }
    if (dirty && !window.confirm('Discard unsaved changes and open another slide?')) return;
    const next = image ? { ...empty, ...image } : { ...empty, sort_order: Math.max(-1, ...images.map(item => item.sort_order)) + 1 };
    setForm(next); setBaseline(next); setEditing(true); setErrors({}); setError(''); setNotice('');
    requestAnimationFrame(() => editor.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }
  function cancel() {
    if (dirty && !window.confirm('Discard your unsaved changes?')) return;
    setEditing(false); setForm(empty); setBaseline(empty); setErrors({}); setError('');
  }
  async function action(fn, success) {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError(''); setNotice('');
    try { await fn(); if (success) setNotice(success); }
    catch (e) { setError(e.message); }
    finally { lock.current = false; setBusy(false); }
  }
  async function upload(file, key) {
    if (!file) return;
    await action(async () => {
      const video = key.includes('video');
      const allowed = video ? ['video/mp4', 'video/webm'] : ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowed.includes(file.type) || file.size > (video ? 20 : 5) * 1024 * 1024) { setErrors(e => ({ ...e, [key]: video ? 'Choose MP4 or WebM up to 20 MB.' : 'Choose JPG, PNG, WebP or GIF up to 5 MB.' })); return; }
      setUploading(key);
      try {
        const body = new FormData(); body.append(video ? 'video' : 'image', file);
        const response = await adminFetch(`${API_BASE}/upload${video ? '/hero-video' : '?folder=hero'}`, { method: 'POST', body });
        const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Upload failed. Please try again.');
        patch(key, data.url); setNotice('File uploaded. Save the slide to publish this change.');
      } finally { setUploading(''); }
    });
  }
  const refresh = async () => { const result = await adminApi('/hero-images'); setImages(result.images || []); window.dispatchEvent(new Event('hero-updated')); };
  async function save(e) {
    e.preventDefault();
    if (!form.id && images.length >= 3) { setError('Maximum 3 hero slides allowed, including images and videos. Edit or remove an existing slide.'); return; }
    const invalid = {};
    if (!form.desktop_url) invalid.desktop_url = 'Add a desktop image. Video slides also need a poster image.';
    if (form.button_url && (!form.button_url.startsWith('/') || form.button_url.startsWith('//') || /[\\\s]/.test(form.button_url))) invalid.button_url = 'Use a local path, such as /products?category=laptops.';
    if (!Number.isInteger(Number(form.sort_order))) invalid.sort_order = 'Enter a whole number.';
    setErrors(invalid); if (Object.keys(invalid).length) { setError('Please check the highlighted fields.'); return; }
    await action(async () => {
      const { image } = await adminApi(`/hero-images${form.id ? '/' + form.id : ''}`, form.id ? 'PUT' : 'POST', form);
      const saved = { ...empty, ...image }; setForm(saved); setBaseline(saved);
      await refresh();
    }, 'Slide saved. The homepage has been updated.');
  }
  async function move(index, delta) {
    if (!images[index + delta]) return;
    await action(async () => {
      const reordered = [...images]; [reordered[index], reordered[index + delta]] = [reordered[index + delta], reordered[index]];
      try {
        for (let i = 0; i < reordered.length; i++) if (reordered[i].sort_order !== i) await adminApi(`/hero-images/${reordered[i].id}`, 'PUT', { ...reordered[i], sort_order: i });
      } finally { await refresh(); }
      if (editing && form.id) { const order = reordered.findIndex(item => item.id === form.id); setForm(f => ({ ...f, sort_order: order })); setBaseline(f => ({ ...f, sort_order: order })); }
    }, 'Slide order updated.');
  }
  async function toggle(image) {
    if (editing && image.id === form.id && dirty && !window.confirm('Save visibility now? Unsaved editor changes will remain in the editor.')) return;
    await action(async () => {
      await adminApi(`/hero-images/${image.id}`, 'PUT', { ...image, is_active: !image.is_active });
      if (form.id === image.id) { setForm(f => ({ ...f, is_active: !image.is_active })); setBaseline(f => ({ ...f, is_active: !image.is_active })); }
      await refresh();
    }, image.is_active ? 'Slide deactivated.' : 'Slide activated.');
  }
  async function remove(image) {
    if (!window.confirm(`Remove “${image.title || image.alt || 'Untitled slide'}”? This cannot be undone.`)) return;
    await action(async () => {
      await adminApi(`/hero-images/${image.id}`, 'DELETE');
      if (form.id === image.id) { setEditing(false); setForm(empty); setBaseline(empty); }
      await refresh();
    }, 'Slide removed.');
  }
  const media = (key, label, hint, video = false) => <div><MediaUpload name={key} label={label} hint={hint} value={form[key]} video={video} busy={pending} uploading={uploading === key} onUpload={upload} onRemove={() => patch(key, '')} />{errors[key] && <p role="alert" className="mt-2 text-xs text-error">{errors[key]}</p>}</div>;
  return <div className="mx-auto max-w-7xl space-y-7 pb-8 text-content [&_button]:transition-colors">
    <header className="flex flex-wrap items-start justify-between gap-4"><div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-300">Storefront / Homepage</p><h1 className="text-3xl font-bold tracking-tight">Hero slides</h1><p className="mt-2 max-w-xl text-sm leading-6 text-muted">Create the first impression. Manage up to 3 homepage slides total, using images or videos.</p></div><button type="button" disabled={pending || images.length >= 3} onClick={() => begin()} className={primary}><Plus size={17} />Add slide</button></header>
    <div className="grid gap-3 sm:grid-cols-3">{[[images.length, 'Custom slides', ImagePlus], [Math.min(active.length, 3), 'Custom slides on homepage', Eye], [Math.max(0, 3 - active.length), 'Default slides filling spaces', Monitor]].map(([value, label, Icon]) => <div key={label} className="flex items-center gap-4 rounded-2xl border border-line bg-surface-card px-5 py-4"><span className="rounded-xl bg-surface p-3 text-muted"><Icon size={19} /></span><div><p className="text-2xl font-bold tabular-nums">{loading ? '—' : value}</p><p className="mt-0.5 text-xs text-muted">{label}</p></div></div>)}</div>
    {error && <div role="alert" className="rounded-xl border border-error/40 bg-error/10 px-4 py-3 text-sm text-error">{error}</div>}
    {notice && <div role="status" className="flex items-center gap-2 rounded-xl border border-success/40 bg-success/10 px-4 py-3 text-sm text-success"><Check size={17} />{notice}</div>}
    <section aria-labelledby="slide-library-heading" className="overflow-hidden rounded-2xl border border-line bg-surface-card">
      <div className="border-b border-line p-5 sm:px-6"><h2 id="slide-library-heading" className="font-semibold">Your slide library</h2><p className="mt-1 text-xs leading-5 text-muted">Maximum 3 slides total, including images and videos. Edit or remove a slide before adding another. Active slides appear in order; empty positions use defaults.</p></div>
      {loading ? <div role="status" className="flex items-center justify-center gap-2 py-16 text-sm text-muted"><LoaderCircle size={18} className="animate-spin" />Loading slides…</div> : !images.length ? <div className="px-6 py-12 text-center"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-error/10 text-brand-300"><ImagePlus size={23} /></span><h3 className="mt-4 font-semibold">Make the homepage yours</h3><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">Three default slides are already displayed. Add your first custom slide with an image or video.</p><button type="button" onClick={() => begin()} className={`${button} mt-5`}><Plus size={16} />Create your first slide</button></div> : <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-6 2xl:grid-cols-3">{images.map((image, i) => {
        const position = active.findIndex(item => item.id === image.id);
        const visible = image.is_active && position < 3;
        return <article key={image.id} className={`overflow-hidden rounded-xl border ${editing && image.id === form.id ? 'border-brand-400 ring-2 ring-control/10' : 'border-line'}`}>
          <div className="relative aspect-[16/8] overflow-hidden bg-surface-card"><img src={image.desktop_url} alt={image.alt || ''} style={{ objectPosition: image.desktop_position }} className="h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-midnight/50 to-transparent" /><span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-lg bg-arctic/95 px-2 py-1 text-[11px] font-semibold">{image.video_url || image.mobile_video_url ? <Film size={12} /> : <ImagePlus size={12} />}{image.video_url || image.mobile_video_url ? 'Video' : 'Image'}</span><span className={`absolute bottom-3 left-3 rounded-md px-2 py-1 text-[11px] font-medium ${visible ? 'bg-success/10 text-success' : 'bg-arctic/95 text-muted'}`}>{visible ? `Homepage · Slide ${position + 1}` : image.is_active ? 'Active · Outside first 3' : 'Inactive'}</span></div>
          <div className="p-4"><h3 className="truncate text-sm font-semibold" title={image.title || image.alt}>{image.title || image.alt || 'Untitled slide'}</h3><p className="mt-1 truncate text-xs text-muted">{image.eyebrow || 'Default copy'} · Order {image.sort_order}</p><div className="mt-4 flex flex-wrap items-center gap-2"><button disabled={pending} type="button" onClick={() => begin(image)} className={button}><Pencil size={14} />Edit</button><button disabled={pending} type="button" onClick={() => toggle(image)} className={`${button} text-xs`}>{image.is_active ? 'Deactivate' : 'Activate'}</button><div className="ml-auto flex gap-1"><button disabled={pending || i === 0} type="button" aria-label={`Move ${image.title || 'slide'} up`} onClick={() => move(i, -1)} className={`${button} px-2`}><ArrowUp size={15} /></button><button disabled={pending || i === images.length - 1} type="button" aria-label={`Move ${image.title || 'slide'} down`} onClick={() => move(i, 1)} className={`${button} px-2`}><ArrowDown size={15} /></button><button disabled={pending} type="button" aria-label={`Delete ${image.title || 'slide'}`} onClick={() => remove(image)} className={`${button} px-2 text-error`}><Trash2 size={15} /></button></div></div></div>
        </article>;
      })}</div>}
    </section>
    {editing && <section ref={editor} className="scroll-mt-6" aria-labelledby="slide-editor-heading"><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h2 id="slide-editor-heading" className="text-xl font-bold">{form.id ? 'Edit slide' : 'Create a slide'}</h2><p className="mt-1 text-sm text-muted">Start with your media, then tailor the message.</p></div><span className={`rounded-full px-3 py-1.5 text-xs font-medium ${dirty ? 'bg-warning/10 text-warning' : 'bg-surface-card text-muted'}`}>{dirty ? 'Unsaved changes' : form.id ? 'All changes saved' : 'New slide'}</span></div>
      <form onSubmit={save} noValidate>
        <div className="grid items-start gap-6 xl:grid-cols-[1.15fr_1fr]">
          <fieldset disabled={pending} className="min-w-0 space-y-5">
            <div className="rounded-2xl border border-line bg-surface-card p-5 sm:p-6"><h3 className="font-semibold">01 · Background media</h3><p className="mb-5 mt-1 text-xs leading-5 text-muted">Keep the subject on the right, leaving room for the headline.</p>{media('desktop_url', 'Desktop image · Required', 'Recommended 1920 × 1080. Also used as the video poster.')}<div className="mt-4">{media('video_url', 'Desktop video · Optional', 'Short, compressed clips work best. Playback is muted and loops.', true)}</div><details className="mt-5 rounded-xl border border-line"><summary className="cursor-pointer px-4 py-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-control">Mobile media <span className="ml-2 text-xs font-normal text-muted">Optional</span></summary><div className="space-y-4 border-t border-line p-4">{media('mobile_url', 'Mobile image', 'Recommended 900 × 1200. Falls back to the desktop image.')}{media('mobile_video_url', 'Mobile video', 'A portrait clip for smaller screens. Falls back to the desktop video.', true)}</div></details><label className="mt-5 block text-sm font-medium">Image description<input value={form.alt} maxLength={200} onChange={e => patch('alt', e.target.value)} className={input} placeholder="Describe the image for your media library" /></label></div>
            <div className="rounded-2xl border border-line bg-surface-card p-5 sm:p-6"><h3 className="font-semibold">02 · Content & buttons</h3><p className="mt-1 text-xs leading-5 text-muted">Leave fields blank to use the default copy shown in the preview.</p><div className="mt-5 space-y-4">{[['eyebrow', 'Small heading', 80], ['title', 'Headline', 120], ['description', 'Description', 350], ['button_label', 'Primary button text', 60], ['button_url', 'Button destination', 500]].map(([key, label, max]) => <label key={key} className="block text-sm font-medium">{label}{key === 'description' ? <textarea rows={3} maxLength={max} value={form[key] || ''} onChange={e => patch(key, e.target.value)} placeholder={fallback[key]} className={`${input} resize-y`} /> : <input maxLength={max} value={form[key] || ''} aria-invalid={!!errors[key]} aria-describedby={errors[key] ? `${key}-error` : undefined} onChange={e => patch(key, e.target.value)} placeholder={fallback[key]} className={`${input} ${errors[key] ? 'border-error/40' : ''}`} />}{errors[key] && <span id={`${key}-error`} role="alert" className="mt-1 block text-xs text-error">{errors[key]}</span>}{key === 'button_url' && <span className="mt-1.5 block text-xs font-normal text-muted">Use a local page path, such as /products?category=laptops.</span>}</label>)}</div></div>
            <div className="rounded-2xl border border-line bg-surface-card p-5 sm:p-6"><h3 className="font-semibold">03 · Display settings</h3><div className="mt-5 grid gap-4 sm:grid-cols-2">{['desktop_position', 'mobile_position'].map(key => <label key={key} className="text-sm font-medium">{key === 'desktop_position' ? 'Desktop focal point' : 'Mobile focal point'}<select value={form[key]} onChange={e => patch(key, e.target.value)} className={input}>{[['left center', 'Left'], ['center center', 'Center'], ['65% center', 'Center right'], ['right center', 'Right']].map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>)}</div><label className="mt-5 block text-sm font-medium">Extra background dimming <span className="float-right tabular-nums text-muted">{form.overlay_opacity}%</span><input type="range" min="0" max="60" value={form.overlay_opacity} onChange={e => patch('overlay_opacity', Number(e.target.value))} className="mt-3 w-full accent-brand-600" /></label><p className="text-xs leading-5 text-muted">Increase dimming if the text is hard to read over your media.</p><div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-5"><label className="text-sm font-medium">Sort order<input type="number" step="1" value={form.sort_order} onChange={e => patch('sort_order', e.target.value)} aria-invalid={!!errors.sort_order} className={`${input} ml-3 !mt-0 !w-24`} />{errors.sort_order && <span role="alert" className="block mt-1 text-xs text-error">{errors.sort_order}</span>}</label><label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-medium"><input type="checkbox" checked={form.is_active} onChange={e => patch('is_active', e.target.checked)} className="h-4 w-4 accent-brand-600" />Active on homepage</label></div></div>
          </fieldset>
          <SlidePreview key={form.id || 'new-slide'} form={form} fallback={fallback} />
        </div>
        <div className="sticky bottom-3 z-10 mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-arctic/95 p-4 shadow-lg shadow-gray-900/5 backdrop-blur-sm"><p role="status" className="text-xs text-muted">{uploading ? 'Uploading media…' : busy ? 'Saving changes…' : dirty ? 'Your changes are not published yet.' : 'Ready when you are.'}</p><div className="flex gap-2"><button type="button" disabled={pending} onClick={cancel} className={button}>Cancel</button><button disabled={pending || (form.id && !dirty)} className={primary}>{busy ? <LoaderCircle size={16} className="animate-spin" /> : <Save size={16} />}{busy ? 'Working…' : form.id ? 'Save changes' : 'Create slide'}</button></div></div>
      </form>
    </section>}
  </div>;
}
