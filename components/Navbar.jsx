'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSiteContent } from '@/lib/useSiteContent';

export default function Navbar() {
  const content = useSiteContent();
  const navbar = content?.navbar || {};
  const branding = content?.branding || {};
  const links = navbar.navLinks || [];
  const ctaLabel = navbar.ctaLabel || 'Contact Us';
  const logoText = branding.logoText || 'NAMO STEEL';
  const logoTagline = navbar.logoTagline || 'The Steel Hub';

  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header className="nav" style={{ boxShadow: scrolled ? '0 4px 32px rgba(0,0,0,0.4)' : 'none' }}>
        <div className="nav-accent-line" />
        <div className="container nav-inner">
          <Link href="/" className="logo">
            <div className="logo-icon" style={{ background: '#fff', borderRadius: 8, padding: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, flexShrink: 0 }}>
              <Image src="/logo.png" alt={logoText} width={38} height={38} style={{ objectFit: 'contain' }} />
            </div>
            <div className="logo-text">
              <span className="logo-name">{logoText}</span>
              <span className="logo-tag">{logoTagline}</span>
            </div>
          </Link>

          <nav className="nav-links">
            {links.map(l => (
              <Link key={l.href} href={l.href}>{l.label}</Link>
            ))}
            <Link href="#contact" className="btn-nav">{ctaLabel}</Link>
          </nav>

          <button className="hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Toggle menu">
            <span style={{ transform: menuOpen ? 'rotate(45deg) translate(5px,5px)' : '' }} />
            <span style={{ opacity: menuOpen ? 0 : 1 }} />
            <span style={{ transform: menuOpen ? 'rotate(-45deg) translate(5px,-5px)' : '' }} />
          </button>
        </div>
      </header>

      <div className={`mobile-menu${menuOpen ? ' open' : ''}`}>
        {links.map(l => (
          <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}>{l.label}</Link>
        ))}
        <Link href="#contact" onClick={() => setMenuOpen(false)} style={{ color: 'var(--orange)', fontWeight: 700 }}>{ctaLabel}</Link>
      </div>
    </>
  );
}
