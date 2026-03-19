export type TxType = 'income' | 'escrow_in' | 'withdraw' | 'escrow_release';
export type TxStatus = 'completed' | 'pending' | 'processing';
export type TxFilter = TxType | 'all';

export interface Transaction {
  id: string;
  type: TxType;
  label: string;
  amount: number;
  date: string;
  status: TxStatus;
  jobTitle?: string;
}

export interface BankMethod {
  id: string;
  icon: string;
  name: string;
  detail: string;
  isDefault: boolean;
}

export interface WithdrawForm {
  amount: string;
  methodId: string;
}
