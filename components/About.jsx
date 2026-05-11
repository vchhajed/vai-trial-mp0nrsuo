'use client';
import Image from 'next/image';
import { useSiteContent } from '@/lib/useSiteContent';

const metrics = [
  { num: '30+', label: 'Years in Business' },
  { num: '15+', label: 'Premium Brands' },
  { num: 'ISI', label: 'Certified Products' },
  { num: '₹10Cr+', label: 'Projects Delivered' },
];

export default function About() {
  const { about } = useSiteContent();
  return (
    <section className="about" id="about">
      {/* Metrics strip */}
      <div className="metrics-strip">
        <div className="container metrics-inner">
          {metrics.map((m, i) => (
            <div key={i} className="metric-item">
              <span className="metric-num">{m.num}</span>
              <span className="metric-label">{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="container about-grid section">
        <div className="about-text">
          <span className="section-label">{about.sectionLabel}</span>
          <h2 className="about-heading">{about.heading}</h2>
          <p className="about-desc">{about.description}</p>
          <div className="about-highlights">
            {about.checklist.map((item, i) => (
              <div key={i} className="about-highlight-item">
                <span className="highlight-num">0{i + 1}</span>
                <span className="highlight-text">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — image with floating badge */}
        <div className="about-img-col">
          <div className="about-img-wrap">
            <Image
              src={about.image || '/products/beams.jpeg'}
              alt="Steel Beams & Structural Products"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="about-img"
              style={{ objectFit: 'cover' }}
            />
            <div className="about-img-tint" />

            {/* Vision/Mission overlaid as floating cards */}
            <div className="about-vm-stack">
              <div className="about-vm-pill">
                <div className="about-vm-pill-title">Vision</div>
                <div className="about-vm-pill-text">{about.vision.slice(0, 80)}…</div>
              </div>
              <div className="about-vm-pill about-vm-pill--alt">
                <div className="about-vm-pill-title">Mission</div>
                <div className="about-vm-pill-text">{about.mission.slice(0, 80)}…</div>
              </div>
            </div>

            {/* Corner badge */}
            <div className="about-corner-badge">
              <span className="about-badge-num">30+</span>
              <span className="about-badge-label">Years of Trust</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
