'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useSiteContent } from '@/lib/useSiteContent';

const heroImages = [
  { src: '/products/ms-hrc-plate.jpeg',             label: 'Flat Products' },
  { src: '/products/tmt-bars.jpeg',                  label: 'TMT Bars' },
  { src: '/products/beams.jpeg',                     label: 'Structural Steel' },
  { src: '/products/colour-coated-sheets.jpeg',      label: 'Roofing Sheets' },
];

export default function Hero() {
  const { hero } = useSiteContent();
  return (
    <section className="hero" id="home">
      <div className="hero-grid" />

      <div className="container hero-split">
        {/* Left — content */}
        <div className="hero-content">
          <div className="hero-eyebrow">
            <span className="hero-est">{hero.badge}</span>
            <span className="hero-sep">—</span>
            <span className="hero-sub-tag">Iron &amp; Steel Merchants</span>
          </div>

          <h1 className="hero-title">
            {hero.title.split('\n').map((line, i) =>
              i === 1
                ? <span key={i} className="hero-accent">{line}</span>
                : <span key={i} className="hero-title-line">{line}</span>
            )}
          </h1>

          <p className="hero-sub">{hero.subtitle}</p>

          <div className="hero-actions">
            <a
              href={`https://wa.me/${hero.phone.replace(/[\s+]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="17" height="17" style={{ flexShrink: 0 }}>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378L.436 23.03l1.621-5.942A9.91 9.91 0 0 1 .75 12C.75 5.797 5.797.75 12 .75s11.25 5.047 11.25 11.25S18.203 23.25 12 23.25z"/>
              </svg>
              {hero.phone}
            </a>
            <Link href="#products" className="btn-outline">{hero.ctaText} →</Link>
          </div>

          <div className="hero-stats-row">
            {hero.stats.map((s, i) => (
              <div key={i} className="h-stat">
                <span className="h-stat-num">{s.num}</span>
                <span className="h-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — image grid */}
        <div className="hero-visual">
          <div className="hero-img-grid">
            {heroImages.map((img, i) => (
              <div key={i} className="hero-img-cell">
                <Image
                  src={img.src}
                  alt={img.label}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="hero-img"
                  style={{ objectFit: 'cover' }}
                />
                <div className="hero-img-overlay" />
                <span className="hero-img-label">{img.label}</span>
              </div>
            ))}
          </div>
          {/* Floating badge */}
          <div className="hero-float-badge">
            <span className="hero-float-num">ISI</span>
            <span className="hero-float-text">Certified Products</span>
          </div>
        </div>
      </div>

      <div className="hero-bottom-line" />
    </section>
  );
}
