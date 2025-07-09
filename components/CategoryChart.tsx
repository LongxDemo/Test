
import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Transaction, TransactionType } from '../types';
import { EXPENSE_CATEGORIES } from '../constants';

interface CategoryChartProps {
  transactions: Transaction[];
}

const CustomTooltip: React.FC<any> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const value = payload[0].value;
    return (
      <div className="bg-slate-700 p-3 rounded-md shadow-lg border border-slate-600">
        <p className="text-sm text-slate-200">{`${data.name}: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value as number)}`}</p>
      </div>
    );
  }
  return null;
};

const CategoryChart: React.FC<CategoryChartProps> = ({ transactions }) => {
  const chartData = useMemo(() => {
    const expenseTransactions = transactions.filter(t => t.type === TransactionType.EXPENSE);
    const categoryTotals: { [key: string]: number } = {};

    expenseTransactions.forEach(t => {
      if (categoryTotals[t.category]) {
        categoryTotals[t.category] += t.amount;
      } else {
        categoryTotals[t.category] = t.amount;
      }
    });

    return Object.entries(categoryTotals).map(([categoryId, total]) => {
      const category = EXPENSE_CATEGORIES.find(c => c.id === categoryId);
      return {
        name: category?.name ?? 'Other',
        value: total,
        fill: category?.color ?? '#64748b',
      };
    }).sort((a, b) => b.value - a.value);

  }, [transactions]);

  if (chartData.length === 0) {
    return null; // Don't render the chart container if there's no expense data
  }

  return (
    <div className="bg-slate-800 p-6 rounded-xl shadow-2xl border border-slate-700">
      <h2 className="text-xl font-bold text-slate-100 mb-4">Expense Breakdown by Category</h2>
      <div style={{ width: '100%', height: 350 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
              stroke="#1e293b" // slate-800
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconSize={10}
              layout="vertical"
              verticalAlign="middle"
              align="right"
              wrapperStyle={{ color: '#cbd5e1' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CategoryChart;
