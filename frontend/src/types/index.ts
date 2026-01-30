export const Frequency = {
  OneTime: 0,
  Daily: 1,
  Weekly: 2,
  BiWeekly: 3,
  Monthly: 4,
  Quarterly: 5,
  Yearly: 6,
} as const;
export type Frequency = typeof Frequency[keyof typeof Frequency];

export const TransactionType = {
  Expense: 0,
  Income: 1,
  Deduction: 2,
} as const;
export type TransactionType = typeof TransactionType[keyof typeof TransactionType];

export const ImportedTransactionStatus = {
  Pending: 0,
  Reviewed: 1,
  AddedToMonth: 2,
  Ignored: 3,
} as const;
export type ImportedTransactionStatus = typeof ImportedTransactionStatus[keyof typeof ImportedTransactionStatus];

export const MonthStatus = {
  Open: 0,
  Locked: 1,
  Reconciled: 2,
} as const;
export type MonthStatus = typeof MonthStatus[keyof typeof MonthStatus];

export interface Expense {
  id: number;
  description: string;
  amount: number;
  date: string;
  category?: string;
  isRecurrent: boolean;
  frequency: Frequency;
  monthlyRecordId?: number;
  createdAt: string;
}

export interface CreateExpense {
  description: string;
  amount: number;
  date: string;
  category?: string;
  isRecurrent: boolean;
  frequency: Frequency;
  monthlyRecordId?: number;
}

export interface Income {
  id: number;
  description: string;
  amount: number;
  date: string;
  category?: string;
  isRecurrent: boolean;
  frequency: Frequency;
  isNetIncome: boolean;
  monthlyRecordId?: number;
  createdAt: string;
}

export interface CreateIncome {
  description: string;
  amount: number;
  date: string;
  category?: string;
  isRecurrent: boolean;
  frequency: Frequency;
  isNetIncome?: boolean;
  monthlyRecordId?: number;
}

export interface Deduction {
  id: number;
  description: string;
  amount: number;
  date: string;
  category?: string;
  deductionType?: string;
  isRecurrent: boolean;
  frequency: Frequency;
  monthlyRecordId?: number;
  createdAt: string;
}

export interface CreateDeduction {
  description: string;
  amount: number;
  date: string;
  category?: string;
  deductionType?: string;
  isRecurrent: boolean;
  frequency: Frequency;
  monthlyRecordId?: number;
}

export interface ImportedTransaction {
  id: number;
  description: string;
  amount: number;
  transactionDate: string;
  category?: string;
  source?: string;
  status: ImportedTransactionStatus;
  assignedType?: TransactionType;
  isRecurrent: boolean;
  frequency: Frequency;
  importBatchId: number;
  createdAt: string;
  reviewedAt?: string;
}

export interface ImportBatch {
  id: number;
  fileName: string;
  source?: string;
  importedAt: string;
  totalTransactions: number;
  processedTransactions: number;
  transactions: ImportedTransaction[];
}

export interface MonthlyRecord {
  id: number;
  year: number;
  month: number;
  status: MonthStatus;
  totalIncome: number;
  totalExpenses: number;
  totalDeductions: number;
  netBalance: number;
  notes?: string;
  createdAt: string;
  reconciledAt?: string;
  lockedAt?: string;
}

export interface MonthlyRecordDetail extends MonthlyRecord {
  expenses: Expense[];
  incomes: Income[];
  deductions: Deduction[];
}

export interface MonthComparison {
  year: number;
  month: number;
  totalIncome: number;
  totalExpenses: number;
  totalDeductions: number;
  netBalance: number;
  expensesByCategory: Record<string, number>;
  incomeByCategory: Record<string, number>;
}

export interface TrendAnalysis {
  monthlyData: MonthComparison[];
  averageMonthlyIncome: number;
  averageMonthlyExpense: number;
  averageMonthlyDeductions: number;
  averageNetBalance: number;
  topExpenseCategory?: string;
  topIncomeCategory?: string;
}

export interface ReviewTransaction {
  assignedType: TransactionType;
  category?: string;
  isRecurrent: boolean;
  frequency: Frequency;
  monthlyRecordId?: number;
}

export const frequencyLabels: Record<Frequency, string> = {
  [Frequency.OneTime]: 'One Time',
  [Frequency.Daily]: 'Daily',
  [Frequency.Weekly]: 'Weekly',
  [Frequency.BiWeekly]: 'Bi-Weekly',
  [Frequency.Monthly]: 'Monthly',
  [Frequency.Quarterly]: 'Quarterly',
  [Frequency.Yearly]: 'Yearly',
};

export const transactionTypeLabels: Record<TransactionType, string> = {
  [TransactionType.Expense]: 'Expense',
  [TransactionType.Income]: 'Income',
  [TransactionType.Deduction]: 'Deduction',
};

export const statusLabels: Record<MonthStatus, string> = {
  [MonthStatus.Open]: 'Open',
  [MonthStatus.Locked]: 'Locked',
  [MonthStatus.Reconciled]: 'Reconciled',
};

export const importStatusLabels: Record<ImportedTransactionStatus, string> = {
  [ImportedTransactionStatus.Pending]: 'Pending',
  [ImportedTransactionStatus.Reviewed]: 'Reviewed',
  [ImportedTransactionStatus.AddedToMonth]: 'Added',
  [ImportedTransactionStatus.Ignored]: 'Ignored',
};
