'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import NextImage from 'next/image';
import { getSiteContent, setSiteContent } from '@/lib/siteContent';
import { LayoutDashboard, Users, UserCheck, Building2, Package, Palette, Pencil, ExternalLink, AlertTriangle, Layers } from 'lucide-react';

/* ─── localStorage helpers ─── */
const LEADS_KEY = 'ntl_leads';
const CUSTOMERS_KEY = 'ntl_customers';
const stored = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; }
  catch { return fallback; }
};

/* ─── Shared mini components ─── */
const Badge = ({ text, color }) => {
  const colors = { new: '#3b82f6', contacted: '#f59e0b', converted: '#22c55e', closed: '#6b7280', inbound: '#8b5cf6', outbound: '#e87722' };
  const c = colors[color] || '#6b7280';
  return <span style={{ background: c + '22', color: c, border: `1px solid ${c}44`, borderRadius: 99, padding: '2px 10px', fontSize: 11, fontWeight: 600, textTransform: 'capitalize', whiteSpace: 'nowrap' }}>{text}</span>;
};

const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16, backdropFilter: 'blur(6px)' }} onClick={onClose}>
      <div style={{ background: '#141e2e', borderRadius: 18, padding: '26px 30px', minWidth: 360, maxWidth: 520, width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 32px 80px rgba(0,0,0,0.6)', border: '1px solid #1e2d42' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#e2e8f0' }}>{title}</h3>
          <button onClick={onClose} style={{ background: '#1e2d42', border: 'none', borderRadius: 8, width: 32, height: 32, fontSize: 18, cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
};

const inputBase = { width: '100%', padding: '9px 12px', border: '1.5px solid #1e2d42', borderRadius: 9, fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none', transition: 'border-color 0.15s', color: '#e2e8f0', background: '#0e1a2b' };
const FInput = ({ label, value, onChange, type = 'text', placeholder, required, multiline, rows = 3 }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>}
    {multiline
      ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} required={required}
          style={{ ...inputBase, resize: 'vertical' }}
          onFocus={e => e.target.style.borderColor = '#3b82f6'} onBlur={e => e.target.style.borderColor = '#1e2d42'} />
      : <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} required={required}
          style={inputBase}
          onFocus={e => e.target.style.borderColor = '#3b82f6'} onBlur={e => e.target.style.borderColor = '#1e2d42'} />
    }
  </div>
);

const FSelect = ({ label, value, onChange, options }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</label>}
    <select value={value} onChange={e => onChange(e.target.value)} style={{ ...inputBase, cursor: 'pointer' }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

/* ─── Overview Tab ─── */
function OverviewTab({ leads, customers }) {
  const inbound = leads.filter(l => l.type === 'inbound');
  const outbound = leads.filter(l => l.type === 'outbound');
  const pending = leads.filter(l => l.status === 'new' || l.status === 'contacted');
  const converted = leads.filter(l => l.status === 'converted');

  const stats = [
    { label: 'Total Leads', value: leads.length, icon: '◈', color: '#3b82f6', bg: 'linear-gradient(135deg, rgba(59,130,246,0.14) 0%, rgba(59,130,246,0.07) 100%)', sub: `${inbound.length} inbound · ${outbound.length} outbound` },
    { label: 'Customers', value: customers.length, icon: '◉', color: '#22c55e', bg: 'linear-gradient(135deg, rgba(34,197,94,0.14) 0%, rgba(34,197,94,0.07) 100%)', sub: 'Active accounts' },
    { label: 'Pending Follow-up', value: pending.length, icon: '⏳', color: '#f59e0b', bg: 'linear-gradient(135deg, rgba(245,158,11,0.14) 0%, rgba(245,158,11,0.07) 100%)', sub: 'Need attention' },
    { label: 'Converted', value: converted.length, icon: '✓', color: '#8b5cf6', bg: 'linear-gradient(135deg, rgba(139,92,246,0.14) 0%, rgba(139,92,246,0.07) 100%)', sub: 'Closed deals' },
  ];

  const stageData = [
    { label: 'New', count: leads.filter(l => l.status === 'new').length, color: '#3b82f6' },
    { label: 'Contacted', count: leads.filter(l => l.status === 'contacted').length, color: '#f59e0b' },
    { label: 'Converted', count: leads.filter(l => l.status === 'converted').length, color: '#22c55e' },
    { label: 'Closed', count: leads.filter(l => l.status === 'closed').length, color: '#94a3b8' },
  ];
  const maxStage = Math.max(...stageData.map(s => s.count), 1);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#e2e8f0', letterSpacing: '-0.02em' }}>Overview</h1>
        <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13 }}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: 16, padding: '20px 22px', border: `1px solid ${s.color}25` }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 12px ${s.color}50`, marginBottom: 14 }}>
              <span style={{ color: '#fff', fontSize: 15 }}>{s.icon}</span>
            </div>
            <div style={{ fontSize: 34, fontWeight: 800, color: '#f1f5f9', lineHeight: 1, letterSpacing: '-0.02em' }}>{s.value}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#cbd5e1', marginTop: 5 }}>{s.label}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: leads.length > 0 ? '1fr 300px' : '1fr', gap: 16, alignItems: 'start' }}>
        {leads.length > 0 ? (
          <div style={{ background: '#141e2e', borderRadius: 16, border: '1px solid #1e2d42', overflow: 'hidden' }}>
            <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid #1e2d42' }}>
              <h3 style={{ margin: 0, color: '#e2e8f0', fontSize: 15, fontWeight: 700 }}>Recent Leads</h3>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr style={{ background: '#0d1726' }}>
                {['Name', 'Phone', 'Type', 'Status', 'Date'].map(h => <th key={h} style={{ textAlign: 'left', padding: '9px 16px', fontSize: 11, color: '#4a5a6b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {leads.slice().reverse().slice(0, 6).map(l => (
                  <tr key={l.id} style={{ borderTop: '1px solid #1a2538' }}>
                    <td style={{ padding: '11px 16px', fontWeight: 600, color: '#e2e8f0', fontSize: 14 }}>{l.name}</td>
                    <td style={{ padding: '11px 16px', color: '#94a3b8', fontSize: 13 }}>{l.phone}</td>
                    <td style={{ padding: '11px 16px' }}><Badge text={l.type} color={l.type} /></td>
                    <td style={{ padding: '11px 16px' }}>{(() => { const s = STATUS_STYLE[l.status] || STATUS_STYLE.new; return <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, borderRadius: 99, padding: '2px 10px', fontSize: 11, fontWeight: 700 }}>{s.label}</span>; })()}</td>
                    <td style={{ padding: '11px 16px', color: '#64748b', fontSize: 12 }}>{l.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ background: '#141e2e', borderRadius: 16, padding: 48, textAlign: 'center', border: '1px solid #1e2d42' }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: '#1e2d42', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: 24 }}>◈</div>
            <h3 style={{ color: '#e2e8f0', margin: '0 0 6px', fontSize: 16 }}>No leads yet</h3>
            <p style={{ color: '#64748b', margin: 0, fontSize: 13 }}>Go to the Leads tab to add your first lead.</p>
          </div>
        )}

        {leads.length > 0 && (
          <div style={{ background: '#141e2e', borderRadius: 16, padding: '20px 22px', border: '1px solid #1e2d42' }}>
            <h3 style={{ margin: '0 0 18px', color: '#e2e8f0', fontSize: 15, fontWeight: 700 }}>Lead Pipeline</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {stageData.map(s => (
                <div key={s.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>{s.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: s.color }}>{s.count}</span>
                  </div>
                  <div style={{ height: 7, background: '#1e2d42', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(s.count / maxStage) * 100}%`, background: s.color, borderRadius: 99, transition: 'width 0.5s ease' }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #1e2d42', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: '#64748b' }}>Conversion rate</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#22c55e' }}>{leads.length > 0 ? Math.round((converted.length / leads.length) * 100) : 0}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Quality config ─── */
const QUALITY_STYLE = {
  hot:  { bg: 'rgba(239,68,68,0.15)',  color: '#f87171', border: 'rgba(239,68,68,0.3)',  label: '🔥 Hot' },
  warm: { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: 'rgba(245,158,11,0.3)', label: '✦ Warm' },
  cold: { bg: 'rgba(99,102,241,0.15)', color: '#a5b4fc', border: 'rgba(99,102,241,0.3)', label: '❄ Cold' },
};
const QualityBadge = ({ value }) => {
  const q = QUALITY_STYLE[value] || QUALITY_STYLE.warm;
  return <span style={{ background: q.bg, color: q.color, border: `1px solid ${q.border}`, borderRadius: 99, padding: '2px 10px', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>{q.label}</span>;
};

/* ─── Status colour config ─── */
const STATUS_STYLE = {
  new:       { bg: 'rgba(59,130,246,0.15)',  color: '#60a5fa', border: 'rgba(59,130,246,0.3)',  label: 'New' },
  contacted: { bg: 'rgba(245,158,11,0.15)',  color: '#fbbf24', border: 'rgba(245,158,11,0.3)',  label: 'Contacted' },
  converted: { bg: 'rgba(34,197,94,0.15)',   color: '#4ade80', border: 'rgba(34,197,94,0.3)',   label: 'Converted' },
  closed:    { bg: 'rgba(100,116,139,0.15)', color: '#94a3b8', border: 'rgba(100,116,139,0.3)', label: 'Closed' },
};

const StatusSelect = ({ value, onChange }) => {
  const s = STATUS_STYLE[value] || STATUS_STYLE.new;
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          background: s.bg, color: s.color, border: `1.5px solid ${s.border}`,
          borderRadius: 99, padding: '4px 24px 4px 10px', fontSize: 12, fontWeight: 700,
          cursor: 'pointer', outline: 'none', appearance: 'none', WebkitAppearance: 'none',
        }}
      >
        {Object.entries(STATUS_STYLE).map(([val, { label }]) => (
          <option key={val} value={val}>{label}</option>
        ))}
      </select>
      <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: 10, color: s.color }}>▾</span>
    </div>
  );
};

