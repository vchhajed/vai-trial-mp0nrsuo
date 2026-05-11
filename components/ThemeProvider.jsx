'use client';
import { useEffect } from 'react';
import { useSiteContent } from '@/lib/useSiteContent';

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

function darken(hex, amount = 30) {
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - amount);
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - amount);
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - amount);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function lighten(hex, amount = 20) {
  const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + amount);
  const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + amount);
  const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + amount);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export default function ThemeProvider() {
  const content = useSiteContent();
  const theme = content?.theme;
  const branding = content?.branding;

  useEffect(() => {
    if (!theme?.primary || !theme?.secondary) return;
    const root = document.documentElement;
    root.style.setProperty('--orange', theme.primary);
    root.style.setProperty('--orange-dark', theme.primaryDark || darken(theme.primary));
    root.style.setProperty('--navy', theme.secondary);
    root.style.setProperty('--navy-light', theme.secondaryLight || lighten(theme.secondary));
  }, [theme]);

  useEffect(() => {
    if (!branding) return;
    const root = document.documentElement;
    const headingFont = branding.headingFont || 'Inter';
    const bodyFont = branding.bodyFont || 'Inter';
    root.style.setProperty('--font-heading', `'${headingFont}', system-ui, sans-serif`);
    root.style.setProperty('--font-body', `'${bodyFont}', system-ui, sans-serif`);
    [headingFont, bodyFont].filter(f => f && f !== 'Inter').forEach(font => {
      const id = `gfont-${font.replace(/\s+/g, '-')}`;
      if (!document.getElementById(id)) {
        const link = document.createElement('link');
        link.id = id;
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font)}:wght@400;500;600;700;900&display=swap`;
        document.head.appendChild(link);
      }
    });
  }, [branding]);

  return null;
}
