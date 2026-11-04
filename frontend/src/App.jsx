import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import AddExpenseModal from './components/AddExpenseModal';
import EditTransactionModal from './components/EditTransactionModal';

import Overview from './pages/Overview';
import Transactions from './pages/Transactions';
import Analytics from './pages/Analytics';
import Budgets from './pages/Budgets';
import Goals from './pages/Goals';
import Settings from './pages/Settings';
import ImportExport from './pages/ImportExport';

import { api } from './services/api';

export default function App() {
  const [activeNav, setActiveNav] = useState('Overview');
  const [currency, setCurrency] = useState('PKR');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [dashboardData, setDashboardData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals & Search
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [searchVal, setSearchVal] = useState('');

  const loadAllData = async (m = selectedMonth, y = selectedYear) => {
    try {
      const [dashRes, txRes, catRes, budRes] = await Promise.all([
        api.getDashboard(m, y, currency),
        api.getTransactions({ currency }),
        api.getCategories(),
        api.getBudgets(m, y, currency)
      ]);

      setDashboardData(dashRes);
      setTransactions(Array.isArray(txRes) ? txRes : []);
      setCategories(Array.isArray(catRes) ? catRes : []);
      setBudgets(Array.isArray(budRes) ? budRes : []);
    } catch (err) {
      console.error('Error loading ExpenseMate data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData(selectedMonth, selectedYear);
  }, [currency, selectedMonth, selectedYear]);

  const handleSelectMonth = (m, y = selectedYear) => {
    setSelectedMonth(m);
    if (y) setSelectedYear(y);
  };

  // Handle topbar search
  const handleSearchChange = (val) => {
    setSearchVal(val);
    if (activeNav !== 'Transactions') {
      setActiveNav('Transactions');
    }
  };

  return (
    <div className="app-shell">
      {/* Exact Reference Desktop Sidebar (Plus promo card removed) */}
      <Sidebar
        activeNav={activeNav}
        onSelectNav={setActiveNav}
        transactionCount={transactions.length}
      />

      {/* Main Content Area */}
      <main className="main">
        {/* Topbar without search and notifications */}
        <Topbar
          onAddExpense={() => setModalOpen(true)}
        />

        {/* Dynamic Page Views */}
        {activeNav === 'Overview' && (
          <Overview
            dashboardData={dashboardData}
            currency={currency}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onSelectMonth={handleSelectMonth}
            transactions={transactions}
            onNavigate={setActiveNav}
            onAddExpense={() => setModalOpen(true)}
          />
        )}

        {activeNav === 'Transactions' && (
          <Transactions
            transactions={transactions}
            categories={categories}
            currency={currency}
            onRefresh={() => loadAllData(selectedMonth, selectedYear)}
            onAddExpense={() => setModalOpen(true)}
            onEditTransaction={(tx) => setEditingTransaction(tx)}
          />
        )}

        {activeNav === 'Analytics' && (
          <Analytics
            dashboardData={dashboardData}
            currency={currency}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onSelectMonth={handleSelectMonth}
          />
        )}

        {activeNav === 'Budgets' && (
          <Budgets
            budgets={budgets}
            categories={categories}
            currency={currency}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onSelectMonth={handleSelectMonth}
            onRefresh={() => loadAllData(selectedMonth, selectedYear)}
          />
        )}

        {activeNav === 'Goals' && (
          <Goals
            currency={currency}
          />
        )}

        {activeNav === 'Import & Export' && (
          <ImportExport
            onRefresh={loadAllData}
          />
        )}

        {activeNav === 'Settings' && (
          <Settings
            currency={currency}
            onCurrencyChange={setCurrency}
          />
        )}
      </main>

      {/* Exact Reference Add Expense Modal */}
      <AddExpenseModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={loadAllData}
        categories={categories}
        currency={currency}
      />

      {/* Edit Transaction Modal */}
      <EditTransactionModal
        isOpen={!!editingTransaction}
        transaction={editingTransaction}
        onClose={() => setEditingTransaction(null)}
        onSuccess={loadAllData}
        categories={categories}
        currency={currency}
      />
    </div>
  );
}
