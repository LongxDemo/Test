
import { Category } from './types';
import { 
  SalaryIcon, 
  InvestmentIcon, 
  GiftIcon, 
  FoodIcon, 
  TransportIcon, 
  HousingIcon, 
  EntertainmentIcon, 
  HealthIcon,
  ShoppingIcon,
  UtilitiesIcon,
  OtherIcon 
} from './components/icons/IconComponents';

export const INCOME_CATEGORIES: Category[] = [
  { id: 'salary', name: 'Salary', icon: SalaryIcon, color: '#10b981' }, // emerald-500
  { id: 'investments', name: 'Investments', icon: InvestmentIcon, color: '#22c55e' }, // green-500
  { id: 'gifts', name: 'Gifts', icon: GiftIcon, color: '#84cc16' }, // lime-500
  { id: 'other_income', name: 'Other', icon: OtherIcon, color: '#a3a3a3' }, // neutral-400
];

export const EXPENSE_CATEGORIES: Category[] = [
  { id: 'food', name: 'Food & Dining', icon: FoodIcon, color: '#ef4444' }, // red-500
  { id: 'transport', name: 'Transportation', icon: TransportIcon, color: '#f97316' }, // orange-500
  { id: 'housing', name: 'Housing', icon: HousingIcon, color: '#eab308' }, // yellow-500
  { id: 'utilities', name: 'Utilities', icon: UtilitiesIcon, color: '#3b82f6' }, // blue-500
  { id: 'entertainment', name: 'Entertainment', icon: EntertainmentIcon, color: '#8b5cf6' }, // violet-500
  { id: 'health', name: 'Health & Wellness', icon: HealthIcon, color: '#d946ef' }, // fuchsia-500
  { id: 'shopping', name: 'Shopping', icon: ShoppingIcon, color: '#ec4899' }, // pink-500
  { id: 'other_expense', name: 'Other', icon: OtherIcon, color: '#a3a3a3' }, // neutral-400
];

export const ALL_CATEGORIES = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];
