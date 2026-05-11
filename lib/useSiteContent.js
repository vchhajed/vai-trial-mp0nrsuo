'use client';
import { useState, useEffect } from 'react';
import { getSiteContent, setSiteContent } from './siteContent';

export function useSiteContent() {
  // Start with whatever is in localStorage (or the file default) — renders instantly
  const [content, setContent] = useState(getSiteContent);

  useEffect(() => {
    // Fetch the latest published content from the server (Vercel KV)
    fetch('/api/content')
      .then((r) => r.json())
      .then((data) => {
        setSiteContent(data);   // keep localStorage in sync
        setContent(data);
      })
      .catch(() => {
        // Network error or dev without KV — stay with local content
      });

    // Also react to local admin publishes on the same device
    const handler = () => setContent(getSiteContent());
    window.addEventListener('ntl-content-updated', handler);
    return () => window.removeEventListener('ntl-content-updated', handler);
  }, []);

  return content;
}
