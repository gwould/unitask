/** Use API data when available; otherwise fall back to local mock seed. */
export async function withFallback<T>(
  fetcher: () => Promise<T>,
  fallback: T,
  isEmpty: (value: T) => boolean = (v) => Array.isArray(v) && v.length === 0,
): Promise<T> {
  try {
    const data = await fetcher();
    return isEmpty(data) ? fallback : data;
  } catch {
    return fallback;
  }
}
