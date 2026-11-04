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
  const n = Number(amt) || 0;
  const isNegative = n < 0;
  const formatted = Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${isNegative ? '-' : ''}${symbol}${formatted}`;
}

export default function Budgets({
  budgets = [],
  categories = [],
  currency = 'PKR',
  selectedMonth = 9,
  selectedYear = 2026,
  onSelectMonth,
  onRefresh
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [amountLimit, setAmountLimit] = useState('');
  const [targetMonth, setTargetMonth] = useState(selectedMonth === 'overall' ? 9 : (selectedMonth || 9));
  const [targetYear, setTargetYear] = useState(selectedYear || 2026);
  const [saving, setSaving] = useState(false);

  const symbol = CURRENCY_SYMBOLS[currency] || '$';

  const isOverall = selectedMonth === 'overall' || selectedMonth === 0;
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fullMonthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const currentMonthName = isOverall ? `Overall (${selectedYear})` : `${fullMonthNames[(Number(selectedMonth) || 9) - 1]} ${selectedYear}`;

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    if (!selectedCategory || !amountLimit || parseFloat(amountLimit) <= 0) {
      alert('Please select a category and specify a positive budget limit.');
      return;
    }

    try {
      setSaving(true);
      await api.saveBudget({
        category_id: selectedCategory,
        amount: parseFloat(amountLimit),
        month: targetMonth,
        year: targetYear,
        currency
      });
      setSaving(false);
      setModalOpen(false);
      setSelectedCategory('');
      setAmountLimit('');
      onRefresh && onRefresh();
    } catch (err) {
      setSaving(false);
      alert('Failed to save budget: ' + err.message);
    }
  };

  const handleDeleteBudget = async (id) => {
    if (window.confirm('Delete this category budget cap?')) {
      try {
        await api.deleteBudget(id);
        onRefresh && onRefresh();
      } catch (err) {
        alert('Failed to delete budget: ' + err.message);
      }
    }
  };

  const expenseCategories = categories.filter(c => !c.type || c.type === 'expense');

  return (
    <div className="content">
      {/* Header */}
      <section className="welcome-row">
        <div>
          <div className="eyebrow">
            <span></span> BUDGET CONTROLS
          </div>
          <div className="page-title" role="heading" aria-level={1}>
            Monthly Budgets
          </div>
          <p>
            {isOverall
              ? `Annual spending caps for Year ${selectedYear} (${budgets.length} active).`
              : `Spending caps for ${currentMonthName} (${budgets.length} active).`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select
            className="month-select"
            value={selectedMonth}
            onChange={(e) => {
              const val = e.target.value;
              onSelectMonth && onSelectMonth(val === 'overall' ? 'overall' : Number(val), selectedYear);
            }}
            aria-label="Select budget month"
          >
            <option value="overall">Overall (Year {selectedYear})</option>
            {fullMonthNames.map((name, idx) => (
              <option key={name} value={idx + 1}>
                {name} {selectedYear}
              </option>
            ))}
          </select>
          <button className="primary-button" onClick={() => { setTargetMonth(selectedMonth); setModalOpen(true); }}>
            <Icon name="plus" size={18} /> Set Category Budget
          </button>
        </div>
      </section>

      {/* Threshold Guide */}
      <div className="filter-card" style={{ marginBottom: '20px', gap: '16px', fontSize: '11px' }}>
        <strong style={{ color: 'var(--muted)' }}>Threshold Alerts:</strong>
        <span className="badge badge-mint">&lt;80% Normal</span>
        <span className="badge badge-peach">80% - 89% Warning</span>
        <span className="badge badge-coral">90%+ Critical / Exceeded</span>
      </div>

      {/* Budgets Grid */}
      {budgets.length === 0 ? (
        <article className="panel" style={{ textAlign: 'center', padding: '50px 20px' }}>
          <div className="mini-icon dark" style={{ margin: '0 auto 14px' }}>
            <Icon name="wallet" size={20} />
          </div>
          <div className="panel-title" style={{ marginBottom: '6px' }}>No category budget limits set</div>
          <p style={{ color: 'var(--muted)', fontSize: '12px', marginBottom: '18px' }}>
            Establish monthly spending ceilings to track consumption and prevent overspending.
          </p>
          <button className="primary-button" onClick={() => setModalOpen(true)}>
            <Icon name="plus" size={16} /> Set First Budget
          </button>
        </article>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {budgets.map((b) => {
            const ceiling = Number(b.amount || b.amount_limit || b.budgetAmount || 0);
            const spent = Number(b.actual_spent || b.spent || 0);
            const remaining = Math.max(0, ceiling - spent);
            const percent = ceiling > 0 ? Math.min(100, Math.round((spent / ceiling) * 100)) : 0;
            const ringOffset = 390 - (390 * percent) / 100;
            const statusKey = percent >= 100 ? 'exceeded' : percent >= 90 ? 'critical' : percent >= 80 ? 'warning' : 'normal';

            return (
              <article key={b.id} className="panel budget-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="panel-header">
                  <div>
                    <div className="panel-title" role="heading" aria-level={2}>
                      {b.category_name || 'Category'}
                    </div>
                    <p>Monthly limit</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={`badge ${statusKey === 'normal' ? 'badge-mint' : statusKey === 'warning' ? 'badge-peach' : 'badge-coral'}`}>
                      {statusKey.toUpperCase()}
                    </span>
                    <button
                      className="icon-button"
                      style={{ width: '28px', height: '28px', color: 'var(--coral-ink)' }}
                      title="Delete budget"
                      onClick={() => handleDeleteBudget(b.id)}
                    >
                      <Icon name="trash" size={13} />
                    </button>
                  </div>
                </div>

                <div className="budget-ring">
                  <svg viewBox="0 0 160 160">
                    <circle cx="80" cy="80" r="62" className="ring-bg" />
                    <circle
                      cx="80"
                      cy="80"
                      r="62"
                      className="ring-progress"
                      style={{
                        strokeDashoffset: ringOffset,
                        stroke: percent >= 100 ? 'var(--coral-ink)' : percent >= 80 ? '#f59e0b' : 'var(--accent)'
                      }}
                    />
                  </svg>
                  <div className="ring-center">
                    <strong>{percent}%</strong>
                    <span>used</span>
                  </div>
                </div>

                <div className="budget-copy">
                  <div>
                    <span>Spent</span>
                    <strong>{formatAmount(spent, symbol)}</strong>
                  </div>
                  <i></i>
                  <div>
                    <span>Remaining</span>
                    <strong>{formatAmount(remaining, symbol)}</strong>
                  </div>
                </div>

                <div className="budget-note" style={{ marginTop: 'auto' }}>
                  <Icon name="sparkle" size={16} />
                  <span>
                    Limit: <strong>{formatAmount(ceiling, symbol)}</strong>
                    {percent >= 100 ? ' • Exceeded!' : ` • ${100 - percent}% left`}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Set Budget Modal */}
      {modalOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setModalOpen(false)}>
          <div className="modal" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="modal-title">Set Category Budget</div>
                <p>Set spending cap for {currency} currency</p>
              </div>
              <button className="icon-button" onClick={() => setModalOpen(false)} aria-label="Close">
                <Icon name="close" />
              </button>
            </div>

            <form onSubmit={handleSaveBudget}>
              <label>
                Category
                <select
                  required
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">Select Expense Category</option>
                  {expenseCategories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '10px' }}>
                <label>
                  Target Month
                  <select
                    value={targetMonth}
                    onChange={(e) => setTargetMonth(Number(e.target.value))}
                  >
                    {fullMonthNames.map((name, idx) => (
                      <option key={name} value={idx + 1}>{name}</option>
                    ))}
                  </select>
                </label>

                <label>
                  Target Year
                  <input
                    type="number"
                    min="2020"
                    max="2035"
                    value={targetYear}
                    onChange={(e) => setTargetYear(Number(e.target.value))}
                  />
                </label>
              </div>

              <label>
                Monthly Limit Amount ({currency})
                <input
                  required
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder={currency === 'PKR' ? 'e.g. 50000' : 'e.g. 500'}
                  value={amountLimit}
                  onChange={(e) => setAmountLimit(e.target.value)}
                />
              </label>

              <div className="modal-actions">
                <button type="button" className="secondary-button" onClick={() => setModalOpen(false)} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="primary-button" disabled={saving}>
                  {saving ? "Saving..." : "Save Budget"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
