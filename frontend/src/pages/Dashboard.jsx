import React, { useState, useEffect } from 'react';
import { ArrowDownLeft, ArrowUpRight, Wallet, PieChart, AlertTriangle } from 'lucide-react';
import SummaryCard from '../components/SummaryCard';
import TransactionTable from '../components/TransactionTable';
import { ExpenseCategoryChart, IncomeVsExpenseChart } from '../components/ChartComponent';
import { api } from '../services/api';

export default function Dashboard({ currency = 'PKR', onNavigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboard(9, 2026, currency);
      setData(res);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [currency]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
        Loading dashboard metrics...
      </div>
    );
  }

  const summary = data?.summary || { total_income: 0, total_expense: 0, net_balance: 0 };
  const symbol = currency === 'PKR' ? 'Rs.' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : `${currency} `;

  const categoryBreakdown = data?.category_breakdown || data?.categoryExpenses || [];
  const recentList = data?.recent_transactions || data?.recentTransactions || [];
  const budgets = data?.budget_summary || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Financial Overview ({currency})</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Comprehensive overview of income, expenses, category breakdown & budget limits
          </p>
        </div>
        <button onClick={() => onNavigate && onNavigate('transactions')} className="btn btn-primary">
          + Add Transaction
        </button>
      </div>

      {/* Summary Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <SummaryCard
          title="Total Income"
          amount={`${symbol}${Number(summary.total_income || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          icon={ArrowDownLeft}
          variant="success"
          subtitle="Cumulative Inflow"
        />
        <SummaryCard
          title="Total Expense"
          amount={`${symbol}${Number(summary.total_expense || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          icon={ArrowUpRight}
          variant="danger"
          subtitle="Cumulative Outflow"
        />
        <SummaryCard
          title="Net Balance"
          amount={`${symbol}${Number(summary.net_balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          icon={Wallet}
          variant={summary.net_balance >= 0 ? "primary" : "danger"}
          subtitle="Net Savings"
        />
        <SummaryCard
          title="Active Budgets"
          amount={budgets.length}
          icon={PieChart}
          variant="info"
          subtitle="Monitored Categories"
        />
      </div>

      {/* Exceeded / Warning Budget Banner if any */}
      {budgets.some(b => b.warning_status === 'EXCEEDED' || b.warning_status === 'CRITICAL') && (
        <div className="card" style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <AlertTriangle size={24} style={{ color: '#ef4444', flexShrink: 0 }} />
          <div>
            <strong style={{ color: '#ffffff' }}>Budget Warning Triggered!</strong>
            <p style={{ margin: 0, fontSize: '0.85rem' }}>
              One or more monthly budgets have crossed the 90% threshold or exceeded their set ceiling limit. Click 'Budgets' to review.
            </p>
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Expense by Category</h3>
          <ExpenseCategoryChart categoryBreakdown={categoryBreakdown} />
        </div>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Income vs Expense</h3>
          <IncomeVsExpenseChart summary={summary} />
        </div>
      </div>

      {/* Recent Transactions Section */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Recent Transactions</h3>
          <button 
            onClick={() => onNavigate && onNavigate('transactions')} 
            className="btn btn-secondary" 
            style={{ fontSize: '0.85rem', padding: '6px 12px' }}
          >
            View All Ledger
          </button>
        </div>
        <TransactionTable 
          transactions={recentList} 
          currency={currency}
          onEdit={() => onNavigate && onNavigate('transactions')}
          onDelete={async (id) => {
            if (window.confirm('Delete this transaction?')) {
              await api.deleteTransaction(id);
              fetchDashboardData();
            }
          }}
        />
      </div>
    </div>
  );
}
