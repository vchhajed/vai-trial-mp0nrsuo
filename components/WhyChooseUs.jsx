'use client';
import { useSiteContent } from '@/lib/useSiteContent';

export default function WhyChooseUs() {
  const { why } = useSiteContent();
  return (
    <section className="why" id="why">
      <div className="container why-inner">
        <div className="why-header">
          <span className="section-label why-label">{why.sectionLabel}</span>
          <h2 className="why-heading">{why.heading}</h2>
          <p className="why-sub">Built on three decades of supply chain excellence, technical knowledge, and client trust.</p>
        </div>
        <div className="why-num-grid">
          {why.items.map((r, i) => (
            <div className="why-num-item" key={i}>
              <span className="why-num">{String(i + 1).padStart(2, '0')}</span>
              <h4 className="why-item-title">{r.title}</h4>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
