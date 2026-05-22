import type { Transaction, BankMethod } from '../types';
import { simulateDelay } from '../utils/async';
import { localRepository } from './localRepository';

/* ─── SERVICE ─────────────────────────────────────── */

export const walletService = {
  /** Load transactions */
  async getTransactions(role: string): Promise<Transaction[]> {
    await simulateDelay(700);
    return localRepository.transactions.get(role);
  },

  /** Save transactions */
  saveTransactions(txs: Transaction[]): void {
    localRepository.transactions.save(txs);
  },

  /** Load bank methods */
  async getBankMethods(): Promise<BankMethod[]> {
    await simulateDelay(300);
    return localRepository.bankMethods.getAll();
  },

  /** Save bank methods */
  saveBankMethods(methods: BankMethod[]): void {
    localRepository.bankMethods.save(methods);
  },

  /** Process a withdrawal */
  async withdraw(amount: number, method: BankMethod): Promise<Transaction> {
    await simulateDelay(1200);
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'withdraw',
      label: `Rút tiền về ${method.name} ${method.detail}`,
      amount: -amount,
      date: new Date().toISOString().slice(0, 10),
      status: 'processing',
    };
    return newTx;
  },

  /** Add a new bank method */
  async addBankMethod(data: { icon: string; name: string; detail: string }): Promise<BankMethod> {
    await simulateDelay(400);
    const methods = localRepository.bankMethods.getAll();
    const method: BankMethod = {
      id: `bm-${Date.now()}`,
      icon: data.icon,
      name: data.name.trim(),
      detail: data.detail.trim(),
      isDefault: methods.length === 0,
    };
    methods.push(method);
    localRepository.bankMethods.save(methods);
    return method;
  },
};
