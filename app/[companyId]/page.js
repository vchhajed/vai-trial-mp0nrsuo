'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';

export default function CompanyLogin() {
  const { companyId } = useParams();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  // If already logged in, go straight to dashboard
  useEffect(() => {
    const token = sessionStorage.getItem(`ntl_token_${companyId}`);
    if (token) {
      fetch(`/api/auth?token=${token}`)
        .then(r => r.json())
        .then(d => { if (d.ok) router.replace(`/${companyId}/dashboard`); else setChecking(false); })
        .catch(() => setChecking(false));
    } else {
      setChecking(false);
    }
  }, [companyId, router]);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: companyId, password }),
      });
      const data = await res.json();
      if (data.ok) {
        sessionStorage.setItem(`ntl_token_${companyId}`, data.token);
        router.push(`/${companyId}/dashboard`);
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch {
      setError('Something went wrong. Try again.');
    }
    setLoading(false);
  }

  if (checking) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' }}><div style={{ color: '#64748b' }}>Loading…</div></div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0d1b30 0%, #1a2a4a 60%, #0d1b30 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: '48px 44px', width: '100%', maxWidth: 420, boxShadow: '0 24px 80px rgba(0,0,0,0.35)' }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 36 }}>
          <Image src="/logo.png" alt="Namo Steel" width={40} height={40} style={{ objectFit: 'contain' }} />
          <div>
            <div style={{ fontWeight: 900, fontSize: 16, color: '#1a2a4a', letterSpacing: '0.08em' }}>NAMO STEEL</div>
            <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Company Portal</div>
          </div>
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1a2a4a', margin: '0 0 6px' }}>Welcome back</h1>
        <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 28px' }}>
          Sign in to <strong style={{ color: '#e87722' }}>/{companyId}</strong>
        </p>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              autoFocus
              style={{ width: '100%', padding: '12px 14px', border: `1.5px solid ${error ? '#fca5a5' : '#e2e8f0'}`, borderRadius: 10, fontSize: 15, outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', background: error ? '#fef2f2' : '#fff' }}
            />
          </div>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#dc2626', marginBottom: 16 }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ width: '100%', background: loading ? '#94a3b8' : '#e87722', color: '#fff', border: 'none', borderRadius: 10, padding: '13px 0', fontWeight: 700, fontSize: 15, cursor: loading ? 'wait' : 'pointer', transition: 'background 0.2s' }}
          >
            {loading ? 'Signing in…' : 'Sign In →'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', marginTop: 24, marginBottom: 0 }}>
          Don&apos;t have access? Contact <a href="https://wa.me/919860489490" style={{ color: '#e87722', textDecoration: 'none' }}>Namo Steel</a>
        </p>
      </div>
    </div>
  );
}
