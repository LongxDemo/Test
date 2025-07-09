import React from 'react';
import { ChartPieIcon } from './icons/IconComponents';

const Header: React.FC = () => {
  return (
    <header className="bg-slate-800/50 backdrop-blur-sm shadow-lg sticky top-0 z-50 border-b border-slate-700">
      <div className="container mx-auto px-4 md:px-6 py-4">
        <div className="flex items-center space-x-3">
          <ChartPieIcon className="w-8 h-8 text-indigo-400" />
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
            Demo Money Tracker
          </h1>
        </div>
      </div>
    </header>
  );
};

export default Header;