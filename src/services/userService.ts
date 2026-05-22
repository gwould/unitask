import type { User, RegisterData } from '../types';
import { localRepository } from './localRepository';

export const userService = {
  /** Attempt login */
  async login(email: string, password: string): Promise<User | null> {
    const accounts = localRepository.accounts.getAll();
    const match = accounts.find(
      (a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password,
    );
    if (!match) return null;
    const { password: _, ...userData } = match;
    return userData;
  },

  /** Register a new user */
  async register(data: RegisterData): Promise<User | null> {
    const accounts = localRepository.accounts.getAll();
    if (accounts.some((a) => a.email.toLowerCase() === data.email.toLowerCase())) {
      return null; // email exists
    }
    const newUser = localRepository.createAccount(data);
    accounts.push(newUser);
    localRepository.accounts.save(accounts);
    const { password: _, ...userData } = newUser;
    return userData;
  },

  /** Persist user session */
  persistUser(user: User | null): void {
    localRepository.userSession.set(user);
  },

  /** Restore user session */
  restoreUser(): User | null {
    return localRepository.userSession.get();
  },
};
