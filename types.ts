
export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export interface Category {
  id: string;
  name: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  color: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  category: Category['id'];
  date: string;
}
