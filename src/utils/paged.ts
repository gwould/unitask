/** Matches backend PagedResult<T> */
export type PagedResult<T> = {
  total: number;
  page: number;
  limit: number;
  data: T[];
};

/** Backend may return a raw array or a paged wrapper — normalize to items. */
export function unwrapPaged<T>(payload: T[] | PagedResult<T> | null | undefined): T[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  return payload.data ?? [];
}
