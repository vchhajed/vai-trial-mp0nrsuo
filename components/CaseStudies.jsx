'use client';
import { useSiteContent } from '@/lib/useSiteContent';

export default function CaseStudies() {
  const { caseStudies } = useSiteContent();
  return (
    <section className="cases section" id="cases">
      <div className="container">
        <div className="section-header">
          <span className="section-label">Case Studies</span>
          <h2>Real Projects, Real Results</h2>
        </div>
        <div className="cases-grid">
          {caseStudies.map((c) => (
            <div className="case-card" key={c.num}>
              <div className="case-num">{c.num}</div>
              <h3>{c.title}</h3>
              <div className="case-meta"><span>{c.client}</span></div>
              <p className="case-project">{c.project}</p>
              <p>{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
