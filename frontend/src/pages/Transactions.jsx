import React, { useState } from 'react';
import Icon from '../components/Icon';
import { api } from '../services/api';

const CURRENCY_SYMBOLS = {
  PKR: 'Rs.',
  USD: '$',
  EUR: '€',
  GBP: '£',
  AED: 'AED ',
  SAR: 'SAR '
};

function formatAmount(amt, symbol) {
  const num = Math.abs(Number(amt) || 0);
  return `${symbol}${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function Transactions({
  transactions = [],
  categories = [],
  currency = 'PKR',
  onRefresh,
  onAddExpense,
  onEditTransaction
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const symbol = CURRENCY_SYMBOLS[currency] || '$';

  // Map category to icon & tone
  const getCategoryDetails = (catName = '', type = 'expense') => {
    const lower = (catName || '').toLowerCase();
    if (type === 'income' || lower.includes('salary') || lower.includes('income') || lower.includes('freelance') || lower.includes('business')) {
      return { icon: 'home', tone: 'mint', isIncome: true };
    }
    if (lower.includes('food') || lower.includes('dining') || lower.includes('grocery') || lower.includes('bistro') || lower.includes('snack')) {
      return { icon: 'food', tone: 'peach', isIncome: false };
    }
    if (lower.includes('transport') || lower.includes('fuel') || lower.includes('uber') || lower.includes('shell') || lower.includes('car')) {
      return { icon: 'car', tone: 'blue', isIncome: false };
    }
    if (lower.includes('shop') || lower.includes('cloth') || lower.includes('market') || lower.includes('mall')) {
      return { icon: 'bag', tone: 'lavender', isIncome: false };
    }
    return { icon: 'card', tone: 'lavender', isIncome: false };
  };

  // Filter transactions
  const filtered = transactions.filter(t => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const descMatch = (t.description || '').toLowerCase().includes(q);
      const catMatch = (t.category_name || '').toLowerCase().includes(q);
      if (!descMatch && !catMatch) return false;
    }
    if (selectedType && t.type !== selectedType) return false;
    if (selectedCategory && String(t.category_id) !== String(selectedCategory)) return false;
    if (startDate && t.date && t.date.substring(0, 10) < startDate) return false;
    if (endDate && t.date && t.date.substring(0, 10) > endDate) return false;
    return true;
  });

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this transaction record?')) {
      try {
        await api.deleteTransaction(id);
        onRefresh && onRefresh();
      } catch (err) {
        alert('Failed to delete transaction: ' + err.message);
      }
    }
  };

  return (
    <div className="content">
      {/* Header Row */}
      <section className="welcome-row">
        <div>
          <div className="eyebrow">
            <span></span> TRANSACTION LEDGER
          </div>
          <div className="page-title" role="heading" aria-level={1}>
            Transactions
          </div>
          <p>Search, filter, edit, or record all income and expenses ({filtered.length} entries).</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="primary-button" onClick={onAddExpense}>
            <Icon name="plus" size={18} /> Add transaction
          </button>
        </div>
      </section>

      {/* Filter Card */}
      <div className="filter-card" style={{ marginBottom: '20px' }}>
        <div style={{ flex: '1 1 200px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icon name="search" size={16} />
          <input
            className="filter-input"
            style={{ width: '100%' }}
            placeholder="Search description or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select
          className="filter-input"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          <option value="">All Types</option>
          <option value="expense">Expenses Only</option>
          <option value="income">Income Only</option>
        </select>

        <select
          className="filter-input"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <input
          type="date"
          className="filter-input"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          title="Start date"
        />

        <input
          type="date"
          className="filter-input"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          title="End date"
        />

        {(searchTerm || selectedType || selectedCategory || startDate || endDate) && (
          <button
            className="text-button"
            onClick={() => {
              setSearchTerm('');
              setSelectedType('');
              setSelectedCategory('');
              setStartDate('');
              setEndDate('');
            }}
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Transactions Panel */}
      <article className="panel transactions-panel">
        <div className="panel-header transaction-heading">
          <div>
            <div className="panel-title" role="heading" aria-level={2}>
              Ledger Entries
            </div>
            <p>Showing {filtered.length} transactions</p>
          </div>
        </div>

        <div className="transaction-list">
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)', fontSize: '12px' }}>
              No transactions match your search filter criteria.
            </div>
          ) : (
            filtered.map((t) => {
              const details = getCategoryDetails(t.category_name, t.type);
              const isInc = t.type === 'income' || details.isIncome;
              const sign = isInc ? '+' : '-';
              const dateStr = t.date ? (typeof t.date === 'string' ? t.date.split('T')[0] : new Date(t.date).toLocaleDateString()) : 'N/A';

              return (
                <div
                  className="transaction-row interactive"
                  key={t.id}
                  style={{ gridTemplateColumns: '39px 1fr minmax(100px,.6fr) minmax(90px,.4fr) 70px' }}
                >
                  <div className={`transaction-icon ${details.tone}`}>
                    <Icon name={details.icon} size={19} />
                  </div>
                  <div className="transaction-info">
                    <strong>{t.description || 'Transaction'}</strong>
                    <span>{t.category_name || (isInc ? 'Income' : 'Expense')} • {t.payment_method || 'Cash'}</span>
                  </div>
                  <div className="transaction-date">{dateStr}</div>
                  <div className={`transaction-amount ${isInc ? 'income' : ''}`}>
                    {sign}{formatAmount(t.amount, symbol)}
                  </div>
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                    <button
                      className="icon-button"
                      style={{ width: '30px', height: '30px' }}
                      title="Edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditTransaction && onEditTransaction(t);
                      }}
                    >
                      <Icon name="edit" size={13} />
                    </button>
                    <button
                      className="icon-button"
                      style={{ width: '30px', height: '30px', color: 'var(--coral-ink)' }}
                      title="Delete"
                      onClick={(e) => handleDelete(t.id, e)}
                    >
                      <Icon name="trash" size={13} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </article>
    </div>
  );
}
