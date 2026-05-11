'use client';
import { useCart } from '@/lib/CartContext';

const WHATSAPP = '919860489490';

export default function Cart() {
  const { items, open, setOpen, removeItem, updateQty, clearCart, totalCount } = useCart();

  function checkout() {
    if (items.length === 0) return;
    const lines = items.map((item, i) =>
      `${i + 1}. ${item.title} (${item.category})${item.qty > 1 ? ` × ${item.qty}` : ''}`
    ).join('\n');
    const msg = `Hello Namo Steel! 🙏\n\nI'd like to enquire about the following products:\n\n${lines}\n\nPlease share pricing and availability. Thank you!`;
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, '_blank');
  }

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, backdropFilter: 'blur(2px)' }}
        />
      )}

      {/* Drawer */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 380, maxWidth: '95vw',
        background: '#fff', zIndex: 1001, display: 'flex', flexDirection: 'column',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
        boxShadow: '-8px 0 40px rgba(0,0,0,0.15)',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#1a2a4a' }}>Enquiry Cart</h2>
            <p style={{ margin: '2px 0 0', fontSize: 12, color: '#94a3b8' }}>
              {totalCount === 0 ? 'No products added yet' : `${totalCount} product${totalCount > 1 ? 's' : ''} selected`}
            </p>
          </div>
          <button onClick={() => setOpen(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: 8, width: 36, height: 36, cursor: 'pointer', fontSize: 18, color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🛒</div>
              <div style={{ fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Your cart is empty</div>
              <div style={{ fontSize: 13 }}>Browse products and click<br />"Add to Enquiry" to get started</div>
            </div>
          ) : (
            <>
              {items.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: 12, padding: '14px 0', borderBottom: '1px solid #f8fafc', alignItems: 'flex-start' }}>
                  {/* Thumbnail */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.img} alt={item.title} style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover', flexShrink: 0, border: '1px solid #f1f5f9' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#1a2a4a', marginBottom: 2 }}>{item.title}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 8 }}>{item.category}</div>
                    {/* Qty controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button onClick={() => updateQty(item.id, item.qty - 1)} style={{ width: 26, height: 26, borderRadius: 6, border: '1.5px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', fontSize: 16, color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                      <span style={{ fontWeight: 700, fontSize: 14, minWidth: 20, textAlign: 'center', color: '#1a2a4a' }}>{item.qty}</span>
                      <button onClick={() => updateQty(item.id, item.qty + 1)} style={{ width: 26, height: 26, borderRadius: 6, border: '1.5px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer', fontSize: 16, color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                    </div>
                  </div>
                  <button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1', fontSize: 18, padding: 4, flexShrink: 0 }} title="Remove">✕</button>
                </div>
              ))}
              <button onClick={clearCart} style={{ marginTop: 8, background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#94a3b8', textDecoration: 'underline', padding: 0 }}>Clear all</button>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '20px 24px', borderTop: '1px solid #f1f5f9', background: '#fafafa' }}>
          <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 12, textAlign: 'center' }}>
            This sends an enquiry to Namo Steel via WhatsApp — no payment required.
          </div>
          <button
            onClick={checkout}
            disabled={items.length === 0}
            style={{
              width: '100%', padding: '14px 0', borderRadius: 12, border: 'none',
              background: items.length === 0 ? '#e2e8f0' : '#25d366',
              color: items.length === 0 ? '#94a3b8' : '#fff',
              fontWeight: 800, fontSize: 15, cursor: items.length === 0 ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              transition: 'background 0.2s',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Send Enquiry on WhatsApp
          </button>
        </div>
      </div>
    </>
  );
}
