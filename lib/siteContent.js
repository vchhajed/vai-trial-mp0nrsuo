import fileContent from '../data/content.json';

// The source of truth is data/content.json — committed to git.
// To update the live site: edit in /admindashboard → Download content.json → replace this file → git push.
export const defaultContent = fileContent;

const STORAGE_KEY = 'ntl_site_content';

export function getSiteContent() {
  if (typeof window === 'undefined') return defaultContent;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultContent;
    return deepMerge(defaultContent, JSON.parse(stored));
  } catch {
    return defaultContent;
  }
}

export function setSiteContent(content) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
  window.dispatchEvent(new CustomEvent('ntl-content-updated'));
}

function deepMerge(base, override) {
  const result = { ...base };
  for (const key of Object.keys(override)) {
    if (
      key in base &&
      typeof base[key] === 'object' &&
      !Array.isArray(base[key]) &&
      base[key] !== null
    ) {
      result[key] = deepMerge(base[key], override[key]);
    } else {
      result[key] = override[key];
    }
  }
  return result;
}
