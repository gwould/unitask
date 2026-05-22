import { STORAGE_KEYS } from '../constants';

export function hasAuthToken(): boolean {
  try {
    return Boolean(localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN));
  } catch {
    return false;
  }
}
