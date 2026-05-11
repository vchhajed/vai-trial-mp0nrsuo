'use client';
import { useSiteContent } from '@/lib/useSiteContent';

export default function ServiceExcellence() {
  const { services } = useSiteContent();
  return (
    <section className="service section" id="service">
      <div className="container">
        <div className="service-header">
          <span className="section-label">{services.sectionLabel}</span>
          <h2 className="service-heading">{services.heading}</h2>
        </div>

        <div className="service-process">
          {services.items.map((s, i) => (
            <div className="process-step" key={i}>
              <div className="process-step-num">{String(i + 1).padStart(2, '0')}</div>
              <div className="process-connector" />
              <div className="process-step-body">
                <h4>{s.title}</h4>
                <p>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
