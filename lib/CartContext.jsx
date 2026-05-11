'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('ntl_cart');
      if (saved) setItems(JSON.parse(saved));
    } catch {}
  }, []);

  function persist(next) {
    setItems(next);
    localStorage.setItem('ntl_cart', JSON.stringify(next));
  }

  function addItem(product) {
    setItems(prev => {
      const exists = prev.find(i => i.id === product.id);
      const next = exists
        ? prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i)
        : [...prev, { ...product, qty: 1 }];
      localStorage.setItem('ntl_cart', JSON.stringify(next));
      return next;
    });
    setOpen(true);
  }

  function removeItem(id) {
    persist(items.filter(i => i.id !== id));
  }

  function updateQty(id, qty) {
    if (qty < 1) { removeItem(id); return; }
    persist(items.map(i => i.id === id ? { ...i, qty } : i));
  }

  function clearCart() {
    persist([]);
  }

  const totalCount = items.reduce((s, i) => s + i.qty, 0);

  return (
    <CartContext.Provider value={{ items, open, setOpen, addItem, removeItem, updateQty, clearCart, totalCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
