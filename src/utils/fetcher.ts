/**
 * Standard SWR-compatible fetcher.
 * Used as the default fetcher across all data-fetching hooks.
 */
export const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};
