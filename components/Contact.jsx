'use client';
import { useState } from 'react';
import { useSiteContent } from '@/lib/useSiteContent';

const PRODUCT_KEYS = ['flat', 'tubular', 'structural', 'roofing', 'accessories'];

export default function Contact() {
  const content = useSiteContent();
  const contactData = content?.contact || {};
  const products = content?.products || {};

  const productOptions = PRODUCT_KEYS.flatMap(k => (products[k] || []).map(p => p.title));
  const sectionLabel = contactData.sectionLabel || 'Get In Touch';
  const heading = contactData.heading || "Let's Build Something Strong Together";
  const subheading = contactData.subheading || 'Reach out to us for inquiries, quotes, or customized steel solutions. We\'re ready to serve your project needs.';
  const phone = contactData.phone || '+91 98604 89490';
  const email = contactData.email || 'namotradelink@gmail.com';
  const address = contactData.address || 'Office No. 801, Apex Business Court,\nNear Gangadham, Pune 411037';
  const businessType = contactData.businessType || 'Iron & Steel Merchants';
  const waPhone = phone.replace(/\D/g, '');

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);
  const [selected, setSelected] = useState([]);

  function toggleProduct(p) {
    setSelected(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(false);
    const data = new FormData(e.target);
    const lead = {
      name:        data.get('name'),
      phone:       data.get('phone'),
      email:       data.get('email') || null,
      requirement: selected.length > 0 ? selected.join(', ') : null,
      notes:       data.get('message') || null,
      type:        'inbound',
      status:      'new',
      date:        new Date().toLocaleDateString('en-IN'),
    };
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead),
      });
      if (!res.ok) throw new Error('failed');
      setSubmitted(true);
      setSelected([]);
      e.target.reset();
      setTimeout(() => setSubmitted(false), 4000);
    } catch {
      setError(true);
      setTimeout(() => setError(false), 4000);
    }
  }

  return (
    <section className="contact section" id="contact">
      <div className="container contact-inner">
        <div className="contact-info">
          <span className="section-label">{sectionLabel}</span>
          <h2>{heading}</h2>
          <p>{subheading}</p>
          <div className="contact-items">
            <div className="contact-item">
              <div className="contact-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                  <rect x="5" y="2" width="14" height="20" rx="2"/><circle cx="12" cy="17" r="1"/>
                </svg>
              </div>
              <div>
                <span className="contact-label">Phone</span>
                <a href={`https://wa.me/${waPhone}`} target="_blank" rel="noopener noreferrer">{phone}</a>
              </div>
            </div>
            <div className="contact-item">
              <div className="contact-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <div>
                <span className="contact-label">Email</span>
                <a href={`mailto:${email}`}>{email}</a>
              </div>
            </div>
            <div className="contact-item">
              <div className="contact-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <div>
                <span className="contact-label">Office</span>
                <span style={{ whiteSpace: 'pre-line' }}>{address}</span>
              </div>
            </div>
            <div className="contact-item">
              <div className="contact-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                  <rect x="2" y="7" width="20" height="14" rx="2"/>
                  <path d="M16 7V5a2 2 0 0 0-4 0v2"/>
                </svg>
              </div>
              <div>
                <span className="contact-label">Business</span>
                <span>{businessType}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="contact-form-wrap">
          <form className="contact-form" onSubmit={handleSubmit}>
            <h3>Send Us a Message</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Your Name</label>
                <input type="text" id="name" name="name" placeholder="Rajesh Kumar" required />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input type="tel" id="phone" name="phone" placeholder="+91 XXXXX XXXXX" required />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input type="email" id="email" name="email" placeholder="you@company.com" />
            </div>

            <div className="form-group">
              <label>Products Required {selected.length > 0 && <span style={{ color: 'var(--orange)', fontWeight: 700 }}>({selected.length} selected)</span>}</label>
              <div style={{
                border: '1.5px solid #e5e7eb', borderRadius: 8, padding: '10px 12px',
                maxHeight: 200, overflowY: 'auto', display: 'flex', flexWrap: 'wrap', gap: '8px 12px',
              }}>
                {productOptions.map(p => (
                  <label key={p} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, color: selected.includes(p) ? 'var(--orange)' : '#374151', fontWeight: selected.includes(p) ? 600 : 400, whiteSpace: 'nowrap' }}>
                    <input
                      type="checkbox"
                      checked={selected.includes(p)}
                      onChange={() => toggleProduct(p)}
                      style={{ accentColor: 'var(--orange)', width: 14, height: 14, cursor: 'pointer' }}
                    />
                    {p}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea id="message" name="message" rows={3} placeholder="Describe your requirement, quantity, specifications…" />
            </div>
            <button
              type="submit"
              className="btn-primary btn-full"
              style={submitted ? { background: '#16a34a', borderColor: '#16a34a' } : error ? { background: '#dc2626', borderColor: '#dc2626' } : {}}
              disabled={submitted}
            >
              {submitted ? '✓ Message Sent! We\'ll be in touch.' : error ? 'Failed — please try again' : 'Send Inquiry →'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
