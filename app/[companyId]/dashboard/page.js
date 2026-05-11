'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';

const STATUS_STYLE = {
  new:       { bg: '#eff6ff', color: '#2563eb', border: '#bfdbfe', label: 'New' },
  contacted: { bg: '#fffbeb', color: '#d97706', border: '#fde68a', label: 'Contacted' },
  converted: { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0', label: 'Converted' },
  closed:    { bg: '#f8fafc', color: '#64748b', border: '#cbd5e1', label: 'Closed' },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_STYLE[status] || STATUS_STYLE.new;
  return <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`, borderRadius: 99, padding: '3px 10px', fontSize: 12, fontWeight: 700 }}>{s.label}</span>;
};

export default function CompanyDashboard() {
  const { companyId } = useParams();
  const router = useRouter();
  const [company, setCompany] = useState(null);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem(`ntl_token_${companyId}`);
    if (!token) { router.replace(`/${companyId}`); return; }

    fetch(`/api/auth?token=${token}`)
      .then(r => r.json())
      .then(async d => {
        if (!d.ok) { router.replace(`/${companyId}`); return; }
        setCompany(d.company);
        // Load leads that belong to this company (matched by company name or slug)
        const lr = await fetch('/api/leads').then(r => r.json());
        const companyLeads = Array.isArray(lr)
          ? lr.filter(l => l.company?.toLowerCase() === d.company.slug || l.company?.toLowerCase() === d.company.name.toLowerCase())
          : [];
        setLeads(companyLeads);
        setLoading(false);
      })
      .catch(() => router.replace(`/${companyId}`));
  }, [companyId, router]);

  function logout() {
    sessionStorage.removeItem(`ntl_token_${companyId}`);
    router.replace(`/${companyId}`);
  }

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', fontFamily: 'system-ui', color: '#64748b' }}>Loading…</div>;
  }

  const stats = [
    { label: 'Total Inquiries', value: leads.length, color: '#3b82f6' },
    { label: 'In Progress', value: leads.filter(l => l.status === 'new' || l.status === 'contacted').length, color: '#f59e0b' },
    { label: 'Converted', value: leads.filter(l => l.status === 'converted').length, color: '#22c55e' },
    { label: 'Closed', value: leads.filter(l => l.status === 'closed').length, color: '#6b7280' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Top nav */}
      <header style={{ background: '#1a2a4a', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60, boxShadow: '0 2px 12px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Image src="/logo.png" alt="Namo Steel" width={32} height={32} style={{ objectFit: 'contain' }} />
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 15, letterSpacing: '0.08em' }}>NAMO STEEL</span>
          <span style={{ color: 'rgba(255,255,255,0.3)', margin: '0 4px' }}>·</span>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>{company.name}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <a href="https://wa.me/919860489490" target="_blank" rel="noopener noreferrer"
            style={{ background: '#25d366', color: '#fff', borderRadius: 8, padding: '7px 16px', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
            WhatsApp Us
          </a>
          <button onClick={logout} style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '7px 14px', fontSize: 13, cursor: 'pointer' }}>
            Sign Out
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '36px 24px' }}>
        {/* Company header */}
        <div style={{ background: '#fff', borderRadius: 16, padding: '28px 32px', marginBottom: 28, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: '#e87722', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 900, color: '#fff', flexShrink: 0 }}>
            {company.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#1a2a4a' }}>{company.name}</h1>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
              {company.industry && <span style={{ marginRight: 16 }}>◈ {company.industry}</span>}
              {company.email && <span>✉ {company.email}</span>}
            </div>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Company ID</div>
            <div style={{ fontFamily: 'monospace', fontSize: 15, fontWeight: 700, color: '#e87722', marginTop: 2 }}>/{company.slug}</div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
          {stats.map(s => (
            <div key={s.label} style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', borderLeft: `4px solid ${s.color}` }}>
              <div style={{ fontSize: 13, color: '#64748b', marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 36, fontWeight: 800, color: '#1a2a4a', lineHeight: 1 }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Inquiries table */}
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
          <div style={{ padding: '20px 28px', borderBottom: '1px solid #f1f5f9' }}>
            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#1a2a4a' }}>Your Inquiries</h2>
          </div>
          {leads.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center', color: '#94a3b8' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>◈</div>
              <div style={{ fontWeight: 600, marginBottom: 8, color: '#64748b' }}>No inquiries yet</div>
              <a href="https://wa.me/919860489490" target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-block', marginTop: 8, background: '#e87722', color: '#fff', borderRadius: 8, padding: '10px 24px', textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
                Contact Namo Steel →
              </a>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                  {['Requirement', 'Message', 'Status', 'Date'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '12px 20px', fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leads.map(l => (
                  <tr key={l.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 20px', fontWeight: 600, color: '#1a2a4a', fontSize: 14 }}>{l.requirement || '—'}</td>
                    <td style={{ padding: '14px 20px', color: '#64748b', fontSize: 13, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.notes || '—'}</td>
                    <td style={{ padding: '14px 20px' }}><StatusBadge status={l.status} /></td>
                    <td style={{ padding: '14px 20px', color: '#94a3b8', fontSize: 13 }}>{l.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
