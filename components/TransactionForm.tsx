
import React, { useState } from 'react';
import { TransactionType } from '../types';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../constants';
import { Transaction } from '../types';

interface TransactionFormProps {
  onAddTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
  onCancel: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onAddTransaction, onCancel }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0].id);
  const [error, setError] = useState('');

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    setCategory(newType === TransactionType.INCOME ? INCOME_CATEGORIES[0].id : EXPENSE_CATEGORIES[0].id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount) {
      setError('Description and amount are required.');
      return;
    }
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Please enter a valid, positive amount.');
      return;
    }

    onAddTransaction({
      description: description.trim(),
      amount: numericAmount,
      type,
      category,
    });
    
    // Reset form
    setDescription('');
    setAmount('');
    setError('');
    setType(TransactionType.EXPENSE);
    setCategory(EXPENSE_CATEGORIES[0].id);
  };

  const categories = type === TransactionType.INCOME ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="bg-slate-800 p-6 rounded-xl shadow-2xl border border-slate-700">
      <h2 className="text-xl font-bold text-slate-100 mb-4">Add a New Transaction</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-slate-300">Description</label>
          <input
            type="text"
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-slate-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="e.g. Groceries, Paycheck"
          />
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-slate-300">Amount</label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-slate-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="0.00"
            step="0.01"
          />
        </div>

        <div>
          <span className="block text-sm font-medium text-slate-300">Type</span>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <button type="button" onClick={() => handleTypeChange(TransactionType.EXPENSE)} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${type === TransactionType.EXPENSE ? 'bg-red-500 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}>
              Expense
            </button>
            <button type="button" onClick={() => handleTypeChange(TransactionType.INCOME)} className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${type === TransactionType.INCOME ? 'bg-green-500 text-white' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'}`}>
              Income
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-slate-300">Category</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-slate-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex items-center justify-end space-x-3 pt-2">
            <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-600 hover:bg-slate-500 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-slate-500 transition-colors"
            >
                Cancel
            </button>
            <button
                type="submit"
                className="px-6 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500 transition-colors"
            >
                Add Transaction
            </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;
