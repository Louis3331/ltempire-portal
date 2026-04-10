import { useState, useEffect } from 'react';
import Head from 'next/head';

const CATS = { ea: 'EA File', guide: 'Guide', resource: 'Resource' };

const empty = { name: '', version: '', description: '', category: 'ea', filename: '', url: '', size: '', changelog: '' };

export default function AdminDownloads() {
  const [secret,    setSecret]    = useState('');
  const [authed,    setAuthed]    = useState(false);
  const [files,     setFiles]     = useState([]);
  const [form,      setForm]      = useState(empty);
  const [editId,    setEditId]    = useState(null);
  const [status,    setStatus]    = useState('');
  const [loading,   setLoading]   = useState(false);

  const headers = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${secret}` });

  const load = async () => {
    // Use session-authenticated list endpoint
    const r = await fetch('/api/downloads');
    if (r.ok) { const d = await r.json(); setFiles(d.downloads || []); }
  };

  const verify = async () => {
    if (!secret.trim()) return;
    setLoading(true);
    try {
      const r = await fetch('/api/downloads', { method: 'POST', headers: headers(), body: JSON.stringify({ _check: true }) });
      // If we get 400 (missing fields) that means secret was accepted; 403 = wrong
      if (r.status !== 403) { setAuthed(true); load(); }
      else setStatus('Wrong admin secret.');
    } catch { setStatus('Error connecting.'); }
    finally { setLoading(false); }
  };

  const save = async (e) => {
    e.preventDefault();
    setLoading(true); setStatus('');
    try {
      const body = editId ? { ...form, id: editId } : form;
      const r = await fetch('/api/downloads', { method: 'POST', headers: headers(), body: JSON.stringify(body) });
      if (r.ok) {
        setStatus(editId ? 'Updated.' : 'Added.');
        setForm(empty); setEditId(null); load();
      } else {
        const d = await r.json(); setStatus(d.error || 'Error.');
      }
    } catch { setStatus('Network error.'); }
    finally { setLoading(false); }
  };

  const remove = async (id) => {
    if (!confirm('Delete this file?')) return;
    const r = await fetch(`/api/downloads?id=${id}`, { method: 'DELETE', headers: headers() });
    if (r.ok) { setStatus('Deleted.'); load(); }
    else setStatus('Error deleting.');
  };

  const startEdit = (f) => {
    setEditId(f.id);
    setForm({ name: f.name, version: f.version || '', description: f.description || '', category: f.category, filename: f.filename || '', url: f.url, size: f.size || '', changelog: f.changelog || '' });
    window.scrollTo(0, 0);
  };

  const inp = (field) => ({
    value: form[field],
    onChange: e => setForm(p => ({ ...p, [field]: e.target.value })),
    style: s.input,
  });

  if (!authed) return (
    <div style={s.page}>
      <Head><title>Admin | Downloads</title></Head>
      <div style={s.card}>
        <h1 style={s.h1}>Admin — Download Center</h1>
        <p style={s.sub}>Enter your ADMIN_SECRET to continue</p>
        <input type="password" placeholder="Admin secret" value={secret} onChange={e => setSecret(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && verify()} style={s.input} />
        {status && <p style={{ color: '#E05252', fontSize: 13, marginTop: 8 }}>{status}</p>}
        <button onClick={verify} disabled={loading} style={s.btn}>{loading ? 'Checking...' : 'Enter'}</button>
      </div>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } body { background: #0A0A0A; font-family: -apple-system, sans-serif; }`}</style>
    </div>
  );

  return (
    <div style={s.page}>
      <Head><title>Admin | Downloads</title></Head>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={s.h1}>Download Center — Admin</h1>
            <p style={s.sub}>Manage files that members can download</p>
          </div>
          <a href="/dashboard" style={{ color: '#C9A84C', fontSize: 13 }}>← Back to portal</a>
        </div>

        {/* ── Form ── */}
        <div style={s.card}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#F5F0E8', marginBottom: 20 }}>
            {editId ? 'Edit File' : 'Add New File'}
          </h2>
          <form onSubmit={save}>
            <div style={s.grid2}>
              <label style={s.label}>
                Name <span style={s.req}>*</span>
                <input {...inp('name')} placeholder="LouisTrading GOLD EA" required />
              </label>
              <label style={s.label}>
                Version
                <input {...inp('version')} placeholder="1.01" />
              </label>
            </div>
            <div style={s.grid2}>
              <label style={s.label}>
                Category <span style={s.req}>*</span>
                <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} style={s.input}>
                  <option value="ea">EA File</option>
                  <option value="guide">Guide</option>
                  <option value="resource">Resource</option>
                </select>
              </label>
              <label style={s.label}>
                File Size
                <input {...inp('size')} placeholder="245 KB" />
              </label>
            </div>
            <label style={s.label}>
              Download URL <span style={s.req}>*</span>
              <input {...inp('url')} placeholder="https://..." type="url" required />
            </label>
            <label style={s.label}>
              Filename (shown to user)
              <input {...inp('filename')} placeholder="LouisTrading_GOLD_1.01.ex5" />
            </label>
            <label style={s.label}>
              Description
              <textarea {...inp('description')} placeholder="Short description of this file..." rows={2} style={{ ...s.input, resize: 'vertical' }} />
            </label>
            <label style={s.label}>
              Changelog / What&apos;s New
              <textarea {...inp('changelog')} placeholder="What changed in this version..." rows={3} style={{ ...s.input, resize: 'vertical' }} />
            </label>

            {status && <p style={{ color: status.includes('rror') || status.includes('Wrong') ? '#E05252' : '#3ECF8E', fontSize: 13, marginBottom: 12 }}>{status}</p>}

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" disabled={loading} style={s.btn}>{loading ? 'Saving...' : editId ? 'Update File' : 'Add File'}</button>
              {editId && <button type="button" onClick={() => { setEditId(null); setForm(empty); setStatus(''); }} style={s.btnGhost}>Cancel</button>}
            </div>
          </form>
        </div>

        {/* ── File list ── */}
        <div style={{ marginTop: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#F5F0E8', marginBottom: 16 }}>
            Current Files ({files.length})
          </h2>
          {files.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#555' }}>No files added yet.</div>
          ) : (
            files.map(f => (
              <div key={f.id} style={s.fileRow}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, color: '#F5F0E8', fontSize: 14 }}>{f.name}</span>
                    {f.version && <span style={{ fontSize: 11, color: '#C9A84C', background: 'rgba(201,168,76,0.12)', padding: '2px 7px', borderRadius: 10 }}>v{f.version}</span>}
                    <span style={{ fontSize: 11, color: '#555', background: '#1a1a1a', padding: '2px 7px', borderRadius: 10 }}>{CATS[f.category] || f.category}</span>
                  </div>
                  <p style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{f.url}</p>
                  <p style={{ fontSize: 12, color: '#444', marginTop: 2 }}>{f.releaseDate} · {f.size} · {f.downloadCount || 0} downloads</p>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button onClick={() => startEdit(f)} style={s.editBtn}>Edit</button>
                  <button onClick={() => remove(f.id)} style={s.delBtn}>Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0A0A0A; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        input::placeholder, textarea::placeholder { color: #444; }
        input:focus, textarea:focus, select:focus { outline: none; border-color: #C9A84C !important; }
      `}</style>
    </div>
  );
}

const s = {
  page:    { minHeight: '100vh', background: '#0A0A0A', padding: '0 0 60px' },
  card:    { background: '#111', border: '1px solid #1e1e1e', borderRadius: 12, padding: '24px 28px', marginBottom: 16 },
  h1:      { fontSize: 22, fontWeight: 700, color: '#F5F0E8' },
  sub:     { fontSize: 13, color: '#666', marginTop: 4 },
  grid2:   { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 },
  label:   { display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: '#888', marginBottom: 12 },
  req:     { color: '#C9A84C' },
  input:   { width: '100%', padding: '10px 12px', background: '#0d0d0d', border: '1px solid #2a2a2a', borderRadius: 7, color: '#F5F0E8', fontSize: 13 },
  btn:     { padding: '10px 20px', background: 'linear-gradient(135deg,#C9A84C,#9B7B2F)', border: 'none', borderRadius: 7, color: '#0A0A0A', fontWeight: 700, fontSize: 14, cursor: 'pointer' },
  btnGhost:{ padding: '10px 20px', background: 'transparent', border: '1px solid #333', borderRadius: 7, color: '#888', fontSize: 14, cursor: 'pointer' },
  fileRow: { background: '#111', border: '1px solid #1e1e1e', borderRadius: 10, padding: '16px 20px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 16 },
  editBtn: { padding: '6px 14px', background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 6, color: '#C9A84C', fontSize: 12, fontWeight: 600, cursor: 'pointer' },
  delBtn:  { padding: '6px 14px', background: 'rgba(224,82,82,0.1)', border: '1px solid rgba(224,82,82,0.25)', borderRadius: 6, color: '#E05252', fontSize: 12, fontWeight: 600, cursor: 'pointer' },
};
