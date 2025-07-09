
import React from 'react';
import { PiggyBankIcon } from './icons/IconComponents';

interface MonthlySavingsGoalProps {
  income: number;
  expenses: number;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const SAVINGS_RATE = 0.15;

const MonthlySavingsGoal: React.FC<MonthlySavingsGoalProps> = ({ income, expenses }) => {
    const savingsGoal = income * SAVINGS_RATE;
    const amountSaved = Math.max(0, income - expenses);
    const progress = savingsGoal > 0 ? Math.min((amountSaved / savingsGoal) * 100, 100) : 0;
    const progressColor = progress >= 100 ? 'bg-green-500' : 'bg-indigo-500';

    return (
        <div className="mt-8 bg-slate-800 p-6 rounded-xl shadow-2xl border border-slate-700">
            <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-3">
                    <PiggyBankIcon className="w-7 h-7 text-indigo-400" />
                    <h2 className="text-xl font-bold text-slate-100">Monthly Savings Goal (15%)</h2>
                 </div>
                 <span className="text-lg font-semibold text-green-400">{formatCurrency(savingsGoal)}</span>
            </div>
            <div className="space-y-2">
                 <div className="w-full bg-slate-700 rounded-full h-4">
                    <div
                        className={`h-4 rounded-full transition-all duration-500 ease-in-out ${progressColor}`}
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
                <div className="flex justify-between text-sm font-medium text-slate-400">
                    <span>Saved: {formatCurrency(amountSaved)}</span>
                    <span>{Math.round(progress)}% Complete</span>
                </div>
            </div>
        </div>
    );
};

export default MonthlySavingsGoal;
