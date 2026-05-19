/** Normalize user/company ids for APIs and storage keys */
export function toIdString(id: string | number): string {
  return String(id);
}
