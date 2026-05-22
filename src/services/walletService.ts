import type { Transaction, BankMethod } from '../types';
import { simulateDelay } from '../utils/async';
import { localRepository } from './localRepository';
import { apiGet, apiPost } from './apiService';

type WalletResponse = {
  balance?: number | null;
  totalEarned?: number | null;
  totalWithdrawn?: number | null;
};

type WithdrawalResponse = {
  id: string;
  amount: number;
  status: string;
  requestedAt?: string | null;
  completedAt?: string | null;
};

function mapWithdrawalToTransaction(w: WithdrawalResponse): Transaction {
  const date = w.requestedAt
    ? new Date(w.requestedAt).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10);
  const status = w.status === 'completed'
    ? 'completed'
    : w.status === 'pending'
      ? 'processing'
      : 'processing';

  return {
    id: w.id,
    type: 'withdraw',
    label: 'Yêu cầu rút tiền',
    amount: -Math.abs(Number(w.amount)),
    date,
    status,
  };
}

export const walletService = {
  /** Load wallet summary from API (student) */
  async getWalletSummary(): Promise<WalletResponse | null> {
    try {
      return await apiGet<WalletResponse>('/api/wallets/my-wallet');
    } catch {
      return null;
    }
  },

  /** Load transactions — API history for students, local fallback otherwise */
  async getTransactions(role: string): Promise<Transaction[]> {
    if (role === 'student') {
      try {
        const history = await apiGet<WithdrawalResponse[]>('/api/wallets/withdrawal-history');
        return history.map(mapWithdrawalToTransaction);
      } catch {
        // fall through to local
      }
    }

    await simulateDelay(300);
    return localRepository.transactions.get(role);
  },

  saveTransactions(txs: Transaction[]): void {
    localRepository.transactions.save(txs);
  },

  async getBankMethods(): Promise<BankMethod[]> {
    await simulateDelay(300);
    return localRepository.bankMethods.getAll();
  },

  saveBankMethods(methods: BankMethod[]): void {
    localRepository.bankMethods.save(methods);
  },

  async withdraw(
    amount: number,
    bank: { accountName: string; accountNumber: string; bankName: string },
  ): Promise<Transaction> {
    try {
      const result = await apiPost<WithdrawalResponse>('/api/wallets/withdraw', {
        amount,
        bankAccountName: bank.accountName,
        bankAccountNumber: bank.accountNumber,
        bankName: bank.bankName,
      });
      return mapWithdrawalToTransaction(result);
    } catch {
      await simulateDelay(1200);
      return {
        id: `tx-${Date.now()}`,
        type: 'withdraw',
        label: `Rút tiền về ${bank.bankName}`,
        amount: -amount,
        date: new Date().toISOString().slice(0, 10),
        status: 'processing',
      };
    }
  },

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
