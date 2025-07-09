
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { Transaction, TransactionType } from './types';
import Header from './components/Header';
import BalanceSummary from './components/BalanceSummary';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import CategoryChart from './components/CategoryChart';
import MonthlySavingsGoal from './components/MonthlySavingsGoal';
import GoogleSheetSyncModal from './components/modals/GoogleSheetSyncModal';
import { PlusCircleIcon } from './components/icons/IconComponents';

// A validation function for imported transactions to ensure data integrity
const isValidTransaction = (obj: any): obj is Transaction => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.id === 'string' &&
    (obj.type === TransactionType.INCOME || obj.type === TransactionType.EXPENSE) &&
    typeof obj.amount === 'number' &&
    typeof obj.description === 'string' &&
    typeof obj.category === 'string' &&
    typeof obj.date === 'string' && !isNaN(Date.parse(obj.date))
  );
};


const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isFormVisible, setIsFormVisible] = useState<boolean>(false);
  
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [scriptUrl, setScriptUrl] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<{ loading: boolean; message: string; error: boolean }>({ loading: false, message: 'Not connected.', error: false });
  const [isAutoSaveEnabled, setIsAutoSaveEnabled] = useState(false);
  
  const isInitialMount = useRef(true);


  useEffect(() => {
    try {
      const storedUrl = localStorage.getItem('googleScriptUrl');
      if (storedUrl) {
        setScriptUrl(storedUrl);
        setSyncStatus(prev => ({ ...prev, message: "Ready to sync."}));
      }
      const storedTransactions = localStorage.getItem('transactions');
      if (storedTransactions) {
        setTransactions(JSON.parse(storedTransactions));
      }
      const storedAutoSave = localStorage.getItem('isAutoSaveEnabled');
      if (storedAutoSave) {
          setIsAutoSaveEnabled(JSON.parse(storedAutoSave));
      }
    } catch (error) {
      console.error("Failed to parse data from localStorage", error);
      toast.error("Could not load saved data.");
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('transactions', JSON.stringify(transactions));
    } catch (error) {
      console.error("Failed to save transactions to localStorage", error);
      toast.error("Could not save new data.");
    }
  }, [transactions]);
  
  // Debounced auto-save effect
  useEffect(() => {
    if (isInitialMount.current) {
        isInitialMount.current = false;
        return;
    }

    if (isAutoSaveEnabled && scriptUrl) {
        setSyncStatus({ loading: true, message: 'Auto-saving changes...', error: false });
        const handler = setTimeout(() => {
            saveToSheet(true);
        }, 2000); // 2-second debounce

        return () => {
            clearTimeout(handler);
        };
    }
  }, [transactions, isAutoSaveEnabled, scriptUrl]);


  const { totalIncome, totalExpenses, balance } = useMemo(() => {
    const income = transactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((acc, t) => acc + t.amount, 0);
    const expenses = transactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((acc, t) => acc + t.amount, 0);
    return {
      totalIncome: income,
      totalExpenses: expenses,
      balance: income - expenses,
    };
  }, [transactions]);

  const { currentMonthIncome, currentMonthExpenses } = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const monthlyTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getFullYear() === currentYear && transactionDate.getMonth() === currentMonth;
    });

    const income = monthlyTransactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((acc, t) => acc + t.amount, 0);
    
    const expenses = monthlyTransactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((acc, t) => acc + t.amount, 0);

    return { currentMonthIncome: income, currentMonthExpenses: expenses };
  }, [transactions]);

  const addTransaction = useCallback((transaction: Omit<Transaction, 'id' | 'date'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      date: new Date().toISOString(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
    toast.success(`Transaction added successfully!`);
    setIsFormVisible(false); // Hide form after successful submission
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    toast.error('Transaction removed.');
  }, []);
  
  const handleSetScriptUrl = (url: string) => {
      setScriptUrl(url);
      localStorage.setItem('googleScriptUrl', url);
      toast.success("Google Sheets URL saved!");
      setSyncStatus({loading: false, message: 'URL saved. Ready to sync.', error: false});
  };
  
  const handleToggleAutoSave = useCallback(() => {
    setIsAutoSaveEnabled(prev => {
        const newState = !prev;
        localStorage.setItem('isAutoSaveEnabled', JSON.stringify(newState));
        toast.success(`Auto-save ${newState ? 'enabled' : 'disabled'}.`);
        return newState;
    });
  }, []);


  const fetchFromSheet = async () => {
    if (!scriptUrl) {
      toast.error("Please set the Google Apps Script URL first.");
      return;
    }
    setSyncStatus({ loading: true, message: 'Fetching data from Google Sheet...', error: false });
    try {
      const response = await fetch(scriptUrl);
      if (!response.ok) {
        throw new Error(`Network response was not ok. Status: ${response.status}`);
      }
      
      const textData = await response.text();
      let data;
      try {
        data = JSON.parse(textData);
      } catch (jsonError) {
        console.error("JSON Parse Error on data:", textData);
        throw new Error('Failed to parse server response. It might be an HTML error page instead of JSON. Check the script deployment and try the Troubleshooting steps in the sync modal.');
      }

      if (data.error) throw new Error(`Script error: ${data.error}`);

      if (Array.isArray(data) && data.every(isValidTransaction)) {
        if (data.length > 0 && transactions.length > 0) {
          if (!window.confirm("This will overwrite your current local data with data from your Google Sheet. Are you sure?")) {
             setSyncStatus({ loading: false, message: 'Fetch cancelled by user.', error: false });
             return;
          }
        }
        setTransactions(data);
        toast.success(`Successfully fetched ${data.length} transactions.`);
        setSyncStatus({ loading: false, message: `Last fetch successful.`, error: false });
        setIsSyncModalOpen(false);
      } else {
        throw new Error('Data from Google Sheet is invalid or malformed.');
      }
    } catch (error) {
      const errorMessage = (error as Error).message;
      console.error("Fetch error:", error);
      
      let friendlyMessage = `Fetch failed: ${errorMessage}`;
      if (errorMessage.includes('Failed to fetch')) {
          friendlyMessage = "Fetch failed. Please check your network connection, ensure the Apps Script URL is correct, and verify the script is deployed with 'Anyone' access as per the instructions.";
      }
      
      toast.error(friendlyMessage, { duration: 6000 });
      setSyncStatus({ loading: false, message: friendlyMessage, error: true });
    }
  };

  const saveToSheet = async (isAutoSave = false) => {
    if (!scriptUrl) {
      if (!isAutoSave) toast.error("Please set the Google Apps Script URL first.");
      return;
    }
    if (!isAutoSave) {
        setSyncStatus({ loading: true, message: 'Saving data to Google Sheet...', error: false });
    }
    
    try {
      await fetch(scriptUrl, {
        method: 'POST',
        body: JSON.stringify(transactions),
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        mode: 'no-cors',
      });

      if (isAutoSave) {
        toast.success('Auto-saved to Google Sheets');
        setSyncStatus({ loading: false, message: 'Changes saved automatically.', error: false });
      } else {
        toast.success('Save request sent to Google Sheets. The sheet will update shortly.');
        setSyncStatus({ loading: false, message: 'Data sent successfully.', error: false });
        setIsSyncModalOpen(false);
      }

    } catch (error) {
       const errorMessage = (error as Error).message;
       console.error("Save error:", error);
       const friendlyMessage = `Save failed. Could not send data. Please check your network connection and ensure the Apps Script URL is correct.`;
       toast.error(friendlyMessage, { duration: 6000 });
       setSyncStatus({ loading: false, message: friendlyMessage, error: true });
    }
  };


  return (
    <>
      <Toaster position="top-center" toastOptions={{
        className: '',
        style: {
          background: '#334155', // slate-700
          color: '#f1f5f9', // slate-100
        },
      }} />
      <div className="min-h-screen bg-slate-900 font-sans">
        <Header />
        <main className="container mx-auto p-4 md:p-6">
          <BalanceSummary income={totalIncome} expense={totalExpenses} balance={balance} />
          
          {currentMonthIncome > 0 && (
            <MonthlySavingsGoal income={currentMonthIncome} expenses={currentMonthExpenses} />
          )}

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2">
               {isFormVisible ? (
                  <TransactionForm onAddTransaction={addTransaction} onCancel={() => setIsFormVisible(false)} />
               ) : (
                <div className="flex justify-center items-center h-full bg-slate-800 rounded-xl p-6 shadow-2xl border border-slate-700">
                    <button 
                        onClick={() => setIsFormVisible(true)}
                        className="flex flex-col items-center justify-center gap-4 text-slate-400 hover:text-indigo-400 transition-colors duration-300 w-full h-48 border-2 border-dashed border-slate-600 rounded-lg hover:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                    >
                        <PlusCircleIcon className="w-16 h-16"/>
                        <span className="text-xl font-semibold">Add New Transaction</span>
                    </button>
                </div>
               )}
            </div>
            <div className="lg:col-span-3">
              <TransactionList 
                transactions={transactions} 
                onDeleteTransaction={deleteTransaction}
                onOpenSyncModal={() => setIsSyncModalOpen(true)}
              />
            </div>
          </div>
          
          {transactions.filter(t => t.type === TransactionType.EXPENSE).length > 0 && (
             <div className="mt-8">
                <CategoryChart transactions={transactions} />
             </div>
          )}
        </main>
      </div>
      <GoogleSheetSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        onSetUrl={handleSetScriptUrl}
        onFetch={fetchFromSheet}
        onSave={() => saveToSheet(false)}
        currentUrl={scriptUrl}
        status={syncStatus}
        isAutoSaveEnabled={isAutoSaveEnabled}
        onToggleAutoSave={handleToggleAutoSave}
      />
    </>
  );
};

export default App;
