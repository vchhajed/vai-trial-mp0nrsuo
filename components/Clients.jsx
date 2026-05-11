'use client';
import { useSiteContent } from '@/lib/useSiteContent';

export default function Clients() {
  const { clients } = useSiteContent();
  return (
    <section className="clients section" id="clients">
      <div className="container">
        <div className="section-header">
          <span className="section-label">Our Clients</span>
          <h2>Clients Through BNI</h2>
        </div>
        <div className="clients-grid">
          {clients.map((c) => (
            <div className="client-pill" key={c}>{c}</div>
          ))}
        </div>
      </div>
    </section>
  );
}