/* ─── Leads Tab ─── */
function LeadsTab({ leads, saveLeads }) {
  const [subTab, setSubTab] = useState('inbound');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', company: '', company_website: '', requirement: '', notes: '', status: 'new', type: 'inbound', quality: 'warm', ref_link: '' });
  const [editId, setEditId] = useState(null);
  const [sortBy, setSortBy] = useState('date_desc');
  const filtered = leads.filter(l => l.type === subTab);
  const ORDER = ['new', 'contacted', 'converted', 'closed'];
  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'name_asc')  return (a.name || '').localeCompare(b.name || '');
    if (sortBy === 'name_desc') return (b.name || '').localeCompare(a.name || '');
    if (sortBy === 'status')    return ORDER.indexOf(a.status) - ORDER.indexOf(b.status);
    if (sortBy === 'date_asc')  return (a.created_at || a.date || '').localeCompare(b.created_at || b.date || '');
    // date_desc (default)
    return (b.created_at || b.date || '').localeCompare(a.created_at || a.date || '');
  });
  const f = k => v => setForm(p => ({ ...p, [k]: v }));
  const submit = async e => {
    e.preventDefault();
    if (editId) {
      await fetch('/api/leads', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editId, ...form }) });
      saveLeads(leads.map(l => l.id === editId ? { ...l, ...form } : l));
    } else {
      const res = await fetch('/api/leads', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, date: new Date().toLocaleDateString('en-IN') }) });
      const data = await res.json();
      // If DB is configured, use the returned row (has real id); otherwise create a local one
      const newLead = res.ok && data.id ? data : { ...form, id: Date.now(), date: new Date().toLocaleDateString('en-IN') };
      saveLeads([...leads, newLead]);
    }
    setShowModal(false); setEditId(null);
    setForm({ name: '', phone: '', email: '', company: '', company_website: '', requirement: '', notes: '', status: 'new', type: subTab, quality: 'warm', ref_link: '' });
  };
  const openAdd = () => { setForm({ name: '', phone: '', email: '', company: '', company_website: '', requirement: '', notes: '', status: 'new', type: subTab, quality: 'warm', ref_link: '' }); setEditId(null); setShowModal(true); };
  const openEdit = l => { setForm({ name: l.name, phone: l.phone || '', email: l.email || '', company: l.company || '', company_website: l.company_website || '', requirement: l.requirement || '', notes: l.notes || '', status: l.status, type: l.type, quality: l.quality || 'warm', ref_link: l.ref_link || '' }); setEditId(l.id); setShowModal(true); };
  const del = async id => {
    if (window.confirm('Delete this lead?')) {
      await fetch(`/api/leads?id=${id}`, { method: 'DELETE' });
      saveLeads(leads.filter(l => l.id !== id));
    }
  };
  const updateStatus = async (id, status) => {
    await fetch('/api/leads', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) });
    saveLeads(leads.map(l => l.id === id ? { ...l, status } : l));
  };
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#e2e8f0', letterSpacing: '-0.02em' }}>Lead Management</h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13 }}>Track and manage all your inbound and outbound leads</p>
        </div>
        <button onClick={openAdd} style={{ background: '#e87722', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 22px', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 2px 8px rgba(232,119,34,0.3)' }}>+ Add Lead</button>
      </div>
      <div style={{ display: 'flex', gap: 2, background: '#0d1726', borderRadius: 10, padding: 4, marginBottom: 24, width: 'fit-content', border: '1px solid #1e2d42' }}>
        {[{ id: 'inbound', label: '↙ Inbound' }, { id: 'outbound', label: '↗ Outbound' }, { id: 'prospect', label: '★ Prospects' }].map(t => (
          <button key={t.id} onClick={() => setSubTab(t.id)} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, background: subTab === t.id ? '#1e2d42' : 'transparent', color: subTab === t.id ? '#e2e8f0' : '#4a5a6b', boxShadow: subTab === t.id ? '0 1px 4px rgba(0,0,0,0.3)' : 'none' }}>
            {t.label} ({leads.filter(l => l.type === t.id).length})
          </button>
        ))}
      </div>
      <p style={{ color: '#64748b', fontSize: 13, marginBottom: 12, marginTop: -12 }}>{subTab === 'inbound' ? 'Leads coming in from your contact form, referrals, or inquiries.' : subTab === 'outbound' ? 'Prospects you are actively reaching out to.' : 'Manually added prospects — saved here so nothing slips through the cracks.'}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Sort:</span>
        {[
          { value: 'date_desc', label: 'Newest' },
          { value: 'date_asc',  label: 'Oldest' },
          { value: 'status',    label: 'Status' },
          { value: 'name_asc',  label: 'Name A–Z' },
        ].map(opt => (
          <button key={opt.value} onClick={() => setSortBy(opt.value)} style={{
            padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
            background: sortBy === opt.value ? '#e87722' : '#141e2e',
            color:      sortBy === opt.value ? '#fff'    : '#64748b',
            border:     `1px solid ${sortBy === opt.value ? '#e87722' : '#1e2d42'}`,
          }}>{opt.label}</button>
        ))}
      </div>
      <div style={{ background: '#141e2e', borderRadius: 16, border: '1px solid #1e2d42', overflow: 'hidden' }}>
        {sorted.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>◈</div>
            <div>{subTab === 'prospect' ? 'No prospects yet. Click' : `No ${subTab} leads yet. Click`} <strong style={{ color: '#e87722' }}>+ Add Lead</strong> {subTab === 'prospect' ? 'to manually add a prospect.' : 'to get started.'}</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ background: '#0d1726', borderBottom: '2px solid #1e2d42' }}>
              {['Name & Contact', 'Website', 'Requirement', 'Quality', 'Status', 'Link', 'Actions'].map(h => <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 11, color: '#4a5a6b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {sorted.map(l => (
                <tr key={l.id} style={{ borderBottom: '1px solid #1a2538' }} onMouseEnter={e => e.currentTarget.style.background = '#1e2d42'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <td style={{ padding: '10px 14px', maxWidth: 240 }}>
                    <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.name}</div>
                    {l.company && <div style={{ fontSize: 11, color: '#4a5a6b', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.company}</div>}
                    {l.phone && l.phone !== 'NOT_FOUND' && <a href={`tel:${l.phone}`} style={{ fontSize: 11, color: '#60a5fa', marginTop: 1, display: 'block', textDecoration: 'none' }}>{l.phone}</a>}
                    {l.email && <a href={`mailto:${l.email}`} style={{ fontSize: 11, color: '#34d399', marginTop: 1, display: 'block', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.email}</a>}
                  </td>
                  <td style={{ padding: '10px 14px', maxWidth: 180 }} onClick={e => e.stopPropagation()}>
                    {l.company_website
                      ? <a href={l.company_website} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: '#60a5fa', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5 }}>
                          <span style={{ fontSize: 13 }}>🌐</span>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.company_website.replace(/^https?:\/\//, '')}</span>
                        </a>
                      : <span style={{ color: '#334155', fontSize: 13 }}>—</span>}
                  </td>
                  <td style={{ padding: '10px 14px', color: '#64748b', fontSize: 13, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.requirement || '—'}</td>
                  <td style={{ padding: '10px 14px' }}><QualityBadge value={l.quality || 'warm'} /></td>
                  <td style={{ padding: '10px 14px' }}>
                    <StatusSelect value={l.status} onChange={status => updateStatus(l.id, status)} />
                  </td>
                  <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                    {l.ref_link
                      ? <a href={l.ref_link} target="_blank" rel="noopener noreferrer" title={l.ref_link} style={{ color: '#60a5fa', fontSize: 18, textDecoration: 'none' }}>🔗</a>
                      : <span style={{ color: '#334155', fontSize: 13 }}>—</span>}
                  </td>
                  <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
                    <button onClick={() => openEdit(l)} style={{ background: '#1e2d42', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 12, color: '#94a3b8', marginRight: 4 }}>Edit</button>
                    <button onClick={() => del(l.id)} style={{ background: 'rgba(220,38,38,0.12)', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 12, color: '#f87171' }}>Del</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editId ? 'Edit Lead' : subTab === 'prospect' ? 'Add Prospect' : `Add ${subTab === 'inbound' ? 'Inbound' : 'Outbound'} Lead`}>
        {editId && (
          <div style={{ background: '#0d1726', borderRadius: 10, padding: '12px 14px', marginBottom: 18, border: '1px solid #1e2d42' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#4a5a6b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Contact &amp; Source</div>
            {[
              { label: 'Phone',    value: form.phone,           href: form.phone           ? `tel:${form.phone}`           : null },
              { label: 'Email',    value: form.email,           href: form.email           ? `mailto:${form.email}`        : null },
              { label: 'Website',  value: form.company_website, href: form.company_website || null, external: true },
              { label: 'Found at', value: form.ref_link,        href: form.ref_link        || null, external: true },
            ].map(({ label, value, href, external }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 5 }}>
                <span style={{ fontSize: 11, color: '#4a5a6b', fontWeight: 600, minWidth: 62, flexShrink: 0 }}>{label}</span>
                {value
                  ? <a href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} style={{ fontSize: 12, color: '#94a3b8', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</a>
                  : <span style={{ fontSize: 12, color: '#2d3f55' }}>—</span>}
              </div>
            ))}
          </div>
        )}
        <form onSubmit={submit}>
          <FInput label="Full Name" value={form.name} onChange={f('name')} placeholder="Rajesh Kumar" required />
          <FInput label="Phone" value={form.phone} onChange={f('phone')} placeholder="+91 XXXXX XXXXX" required />
          <FInput label="Email" value={form.email} onChange={f('email')} placeholder="contact@company.com" />
          <FInput label="Company" value={form.company} onChange={f('company')} placeholder="Company name" />
          <FInput label="Company Website" value={form.company_website} onChange={f('company_website')} placeholder="https://company.com" />
          <FInput label="Requirement" value={form.requirement} onChange={f('requirement')} placeholder="TMT Bars, Plates, etc." />
          <FInput label="Notes" value={form.notes} onChange={f('notes')} placeholder="Additional notes..." multiline rows={2} />
          <FSelect label="Lead Quality" value={form.quality} onChange={f('quality')} options={[{ value: 'hot', label: '🔥 Hot — Ready to buy' }, { value: 'warm', label: '✦ Warm — Interested' }, { value: 'cold', label: '❄ Cold — Early stage' }]} />
          <FSelect label="Status" value={form.status} onChange={f('status')} options={[{ value: 'new', label: 'New' }, { value: 'contacted', label: 'Contacted' }, { value: 'converted', label: 'Converted' }, { value: 'closed', label: 'Closed' }]} />
          <FSelect label="Type" value={form.type} onChange={f('type')} options={[{ value: 'inbound', label: 'Inbound (came to us)' }, { value: 'outbound', label: 'Outbound (we reached out)' }, { value: 'prospect', label: 'Prospect (manual entry)' }]} />
          <FInput label="Found at (Reference URL)" value={form.ref_link} onChange={f('ref_link')} placeholder="https://..." />
          <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
            <button type="submit" style={{ flex: 1, background: '#e87722', color: '#fff', border: 'none', borderRadius: 8, padding: '11px 0', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>{editId ? 'Save Changes' : 'Add Lead'}</button>
            <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, background: '#1e2d42', color: '#94a3b8', border: 'none', borderRadius: 8, padding: '11px 0', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

/* ─── Customers Tab ─── */
function CustomersTab({ customers, saveCustomers }) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', company: '', phone: '', city: '', products: '', notes: '' });
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState('');
  const f = k => v => setForm(p => ({ ...p, [k]: v }));
  const submit = e => {
    e.preventDefault();
    if (editId) { saveCustomers(customers.map(c => c.id === editId ? { ...c, ...form } : c)); }
    else { saveCustomers([...customers, { ...form, id: Date.now(), since: new Date().toLocaleDateString('en-IN') }]); }
    setShowModal(false); setEditId(null);
    setForm({ name: '', company: '', phone: '', city: '', products: '', notes: '' });
  };
  const openEdit = c => { setForm({ name: c.name, company: c.company || '', phone: c.phone, city: c.city || '', products: c.products || '', notes: c.notes || '' }); setEditId(c.id); setShowModal(true); };
  const del = id => { if (window.confirm('Delete this customer?')) saveCustomers(customers.filter(c => c.id !== id)); };
  const filtered = customers.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()) || c.company?.toLowerCase().includes(search.toLowerCase()) || c.city?.toLowerCase().includes(search.toLowerCase()));
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#e2e8f0', letterSpacing: '-0.02em' }}>Customer List</h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13 }}>Manage your existing customer relationships</p>
        </div>
        <button onClick={() => { setForm({ name: '', company: '', phone: '', city: '', products: '', notes: '' }); setEditId(null); setShowModal(true); }} style={{ background: '#e87722', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 22px', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 2px 8px rgba(232,119,34,0.3)' }}>+ Add Customer</button>
      </div>
      <div style={{ background: '#141e2e', borderRadius: 16, border: '1px solid #1e2d42', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e2d42' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers..." style={{ border: '1.5px solid #1e2d42', borderRadius: 8, padding: '8px 14px', fontSize: 14, width: 260, outline: 'none', background: '#0e1a2b', color: '#e2e8f0' }} />
        </div>
        {filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>◉</div>
            <div>{customers.length === 0 ? 'No customers yet. Add your first customer!' : 'No results found.'}</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ background: '#0d1726', borderBottom: '2px solid #1e2d42' }}>
              {['Name', 'Company', 'Phone', 'City', 'Products', 'Since', 'Actions'].map(h => <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: 11, color: '#4a5a6b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid #1a2538' }} onMouseEnter={e => e.currentTarget.style.background = '#1e2d42'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <td style={{ padding: '12px 16px', fontWeight: 600, color: '#e2e8f0', fontSize: 14 }}>{c.name}</td>
                  <td style={{ padding: '12px 16px', color: '#64748b', fontSize: 14 }}>{c.company || '—'}</td>
                  <td style={{ padding: '12px 16px', color: '#94a3b8', fontSize: 14 }}>{c.phone}</td>
                  <td style={{ padding: '12px 16px', color: '#64748b', fontSize: 14 }}>{c.city || '—'}</td>
                  <td style={{ padding: '12px 16px', color: '#64748b', fontSize: 13, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.products || '—'}</td>
                  <td style={{ padding: '12px 16px', color: '#4a5a6b', fontSize: 13 }}>{c.since}</td>
                  <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                    <button onClick={() => openEdit(c)} style={{ background: '#1e2d42', border: 'none', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontSize: 13, color: '#94a3b8', marginRight: 6 }}>Edit</button>
                    <button onClick={() => del(c.id)} style={{ background: 'rgba(220,38,38,0.12)', border: 'none', borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontSize: 13, color: '#f87171' }}>Del</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editId ? 'Edit Customer' : 'Add Customer'}>
        <form onSubmit={submit}>
          <FInput label="Full Name" value={form.name} onChange={f('name')} placeholder="Customer name" required />
          <FInput label="Company" value={form.company} onChange={f('company')} placeholder="Company / Firm name" />
          <FInput label="Phone" value={form.phone} onChange={f('phone')} placeholder="+91 XXXXX XXXXX" required />
          <FInput label="City" value={form.city} onChange={f('city')} placeholder="Pune, Mumbai, etc." />
          <FInput label="Products Interested" value={form.products} onChange={f('products')} placeholder="TMT Bars, MS Pipes, etc." />
          <FInput label="Notes" value={form.notes} onChange={f('notes')} placeholder="Notes..." multiline rows={2} />
          <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
            <button type="submit" style={{ flex: 1, background: '#e87722', color: '#fff', border: 'none', borderRadius: 8, padding: '11px 0', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>{editId ? 'Save Changes' : 'Add Customer'}</button>
            <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, background: '#1e2d42', color: '#94a3b8', border: 'none', borderRadius: 8, padding: '11px 0', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

/* ─── Products Admin Tab ─── */
function ProductsAdminTab({ draft, updateDraft }) {
  const [activeTab, setActiveTab] = useState('flat');
  const categories = ['flat', 'tubular', 'structural', 'roofing', 'accessories'];
  const catLabels = { flat: 'Flat Products', tubular: 'Tubular Products', structural: 'Structural Steel', roofing: 'Roofing & Sheets', accessories: 'Accessories & Others' };
  const addProduct = () => updateDraft(`products.${activeTab}`, [...(draft.products[activeTab] || []), { title: 'New Product', desc: 'Product description.', img: 'https://picsum.photos/seed/newproduct/480/280' }]);
  const removeProduct = i => { if (!window.confirm('Remove product?')) return; updateDraft(`products.${activeTab}`, draft.products[activeTab].filter((_, j) => j !== i)); };
  const updateProduct = (i, field, val) => updateDraft(`products.${activeTab}`, draft.products[activeTab].map((p, j) => j === i ? { ...p, [field]: val } : p));
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#e2e8f0', letterSpacing: '-0.02em' }}>Product List</h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13 }}>Edit product cards shown on the website</p>
        </div>
        <button onClick={addProduct} style={{ background: '#e87722', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 22px', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 2px 8px rgba(232,119,34,0.3)' }}>+ Add Product</button>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {categories.map(c => (
          <button key={c} onClick={() => setActiveTab(c)} style={{ padding: '8px 16px', borderRadius: 8, border: '1.5px solid', cursor: 'pointer', fontWeight: 600, fontSize: 13, borderColor: activeTab === c ? '#e87722' : '#1e2d42', background: activeTab === c ? 'rgba(232,119,34,0.12)' : '#141e2e', color: activeTab === c ? '#e87722' : '#64748b' }}>
            {catLabels[c]} ({(draft.products[c] || []).length})
          </button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {(draft.products[activeTab] || []).map((p, i) => (
          <div key={i} style={{ background: '#141e2e', borderRadius: 12, overflow: 'hidden', border: '1px solid #1e2d42' }}>
            <div style={{ position: 'relative' }}>
              <ImageUpload src={p.img} onChange={val => updateProduct(i, 'img', val)} height={140} />
              <button onClick={() => removeProduct(i)} style={{ position: 'absolute', top: 8, right: 8, background: '#dc2626', color: '#fff', border: 'none', borderRadius: 6, padding: '3px 10px', cursor: 'pointer', fontSize: 12, fontWeight: 600, zIndex: 5 }}>Remove</button>
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ marginBottom: 8, background: '#0d1726', borderRadius: 6, padding: '6px 10px', border: '1px solid #1e2d42' }}>
                <p style={{ margin: 0, fontSize: 10, color: '#4a5a6b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Image — hover to upload or change</p>
              </div>
              <div style={{ marginBottom: 8 }}>
                <label style={{ fontSize: 10, fontWeight: 700, color: '#4a5a6b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 3 }}>Name</label>
                <input value={p.title} onChange={e => updateProduct(i, 'title', e.target.value)} style={{ width: '100%', border: '1.5px solid #1e2d42', borderRadius: 6, padding: '6px 10px', fontSize: 14, fontWeight: 600, color: '#e2e8f0', background: '#0e1a2b', boxSizing: 'border-box', outline: 'none' }} />
              </div>
              <div>
                <label style={{ fontSize: 10, fontWeight: 700, color: '#4a5a6b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 3 }}>Description</label>
                <textarea value={p.desc} onChange={e => updateProduct(i, 'desc', e.target.value)} rows={2} style={{ width: '100%', border: '1.5px solid #1e2d42', borderRadius: 6, padding: '6px 10px', fontSize: 12, color: '#94a3b8', background: '#0e1a2b', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none' }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Editable Field ─── */
function EF({ value, onChange, multiline, fontSize = 15, fontWeight = 400, color = 'inherit', style = {}, placeholder, rows = 3 }) {
  const [focused, setFocused] = useState(false);
  const [hov, setHov] = useState(false);
  const { display, ...restStyle } = style;
  const base = {
    background: 'transparent',
    border: 'none',
    borderBottom: '1.5px solid transparent',
    outline: 'none',
    padding: '1px 0 3px',
    borderRadius: 0,
    fontFamily: 'inherit', color, fontSize, fontWeight,
    width: '100%', resize: 'none',
    transition: 'border-color 0.15s, background 0.15s',
    boxSizing: 'border-box', lineHeight: 'inherit',
    ...restStyle,
  };
  const hovStyle = hov && !focused ? { borderBottomColor: 'rgba(232,119,34,0.5)', background: 'rgba(232,119,34,0.04)' } : {};
  const focusStyle = focused ? { borderBottomColor: '#e87722', background: 'rgba(232,119,34,0.06)' } : {};
  const props = {
    value, onChange: e => onChange(e.target.value), placeholder,
    onMouseEnter: () => setHov(true), onMouseLeave: () => setHov(false),
    onFocus: () => setFocused(true), onBlur: () => setFocused(false),
    style: { ...base, ...hovStyle, ...focusStyle },
  };
  return (
    <div style={{ position: 'relative', display: display || 'block' }}>
      {multiline ? <textarea rows={rows} {...props} /> : <input {...props} />}
      {(hov || focused) && (
        <span style={{ position: 'absolute', top: 2, right: 2, fontSize: 9, color: focused ? '#e87722' : 'rgba(232,119,34,0.5)', pointerEvents: 'none', fontWeight: 700, background: 'rgba(255,255,255,0.85)', borderRadius: 3, padding: '1px 5px', lineHeight: 1.5, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{focused ? 'editing' : '✎ edit'}</span>
      )}
    </div>
  );
}

/* ─── Publish status message ─── */
function PublishStatus({ saved, dark }) {
  const c = dark ? 'rgba(255,255,255,0.6)' : '#64748b';
  if (!saved || saved === null) return null;
  const map = {
    saving: { color: '#f59e0b', text: 'Publishing…' },
    saved:  { color: '#22c55e', text: '✓ Live — changes are visible to everyone' },
    no_kv:  { color: '#f59e0b', text: '⚠ Database not connected yet — see instructions below' },
    error:  { color: '#ef4444', text: '✗ Publish failed — see error in browser console' },
  };
  const m = map[saved];
  if (!m) return null;
  return <span style={{ fontSize: 13, fontWeight: 600, color: m.color }}>{m.text}</span>;
}

/* ─── Image Upload Component ─── */
function ImageUpload({ src, onChange, height = 150 }) {
  const fileRef = useRef(null);
  const [hov, setHov] = useState(false);
  const [showUrl, setShowUrl] = useState(false);
  const [urlVal, setUrlVal] = useState('');

  // sync url input value when src changes externally
  useEffect(() => { setUrlVal(src || ''); }, [src]);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // reset so same file can be re-selected
    e.target.value = '';
    const reader = new FileReader();
    reader.onload = (ev) => {
      onChange(ev.target.result);
      setHov(false);
      setShowUrl(false);
    };
    reader.readAsDataURL(file);
  };

  const handleMouseLeave = () => {
    if (!showUrl) setHov(false);
  };

  return (
    <div
      style={{ position: 'relative', height, overflow: 'hidden', background: '#e2e8f0', flexShrink: 0 }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={handleMouseLeave}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'opacity 0.2s', opacity: hov ? 0.25 : 1 }}
      />

      {/* Overlay */}
      {hov && (
        <div
          style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12, background: 'rgba(26,42,74,0.88)' }}
          onMouseLeave={() => { setHov(false); setShowUrl(false); }}
        >
          {!showUrl ? (
            <>
              <button
                onClick={() => fileRef.current?.click()}
                style={{ background: '#e87722', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, width: '85%', justifyContent: 'center' }}
              >
                📁 Upload from Device
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setShowUrl(true); }}
                style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 8, padding: '7px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, width: '85%', justifyContent: 'center' }}
              >
                🔗 Use Image URL
              </button>
            </>
          ) : (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 6 }} onClick={e => e.stopPropagation()}>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 600, textAlign: 'center' }}>Paste image URL</div>
              <input
                autoFocus
                value={urlVal}
                onChange={e => setUrlVal(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { onChange(urlVal); setHov(false); setShowUrl(false); } if (e.key === 'Escape') { setShowUrl(false); } }}
                placeholder="https://example.com/image.jpg"
                style={{ width: '100%', border: '1.5px solid #e87722', borderRadius: 7, padding: '7px 10px', fontSize: 11, background: 'rgba(255,255,255,0.1)', color: '#fff', boxSizing: 'border-box', outline: 'none', textAlign: 'center' }}
              />
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => { onChange(urlVal); setHov(false); setShowUrl(false); }} style={{ flex: 1, background: '#e87722', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 0', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>Apply</button>
                <button onClick={() => setShowUrl(false)} style={{ flex: 1, background: 'rgba(255,255,255,0.12)', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 0', cursor: 'pointer', fontSize: 12 }}>Back</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
    </div>
  );
}

/* ─── Section Label Banner ─── */
function SectionBanner({ label, id }) {
  return (
    <div id={id} style={{ background: '#f8f9fb', borderTop: '1px solid #eef0f3', borderBottom: '1px solid #eef0f3', padding: '6px 48px', display: 'flex', alignItems: 'center', gap: 10, scrollMarginTop: 104, fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <div style={{ width: 3, height: 12, borderRadius: 2, background: '#f97316', flexShrink: 0 }} />
      <span style={{ fontSize: 10, fontWeight: 700, color: '#f97316', textTransform: 'uppercase', letterSpacing: '0.18em' }}>{label}</span>
      <span style={{ marginLeft: 'auto', fontSize: 10, color: '#c8d0da', letterSpacing: '0.03em', display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#c8d0da' }} />
        Hover any text or image to edit
      </span>
    </div>
  );
}

/* ─── Steel Brand Palettes (from brand proposal) ─── */
const STEEL_PALETTES = [
  {
    id: 'steel-midnight',
    name: 'Steel & Midnight',
    tagline: 'Strength, Authority & Precision',
    badge: 'INDUSTRIAL POWER',
    bestFor: 'Infrastructure, construction & government contracts',
    keywords: ['Authority', 'Trust', 'Precision', 'Corporate'],
    primary: '#4A6FA5', primaryDark: '#2D5585', secondary: '#1B2A3B', secondaryLight: '#243550',
    swatches: [
      { hex: '#1B2A3B', name: 'Midnight Navy', role: 'Primary / Brand' },
      { hex: '#4A6FA5', name: 'Steel Blue', role: 'Secondary / Accent' },
      { hex: '#8AAECF', name: 'Cold Chrome', role: 'Tertiary / Support' },
      { hex: '#D4D8DE', name: 'Polished Steel', role: 'Neutral / Background' },
      { hex: '#F5F7FA', name: 'Forge White', role: 'Base / Canvas' },
    ],
  },
  {
    id: 'molten-forge',
    name: 'Molten & Forge',
    tagline: 'Heat, Energy & Raw Industrial Power',
    badge: 'INDUSTRIAL HERITAGE',
    bestFor: 'Trade fairs, bold brand identity & marketing materials',
    keywords: ['Energy', 'Bold', 'Heritage', 'Powerful'],
    primary: '#B84B1A', primaryDark: '#8B3612', secondary: '#1A1A1A', secondaryLight: '#2A2A2A',
    swatches: [
      { hex: '#1A1A1A', name: 'Smelter Black', role: 'Primary / Brand' },
      { hex: '#B84B1A', name: 'Molten Iron', role: 'Secondary / Accent' },
      { hex: '#E87C35', name: 'Forge Glow', role: 'Tertiary / Support' },
      { hex: '#9E9EA0', name: 'Cast Grey', role: 'Neutral / Background' },
      { hex: '#F2F0ED', name: 'Ash White', role: 'Base / Canvas' },
    ],
  },
  {
    id: 'graphite-green',
    name: 'Graphite & Green',
    tagline: 'Reliability, Sustainability & Forward Progress',
    badge: 'SUSTAINABLE STRENGTH',
    bestFor: 'ESG-focused clients, green steel & sustainability reports',
    keywords: ['Sustainable', 'Future', 'Reliable', 'Green'],
    primary: '#3A7D5A', primaryDark: '#2B5E43', secondary: '#2C3E35', secondaryLight: '#3A4F43',
    swatches: [
      { hex: '#2C3E35', name: 'Deep Graphite', role: 'Primary / Brand' },
      { hex: '#3A7D5A', name: 'Industrial Green', role: 'Secondary / Accent' },
      { hex: '#72B08A', name: 'Eco Steel', role: 'Tertiary / Support' },
      { hex: '#A8B0AB', name: 'Raw Metal', role: 'Neutral / Background' },
      { hex: '#EDF2EF', name: 'Clean Air', role: 'Base / Canvas' },
    ],
  },
  {
    id: 'monochrome',
    name: 'Monochrome Steel',
    tagline: 'Precision, Innovation & Minimal Confidence',
    badge: 'MODERN PRECISION',
    bestFor: 'Advanced manufacturing, aerospace steel & tech clients',
    keywords: ['Premium', 'Innovation', 'Modern', 'Precise'],
    primary: '#5B4FCF', primaryDark: '#4638A8', secondary: '#0D0D0D', secondaryLight: '#1F1F1F',
    swatches: [
      { hex: '#0D0D0D', name: 'Carbon Black', role: 'Primary / Brand' },
      { hex: '#3B3B3B', name: 'Dark Steel', role: 'Secondary / Accent' },
      { hex: '#7A7A7A', name: 'Brushed Metal', role: 'Tertiary / Support' },
      { hex: '#C0C0C0', name: 'Silver Grade', role: 'Neutral / Background' },
      { hex: '#5B4FCF', name: 'Tech Accent', role: 'Base / Canvas' },
    ],
  },
];

const FONTS = [
  { value: 'Inter', label: 'Inter — Modern & Clean' },
  { value: 'Roboto', label: 'Roboto — Versatile & Professional' },
  { value: 'Poppins', label: 'Poppins — Geometric & Friendly' },
  { value: 'Montserrat', label: 'Montserrat — Bold & Contemporary' },
  { value: 'Open Sans', label: 'Open Sans — Readable & Neutral' },
  { value: 'Raleway', label: 'Raleway — Elegant & Refined' },
  { value: 'Oswald', label: 'Oswald — Strong & Impactful' },
  { value: 'Barlow', label: 'Barlow — Industrial & Modern' },
  { value: 'Lato', label: 'Lato — Professional & Clear' },
  { value: 'Nunito', label: 'Nunito — Rounded & Approachable' },
];

/* ─── Theme Tab ─── */
const PRESETS = [
  { name: 'Steel & Midnight', primary: '#4A6FA5', primaryDark: '#2D5585', secondary: '#1B2A3B', secondaryLight: '#243550' },
  { name: 'Molten & Forge',   primary: '#B84B1A', primaryDark: '#8B3612', secondary: '#1A1A1A', secondaryLight: '#2A2A2A' },
  { name: 'Graphite & Green', primary: '#3A7D5A', primaryDark: '#2B5E43', secondary: '#2C3E35', secondaryLight: '#3A4F43' },
  { name: 'Monochrome Steel', primary: '#5B4FCF', primaryDark: '#4638A8', secondary: '#0D0D0D', secondaryLight: '#1F1F1F' },
  { name: 'Steel Orange',     primary: '#e87722', primaryDark: '#c96310', secondary: '#1a2a4a', secondaryLight: '#243557' },
  { name: 'Royal Blue',       primary: '#2563eb', primaryDark: '#1d4ed8', secondary: '#0f172a', secondaryLight: '#1e293b' },
  { name: 'Forest Green',     primary: '#16a34a', primaryDark: '#15803d', secondary: '#14532d', secondaryLight: '#166534' },
  { name: 'Deep Purple',      primary: '#7c3aed', primaryDark: '#6d28d9', secondary: '#1e1b4b', secondaryLight: '#312e81' },
];

function ThemeTab({ draft, updateDraft, publish, saved }) {
  const theme = draft?.theme || PRESETS[0];

  function applyPreset(preset) {
    updateDraft('theme.primary', preset.primary);
    updateDraft('theme.primaryDark', preset.primaryDark);
    updateDraft('theme.secondary', preset.secondary);
    updateDraft('theme.secondaryLight', preset.secondaryLight);
    // Live preview immediately
    document.documentElement.style.setProperty('--orange', preset.primary);
    document.documentElement.style.setProperty('--orange-dark', preset.primaryDark);
    document.documentElement.style.setProperty('--navy', preset.secondary);
    document.documentElement.style.setProperty('--navy-light', preset.secondaryLight);
  }

  function handleColor(key, cssVar, value) {
    updateDraft(`theme.${key}`, value);
    document.documentElement.style.setProperty(cssVar, value);
  }

  const isActive = (p) => p.primary === theme.primary && p.secondary === theme.secondary;

  return (
    <div>
      <h2 style={{ color: '#e2e8f0', margin: '0 0 6px', fontSize: 24 }}>Theme & Colours</h2>
      <p style={{ color: '#64748b', fontSize: 13, marginBottom: 32 }}>Changes apply instantly for preview. Click <strong style={{ color: '#94a3b8' }}>Publish Changes</strong> in the Edit Website tab to go live.</p>

      {/* Preset themes */}
      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#94a3b8', marginBottom: 16 }}>Preset Themes</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 12, marginBottom: 40 }}>
        {PRESETS.map(p => (
          <button key={p.name} onClick={() => applyPreset(p)} style={{
            border: isActive(p) ? `3px solid ${p.primary}` : '2px solid #1e2d42',
            borderRadius: 14, overflow: 'hidden', cursor: 'pointer', background: '#141e2e',
            boxShadow: isActive(p) ? `0 4px 16px ${p.primary}44` : 'none',
            transition: 'all 0.15s', padding: 0,
          }}>
            <div style={{ display: 'flex', height: 56 }}>
              <div style={{ flex: 1, background: p.secondary }} />
              <div style={{ flex: 1, background: p.primary }} />
            </div>
            <div style={{ padding: '10px 12px', textAlign: 'left' }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#e2e8f0' }}>{p.name}</div>
              {isActive(p) && <div style={{ fontSize: 11, color: p.primary, fontWeight: 600, marginTop: 2 }}>✓ Active</div>}
            </div>
          </button>
        ))}
      </div>

      {/* Custom pickers */}
      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#94a3b8', marginBottom: 16 }}>Custom Colours</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Accent / Primary', key: 'primary', cssVar: '--orange', desc: 'Buttons, highlights, badges' },
          { label: 'Accent Dark', key: 'primaryDark', cssVar: '--orange-dark', desc: 'Button hover state' },
          { label: 'Dark / Secondary', key: 'secondary', cssVar: '--navy', desc: 'Navbar, headings, footer' },
          { label: 'Secondary Light', key: 'secondaryLight', cssVar: '--navy-light', desc: 'Sidebar, dark backgrounds' },
        ].map(({ label, key, cssVar, desc }) => (
          <div key={key} style={{ background: '#141e2e', borderRadius: 12, padding: '18px 20px', border: '1px solid #1e2d42' }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#e2e8f0', marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12 }}>{desc}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                type="color"
                value={theme[key] || '#000000'}
                onChange={e => handleColor(key, cssVar, e.target.value)}
                style={{ width: 44, height: 44, border: '2px solid #1e2d42', borderRadius: 8, cursor: 'pointer', padding: 2, background: 'none' }}
              />
              <div>
                <div style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 700, color: '#94a3b8' }}>{theme[key] || '#000000'}</div>
                <div style={{ fontSize: 11, color: '#64748b' }}>Click to change</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Live preview strip */}
      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#94a3b8', marginBottom: 16 }}>Live Preview</h3>
      <div style={{ borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.1)' }}>
        <div style={{ background: theme.secondary, padding: '14px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: theme.primary }} />
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 14, letterSpacing: '0.08em' }}>NAMO STEEL</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            {['About', 'Products', 'Contact'].map(l => <span key={l} style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>{l}</span>)}
            <span style={{ background: theme.primary, color: '#fff', borderRadius: 20, padding: '4px 14px', fontSize: 12, fontWeight: 700 }}>Contact Us</span>
          </div>
        </div>
        <div style={{ background: '#f8fafc', padding: '28px 24px', display: 'flex', gap: 16, alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-block', background: `${theme.primary}20`, color: theme.primary, borderRadius: 99, padding: '4px 14px', fontSize: 11, fontWeight: 700, marginBottom: 8 }}>SINCE 1995</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: theme.secondary, lineHeight: 1.2, marginBottom: 12 }}>Steel Solutions for<br /><span style={{ color: theme.primary }}>Solid Foundations.</span></div>
            <button style={{ background: theme.primary, color: '#fff', border: 'none', borderRadius: 24, padding: '10px 24px', fontWeight: 700, fontSize: 13, cursor: 'default' }}>Explore Products →</button>
          </div>
        </div>
      </div>

      {/* Publish bar */}
      <div style={{ marginTop: 32, background: '#1a2a4a', borderRadius: 14, padding: '20px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <div style={{ fontWeight: 700, color: '#fff', fontSize: 15 }}>Publish Theme</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>Makes your chosen colours live for all visitors instantly.</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <PublishStatus saved={saved} dark />
          <button
            onClick={publish}
            disabled={saved === 'saving'}
            style={{ background: saved === 'saved' ? '#22c55e' : theme.primary, color: '#fff', border: 'none', borderRadius: 10, padding: '12px 32px', fontWeight: 700, fontSize: 14, cursor: saved === 'saving' ? 'wait' : 'pointer', whiteSpace: 'nowrap', transition: 'background 0.2s' }}
          >
            {saved === 'saving' ? 'Publishing…' : saved === 'saved' ? '✓ Live!' : 'Publish Theme →'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Branding Tab ─── */
function BrandingTab({ draft, updateDraft, publish, saved }) {
  const theme = draft?.theme || {};
  const branding = draft?.branding || {};
  const selectedPaletteId = branding.selectedPalette || 'steel-midnight';

  function applyPalette(palette) {
    updateDraft('branding.selectedPalette', palette.id);
    updateDraft('theme.primary', palette.primary);
    updateDraft('theme.primaryDark', palette.primaryDark);
    updateDraft('theme.secondary', palette.secondary);
    updateDraft('theme.secondaryLight', palette.secondaryLight);
    document.documentElement.style.setProperty('--orange', palette.primary);
    document.documentElement.style.setProperty('--orange-dark', palette.primaryDark);
    document.documentElement.style.setProperty('--navy', palette.secondary);
    document.documentElement.style.setProperty('--navy-light', palette.secondaryLight);
  }

  function handleColor(key, cssVar, value) {
    updateDraft(`theme.${key}`, value);
    document.documentElement.style.setProperty(cssVar, value);
  }

  function handleFont(key, value) {
    updateDraft(`branding.${key}`, value);
    if (value && value !== 'Inter') {
      const id = `gfont-${value.replace(/\s+/g, '-')}`;
      if (!document.getElementById(id)) {
        const link = document.createElement('link');
        link.id = id; link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(value)}:wght@400;500;600;700;900&display=swap`;
        document.head.appendChild(link);
      }
    }
    const prop = key === 'headingFont' ? '--font-heading' : '--font-body';
    document.documentElement.style.setProperty(prop, `'${value}', system-ui, sans-serif`);
  }

  const activePalette = STEEL_PALETTES.find(p => p.id === selectedPaletteId) || STEEL_PALETTES[0];

  return (
    <div>
      <h2 style={{ color: '#e2e8f0', margin: '0 0 6px', fontSize: 24 }}>Brand Identity</h2>
      <p style={{ color: '#64748b', fontSize: 13, marginBottom: 36 }}>Manage your brand's visual identity — colour palette, typography, and logo. Publish to go live.</p>

      {/* ── LOGO ── */}
      <section style={{ marginBottom: 44 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#94a3b8', marginBottom: 4, marginTop: 0 }}>Logo</h3>
        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16, marginTop: 0 }}>Upload a logo via URL or use a text-based logo displayed in the navbar and footer.</p>
        <div style={{ background: '#141e2e', borderRadius: 14, padding: '24px 28px', border: '1px solid #1e2d42', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Logo Image URL (optional)</label>
            <input
              type="url"
              value={branding.logoUrl || ''}
              onChange={e => updateDraft('branding.logoUrl', e.target.value)}
              placeholder="https://example.com/logo.png"
              style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #1e2d42', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none', marginBottom: 14, background: '#0e1a2b', color: '#e2e8f0' }}
            />
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Brand Name (text fallback)</label>
            <input
              type="text"
              value={branding.logoText || draft?.footer?.brandName || 'NAMO STEEL'}
              onChange={e => updateDraft('branding.logoText', e.target.value)}
              placeholder="NAMO STEEL"
              style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #1e2d42', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none', background: '#0e1a2b', color: '#e2e8f0' }}
            />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Navbar Preview</div>
            <div style={{ background: theme.secondary || '#1B2A3B', borderRadius: 10, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 10 }}>
              {branding.logoUrl
                ? <NextImage unoptimized src={branding.logoUrl} alt="Logo" width={80} height={30} style={{ height: 30, width: 'auto', objectFit: 'contain' }} />
                : <>
                    <div style={{ width: 26, height: 26, borderRadius: 6, background: theme.primary || '#4A6FA5', flexShrink: 0 }} />
                    <span style={{ color: '#fff', fontWeight: 900, fontSize: 14, letterSpacing: '0.08em' }}>{branding.logoText || draft?.footer?.brandName || 'NAMO STEEL'}</span>
                  </>
              }
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 12 }}>
                {['About', 'Products', 'Contact'].map(l => <span key={l} style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12 }}>{l}</span>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TYPOGRAPHY ── */}
      <section style={{ marginBottom: 44 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#94a3b8', marginBottom: 4, marginTop: 0 }}>Typography</h3>
        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 16, marginTop: 0 }}>Select fonts for headings and body text. Fonts load from Google Fonts automatically.</p>
        <div style={{ background: '#141e2e', borderRadius: 14, padding: '24px 28px', border: '1px solid #1e2d42' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
            {[
              { key: 'headingFont', label: 'Heading Font', desc: 'Titles and section headers' },
              { key: 'bodyFont', label: 'Body Font', desc: 'Paragraphs and descriptions' },
            ].map(({ key, label, desc }) => (
              <div key={key}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</label>
                <div style={{ fontSize: 11, color: '#4a5a6b', marginBottom: 8 }}>{desc}</div>
                <select
                  value={branding[key] || 'Inter'}
                  onChange={e => handleFont(key, e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', border: '1.5px solid #1e2d42', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none', background: '#0e1a2b', color: '#e2e8f0', cursor: 'pointer' }}
                >
                  {FONTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
              </div>
            ))}
          </div>
          <div style={{ background: '#0d1726', borderRadius: 10, padding: '20px 24px', border: '1px solid #1e2d42' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#4a5a6b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Font Preview</div>
            <div style={{ fontFamily: `'${branding.headingFont || 'Inter'}', system-ui, sans-serif`, fontSize: 20, fontWeight: 700, color: '#e2e8f0', marginBottom: 6 }}>Steel Solutions for Solid Foundations</div>
            <div style={{ fontFamily: `'${branding.bodyFont || 'Inter'}', system-ui, sans-serif`, fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>Trusted dealers in construction and industrial steel products, serving the industry for over 30 years. Known for quality, reliability, and competitive pricing.</div>
          </div>
        </div>
      </section>

      {/* ── COLOUR PALETTES ── */}
      <section style={{ marginBottom: 44 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#94a3b8', marginBottom: 4, marginTop: 0 }}>Brand Colour Palette</h3>
        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20, marginTop: 0 }}>Four curated palettes for your steel brand identity. Select one, then fine-tune individual colours below.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20, marginBottom: 28 }}>
          {STEEL_PALETTES.map(palette => {
            const isSelected = selectedPaletteId === palette.id;
            return (
              <div key={palette.id} style={{ background: '#141e2e', borderRadius: 16, overflow: 'hidden', border: isSelected ? `3px solid ${palette.primary}` : '2px solid #1e2d42', boxShadow: isSelected ? `0 6px 24px ${palette.primary}33` : 'none', transition: 'all 0.2s' }}>
                <div style={{ background: palette.secondary, padding: '8px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: palette.primary, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{palette.badge}</span>
                  {isSelected && <span style={{ fontSize: 10, fontWeight: 700, color: '#fff', background: palette.primary, borderRadius: 99, padding: '2px 8px' }}>✓ Active</span>}
                </div>
                <div style={{ display: 'flex', height: 60 }}>
                  {palette.swatches.map((s, i) => <div key={i} style={{ flex: 1, background: s.hex }} title={`${s.name}: ${s.hex}`} />)}
                </div>
                <div style={{ padding: '16px 20px' }}>
                  <div style={{ fontSize: 17, fontWeight: 800, color: '#e2e8f0', marginBottom: 2 }}>{palette.name}</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 10 }}>{palette.tagline}</div>
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 12 }}>
                    {palette.keywords.map(k => <span key={k} style={{ background: `${palette.primary}18`, color: palette.primary, fontSize: 10, fontWeight: 600, borderRadius: 99, padding: '2px 8px', border: `1px solid ${palette.primary}30` }}>{k}</span>)}
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                    {palette.swatches.map((s, i) => (
                      <div key={i} style={{ textAlign: 'center', flex: 1 }}>
                        <div style={{ width: 18, height: 18, borderRadius: '50%', background: s.hex, margin: '0 auto 3px', border: '1.5px solid rgba(0,0,0,0.1)' }} />
                        <div style={{ fontSize: 8, color: '#94a3b8', lineHeight: 1.2, fontFamily: 'monospace' }}>{s.hex}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginBottom: 12, borderTop: '1px solid #1e2d42', paddingTop: 8 }}>
                    Best for: <span style={{ color: '#94a3b8', fontWeight: 500 }}>{palette.bestFor}</span>
                  </div>
                  <button
                    onClick={() => applyPalette(palette)}
                    style={{ width: '100%', background: isSelected ? palette.primary : '#1e2d42', color: isSelected ? '#fff' : '#64748b', border: `2px solid ${isSelected ? palette.primary : '#1e2d42'}`, borderRadius: 8, padding: '10px', fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all 0.15s' }}
                  >
                    {isSelected ? '✓ Selected' : 'Select This Palette'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Fine-tune colours */}
        <div style={{ background: '#141e2e', borderRadius: 14, padding: '24px 28px', border: `2px solid ${activePalette.primary}33` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: activePalette.primary, flexShrink: 0 }} />
            <div style={{ fontSize: 14, fontWeight: 700, color: '#e2e8f0' }}>Fine-tune: {activePalette.name}</div>
            <div style={{ fontSize: 12, color: '#64748b' }}>— adjust individual colours below</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
            {[
              { label: 'Accent / Buttons', key: 'primary', cssVar: '--orange', desc: 'Buttons, badges, highlights' },
              { label: 'Accent Dark (Hover)', key: 'primaryDark', cssVar: '--orange-dark', desc: 'Button hover & active states' },
              { label: 'Dark Background', key: 'secondary', cssVar: '--navy', desc: 'Navbar, headings, footer' },
              { label: 'Mid Dark', key: 'secondaryLight', cssVar: '--navy-light', desc: 'Sidebar, dark card sections' },
            ].map(({ label, key, cssVar, desc }) => (
              <div key={key} style={{ background: '#0d1726', borderRadius: 10, padding: '14px 16px', border: '1px solid #1e2d42' }}>
                <div style={{ fontWeight: 700, fontSize: 12, color: '#e2e8f0', marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 11, color: '#64748b', marginBottom: 10 }}>{desc}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input type="color" value={theme[key] || '#000000'} onChange={e => handleColor(key, cssVar, e.target.value)} style={{ width: 40, height: 40, border: '2px solid #1e2d42', borderRadius: 8, cursor: 'pointer', padding: 2, background: 'none' }} />
                  <div>
                    <div style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 700, color: '#94a3b8' }}>{theme[key] || '#000000'}</div>
                    <div style={{ fontSize: 10, color: '#64748b' }}>Click to change</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Publish bar */}
      <div style={{ background: '#1a2a4a', borderRadius: 14, padding: '20px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <div style={{ fontWeight: 700, color: '#fff', fontSize: 15 }}>Publish Brand Identity</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>Makes your chosen palette, fonts, and logo live for all visitors instantly.</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <PublishStatus saved={saved} dark />
          <button
            onClick={publish}
            disabled={saved === 'saving'}
            style={{ background: saved === 'saved' ? '#22c55e' : (theme.primary || '#4A6FA5'), color: '#fff', border: 'none', borderRadius: 10, padding: '12px 32px', fontWeight: 700, fontSize: 14, cursor: saved === 'saving' ? 'wait' : 'pointer', whiteSpace: 'nowrap', transition: 'background 0.2s' }}
          >
            {saved === 'saving' ? 'Publishing…' : saved === 'saved' ? '✓ Live!' : 'Publish Brand →'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Companies Tab ─── */
function CompaniesTab() {
  const [companies, setCompanies] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', slug: '', email: '', password: '', industry: '' });
  const [slugError, setSlugError] = useState('');

  useEffect(() => {
    fetch('/api/companies').then(r => r.json()).then(data => { if (Array.isArray(data)) setCompanies(data); });
  }, []);

  const f = k => v => {
    setForm(p => ({ ...p, [k]: v }));
    if (k === 'name' && !editId) setForm(p => ({ ...p, [k]: v, slug: v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }));
  };

  const submit = async e => {
    e.preventDefault();
    setSlugError('');
    if (editId) {
      await fetch('/api/companies', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editId, ...form }) });
      setCompanies(prev => prev.map(c => c.id === editId ? { ...c, ...form } : c));
    } else {
      const res = await fetch('/api/companies', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (data.error === 'SLUG_TAKEN') { setSlugError('This company ID is already taken. Choose another.'); return; }
      if (data.id) setCompanies(prev => [data, ...prev]);
    }
    setShowModal(false); setEditId(null);
    setForm({ name: '', slug: '', email: '', password: '', industry: '' });
  };

  const openAdd = () => { setForm({ name: '', slug: '', email: '', password: '', industry: '' }); setEditId(null); setSlugError(''); setShowModal(true); };
  const openEdit = c => { setForm({ name: c.name, slug: c.slug, email: c.email || '', password: '', industry: c.industry || '' }); setEditId(c.id); setSlugError(''); setShowModal(true); };
  const del = async id => {
    if (window.confirm('Delete this company? They will lose access.')) {
      await fetch(`/api/companies?id=${id}`, { method: 'DELETE' });
      setCompanies(prev => prev.filter(c => c.id !== id));
    }
  };

  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#e2e8f0', letterSpacing: '-0.02em' }}>Company Profiles</h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13 }}>Each company gets a unique URL to access their own portal.</p>
        </div>
        <button onClick={openAdd} style={{ background: '#e87722', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 22px', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 2px 8px rgba(232,119,34,0.3)' }}>+ Add Company</button>
      </div>
      <div style={{ marginBottom: 24 }} />

      {companies.length === 0 ? (
        <div style={{ background: '#141e2e', borderRadius: 12, padding: 48, textAlign: 'center', border: '1px solid #1e2d42', color: '#64748b' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🏢</div>
          <div>No companies yet. Click <strong style={{ color: '#e87722' }}>+ Add Company</strong> to onboard one.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {companies.map(c => (
            <div key={c.id} style={{ background: '#141e2e', borderRadius: 14, padding: '22px 24px', border: '1px solid #1e2d42' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 10, background: '#e87722', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 900, color: '#fff', flexShrink: 0 }}>
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: 15 }}>{c.name}</div>
                    {c.industry && <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{c.industry}</div>}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => openEdit(c)} style={{ background: '#1e2d42', border: 'none', borderRadius: 6, padding: '5px 10px', fontSize: 12, cursor: 'pointer', color: '#94a3b8' }}>Edit</button>
                  <button onClick={() => del(c.id)} style={{ background: 'rgba(220,38,38,0.12)', border: 'none', borderRadius: 6, padding: '5px 10px', fontSize: 12, cursor: 'pointer', color: '#f87171' }}>Del</button>
                </div>
              </div>

              <div style={{ background: '#0d1726', borderRadius: 8, padding: '10px 14px', marginBottom: 12, border: '1px solid #1e2d42' }}>
                <div style={{ fontSize: 11, color: '#4a5a6b', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Portal URL</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 13, color: '#e87722', fontWeight: 600 }}>{origin}/{c.slug}</span>
                  <button onClick={() => navigator.clipboard.writeText(`${origin}/${c.slug}`)}
                    style={{ background: '#e87722', color: '#fff', border: 'none', borderRadius: 5, padding: '3px 10px', fontSize: 11, cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    Copy
                  </button>
                </div>
              </div>

              {c.email && <div style={{ fontSize: 13, color: '#64748b' }}>✉ {c.email}</div>}
            </div>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editId ? 'Edit Company' : 'Add Company'}>
        <form onSubmit={submit}>
          <FInput label="Company Name" value={form.name} onChange={f('name')} placeholder="Omkar Industries" required />
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Company ID (URL slug)</label>
            <div style={{ display: 'flex', alignItems: 'center', border: `1.5px solid ${slugError ? '#fca5a5' : '#1e2d42'}`, borderRadius: 8, overflow: 'hidden' }}>
              <span style={{ padding: '8px 10px', background: '#0d1726', fontSize: 14, color: '#4a5a6b', borderRight: '1px solid #1e2d42' }}>site.com/</span>
              <input value={form.slug} onChange={e => { setForm(p => ({ ...p, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })); setSlugError(''); }}
                placeholder="omkar-industries" required
                style={{ flex: 1, padding: '8px 12px', border: 'none', fontSize: 14, outline: 'none', fontFamily: 'monospace', background: '#0e1a2b', color: '#e2e8f0' }} />
            </div>
            {slugError && <div style={{ fontSize: 12, color: '#f87171', marginTop: 4 }}>{slugError}</div>}
          </div>
          <FInput label="Email" value={form.email} onChange={f('email')} placeholder="contact@company.com" />
          <FInput label="Industry" value={form.industry} onChange={f('industry')} placeholder="Steel Fabrication, Construction…" />
          <FInput label={editId ? 'New Password (leave blank to keep)' : 'Password'} value={form.password} onChange={f('password')} placeholder="Set access password" required={!editId} />
          <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
            <button type="submit" style={{ flex: 1, background: '#e87722', color: '#fff', border: 'none', borderRadius: 8, padding: '11px 0', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>{editId ? 'Save Changes' : 'Create Company'}</button>
            <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, background: '#1e2d42', color: '#94a3b8', border: 'none', borderRadius: 8, padding: '11px 0', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

/* ─── Edit Website Tab ─── */
function EditWebsiteTab({ draft, updateDraft, publish, saved }) {
  const [productTab, setProductTab] = useState('flat');
  const [activeSection, setActiveSection] = useState('ew-hero');
  const [showBar, setShowBar] = useState(false);
  const up = path => val => updateDraft(path, val);

  const scrollToSection = (id) => {
    setActiveSection(id);
    setShowBar(true);
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
    setTimeout(() => setShowBar(false), 1000);
  };

  const updateListItem = (path, i, field, val) => {
    const arr = path.split('.').reduce((o, k) => o[k], draft);
    updateDraft(path, arr.map((it, j) => j === i ? { ...it, [field]: val } : it));
  };

  const catLabels = { flat: 'Flat Products', tubular: 'Tubular Products', structural: 'Structural Steel', roofing: 'Roofing & Sheets', accessories: 'Accessories & Others' };

  /* Inline section-label style mirrors .section-label CSS class */
  const slStyle = { display: 'inline-block', background: 'rgba(74,111,165,0.1)', color: 'var(--orange)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', padding: '5px 14px', borderRadius: 3, marginBottom: 12, borderLeft: '3px solid var(--orange)', width: 'auto' };
  const slDark  = { ...slStyle, background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' };

  return (
    <div style={{ margin: '-32px -36px', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* DB setup notice */}
      {saved === 'no_kv' && (
        <div style={{ background: '#fefce8', borderBottom: '2px solid #fbbf24', padding: '14px 32px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 22 }}>⚠️</span>
          <div>
            <div style={{ fontWeight: 700, color: '#92400e', marginBottom: 6, fontSize: 15 }}>One-time Supabase setup needed (1 min)</div>
            <div style={{ fontSize: 13, color: '#78350f', lineHeight: 1.8 }}>
              <b>1.</b> Go to <b>supabase.com → your project → Project Settings → Integrations → Vercel</b><br/>
              <b>2.</b> Click <b>Connect Project</b> and select your Vercel project<br/>
              <b>3.</b> Vercel auto-adds the <b>POSTGRES_URL</b> env var. The project will redeploy automatically.<br/>
              <b>4.</b> Come back and click <b>Publish Changes</b> — it will work permanently from here.
            </div>
          </div>
        </div>
      )}

      {/* ── Loading Bar ── */}
      {showBar && (
        <div style={{ position: 'fixed', top: 0, left: 220, right: 0, height: 3, zIndex: 200, overflow: 'hidden', pointerEvents: 'none' }}>
          <div style={{ height: '100%', background: 'linear-gradient(90deg, #f97316, #fb923c)', animation: 'ns-bar 0.9s ease-out forwards', borderRadius: '0 2px 2px 0' }} />
        </div>
      )}

      {/* ── Sticky Top Bar ── */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: '#0d1b2e', height: 52, padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1e2d42', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, fontWeight: 400 }}>Admin</span>
          <span style={{ color: 'rgba(255,255,255,0.18)', fontSize: 14 }}>/</span>
          <span style={{ fontWeight: 800, color: '#fff', fontSize: 14, fontFamily: "'Barlow Condensed', system-ui, sans-serif", letterSpacing: '0.1em', textTransform: 'uppercase' }}>EDIT WEBSITE</span>
          <span style={{ background: '#22c55e', color: '#fff', borderRadius: 4, padding: '2px 8px', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: '#fff', opacity: 0.85 }} />
            LIVE
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <PublishStatus saved={saved} dark />
          <a href="/" target="_blank" rel="noopener" style={{ padding: '7px 14px', background: 'transparent', color: 'rgba(255,255,255,0.55)', borderRadius: 7, fontSize: 12, fontWeight: 500, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.14)', display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'}
          >
            <ExternalLink size={12} /> Preview
          </a>
          <button onClick={publish} disabled={saved === 'saving'} style={{ background: saved === 'saved' ? '#22c55e' : '#f97316', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', fontWeight: 700, fontSize: 13, cursor: saved === 'saving' ? 'wait' : 'pointer', transition: 'background 0.2s', animation: !saved || saved === null ? 'ns-pulse 2.5s ease-in-out infinite' : 'none', boxShadow: !saved || saved === null ? '0 0 0 0 rgba(249,115,22,0.4)' : 'none' }}>
            {saved === 'saving' ? 'Publishing…' : saved === 'saved' ? '✓ Published!' : 'Publish Changes'}
          </button>
        </div>
      </div>

      {/* ── Section Tab Nav ── */}
      <div style={{ position: 'sticky', top: 52, zIndex: 49, background: '#fff', borderBottom: '1px solid #f0f0f0', padding: '0 20px', display: 'flex', gap: 0, overflowX: 'auto' }}>
        {[
          { id: 'ew-navbar', label: 'Navbar' },
          { id: 'ew-hero', label: 'Hero' },
          { id: 'ew-categories', label: 'Categories' },
          { id: 'ew-about', label: 'About' },
          { id: 'ew-why', label: 'Why Us' },
          { id: 'ew-certs', label: 'Certifications' },
          { id: 'ew-services', label: 'Services' },
          { id: 'ew-products', label: 'Products' },
          { id: 'ew-brands', label: 'Brands' },
          { id: 'ew-cases', label: 'Case Studies' },
          { id: 'ew-clients', label: 'Clients' },
          { id: 'ew-contact', label: 'Contact' },
          { id: 'ew-footer', label: 'Footer' },
        ].map(s => {
          const isActive = activeSection === s.id;
          return (
            <button key={s.id} onClick={() => scrollToSection(s.id)}
              style={{ position: 'relative', padding: '12px 14px', background: 'none', border: 'none', borderBottom: `2.5px solid ${isActive ? '#f97316' : 'transparent'}`, cursor: 'pointer', fontSize: 12, fontWeight: isActive ? 700 : 500, color: isActive ? '#f97316' : '#94a3b8', whiteSpace: 'nowrap', letterSpacing: '0.02em', transition: 'color 0.15s, border-color 0.2s', fontFamily: "'DM Sans', system-ui, sans-serif" }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.color = '#475569'; } }}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.color = '#94a3b8'; } }}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Hint bar */}
      <div style={{ background: '#fffbf5', borderBottom: '1.5px solid #fed7aa', padding: '7px 32px', fontSize: 12, color: '#92400e', display: 'flex', gap: 8, alignItems: 'center' }}>
        <span>✎</span>
        <span>Hover any <strong>text</strong> to edit inline — hover any <strong>image</strong> to replace it — click <strong>+</strong> to add or <strong>×</strong> to remove items</span>
      </div>

      {/* ════════ NAVBAR ════════ */}
      <SectionBanner label="Navbar" id="ew-navbar" />
      <header className="nav" style={{ position: 'relative', zIndex: 1 }}>
        <div className="nav-accent-line" />
        <div className="container nav-inner">
          <div className="logo">
            <div style={{ width: 36, height: 36, background: 'var(--orange)', borderRadius: 6, flexShrink: 0 }} />
            <div className="logo-text">
              <EF value={draft.branding?.logoText || 'NAMO STEEL'} onChange={up('branding.logoText')} fontSize={13} fontWeight={900} color="var(--white)" style={{ letterSpacing: '0.08em', display: 'inline-block', width: 'auto', lineHeight: 1.1 }} />
              <EF value={draft.navbar?.logoTagline || 'The Steel Hub'} onChange={up('navbar.logoTagline')} fontSize={10} fontWeight={500} color="var(--orange)" style={{ letterSpacing: '0.06em', textTransform: 'uppercase', display: 'inline-block', width: 'auto', lineHeight: 1.1, marginTop: 2 }} />
            </div>
          </div>
          <nav className="nav-links">
            {(draft.navbar?.navLinks || []).map((link, i) => (
              <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                <EF value={link.label} onChange={val => updateDraft('navbar.navLinks', (draft.navbar?.navLinks || []).map((l, j) => j === i ? { ...l, label: val } : l))} fontSize={13} fontWeight={500} color="rgba(255,255,255,0.65)" style={{ display: 'inline-block', width: 'auto', letterSpacing: '0.03em' }} />
                <button onClick={() => updateDraft('navbar.navLinks', (draft.navbar?.navLinks || []).filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: 'rgba(255,100,100,0.7)', cursor: 'pointer', fontSize: 14, padding: 0, lineHeight: 1, flexShrink: 0 }}>×</button>
              </span>
            ))}
            <button onClick={() => updateDraft('navbar.navLinks', [...(draft.navbar?.navLinks || []), { href: '#new', label: 'New Link' }])} style={{ background: 'none', border: '1px dashed rgba(255,255,255,0.3)', borderRadius: 3, padding: '4px 10px', cursor: 'pointer', fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>+</button>
            <EF value={draft.navbar?.ctaLabel || 'Contact Us'} onChange={up('navbar.ctaLabel')} fontSize={12} fontWeight={700} color="var(--white)" style={{ display: 'inline-block', background: 'var(--orange)', padding: '9px 20px', borderRadius: 4, letterSpacing: '0.04em', width: 'auto' }} />
          </nav>
        </div>
      </header>

      {/* ════════ HERO ════════ */}
      <SectionBanner label="Hero Section" id="ew-hero" />
      <section className="hero" style={{ minHeight: 'auto', paddingBottom: 40 }}>
        <div className="hero-grid" />
        <div className="container">
          <div className="hero-split" style={{ minHeight: 'auto', paddingTop: 40, paddingBottom: 40 }}>
            <div className="hero-content" style={{ paddingTop: 0 }}>
              <div className="hero-eyebrow">
                <EF value={draft.hero.badge} onChange={up('hero.badge')} fontSize={11} fontWeight={800} color="var(--orange)" style={{ letterSpacing: '0.2em', textTransform: 'uppercase', display: 'inline-block', width: 'auto' }} />
                <span className="hero-sep">—</span>
                <span className="hero-sub-tag">Iron &amp; Steel Merchants</span>
              </div>
              <h1 className="hero-title" style={{ marginBottom: 22 }}>
                {(() => {
                  const lines = (draft.hero.title || '').split('\n');
                  return lines.map((line, i) => i === 0
                    ? <EF key={i} value={line} onChange={val => updateDraft('hero.title', [val, ...(draft.hero.title || '').split('\n').slice(1)].join('\n'))} fontSize={52} fontWeight={900} color="var(--white)" style={{ lineHeight: 1.0, letterSpacing: '-0.03em', display: 'block', width: '100%' }} />
                    : <span key={i} className="hero-accent" style={{ display: 'block' }}><EF value={line} onChange={val => updateDraft('hero.title', [(draft.hero.title || '').split('\n')[0], val].join('\n'))} fontSize={52} fontWeight={900} color="var(--orange)" style={{ lineHeight: 1.0, letterSpacing: '-0.03em', display: 'block', width: '100%' }} /></span>
                  );
                })()}
              </h1>
              <EF value={draft.hero.subtitle} onChange={up('hero.subtitle')} fontSize={15} color="rgba(255,255,255,0.45)" style={{ lineHeight: 1.7, maxWidth: 440, display: 'block', marginBottom: 40, letterSpacing: '0.02em' }} />
              <div className="hero-actions">
                <span className="btn-primary" style={{ cursor: 'default', display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                  <svg viewBox="0 0 24 24" fill="currentColor" width="17" height="17" style={{ flexShrink: 0 }}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378L.436 23.03l1.621-5.942A9.91 9.91 0 01.75 12C.75 5.797 5.797.75 12 .75s11.25 5.047 11.25 11.25S18.203 23.25 12 23.25z"/></svg>
                  <EF value={draft.hero.phone} onChange={up('hero.phone')} fontSize={14} fontWeight={700} color="var(--white)" style={{ display: 'inline-block', width: 'auto' }} />
                </span>
                <span className="btn-outline" style={{ cursor: 'default' }}>
                  <EF value={draft.hero.ctaText} onChange={up('hero.ctaText')} fontSize={14} fontWeight={600} color="var(--white)" style={{ display: 'inline-block', width: 'auto' }} /> →
                </span>
              </div>
              <div className="hero-stats-row">
                {draft.hero.stats.map((s, i) => (
                  <div key={i} className="h-stat">
                    <EF value={s.num} onChange={val => updateDraft('hero.stats', draft.hero.stats.map((st, j) => j === i ? { ...st, num: val } : st))} fontSize={35} fontWeight={900} color="var(--white)" style={{ letterSpacing: '-0.02em', lineHeight: 1, display: 'block', fontFamily: 'inherit' }} />
                    <EF value={s.label} onChange={val => updateDraft('hero.stats', draft.hero.stats.map((st, j) => j === i ? { ...st, label: val } : st))} fontSize={11} fontWeight={500} color="rgba(255,255,255,0.4)" style={{ textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: 6, display: 'block', fontFamily: 'inherit' }} />
                  </div>
                ))}
              </div>
            </div>
            <div className="hero-visual">
              <div className="hero-img-grid">
                {[{ src: '/products/ms-hrc-plate.jpeg', label: 'Flat Products' }, { src: '/products/tmt-bars.jpeg', label: 'TMT Bars' }, { src: '/products/beams.jpeg', label: 'Structural Steel' }, { src: '/products/colour-coated-sheets.jpeg', label: 'Roofing Sheets' }].map((img, i) => (
                  <div key={i} className="hero-img-cell">
                    <NextImage src={img.src} alt={img.label} fill className="hero-img" style={{ objectFit: 'cover' }} />
                    <div className="hero-img-overlay" />
                    <span className="hero-img-label">{img.label}</span>
                  </div>
                ))}
              </div>
              <div className="hero-float-badge">
                <span className="hero-float-num">ISI</span>
                <span className="hero-float-text">Certified Products</span>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-bottom-line" />
      </section>

      {/* ════════ CATEGORIES ════════ */}
      <SectionBanner label="Categories" id="ew-categories" />
      <section className="cats">
        <div className="cats-grid">
          {(draft.categories || []).map((c, i) => (
            <div key={i} style={{ position: 'relative' }}>
              <div className="cat-card" style={{ display: 'block', cursor: 'default' }}>
                <div style={{ position: 'relative', aspectRatio: '3/4', overflow: 'hidden', minHeight: 280 }}>
                  <ImageUpload src={c.img} onChange={val => updateListItem('categories', i, 'img', val)} height={320} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,transparent 30%,rgba(11,22,34,0.5) 65%,rgba(11,22,34,0.92) 100%)', pointerEvents: 'none' }} />
                </div>
                <div className="cat-body">
                  <EF value={c.label} onChange={val => updateListItem('categories', i, 'label', val)} fontSize={10} fontWeight={700} color="var(--orange)" style={{ letterSpacing: '0.16em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }} />
                  <EF value={c.title} onChange={val => updateListItem('categories', i, 'title', val)} multiline rows={2} fontSize={24} fontWeight={900} color="#fff" style={{ lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 10, display: 'block' }} />
                  <EF value={c.desc} onChange={val => updateListItem('categories', i, 'desc', val)} multiline rows={2} fontSize={13} color="rgba(255,255,255,0.55)" style={{ lineHeight: 1.55, marginBottom: 16, display: 'block', maxWidth: 260 }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--orange)', letterSpacing: '0.06em' }}>Explore Range →</span>
                </div>
              </div>
              <button onClick={() => updateDraft('categories', (draft.categories || []).filter((_, j) => j !== i))} style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.55)', border: 'none', borderRadius: '50%', width: 26, height: 26, color: '#fff', cursor: 'pointer', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20, lineHeight: 1 }}>×</button>
            </div>
          ))}
        </div>
        <div style={{ background: '#0b1622', padding: '16px 0', display: 'flex', justifyContent: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <button onClick={() => updateDraft('categories', [...(draft.categories || []), { label: 'New Category', title: 'New\nTitle', img: 'https://picsum.photos/seed/newcat/400/500', desc: 'Category description here.' }])} style={{ background: 'none', border: '1.5px dashed rgba(74,111,165,0.45)', borderRadius: 4, padding: '7px 22px', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'rgba(74,111,165,0.8)' }}>+ Add Category</button>
        </div>
      </section>

      {/* ════════ ABOUT ════════ */}
      <SectionBanner label="About" id="ew-about" />
      <section className="about">
        <div className="metrics-strip">
          <div className="container metrics-inner">
            {[{ num: '30+', label: 'Years in Business' }, { num: '15+', label: 'Premium Brands' }, { num: 'ISI', label: 'Certified Products' }, { num: '₹10Cr+', label: 'Projects Delivered' }].map((m, i) => (
              <div key={i} className="metric-item">
                <span className="metric-num">{m.num}</span>
                <span className="metric-label">{m.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="container about-grid section">
          <div className="about-text">
            <EF value={draft.about.sectionLabel} onChange={up('about.sectionLabel')} fontSize={11} fontWeight={700} color="var(--orange)" style={slStyle} />
            <EF value={draft.about.heading} onChange={up('about.heading')} multiline rows={2} fontSize={36} fontWeight={800} color="var(--navy)" style={{ lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: 20, display: 'block' }} />
            <EF value={draft.about.description} onChange={up('about.description')} multiline rows={4} fontSize={15} color="var(--gray)" style={{ lineHeight: 1.8, marginBottom: 36, display: 'block' }} />
            <div className="about-highlights">
              {draft.about.checklist.map((item, i) => (
                <div key={i} className="about-highlight-item">
                  <span className="highlight-num">0{i + 1}</span>
                  <EF value={item} onChange={val => updateDraft('about.checklist', draft.about.checklist.map((c, j) => j === i ? val : c))} fontSize={14} fontWeight={600} color="var(--navy)" style={{ flex: 1 }} />
                  <button onClick={() => updateDraft('about.checklist', draft.about.checklist.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: 13, opacity: 0.5, padding: 0, flexShrink: 0 }}>×</button>
                </div>
              ))}
            </div>
            <button onClick={() => updateDraft('about.checklist', [...draft.about.checklist, 'New highlight item'])} style={{ marginTop: 10, background: 'none', border: '1.5px dashed var(--orange)', borderRadius: 3, padding: '5px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: 'var(--orange)' }}>+ Add Point</button>
          </div>
          <div className="about-img-col">
            <div className="about-img-wrap">
              <ImageUpload src={draft.about?.image || '/products/beams.jpeg'} onChange={up('about.image')} height={420} />
              <div className="about-img-tint" />
              <div className="about-vm-stack">
                <div className="about-vm-pill">
                  <div className="about-vm-pill-title">Vision</div>
                  <div className="about-vm-pill-text"><EF value={draft.about.vision} onChange={up('about.vision')} multiline rows={2} fontSize={12} color="rgba(255,255,255,0.75)" style={{ lineHeight: 1.4 }} /></div>
                </div>
                <div className="about-vm-pill about-vm-pill--alt">
                  <div className="about-vm-pill-title">Mission</div>
                  <div className="about-vm-pill-text"><EF value={draft.about.mission} onChange={up('about.mission')} multiline rows={2} fontSize={12} color="rgba(255,255,255,0.75)" style={{ lineHeight: 1.4 }} /></div>
                </div>
              </div>
              <div className="about-corner-badge">
                <span className="about-badge-num">30+</span>
                <span className="about-badge-label">Years of Trust</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ WHY CHOOSE US ════════ */}
      <SectionBanner label="Why Choose Us" id="ew-why" />
      <section className="why">
        <div className="container why-inner">
          <div className="why-header">
            <EF value={draft.why.sectionLabel} onChange={up('why.sectionLabel')} fontSize={11} fontWeight={700} color="rgba(255,255,255,0.7)" style={slDark} />
            <EF value={draft.why.heading} onChange={up('why.heading')} fontSize={40} fontWeight={900} color="var(--white)" style={{ lineHeight: 1.1, letterSpacing: '-0.02em', maxWidth: 600, display: 'block', margin: '12px 0' }} />
            <p className="why-sub">Built on three decades of supply chain excellence, technical knowledge, and client trust.</p>
          </div>
          <div className="why-num-grid">
            {draft.why.items.map((r, i) => (
              <div key={i} className="why-num-item">
                <span className="why-num">{String(i + 1).padStart(2, '0')}</span>
                <EF value={r.title} onChange={val => updateListItem('why.items', i, 'title', val)} fontSize={15} fontWeight={700} color="rgba(255,255,255,0.85)" style={{ lineHeight: 1.35, display: 'block' }} />
                <button onClick={() => updateDraft('why.items', draft.why.items.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: 'rgba(255,80,80,0.55)', cursor: 'pointer', fontSize: 11, padding: '4px 0 0', marginTop: 6 }}>× remove</button>
              </div>
            ))}
            <div className="why-num-item" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => updateDraft('why.items', [...draft.why.items, { title: 'New reason to choose us' }])}>
              <span style={{ color: 'rgba(255,255,255,0.35)', fontWeight: 600, fontSize: 14 }}>+ Add Item</span>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ CERTIFICATIONS ════════ */}
      <SectionBanner label="Certifications" id="ew-certs" />
      <section className="certs">
        <div className="certs-top">
          <div className="container certs-top-inner" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
            <EF value={draft.certifications.sectionLabel} onChange={up('certifications.sectionLabel')} fontSize={11} fontWeight={700} color="rgba(255,255,255,0.6)" style={slDark} />
            <EF value={draft.certifications.heading} onChange={up('certifications.heading')} fontSize={36} fontWeight={800} color="var(--white)" style={{ letterSpacing: '-0.02em', display: 'block' }} />
          </div>
        </div>
        <div className="certs-items container">
          {draft.certifications.items.map((c, i) => (
            <div key={i} className="cert-item">
              <div className="cert-item-num">{c.num}</div>
              <div className="cert-item-bar" />
              <EF value={c.title} onChange={val => updateListItem('certifications.items', i, 'title', val)} fontSize={14} fontWeight={700} color="rgba(255,255,255,0.85)" style={{ lineHeight: 1.5, display: 'block' }} multiline rows={2} />
              <button onClick={() => updateDraft('certifications.items', draft.certifications.items.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: 'rgba(255,80,80,0.5)', cursor: 'pointer', fontSize: 11, padding: '4px 0 0', marginTop: 4 }}>× remove</button>
            </div>
          ))}
        </div>
      </section>

      {/* ════════ SERVICE EXCELLENCE ════════ */}
      <SectionBanner label="Service Excellence" id="ew-services" />
      <section className="service section">
        <div className="container">
          <div className="service-header">
            <EF value={draft.services.sectionLabel} onChange={up('services.sectionLabel')} fontSize={11} fontWeight={700} color="var(--orange)" style={slStyle} />
            <EF value={draft.services.heading} onChange={up('services.heading')} multiline rows={2} fontSize={36} fontWeight={800} color="var(--navy)" style={{ lineHeight: 1.15, letterSpacing: '-0.02em', display: 'block', marginTop: 10 }} />
          </div>
          <div className="service-process">
            {draft.services.items.map((s, i) => (
              <div key={i} className="process-step">
                <div className="process-step-num">{String(i + 1).padStart(2, '0')}</div>
                <div className="process-connector" />
                <div className="process-step-body">
                  <EF value={s.title} onChange={val => updateListItem('services.items', i, 'title', val)} fontSize={16} fontWeight={700} color="var(--navy)" style={{ lineHeight: 1.3, display: 'block', marginBottom: 10 }} />
                  <EF value={s.desc} onChange={val => updateListItem('services.items', i, 'desc', val)} multiline rows={2} fontSize={13} color="var(--gray)" style={{ lineHeight: 1.7, display: 'block' }} />
                  <button onClick={() => updateDraft('services.items', draft.services.items.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: 'rgba(200,0,0,0.5)', cursor: 'pointer', fontSize: 11, padding: '6px 0 0', marginTop: 4 }}>× remove</button>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20 }}>
            <button onClick={() => updateDraft('services.items', [...draft.services.items, { title: 'New Service', desc: 'Service description here.' }])} style={{ background: 'none', border: '1.5px dashed var(--orange)', borderRadius: 3, padding: '8px 20px', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--orange)' }}>+ Add Service</button>
          </div>
        </div>
      </section>

      {/* ════════ PRODUCTS ════════ */}
      <SectionBanner label="Products" id="ew-products" />
      <section className="products section">
        <div className="container">
          <div className="section-header">
            <EF value={draft.products.sectionLabel} onChange={up('products.sectionLabel')} fontSize={11} fontWeight={700} color="var(--orange)" style={slStyle} />
            <EF value={draft.products.heading} onChange={up('products.heading')} fontSize={36} fontWeight={800} color="var(--navy)" style={{ display: 'block', letterSpacing: '-0.02em', lineHeight: 1.15, marginTop: 8 }} />
          </div>
          <div className="product-tabs">
            {Object.entries(catLabels).map(([id, label]) => (
              <button key={id} className={`tab-btn${productTab === id ? ' active' : ''}`} onClick={() => setProductTab(id)}>{label}</button>
            ))}
          </div>
          <div className="product-grid">
            {(draft.products[productTab] || []).map((item, i) => (
              <div key={i} className="product-card">
                <div className="product-img-wrap">
                  <ImageUpload src={item.img} onChange={val => updateListItem(`products.${productTab}`, i, 'img', val)} height={180} />
                  <div className="product-img-overlay" />
                </div>
                <div className="product-card-body">
                  <EF value={item.title} onChange={val => updateListItem(`products.${productTab}`, i, 'title', val)} fontSize={14} fontWeight={700} color="var(--navy)" style={{ lineHeight: 1.3, display: 'block', marginBottom: 5 }} />
                  <EF value={item.desc} onChange={val => updateListItem(`products.${productTab}`, i, 'desc', val)} multiline rows={2} fontSize={12} color="var(--gray)" style={{ lineHeight: 1.55, display: 'block' }} />
                  <div style={{ marginTop: 12, width: '100%', padding: '9px 0', borderRadius: 8, border: 'none', fontWeight: 700, fontSize: 13, background: '#25d366', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, opacity: 0.8 }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    Enquire on WhatsApp
                  </div>
                  <button onClick={() => updateDraft(`products.${productTab}`, (draft.products[productTab] || []).filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: 'rgba(200,0,0,0.5)', cursor: 'pointer', fontSize: 11, padding: '4px 0 0', marginTop: 4, display: 'block', width: '100%', textAlign: 'center' }}>× remove</button>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <button onClick={() => updateDraft(`products.${productTab}`, [...(draft.products[productTab] || []), { title: 'New Product', desc: 'Product description.', img: 'https://picsum.photos/seed/prod/480/280' }])} style={{ border: '1.5px dashed var(--orange)', background: 'none', borderRadius: 3, padding: '10px 24px', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--orange)' }}>+ Add Product to {catLabels[productTab]}</button>
          </div>
        </div>
      </section>

      {/* ════════ BRANDS ════════ */}
      <SectionBanner label="Brands" id="ew-brands" />
      <section className="brands">
        <div className="brands-header container">
          <span className="section-label brands-label">Brands We Deal</span>
          <h2 className="brands-heading">Partnered with Industry&apos;s Best</h2>
        </div>
        <div className="marquee-wrapper">
          <div className="marquee-fade-left" />
          <div className="marquee-fade-right" />
          <div className="marquee-row" style={{ overflow: 'visible' }}>
            <div className="marquee-track" style={{ animation: 'none', flexWrap: 'wrap', width: 'auto', padding: '0 16px' }}>
              {draft.brands.map((b, i) => (
                <div key={i} className="marquee-item" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, margin: 0 }}>
                  <EF value={b} onChange={val => updateDraft('brands', draft.brands.map((br, j) => j === i ? val : br))} fontSize={12} fontWeight={700} color="rgba(255,255,255,0.6)" style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }} />
                  <button onClick={() => updateDraft('brands', draft.brands.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: 'rgba(255,100,100,0.55)', cursor: 'pointer', fontSize: 13, padding: 0, lineHeight: 1, flexShrink: 0 }}>×</button>
                </div>
              ))}
              <div className="marquee-item" onClick={() => updateDraft('brands', [...draft.brands, 'NEW BRAND'])} style={{ cursor: 'pointer', border: '1.5px dashed rgba(74,111,165,0.45)', background: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', margin: 0 }}>
                <span style={{ color: 'rgba(74,111,165,0.75)', fontWeight: 700, fontSize: 12 }}>+ Add</span>
              </div>
            </div>
          </div>
          <div className="marquee-row" style={{ overflow: 'visible' }}>
            <div className="marquee-track marquee-track--reverse" style={{ animation: 'none', flexWrap: 'wrap', width: 'auto', padding: '0 16px' }}>
              {[...draft.brands].reverse().map((b, i) => (
                <div key={i} className="marquee-item marquee-item--alt" style={{ margin: 0 }}>{b}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════ CASE STUDIES ════════ */}
      <SectionBanner label="Case Studies" id="ew-cases" />
      <section className="cases section">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Case Studies</span>
            <h2>Real Projects, Real Results</h2>
          </div>
          <div className="cases-grid">
            {draft.caseStudies.map((c, i) => (
              <div key={i} className="case-card">
                <div className="case-num">{c.num}</div>
                <EF value={c.title} onChange={val => updateListItem('caseStudies', i, 'title', val)} fontSize={16} fontWeight={800} color="var(--navy)" style={{ lineHeight: 1.3, display: 'block', marginBottom: 6 }} />
                <div className="case-meta">
                  <EF value={c.client} onChange={val => updateListItem('caseStudies', i, 'client', val)} fontSize={11} fontWeight={700} color="var(--orange)" style={{ textTransform: 'uppercase', letterSpacing: '0.08em', display: 'inline-block', width: 'auto' }} />
                </div>
                <EF value={c.project} onChange={val => updateListItem('caseStudies', i, 'project', val)} fontSize={13} fontWeight={700} color="var(--navy)" style={{ display: 'block', marginBottom: 12, fontStyle: 'italic' }} />
                <EF value={c.desc} onChange={val => updateListItem('caseStudies', i, 'desc', val)} multiline rows={3} fontSize={13} color="var(--gray)" style={{ lineHeight: 1.65, display: 'block' }} />
                <button onClick={() => updateDraft('caseStudies', draft.caseStudies.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: 'rgba(200,0,0,0.5)', cursor: 'pointer', fontSize: 11, padding: '6px 0 0', marginTop: 4 }}>× remove</button>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <button onClick={() => updateDraft('caseStudies', [...draft.caseStudies, { num: String(draft.caseStudies.length + 1).padStart(2, '0'), title: 'New Case Study', client: 'Client Name', project: 'Project Type', desc: 'Project description.' }])} style={{ border: '1.5px dashed var(--orange)', background: 'none', borderRadius: 3, padding: '8px 20px', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: 'var(--orange)' }}>+ Add Case Study</button>
          </div>
        </div>
      </section>

      {/* ════════ CLIENTS ════════ */}
      <SectionBanner label="Clients" id="ew-clients" />
      <section className="clients section">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Our Clients</span>
            <h2>Clients Through BNI</h2>
          </div>
          <div className="clients-grid">
            {draft.clients.map((c, i) => (
              <div key={i} className="client-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <EF value={c} onChange={val => updateDraft('clients', draft.clients.map((cl, j) => j === i ? val : cl))} fontSize={13} fontWeight={600} color="rgba(255,255,255,0.7)" style={{ letterSpacing: '0.03em', display: 'inline-block', width: 'auto', minWidth: 60 }} />
                <button onClick={() => updateDraft('clients', draft.clients.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: 'rgba(255,100,100,0.55)', cursor: 'pointer', fontSize: 14, padding: 0, lineHeight: 1, flexShrink: 0 }}>×</button>
              </div>
            ))}
            <div className="client-pill" onClick={() => updateDraft('clients', [...draft.clients, 'New Client'])} style={{ cursor: 'pointer', borderStyle: 'dashed', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)', fontWeight: 700, fontSize: 13 }}>+ Add</div>
          </div>
        </div>
      </section>

      {/* ════════ CONTACT ════════ */}
      <SectionBanner label="Contact" id="ew-contact" />
      <section className="contact section">
        <div className="container contact-inner">
          <div className="contact-info">
            <EF value={draft.contact.sectionLabel} onChange={up('contact.sectionLabel')} fontSize={11} fontWeight={700} color="var(--orange)" style={slStyle} />
            <EF value={draft.contact.heading} onChange={up('contact.heading')} multiline rows={2} fontSize={36} fontWeight={800} color="var(--navy)" style={{ lineHeight: 1.2, letterSpacing: '-0.02em', display: 'block', marginBottom: 16 }} />
            <EF value={draft.contact.subheading} onChange={up('contact.subheading')} multiline rows={3} fontSize={14} color="var(--gray)" style={{ lineHeight: 1.7, display: 'block', marginBottom: 40 }} />
            <div className="contact-items">
              {[
                { key: 'phone', label: 'Phone', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><rect x="5" y="2" width="14" height="20" rx="2"/><circle cx="12" cy="17" r="1"/></svg> },
                { key: 'email', label: 'Email', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> },
                { key: 'businessType', label: 'Business', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-4 0v2"/></svg> },
              ].map(({ key, label, icon }) => (
                <div key={key} className="contact-item">
                  <div className="contact-icon">{icon}</div>
                  <div>
                    <span className="contact-label">{label}</span>
                    <EF value={draft.contact[key]} onChange={up(`contact.${key}`)} fontSize={14} fontWeight={500} color="var(--navy)" style={{ lineHeight: 1.5 }} />
                  </div>
                </div>
              ))}
              <div className="contact-item">
                <div className="contact-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
                <div>
                  <span className="contact-label">Office</span>
                  <EF value={draft.contact.address} onChange={up('contact.address')} multiline rows={2} fontSize={13} fontWeight={500} color="var(--navy)" style={{ lineHeight: 1.5, whiteSpace: 'pre-line' }} />
                </div>
              </div>
            </div>
          </div>
          <div className="contact-form-wrap">
            <div className="contact-form">
              <h3>Send Us a Message</h3>
              <div className="form-row">
                <div className="form-group"><label>Your Name</label><div style={{ padding: '11px 14px', border: '1.5px solid #dde4ee', borderRadius: 8, fontSize: 14, color: '#9ca3af', background: 'var(--off-white)' }}>Rajesh Kumar</div></div>
                <div className="form-group"><label>Phone Number</label><div style={{ padding: '11px 14px', border: '1.5px solid #dde4ee', borderRadius: 8, fontSize: 14, color: '#9ca3af', background: 'var(--off-white)' }}>+91 XXXXX XXXXX</div></div>
              </div>
              <div className="form-group"><label>Email Address</label><div style={{ padding: '11px 14px', border: '1.5px solid #dde4ee', borderRadius: 8, fontSize: 14, color: '#9ca3af', background: 'var(--off-white)' }}>you@company.com</div></div>
              <div className="form-group">
                <label>Products Required</label>
                <div style={{ border: '1.5px solid #e5e7eb', borderRadius: 8, padding: '10px 12px', maxHeight: 200, overflowY: 'auto', display: 'flex', flexWrap: 'wrap', gap: '8px 12px', background: '#fff' }}>
                  {['flat','tubular','structural','roofing','accessories'].flatMap(k => (draft.products?.[k] || []).map(p => p.title)).map(p => (
                    <label key={p} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'default', fontSize: 13, color: '#374151', fontWeight: 400, whiteSpace: 'nowrap' }}>
                      <input type="checkbox" disabled style={{ accentColor: 'var(--orange)', width: 14, height: 14 }} />
                      {p}
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group"><label>Message</label><div style={{ padding: '11px 14px', border: '1.5px solid #dde4ee', borderRadius: 8, fontSize: 14, color: '#9ca3af', minHeight: 72, background: 'var(--off-white)' }}>Describe your requirement, quantity, specifications…</div></div>
              <div className="btn-primary btn-full" style={{ cursor: 'default', display: 'flex', justifyContent: 'center' }}>Send Inquiry →</div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ FOOTER ════════ */}
      <SectionBanner label="Footer" id="ew-footer" />
      <footer className="footer">
        <div className="container footer-inner">
          <div className="footer-brand">
            <div className="logo">
              <div style={{ width: 36, height: 36, background: 'var(--orange)', borderRadius: 6, flexShrink: 0 }} />
              <div className="logo-text">
                <EF value={draft.footer.brandName} onChange={up('footer.brandName')} fontSize={13} fontWeight={900} color="var(--white)" style={{ letterSpacing: '0.08em', display: 'inline-block', width: 'auto', lineHeight: 1.1 }} />
                <span className="logo-tag">The Steel Hub</span>
              </div>
            </div>
            <EF value={draft.footer.tagline} onChange={up('footer.tagline')} multiline rows={4} fontSize={13} color="rgba(255,255,255,0.45)" style={{ lineHeight: 1.75, display: 'block' }} />
          </div>
          <div className="footer-links">
            <h4>Quick Links</h4>
            <ul>{['About', 'Products', 'Brands', 'Case Studies', 'Clients', 'Contact'].map(l => <li key={l}><a>{l}</a></li>)}</ul>
          </div>
          <div className="footer-products">
            <h4>Products</h4>
            <ul>{['Flat Products', 'Tubular Products', 'Structural Steel', 'Roofing & Sheets', 'Accessories & Others'].map(l => <li key={l}>{l}</li>)}</ul>
          </div>
          <div className="footer-contact">
            <h4>Contact</h4>
            <EF value={draft.footer.presentedPhone} onChange={up('footer.presentedPhone')} fontSize={13} color="rgba(255,255,255,0.45)" style={{ display: 'block', marginBottom: 9 }} />
            <EF value={draft.footer.presentedEmail} onChange={up('footer.presentedEmail')} fontSize={13} color="rgba(255,255,255,0.45)" style={{ display: 'block', marginBottom: 9 }} />
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, marginBottom: 4 }}>Presented by:</div>
            <EF value={draft.footer.presentedBy} onChange={up('footer.presentedBy')} fontSize={13} fontWeight={600} color="rgba(255,255,255,0.65)" style={{ display: 'block' }} />
          </div>
        </div>
        <div className="footer-bottom">
          <div className="container">
            <EF value={draft.footer.copyright} onChange={up('footer.copyright')} fontSize={12} color="rgba(255,255,255,0.25)" style={{ display: 'block', textAlign: 'center', letterSpacing: '0.04em' }} />
          </div>
        </div>
      </footer>

      {/* Bottom publish bar */}
      <div style={{ background: '#0d1b2e', padding: '24px 48px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 14, borderTop: '1px solid #1e2d42', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
        <PublishStatus saved={saved} dark />
        <button onClick={publish} disabled={saved === 'saving'} style={{ background: saved === 'saved' ? '#22c55e' : 'linear-gradient(135deg, #f97316, #ea580c)', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 44px', fontWeight: 700, fontSize: 14, cursor: saved === 'saving' ? 'wait' : 'pointer', transition: 'background 0.2s', animation: !saved || saved === null ? 'ns-pulse 2.5s ease-in-out infinite' : 'none', boxShadow: '0 6px 20px rgba(249,115,22,0.35)' }}>
          {saved === 'saving' ? 'Publishing…' : saved === 'saved' ? '✓ Published!' : 'Publish Changes'}
        </button>
        <a href="/" target="_blank" rel="noopener" style={{ padding: '12px 20px', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', borderRadius: 10, fontSize: 13, fontWeight: 500, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.09)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <ExternalLink size={13} /> View Site
        </a>
      </div>
    </div>
  );
}

/* ─── Leads Pending Tab ─── */
function LeadsPendingTab({ pendingLeads, setPendingLeads }) {
  const [filter, setFilter]       = useState('pending');
  const [detail, setDetail]       = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [acting, setActing]       = useState(null);

  const counts = {
    all:       pendingLeads.length,
    pending:   pendingLeads.filter(l => l.review_status === 'pending').length,
    approved:  pendingLeads.filter(l => l.review_status === 'approved').length,
    rejected:  pendingLeads.filter(l => l.review_status === 'rejected').length,
    duplicate: pendingLeads.filter(l => l.review_status === 'duplicate').length,
  };
  const filtered = pendingLeads.filter(l => filter === 'all' || l.review_status === filter);

  const statusColor = { pending: '#3b82f6', approved: '#22c55e', rejected: '#f87171', duplicate: '#64748b' };
  const qualityColor = s => s >= 70 ? '#22c55e' : s >= 40 ? '#f59e0b' : '#64748b';

  const act = async (id, action) => {
    setActing(id);
    const res = await fetch('/api/leads-pending', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action, review_notes: reviewNotes || null }),
    });
    if (res.ok) {
      const newStatus = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'duplicate';
      setPendingLeads(prev => prev.map(l => l.id === id ? { ...l, review_status: newStatus, reviewed_at: new Date().toISOString() } : l));
      if (detail?.id === id) { setDetail(null); setReviewNotes(''); }
    }
    setActing(null);
  };

  const ContactSource = ({ lead }) => (
    <div style={{ background: '#0d1726', borderRadius: 10, padding: '12px 14px', marginBottom: 16, border: '1px solid #1e2d42' }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#4a5a6b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Contact &amp; Source</div>
      {[
        { label: 'Phone',    value: lead.phone,                          href: lead.phone           ? `tel:${lead.phone}`           : null },
        { label: 'Email',    value: lead.email,                          href: lead.email           ? `mailto:${lead.email}`        : null },
        { label: 'Website',  value: lead.company_website,                href: lead.company_website || null, external: true },
        { label: 'Found at', value: lead.ref_link || lead.source_url,    href: lead.ref_link || lead.source_url || null, external: true },
      ].map(({ label, value, href, external }) => (
        <div key={label} style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 5 }}>
          <span style={{ fontSize: 11, color: '#4a5a6b', fontWeight: 600, minWidth: 62, flexShrink: 0 }}>{label}</span>
          {value
            ? <a href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} style={{ fontSize: 12, color: '#94a3b8', textDecoration: 'none', wordBreak: 'break-all' }}>{value}</a>
            : <span style={{ fontSize: 12, color: '#2d3f55' }}>—</span>}
        </div>
      ))}
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#e2e8f0', letterSpacing: '-0.02em' }}>Review Queue</h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13 }}>Auto-discovered leads awaiting your approval</p>
        </div>
        {counts.pending > 0 && <div style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: 10, padding: '8px 16px', fontSize: 13, fontWeight: 700, color: '#60a5fa' }}>{counts.pending} pending</div>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        {[['Pending','pending','#3b82f6'],['Approved','approved','#22c55e'],['Rejected','rejected','#f87171'],['Duplicate','duplicate','#64748b']].map(([label,key,color]) => (
          <div key={key} style={{ background: '#141e2e', borderRadius: 12, padding: '14px 16px', border: `1px solid ${color}22` }}>
            <div style={{ fontSize: 28, fontWeight: 800, color, lineHeight: 1 }}>{counts[key]}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4, fontWeight: 600 }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {['all','pending','approved','rejected','duplicate'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: '5px 14px', borderRadius: 6, border: `1px solid ${filter === f ? '#e87722' : '#1e2d42'}`, background: filter === f ? '#e87722' : '#141e2e', color: filter === f ? '#fff' : '#64748b', fontSize: 12, fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize' }}>
            {f} ({counts[f] ?? 0})
          </button>
        ))}
      </div>

      <div style={{ background: '#141e2e', borderRadius: 16, border: '1px solid #1e2d42', overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>✓</div>
            <div>No {filter} leads in the queue.</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ background: '#0d1726', borderBottom: '2px solid #1e2d42' }}>
              {['Name & Contact','Website','Signal / Source','Requirement','Score','Status','Actions'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontSize: 11, color: '#4a5a6b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {filtered.map(l => (
                <tr key={l.id} onClick={() => { setDetail(l); setReviewNotes(''); }}
                  style={{ borderBottom: '1px solid #1a2538', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#1e2d42'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}>
                  <td style={{ padding: '10px 14px', maxWidth: 220 }}>
                    <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.name || '—'}</div>
                    {l.company && <div style={{ fontSize: 11, color: '#4a5a6b', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.company}</div>}
                    {l.phone && l.phone !== 'NOT_FOUND' && <a href={`tel:${l.phone}`} onClick={e => e.stopPropagation()} style={{ fontSize: 11, color: '#60a5fa', marginTop: 1, display: 'block', textDecoration: 'none' }}>{l.phone}</a>}
                    {l.email && <a href={`mailto:${l.email}`} onClick={e => e.stopPropagation()} style={{ fontSize: 11, color: '#34d399', marginTop: 1, display: 'block', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.email}</a>}
                  </td>
                  <td style={{ padding: '10px 14px', maxWidth: 180 }} onClick={e => e.stopPropagation()}>
                    {l.company_website
                      ? <a href={l.company_website} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: '#60a5fa', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5 }}>
                          <span style={{ fontSize: 13 }}>🌐</span>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.company_website.replace(/^https?:\/\//,'')}</span>
                        </a>
                      : <span style={{ color: '#334155', fontSize: 13 }}>—</span>}
                  </td>
                  <td style={{ padding: '10px 14px', maxWidth: 160 }}>
                    {l.signal_type && <div style={{ fontSize: 11, fontWeight: 600, color: '#f59e0b', marginBottom: 2 }}>{l.signal_type}</div>}
                    {l.source && <div style={{ fontSize: 11, color: '#4a5a6b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.source}</div>}
                    {(l.ref_link || l.source_url) && <a href={l.ref_link || l.source_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} title={l.ref_link || l.source_url} style={{ fontSize: 16, color: '#60a5fa', textDecoration: 'none' }}>🔗</a>}
                  </td>
                  <td style={{ padding: '10px 14px', color: '#64748b', fontSize: 13, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.requirement || '—'}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ fontWeight: 700, fontSize: 15, color: qualityColor(l.quality_score ?? 0) }}>{l.quality_score ?? 0}</span>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ background: (statusColor[l.review_status]||'#64748b')+'22', color: statusColor[l.review_status]||'#64748b', border: `1px solid ${(statusColor[l.review_status]||'#64748b')}44`, borderRadius: 99, padding: '2px 10px', fontSize: 11, fontWeight: 600, textTransform: 'capitalize', whiteSpace: 'nowrap' }}>{l.review_status}</span>
                  </td>
                  <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }} onClick={e => e.stopPropagation()}>
                    {l.review_status === 'pending' ? (
                      <>
                        <button onClick={() => act(l.id,'approve')} disabled={acting===l.id} style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 12, color: '#22c55e', marginRight: 4, fontWeight: 600 }}>✓</button>
                        <button onClick={() => act(l.id,'reject')}  disabled={acting===l.id} style={{ background: 'rgba(248,113,113,0.1)', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 12, color: '#f87171', marginRight: 4 }}>✕</button>
                        <button onClick={() => act(l.id,'duplicate')} disabled={acting===l.id} style={{ background: '#1e2d42', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontSize: 12, color: '#64748b' }}>Dup</button>
                      </>
                    ) : <span style={{ fontSize: 12, color: '#334155' }}>—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={!!detail} onClose={() => { setDetail(null); setReviewNotes(''); }} title="Lead Detail">
        {detail && (
          <>
            <ContactSource lead={detail} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              {[['Name',detail.name],['Company',detail.company],['Signal',detail.signal_type],['Source',detail.source],['Quality Score',detail.quality_score??0],['Status',detail.review_status],['Requirement',detail.requirement],['Created',detail.created_at ? new Date(detail.created_at).toLocaleDateString('en-IN') : null]].map(([label,value]) => (
                <div key={label}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#4a5a6b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>{label}</div>
                  <div style={{ fontSize: 13, color: '#cbd5e1' }}>{value || '—'}</div>
                </div>
              ))}
            </div>
            {detail.notes && <div style={{ marginBottom: 16 }}><div style={{ fontSize: 10, fontWeight: 700, color: '#4a5a6b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Notes</div><div style={{ fontSize: 13, color: '#94a3b8', background: '#0d1726', borderRadius: 8, padding: '8px 12px' }}>{detail.notes}</div></div>}
            {detail.review_status === 'pending' && (
              <>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Review Notes (optional)</label>
                  <textarea value={reviewNotes} onChange={e => setReviewNotes(e.target.value)} placeholder="Add a note…" rows={2} style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #1e2d42', borderRadius: 9, fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box', outline: 'none', color: '#e2e8f0', background: '#0e1a2b', resize: 'vertical' }} />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => act(detail.id,'approve')}   style={{ flex: 1, background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e', borderRadius: 8, padding: '10px 0', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>✓ Approve</button>
                  <button onClick={() => act(detail.id,'reject')}    style={{ flex: 1, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171', borderRadius: 8, padding: '10px 0', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>✕ Reject</button>
                  <button onClick={() => act(detail.id,'duplicate')} style={{ background: '#1e2d42', border: 'none', color: '#64748b', borderRadius: 8, padding: '10px 14px', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>Dup</button>
                </div>
              </>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}

/* ─── Login Gate ─── */
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'namo@2025';

function LoginGate({ onAuth }) {
  const [pw, setPw] = useState('');
  const [err, setErr] = useState(false);
  const submit = e => {
    e.preventDefault();
    if (pw === ADMIN_PASSWORD) { onAuth(); setErr(false); }
    else { setErr(true); setTimeout(() => setErr(false), 2000); }
  };
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0b1622', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <div style={{ background: '#141e2e', borderRadius: 20, padding: '44px 40px', width: 360, boxShadow: '0 32px 80px rgba(0,0,0,0.6)', border: '1px solid #1e2d42' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'linear-gradient(135deg,#f97316,#ea580c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 22, color: '#fff', fontFamily: "'Barlow Condensed', system-ui, sans-serif", boxShadow: '0 4px 14px rgba(249,115,22,0.45)' }}>N</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: '#fff', letterSpacing: '0.12em', fontFamily: "'Barlow Condensed', system-ui, sans-serif" }}>NAMO STEEL</div>
            <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Admin Panel</div>
          </div>
        </div>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#e2e8f0', marginBottom: 6 }}>Welcome back</div>
        <div style={{ fontSize: 13, color: '#64748b', marginBottom: 28 }}>Enter your admin password to continue</div>
        <form onSubmit={submit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Password</label>
            <input
              type="password" value={pw} onChange={e => setPw(e.target.value)} autoFocus required
              placeholder="Enter password"
              style={{ width: '100%', padding: '11px 14px', border: `1.5px solid ${err ? '#f87171' : '#1e2d42'}`, borderRadius: 10, fontSize: 14, background: '#0e1a2b', color: '#e2e8f0', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s', fontFamily: 'inherit' }}
              onFocus={e => e.target.style.borderColor = '#e87722'} onBlur={e => e.target.style.borderColor = err ? '#f87171' : '#1e2d42'}
            />
            {err && <div style={{ fontSize: 12, color: '#f87171', marginTop: 6 }}>Incorrect password. Try again.</div>}
          </div>
          <button type="submit" style={{ width: '100%', background: 'linear-gradient(135deg,#f97316,#ea580c)', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 0', fontWeight: 700, fontSize: 15, cursor: 'pointer', boxShadow: '0 4px 16px rgba(249,115,22,0.35)', marginTop: 4 }}>
            Sign In →
          </button>
        </form>
        <div style={{ marginTop: 20, fontSize: 11, color: '#334155', textAlign: 'center' }}>Default password: <code style={{ color: '#64748b' }}>namo@2025</code></div>
      </div>
    </div>
  );
}

/* ─── Main Admin Dashboard ─── */
export default function AdminDashboard() {
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState('overview');
  const [leads, setLeadsState] = useState([]);
  const [customers, setCustomersState] = useState([]);
  const [pendingLeads, setPendingLeads] = useState([]);
  const [draft, setDraft] = useState(null);
  const [pubSaved, setPubSaved] = useState(false);

  // Remove Next.js / Vercel dev overlay from admin panel
  useEffect(() => {
    const hide = () => {
      document.querySelectorAll('nextjs-portal, [data-nextjs-dialog-overlay], #__next-build-watcher, vercel-live-feedback').forEach(el => el.remove());
    };
    hide();
    const obs = new MutationObserver(hide);
    obs.observe(document.body, { childList: true, subtree: false });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (sessionStorage.getItem('namo_admin_auth') === '1') setAuthed(true);
    fetch('/api/leads')
      .then(r => r.json())
      .then(data => {
        const apiLeads = Array.isArray(data) ? data : [];
        setLeadsState(apiLeads.length > 0 ? apiLeads : stored(LEADS_KEY, []));
      })
      .catch(() => setLeadsState(stored(LEADS_KEY, [])));
    fetch('/api/leads-pending')
      .then(r => r.json())
      .then(data => setPendingLeads(Array.isArray(data) ? data : []))
      .catch(() => setPendingLeads([]));
    setCustomersState(stored(CUSTOMERS_KEY, []));
    setDraft(getSiteContent());
  }, []);

  const handleAuth = () => { sessionStorage.setItem('namo_admin_auth', '1'); setAuthed(true); };

  const saveLeads = useCallback((l) => { setLeadsState(l); localStorage.setItem(LEADS_KEY, JSON.stringify(l)); }, []);
  const saveCustomers = useCallback((c) => { setCustomersState(c); localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(c)); }, []);

  const publishContent = useCallback(async () => {
    setPubSaved('saving');
    setSiteContent(draft);
    try {
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });
      const data = await res.json();
      if (data.ok) {
        setPubSaved('saved');
      } else if (data.error === 'DB_NOT_CONFIGURED') {
        setPubSaved('no_kv');
      } else {
        console.error('Publish error:', data.error);
        setPubSaved('error');
      }
    } catch {
      setPubSaved('error');
    }
    setTimeout(() => setPubSaved(null), 4000);
  }, [draft]);

  const updateDraft = useCallback((path, value) => {
    setDraft(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) {
        if (obj[keys[i]] === undefined) obj[keys[i]] = {};
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  }, []);

  // All hooks above — safe to conditionally return now
  if (!authed) return <LoginGate onAuth={handleAuth} />;
  if (!draft) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0b1622', fontFamily: 'system-ui, sans-serif', color: '#64748b', fontSize: 16 }}>Loading admin panel…</div>;
  }

  const pendingCount = pendingLeads.filter(l => l.review_status === 'pending').length;
  const navItems = [
    { id: 'overview',  label: 'Overview',     icon: <LayoutDashboard size={15} /> },
    { id: 'leads',     label: 'Leads',        icon: <Users size={15} />,           count: leads.length },
    { id: 'review',    label: 'Review',       icon: <AlertTriangle size={15} />,   count: pendingCount },
    { id: 'customers', label: 'Customers',    icon: <UserCheck size={15} />,       count: customers.length },
    { id: 'companies', label: 'Companies',    icon: <Building2 size={15} /> },
    { id: 'products',  label: 'Products',     icon: <Package size={15} /> },
    { id: 'branding',  label: 'Branding',     icon: <Layers size={15} /> },
    { id: 'theme',     label: 'Theme',        icon: <Palette size={15} /> },
    { id: 'website',   label: 'Edit Website', icon: <Pencil size={15} /> },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes ns-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(249,115,22,0.45); }
          55% { box-shadow: 0 0 0 9px rgba(249,115,22,0); }
        }
        @keyframes ns-wobble {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          20% { transform: translateX(-4px) rotate(-3deg); }
          40% { transform: translateX(4px) rotate(3deg); }
          60% { transform: translateX(-2px) rotate(-1.5deg); }
          80% { transform: translateX(2px) rotate(1.5deg); }
        }
        @keyframes ns-bar {
          0%   { width: 0%; opacity: 1; }
          60%  { width: 82%; }
          85%  { width: 96%; }
          100% { width: 100%; opacity: 0; }
        }
        @keyframes ns-count {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ns-sidebar-btn:hover:not([data-active="true"]) {
          background: rgba(255,255,255,0.045) !important;
          color: rgba(255,255,255,0.8) !important;
        }
        .ns-viewsite:hover { border-color: rgba(255,255,255,0.28) !important; color: rgba(255,255,255,0.75) !important; }
        .ns-issue:hover { animation: ns-wobble 0.45s ease forwards; }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif" }}>

        {/* ═══════════════ SIDEBAR ═══════════════ */}
        <aside style={{ width: 220, background: '#0d1b2e', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100, borderRight: '1px solid #1e2d42' }}>

          {/* Logo */}
          <div style={{ padding: '18px 14px 16px', borderBottom: '1px solid #1e2d42', display: 'flex', alignItems: 'center', gap: 11 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #f97316, #ea580c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 19, color: '#fff', fontFamily: "'Barlow Condensed', system-ui, sans-serif", flexShrink: 0, boxShadow: '0 3px 10px rgba(249,115,22,0.45)' }}>N</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 13.5, color: '#fff', letterSpacing: '0.13em', fontFamily: "'Barlow Condensed', system-ui, sans-serif" }}>NAMO STEEL</div>
              <div style={{ fontSize: 9, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.22em', marginTop: 2 }}>ADMIN PANEL</div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
            {navItems.map((item, idx) => {
              const isActive = tab === item.id;
              const isWebsite = item.id === 'website';
              return (
                <div key={item.id}>
                  {idx === 6 && <div style={{ height: 1, background: '#1e2d42', margin: '8px 4px 10px' }} />}
                  <button
                    className="ns-sidebar-btn"
                    data-active={String(isActive)}
                    onClick={() => setTab(item.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
                      width: '100%', border: 'none', borderRadius: 8, cursor: 'pointer',
                      textAlign: 'left', marginBottom: 2,
                      background: isActive && isWebsite ? 'linear-gradient(135deg, #f97316, #ea580c)'
                                : isActive ? 'rgba(249,115,22,0.1)'
                                : 'transparent',
                      color: isActive && isWebsite ? '#fff'
                            : isActive ? '#f97316'
                            : 'rgba(255,255,255,0.42)',
                      borderLeft: !isWebsite ? `2.5px solid ${isActive ? '#f97316' : 'transparent'}` : '2.5px solid transparent',
                      transition: 'all 0.15s',
                      boxShadow: isActive && isWebsite ? '0 4px 14px rgba(249,115,22,0.35)' : 'none',
                    }}
                  >
                    <span style={{ width: 17, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{item.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 400, flex: 1, letterSpacing: '0.01em' }}>{item.label}</span>
                    {item.count !== undefined && item.count > 0 && (
                      <span style={{ background: isActive && !isWebsite ? '#f97316' : 'rgba(255,255,255,0.09)', color: isActive && !isWebsite ? '#fff' : 'rgba(255,255,255,0.4)', borderRadius: 99, padding: '1px 7px', fontSize: 11, fontWeight: 700 }}>{item.count}</span>
                    )}
                  </button>
                </div>
              );
            })}
          </nav>

          {/* Bottom */}
          <div style={{ padding: '10px 8px 16px', borderTop: '1px solid #1e2d42' }}>
            <a href="/" target="_blank" rel="noopener" className="ns-viewsite" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', borderRadius: 8, color: 'rgba(255,255,255,0.38)', textDecoration: 'none', fontSize: 13, fontWeight: 500, border: '1px solid rgba(255,255,255,0.07)', transition: 'all 0.15s', marginBottom: 8 }}>
              <ExternalLink size={13} />
              <span>View Website</span>
            </a>
            <div style={{ fontSize: 10, color: '#334155', textAlign: 'center', letterSpacing: '0.08em', fontWeight: 600 }}>v2</div>
          </div>
        </aside>

        {/* ═══════════════ MAIN CONTENT ═══════════════ */}
        <main style={{ marginLeft: 220, flex: 1, minHeight: '100vh', padding: tab === 'website' ? 0 : '32px 36px', boxSizing: 'border-box', background: tab === 'website' ? '#f0f2f5' : '#0b1622', minWidth: 0 }}>
          {tab === 'overview'  && <OverviewTab leads={leads} customers={customers} />}
          {tab === 'leads'     && <LeadsTab leads={leads} saveLeads={saveLeads} />}
          {tab === 'review'    && <LeadsPendingTab pendingLeads={pendingLeads} setPendingLeads={setPendingLeads} />}
          {tab === 'customers' && <CustomersTab customers={customers} saveCustomers={saveCustomers} />}
          {tab === 'companies' && <CompaniesTab />}
          {tab === 'branding'  && <BrandingTab draft={draft} updateDraft={updateDraft} publish={publishContent} saved={pubSaved} />}
          {tab === 'theme'     && <ThemeTab draft={draft} updateDraft={updateDraft} publish={publishContent} saved={pubSaved} />}
          {tab === 'products'  && <ProductsAdminTab draft={draft} updateDraft={updateDraft} />}
          {tab === 'website'   && <EditWebsiteTab draft={draft} updateDraft={updateDraft} publish={publishContent} saved={pubSaved} />}
        </main>
      </div>
    </>
  );
}
