import React, { useState } from 'react';
import Icon from '../components/Icon';

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

const TONES = ['lavender', 'mint', 'coral', 'blue', 'peach'];

export default function Analytics({
  dashboardData,
  currency = 'PKR',
  selectedMonth = 9,
  selectedYear = 2026,
  onSelectMonth
}) {
  const [viewScope, setViewScope] = useState('month'); // 'month' or 'all_time'
  const symbol = CURRENCY_SYMBOLS[currency] || '$';

  const isOverall = selectedMonth === 'overall' || selectedMonth === 0;
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fullMonthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const currentMonthName = isOverall ? 'Overall' : monthNames[(Number(selectedMonth) || 9) - 1];
  const selectedPeriodName = isOverall ? `Overall (${selectedYear})` : `${currentMonthName} ${selectedYear}`;

  const allTimeSummary = dashboardData?.summary || { total_income: 0, total_expense: 0, net_balance: 0 };
  
  // Specific month financial figures
  const monthIncome = Number(dashboardData?.monthIncome !== undefined ? dashboardData.monthIncome : (dashboardData?.monthSummary?.total_income || 0));
  const monthSpent = Number(dashboardData?.monthSpent !== undefined ? dashboardData.monthSpent : (dashboardData?.monthSummary?.total_expense || 0));
  const monthSavings = Number(dashboardData?.monthSavings !== undefined ? dashboardData.monthSavings : monthIncome - monthSpent);

  // Active numbers based on viewScope (defaults to specific month/overall)
  const activeIncome = (viewScope === 'month' && !isOverall) ? monthIncome : (isOverall ? monthIncome : Number(allTimeSummary.total_income || 0));
  const activeExpense = (viewScope === 'month' && !isOverall) ? monthSpent : (isOverall ? monthSpent : Number(allTimeSummary.total_expense || 0));
  const activeSavings = (viewScope === 'month' && !isOverall) ? monthSavings : (isOverall ? monthSavings : Number(allTimeSummary.net_balance || 0));
  
  const rawMonthExpenses = dashboardData?.category_breakdown_month || [];
  const rawAllTimeExpenses = dashboardData?.category_breakdown_all_time || dashboardData?.category_breakdown || [];
  
  const categoryExpenses = (viewScope === 'month' || isOverall) ? rawMonthExpenses : rawAllTimeExpenses;
  const periodTotalExpense = categoryExpenses.reduce((sum, c) => sum + Number(c.total_amount || c.value || 0), 0) || activeExpense;

  const monthlyTrend = dashboardData?.monthlyTrend || [];
  const totalsByCurrency = dashboardData?.totalsByCurrency || {};

  return (
    <div className="content">
      {/* Header */}
      <section className="welcome-row">
        <div>
          <div className="eyebrow">
            <span></span> FINANCIAL ANALYTICS
          </div>
          <div className="page-title" role="heading" aria-level={1}>
            Analytics & Insights
          </div>
          <p>
            {isOverall
              ? `Overall financial metrics & category allocation for Full Year ${selectedYear}.`
              : viewScope === 'month'
              ? `Financial metrics & category breakdown for ${currentMonthName} ${selectedYear}.`
              : 'Cumulative all-time trends and multi-currency metrics.'}
          </p>
        </div>

        {/* Month & Overall Selector */}
        <select
          className="month-select"
          value={selectedMonth}
          onChange={(e) => {
            const val = e.target.value;
            onSelectMonth && onSelectMonth(val === 'overall' ? 'overall' : Number(val), selectedYear);
          }}
          aria-label="Filter analytics month"
        >
          <option value="overall">Overall (Year {selectedYear})</option>
          {fullMonthNames.map((name, idx) => (
            <option key={name} value={idx + 1}>
              {name} {selectedYear}
            </option>
          ))}
        </select>
      </section>

      {/* Summary Row - Matching Specific Month Numbers with accurate +/- sign */}
      <section className="stat-grid" style={{ marginBottom: '24px' }}>
        <article className="stat-card featured" style={activeSavings < 0 ? { borderLeft: '4px solid #ff7675' } : {}}>
          <div className="stat-top">
            <span>{selectedPeriodName} Savings</span>
            <div className="mini-icon dark"><Icon name="wallet" size={18} /></div>
          </div>
          <div className="stat-value" style={{ color: activeSavings < 0 ? '#ff7675' : 'white' }}>
            {formatAmount(activeSavings, symbol)}
          </div>
          <div className="stat-bottom light-text">
            <span className={`trend ${activeSavings >= 0 ? 'positive' : 'negative'}`}>
              {activeSavings >= 0 ? 'Surplus' : 'Deficit'}
            </span>
            <span>{activeSavings >= 0 ? `${selectedPeriodName} Net Savings` : `${selectedPeriodName} Net Deficit`}</span>
          </div>
          <div className="card-orb one"></div><div className="card-orb two"></div>
        </article>

        <article className="stat-card">
          <div className="stat-top">
            <span>{selectedPeriodName} Inflow</span>
            <div className="mini-icon mint"><Icon name="arrowDown" size={18} /></div>
          </div>
          <div className="stat-value">{formatAmount(activeIncome, symbol)}</div>
          <div className="stat-bottom">
            {selectedPeriodName} Total Income
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-top">
            <span>{selectedPeriodName} Outflow</span>
            <div className="mini-icon coral"><Icon name="arrowUp" size={18} /></div>
          </div>
          <div className="stat-value">{formatAmount(activeExpense, symbol)}</div>
          <div className="stat-bottom">
            {selectedPeriodName} Total Expenses
          </div>
        </article>
      </section>

      {/* Analytics Panels Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Category Breakdown Panel */}
        <article className="panel">
          <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <div className="panel-title" role="heading" aria-level={2}>Spending by Category</div>
              <p>
                {viewScope === 'month' 
                  ? `${currentMonthName} ${selectedYear} expenses (${categoryExpenses.length} categories)` 
                  : 'All-time cumulative expense allocation'}
              </p>
            </div>
            
            {/* View Scope Toggle */}
            <div style={{ background: 'var(--canvas)', padding: '3px', borderRadius: '10px', display: 'inline-flex', gap: '4px' }}>
              <button
                type="button"
                style={{
                  padding: '5px 12px',
                  borderRadius: '7px',
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: viewScope === 'month' ? 700 : 500,
                  background: viewScope === 'month' ? 'var(--surface)' : 'transparent',
                  color: viewScope === 'month' ? 'var(--accent)' : 'var(--muted)',
                  cursor: 'pointer',
                  boxShadow: viewScope === 'month' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
                }}
                onClick={() => setViewScope('month')}
              >
                {currentMonthName} {selectedYear}
              </button>
              <button
                type="button"
                style={{
                  padding: '5px 12px',
                  borderRadius: '7px',
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: viewScope === 'all_time' ? 700 : 500,
                  background: viewScope === 'all_time' ? 'var(--surface)' : 'transparent',
                  color: viewScope === 'all_time' ? 'var(--accent)' : 'var(--muted)',
                  cursor: 'pointer',
                  boxShadow: viewScope === 'all_time' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none'
                }}
                onClick={() => setViewScope('all_time')}
              >
                All-Time
              </button>
            </div>
          </div>

          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {categoryExpenses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px', color: 'var(--muted)', fontSize: '12px' }}>
                No category expenses recorded for {viewScope === 'month' ? `${currentMonthName} ${selectedYear}` : 'this period'}.
              </div>
            ) : (
              categoryExpenses.map((cat, idx) => {
                const amt = Number(cat.total_amount || cat.value || 0);
                const percent = periodTotalExpense > 0 ? Math.round((amt / periodTotalExpense) * 100) : 0;
                const tone = TONES[idx % TONES.length];

                return (
                  <div key={cat.name || cat.category_name || idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{cat.name || cat.category_name}</span>
                      <span style={{ color: 'var(--muted)' }}>
                        {formatAmount(amt, symbol)} ({percent}%)
                      </span>
                    </div>
                    <div style={{ height: '6px', background: 'var(--canvas)', borderRadius: '8px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${percent}%`,
                          background: tone === 'mint' ? 'var(--mint-ink)' : tone === 'coral' ? 'var(--coral-ink)' : tone === 'blue' ? 'var(--blue-ink)' : tone === 'peach' ? '#b67535' : 'var(--accent)',
                          borderRadius: '8px'
                        }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </article>

        {/* Monthly Trend Panel */}
        <article className="panel">
          <div className="panel-header">
            <div>
              <div className="panel-title" role="heading" aria-level={2}>Monthly Income vs Expense</div>
              <p>Comparative flow across 12 months</p>
            </div>
          </div>

          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {monthlyTrend.map((m) => (
              <div key={m.month} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px' }}>
                <span style={{ width: '32px', color: 'var(--muted)', fontWeight: 600 }}>{m.month}</span>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div
                      style={{
                        height: '6px',
                        width: `${Math.min(100, (Number(m.income) / 60000) * 100)}%`,
                        background: 'var(--mint-ink)',
                        borderRadius: '4px'
                      }}
                    />
                    <span style={{ fontSize: '9px', color: 'var(--mint-ink)' }}>+{formatAmount(m.income, symbol)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div
                      style={{
                        height: '6px',
                        width: `${Math.min(100, (Number(m.expense) / 60000) * 100)}%`,
                        background: 'var(--coral-ink)',
                        borderRadius: '4px'
                      }}
                    />
                    <span style={{ fontSize: '9px', color: 'var(--coral-ink)' }}>-{formatAmount(m.expense, symbol)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>

      {/* Currency Balances Panel */}
      <article className="panel" style={{ marginTop: '20px' }}>
        <div className="panel-header">
          <div>
            <div className="panel-title" role="heading" aria-level={2}>Balances by Currency</div>
            <p>Multi-currency transactions recorded in database</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '16px' }}>
          {Object.entries(totalsByCurrency).map(([currKey, stats]) => {
            const sym = CURRENCY_SYMBOLS[currKey] || currKey;
            return (
              <div key={currKey} style={{ background: 'var(--canvas)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 700, fontSize: '14px' }}>{currKey}</span>
                  <span className="badge badge-lavender">{currKey} Ledger</span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div>Income: <strong style={{ color: 'var(--mint-ink)' }}>{formatAmount(stats.income, sym)}</strong></div>
                  <div>Expense: <strong style={{ color: 'var(--coral-ink)' }}>{formatAmount(stats.expense, sym)}</strong></div>
                  <div>Balance: <strong style={{ color: 'var(--ink)' }}>{formatAmount(stats.balance, sym)}</strong></div>
                </div>
              </div>
            );
          })}
        </div>
      </article>
    </div>
  );
}
