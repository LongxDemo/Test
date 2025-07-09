
import React from 'react';
import { ArrowUpIcon, ArrowDownIcon, ScaleIcon } from './icons/IconComponents';

interface BalanceSummaryProps {
  balance: number;
  income: number;
  expense: number;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const BalanceCard: React.FC<{ title: string; amount: number; icon: React.ReactNode; colorClass: string }> = ({ title, amount, icon, colorClass }) => (
  <div className={`bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700 flex items-center space-x-4 ${colorClass}`}>
    <div className="bg-slate-900 p-3 rounded-full">
      {icon}
    </div>
    <div>
      <p className="text-slate-400 text-sm font-medium">{title}</p>
      <p className="text-2xl font-bold text-slate-100">{formatCurrency(amount)}</p>
    </div>
  </div>
);

const BalanceSummary: React.FC<BalanceSummaryProps> = ({ balance, income, expense }) => {
  const balanceColor = balance >= 0 ? 'text-green-400' : 'text-red-400';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
      <BalanceCard 
        title="Total Income"
        amount={income}
        icon={<ArrowUpIcon className="w-6 h-6 text-green-400" />}
        colorClass="border-l-4 border-green-500"
      />
      <BalanceCard 
        title="Total Expenses"
        amount={expense}
        icon={<ArrowDownIcon className="w-6 h-6 text-red-400" />}
        colorClass="border-l-4 border-red-500"
      />
       <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700 flex items-center space-x-4 border-l-4 border-indigo-500">
         <div className="bg-slate-900 p-3 rounded-full">
           <ScaleIcon className="w-6 h-6 text-indigo-400" />
         </div>
        <div>
          <p className="text-slate-400 text-sm font-medium">Current Balance</p>
          <p className={`text-2xl font-bold ${balanceColor}`}>{formatCurrency(balance)}</p>
        </div>
      </div>
    </div>
  );
};

export default BalanceSummary;
