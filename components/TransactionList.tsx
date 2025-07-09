import React from 'react';
import { Transaction, TransactionType } from '../types';
import { ALL_CATEGORIES } from '../constants';
import { TrashIcon, GoogleSheetsIcon } from './icons/IconComponents';

interface TransactionListProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
  onOpenSyncModal: () => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const TransactionItem: React.FC<{ transaction: Transaction; onDelete: () => void }> = ({ transaction, onDelete }) => {
  const category = ALL_CATEGORIES.find(c => c.id === transaction.category);
  const isIncome = transaction.type === TransactionType.INCOME;
  const amountColor = isIncome ? 'text-green-400' : 'text-red-400';
  const borderColor = isIncome ? 'border-green-500/50' : 'border-red-500/50';

  return (
    <li className={`bg-slate-800/50 p-4 rounded-lg flex items-center space-x-4 border-l-4 ${borderColor} group`}>
      <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full" style={{ backgroundColor: category?.color ?? '#64748b' }}>
        {category && <category.icon className="h-6 w-6 text-white" />}
      </div>
      <div className="flex-grow">
        <p className="font-semibold text-slate-100">{transaction.description}</p>
        <p className="text-sm text-slate-400">{category?.name ?? 'Uncategorized'} &middot; {new Date(transaction.date).toLocaleDateString()}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className={`font-bold text-lg ${amountColor}`}>{isIncome ? '+' : '-'} {formatCurrency(transaction.amount)}</p>
      </div>
      <button 
        onClick={onDelete} 
        className="ml-4 p-2 text-slate-500 hover:text-red-400 rounded-full hover:bg-slate-700 opacity-0 group-hover:opacity-100 transition-all focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-500"
        aria-label="Delete transaction"
      >
        <TrashIcon className="w-5 h-5" />
      </button>
    </li>
  );
};

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onDeleteTransaction, onOpenSyncModal }) => {
  return (
    <div className="bg-slate-800 p-6 rounded-xl shadow-2xl border border-slate-700 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-slate-100">Recent Transactions</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSyncModal}
            className="p-2 text-slate-400 hover:text-green-400 rounded-full hover:bg-slate-700 transition-colors"
            aria-label="Sync with Google Sheets"
            title="Sync with Google Sheets"
          >
            <GoogleSheetsIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
      {transactions.length === 0 ? (
        <div className="flex-grow flex items-center justify-center text-center">
           <div>
            <p className="text-slate-400">No transactions yet.</p>
            <p className="text-sm text-slate-500">Add one or sync with Google Sheets!</p>
          </div>
        </div>
      ) : (
        <ul className="space-y-3 overflow-y-auto pr-2 flex-grow">
          {transactions.map(transaction => (
            <TransactionItem key={transaction.id} transaction={transaction} onDelete={() => onDeleteTransaction(transaction.id)} />
          ))}
        </ul>
      )}
    </div>
  );
};

export default TransactionList;