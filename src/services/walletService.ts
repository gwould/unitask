import type { Transaction, BankMethod } from '../types';
import { STORAGE_KEYS } from '../constants';
import { getFromStorage, setToStorage } from '../utils/storage';
import { simulateDelay } from '../utils/async';

/* ─── SEED DATA ───────────────────────────────────── */

function getSeedTransactions(role: string): Transaction[] {
  if (role === 'student') {
    return [
      { id: 'tx-1', type: 'income',   label: 'Thanh toán job: Frontend Developer',     amount: 3_200_000,  date: '2026-03-01', status: 'completed', jobTitle: 'Frontend Developer (React + Tailwind)' },
      { id: 'tx-2', type: 'income',   label: 'Thanh toán job: Viết 10 bài SEO Blog',   amount: 1_600_000,  date: '2026-02-22', status: 'completed', jobTitle: 'Viết 10 bài SEO Blog (chuẩn EEAT)' },
      { id: 'tx-3', type: 'withdraw', label: 'Rút tiền về Vietcombank ****1234',        amount: -2_000_000, date: '2026-02-15', status: 'completed' },
      { id: 'tx-4', type: 'income',   label: 'Thanh toán job: Dịch thuật tài liệu',    amount: 1_200_000,  date: '2026-02-10', status: 'completed' },
      { id: 'tx-5', type: 'withdraw', label: 'Rút tiền về MoMo',                       amount: -1_500_000, date: '2026-01-28', status: 'completed' },
    ];
  }
  return [
    { id: 'tx-1', type: 'escrow_in',      label: 'Nạp Escrow: Frontend Developer',    amount: -4_000_000, date: '2026-02-25', status: 'completed' },
    { id: 'tx-2', type: 'escrow_release', label: 'Giải phóng Escrow: Viết bài SEO',   amount: -1_800_000, date: '2026-02-20', status: 'completed' },
    { id: 'tx-3', type: 'escrow_in',      label: 'Nạp Escrow: Thiết kế UI/UX',        amount: -3_000_000, date: '2026-02-18', status: 'pending' },
    { id: 'tx-4', type: 'escrow_in',      label: 'Nạp Escrow: Video TikTok',          amount: -5_000_000, date: '2026-02-10', status: 'completed' },
    { id: 'tx-5', type: 'escrow_release', label: 'Giải phóng Escrow: Dịch thuật',     amount: -1_500_000, date: '2026-01-30', status: 'completed' },
  ];
}

function getDefaultBankMethods(): BankMethod[] {
  return [
    { id: 'bm-1', icon: '🏦', name: 'Vietcombank', detail: '****1234 · Nguyễn Minh Anh',  isDefault: true },
    { id: 'bm-2', icon: '📱', name: 'Ví MoMo',     detail: '0912***678',                   isDefault: false },
  ];
}

/* ─── SERVICE ─────────────────────────────────────── */

export const walletService = {
  /** Load transactions */
  async getTransactions(role: string): Promise<Transaction[]> {
    await simulateDelay(700);
    const stored = getFromStorage<Transaction[]>(STORAGE_KEYS.TRANSACTIONS, []);
    return stored.length > 0 ? stored : getSeedTransactions(role);
  },

  /** Save transactions */
  saveTransactions(txs: Transaction[]): void {
    setToStorage(STORAGE_KEYS.TRANSACTIONS, txs);
  },

  /** Load bank methods */
  async getBankMethods(): Promise<BankMethod[]> {
    await simulateDelay(300);
    const stored = getFromStorage<BankMethod[]>(STORAGE_KEYS.BANK_METHODS, []);
    return stored.length > 0 ? stored : getDefaultBankMethods();
  },

  /** Save bank methods */
  saveBankMethods(methods: BankMethod[]): void {
    setToStorage(STORAGE_KEYS.BANK_METHODS, methods);
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
    const methods = getFromStorage<BankMethod[]>(STORAGE_KEYS.BANK_METHODS, getDefaultBankMethods());
    const method: BankMethod = {
      id: `bm-${Date.now()}`,
      icon: data.icon,
      name: data.name.trim(),
      detail: data.detail.trim(),
      isDefault: methods.length === 0,
    };
    methods.push(method);
    setToStorage(STORAGE_KEYS.BANK_METHODS, methods);
    return method;
  },
};
