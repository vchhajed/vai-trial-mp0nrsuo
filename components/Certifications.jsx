'use client';
import { useSiteContent } from '@/lib/useSiteContent';

export default function Certifications() {
  const { certifications } = useSiteContent();
  return (
    <section className="certs" id="certs">
      <div className="certs-top">
        <div className="container certs-top-inner">
          <span className="section-label certs-label">{certifications.sectionLabel}</span>
          <h2 className="certs-heading">{certifications.heading}</h2>
        </div>
      </div>
      <div className="certs-items container">
        {certifications.items.map((c, i) => (
          <div className="cert-item" key={i}>
            <div className="cert-item-num">{c.num}</div>
            <div className="cert-item-bar" />
            <h4 className="cert-item-title">{c.title}</h4>
          </div>
        ))}
      </div>
    </section>
  );
}
