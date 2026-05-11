'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useSiteContent } from '@/lib/useSiteContent';

export default function Footer() {
  const content = useSiteContent();
  const footer = content?.footer || {};
  const contact = content?.contact || {};

  const brandName = footer.brandName || 'NAMO STEEL';
  const tagline = footer.tagline || 'Trusted dealers in construction and industrial steel products since 1995. Serving the industry with quality, reliability, and competitive pricing.';
  const phone = footer.presentedPhone || contact.phone || '+91 98604 89490';
  const email = footer.presentedEmail || contact.email || 'namotradelink@gmail.com';
  const address = contact.address || 'Office No. 801, Apex Business Court,\nNear Gangadham, Pune 411037';
  const presentedBy = footer.presentedBy || '';
  const copyright = footer.copyright || '© 2025 Namo Steel. All rights reserved. | Iron & Steel Merchants Since 1995';
  const waPhone = phone.replace(/\D/g, '');

  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <div className="logo" style={{ marginBottom: 20 }}>
            <div style={{ background: '#fff', borderRadius: 8, padding: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, flexShrink: 0 }}>
              <Image src="/logo.png" alt={brandName} width={38} height={38} style={{ objectFit: 'contain' }} />
            </div>
            <div className="logo-text">
              <span className="logo-name">{brandName}</span>
              <span className="logo-tag">The Steel Hub</span>
            </div>
          </div>
          <p>{tagline}</p>
        </div>

        <div className="footer-links">
          <h4>Quick Links</h4>
          <ul>
            {[
              { href: '/about', label: 'About' },
              { href: '/products', label: 'Products' },
              { href: '/brands', label: 'Brands' },
              { href: '/case-studies', label: 'Case Studies' },
              { href: '/clients', label: 'Clients' },
              { href: '/contact', label: 'Contact' },
            ].map(({ href, label }) => (
              <li key={href}>
                <Link href={href}>{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-products">
          <h4>Products</h4>
          <ul>
            {['Flat Products', 'Tubular Products', 'Structural Steel', 'Roofing & Sheets', 'Accessories & Others'].map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>

        <div className="footer-contact">
          <h4>Contact</h4>
          <p><a href={`https://wa.me/${waPhone}`} target="_blank" rel="noopener noreferrer">{phone}</a></p>
          <p><a href={`mailto:${email}`}>{email}</a></p>
          <p style={{ whiteSpace: 'pre-line' }}>{address}</p>
          {presentedBy && <p className="footer-person">Presented by: <strong>{presentedBy}</strong></p>}
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <p>{copyright}</p>
        </div>
      </div>
    </footer>
  );
}
