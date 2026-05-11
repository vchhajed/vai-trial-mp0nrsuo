'use client';
import { useSiteContent } from '@/lib/useSiteContent';

export default function Brands() {
  const { brands } = useSiteContent();
  const row1 = [...brands, ...brands];
  const row2 = [...brands.slice().reverse(), ...brands.slice().reverse()];

  return (
    <section className="brands" id="brands">
      <div className="brands-header container">
        <span className="section-label brands-label">Brands We Deal</span>
        <h2 className="brands-heading">Partnered with Industry&apos;s Best</h2>
      </div>

      <div className="marquee-wrapper">
        <div className="marquee-fade-left" />
        <div className="marquee-fade-right" />

        <div className="marquee-row">
          <div className="marquee-track">
            {row1.map((b, i) => (
              <div key={i} className="marquee-item">{b}</div>
            ))}
          </div>
        </div>

        <div className="marquee-row">
          <div className="marquee-track marquee-track--reverse">
            {row2.map((b, i) => (
              <div key={i} className="marquee-item marquee-item--alt">{b}</div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
