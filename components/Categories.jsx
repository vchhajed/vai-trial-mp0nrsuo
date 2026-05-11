'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useSiteContent } from '@/lib/useSiteContent';

export default function Categories() {
  const content = useSiteContent();
  const cats = content?.categories || [];

  return (
    <section className="cats" id="categories">
      <div className="cats-grid">
        {cats.map((c, i) => (
          <Link href="#products" key={i} className="cat-card">
            <div className="cat-img-wrap">
              <Image
                src={c.img}
                alt={c.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="cat-img"
                style={{ objectFit: 'cover' }}
              />
              <div className="cat-overlay" />
            </div>
            <div className="cat-body">
              <span className="cat-label">{c.label}</span>
              <h3 className="cat-title">
                {c.title.split('\n').map((line, j) => (
                  <span key={j}>{line}{j === 0 && <br />}</span>
                ))}
              </h3>
              <p className="cat-desc">{c.desc}</p>
              <span className="cat-cta">Explore Range →</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
