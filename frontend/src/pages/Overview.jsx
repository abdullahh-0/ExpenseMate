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

export default function Overview({
  dashboardData,
  currency = 'PKR',
  selectedMonth = 9,
  selectedYear = 2026,
  onSelectMonth,
  transactions = [],
  onNavigate,
  onAddExpense
}) {
  const [transactionTab, setTransactionTab] = useState('Recent');
  const [monthDropdownOpen, setMonthDropdownOpen] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const symbol = CURRENCY_SYMBOLS[currency] || '$';

  // Format dynamic greeting date
  const now = new Date();
  const dateOptions = { weekday: 'long', month: 'short', day: 'numeric' };
  const formattedDate = now.toLocaleDateString('en-US', dateOptions).toUpperCase();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const isOverall = selectedMonth === 'overall' || selectedMonth === 0;
  const currentMonthYear = isOverall
    ? `Overall (${selectedYear || 2026})`
    : `${monthNames[(Number(selectedMonth) || 9) - 1]} ${selectedYear || 2026}`;

  const availableMonths = [
    { m: 'overall', y: 2026, label: 'Overall (Year 2026)' },
    { m: 9, y: 2026, label: 'September 2026' },
    { m: 8, y: 2026, label: 'August 2026' },
    { m: 7, y: 2026, label: 'July 2026' },
    { m: 6, y: 2026, label: 'June 2026' },
    { m: 5, y: 2026, label: 'May 2026' },
    { m: 4, y: 2026, label: 'April 2026' },
    { m: 3, y: 2026, label: 'March 2026' },
    { m: 2, y: 2026, label: 'February 2026' },
    { m: 1, y: 2026, label: 'January 2026' }
  ];

  // Extract totals from backend data matching selected period
  const monthIncome = Number(dashboardData?.monthIncome !== undefined ? dashboardData.monthIncome : (dashboardData?.monthSummary?.total_income || 0));
  const monthSpent = Number(dashboardData?.monthSpent !== undefined ? dashboardData.monthSpent : (dashboardData?.monthSummary?.total_expense || 0));
  const monthSavings = Number(dashboardData?.monthSavings !== undefined ? dashboardData.monthSavings : monthIncome - monthSpent);

  const totalIncome = monthIncome;
  const totalExpense = monthSpent;
  const netBalance = monthSavings;

  // Budget calculations
  const budgets = dashboardData?.budget_summary || [];
  const defaultMonthlyLimit = currency === 'PKR' ? 1250000 : (currency === 'AED' || currency === 'SAR') ? 15000 : 4000;
  const totalBudgetFromCategories = budgets.reduce((sum, b) => sum + Number(b.amount || b.amount_limit || 0), 0);
  const budgetAmount = totalBudgetFromCategories > 0 ? totalBudgetFromCategories : defaultMonthlyLimit;
  const budgetSpent = monthSpent;
  const budgetRemaining = Math.max(0, budgetAmount - budgetSpent);
  const budgetPercent = budgetAmount > 0 ? Math.min(100, Math.round((budgetSpent / budgetAmount) * 100)) : 0;
  // Circular ring: circumference 2 * PI * 62 = 390
  const ringOffset = 390 - (390 * budgetPercent) / 100;

  // Realistic vacation savings goal values
  const vacationTarget = currency === 'PKR' ? 1200000 : (currency === 'AED' || currency === 'SAR') ? 50000 : 16000;
  const vacationSaved = Math.round(vacationTarget * 0.75);
  const vacationRemaining = vacationTarget - vacationSaved;

  // Chart data from monthly trend (last 6 active months)
  const monthlyTrend = dashboardData?.monthlyTrend || [];
  const trendWithActivity = monthlyTrend.filter(d => Number(d.income || 0) > 0 || Number(d.expense || 0) > 0);
  const recent6Months = trendWithActivity.length >= 6 ? trendWithActivity.slice(-6) : (trendWithActivity.length > 0 ? trendWithActivity : monthlyTrend.slice(0, 6));

  // Generate points with calculated savings at the end of every month
  const chartPoints = (recent6Months.length > 0 ? recent6Months : [
    { month: 'Apr', expense: 403400, income: 164200 },
    { month: 'May', expense: 266200, income: 448400 },
    { month: 'Jun', expense: 216600, income: 449400 },
    { month: 'Jul', expense: 199600, income: 751400 },
    { month: 'Aug', expense: 428000, income: 312200 },
    { month: 'Sep', expense: 1438500, income: 2029800 }
  ]).map(d => {
    const inc = Number(d.income || 0);
    const exp = Number(d.expense || 0);
    const positiveBuffer = currency === 'PKR' ? 55000 : 400;
    const endOfMonthSavings = inc > exp ? (inc - exp) : Math.round(exp * 0.22 + positiveBuffer);
    return {
      month: d.month,
      expense: exp,
      income: inc,
      savings: endOfMonthSavings
    };
  });

  const maxExpense = Math.max(...chartPoints.map(p => p.expense), 4000);
  const maxSavings = Math.max(...chartPoints.map(p => p.savings), 1000);
  const chartWidth = 640;
  const chartHeight = 160;
  const stepX = chartPoints.length > 1 ? chartWidth / (chartPoints.length - 1) : chartWidth;

  const points = chartPoints.map((p, idx) => {
    const x = Math.round(idx * stepX);
    const ratio = Math.max(0, Math.min(1, p.savings / (maxSavings || 1)));
    const y = Math.round(190 - (ratio * 170) - 10);
    return { ...p, x, y };
  });

  // Construct smooth SVG path
  let pathD = `M${points[0]?.x || 0} ${points[0]?.y || 140}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const mx = (p0.x + p1.x) / 2;
    pathD += ` C${mx} ${p0.y}, ${mx} ${p1.y}, ${p1.x} ${p1.y}`;
  }
  const areaD = `${pathD} L${chartWidth} 190 L0 190 Z`;

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

  // Recent transactions list
  const recentList = (transactions.length > 0 ? transactions.slice(0, 5) : [
    { id: 1, description: 'Bistro Avenue', category_name: 'Food & dining', date: 'Today, 1:42 PM', amount: 42.80, type: 'expense' },
    { id: 2, description: 'Monthly salary', category_name: 'Income', date: 'May 22, 9:00 AM', amount: 4850.00, type: 'income' },
    { id: 3, description: 'Shell station', category_name: 'Transportation', date: 'May 21, 6:18 PM', amount: 68.20, type: 'expense' },
    { id: 4, description: 'Object & Co.', category_name: 'Shopping', date: 'May 20, 3:25 PM', amount: 125.00, type: 'expense' }
  ]).map(t => {
    const details = getCategoryDetails(t.category_name, t.type);
    const isInc = t.type === 'income' || details.isIncome;
    const sign = isInc ? '+' : '-';
    return {
      id: t.id,
      merchant: t.description || 'Transaction',
      detail: t.category_name || (isInc ? 'Income' : 'Expense'),
      date: t.date ? (typeof t.date === 'string' ? t.date.split('T')[0] : new Date(t.date).toLocaleDateString()) : 'Recent',
      amount: `${sign}${formatAmount(t.amount, symbol)}`,
      icon: details.icon,
      tone: details.tone,
      income: isInc
    };
  });

  const upcomingList = [
    { id: 'u1', merchant: 'Apartment rent', detail: 'Housing', date: 'Next Month, 1st', amount: `-${formatAmount(45000, symbol)}`, icon: 'home', tone: 'blue', income: false },
    { id: 'u2', merchant: 'Cloud Storage & Utilities', detail: 'Subscriptions', date: 'Next Month, 5th', amount: `-${formatAmount(2500, symbol)}`, icon: 'card', tone: 'lavender', income: false }
  ];

  const displayedRows = transactionTab === 'Recent' ? recentList : upcomingList;

  return (
    <div className="content">
      {/* Welcome Row */}
      <section className="welcome-row">
        <div>
          <div className="eyebrow">
            <span></span> {formattedDate}
          </div>
          <div className="page-title" role="heading" aria-level={1}>
            Good morning
          </div>
          <p>Here’s what’s happening with your money today.</p>
        </div>
        <div style={{ position: 'relative' }}>
          <button 
            className="month-select" 
            onClick={() => setMonthDropdownOpen(prev => !prev)}
            aria-expanded={monthDropdownOpen}
          >
            <Icon name="calendar" size={18} /> {currentMonthYear} <span>⌄</span>
          </button>

          {monthDropdownOpen && (
            <div 
              className="month-dropdown-menu"
              style={{
                position: 'absolute',
                top: '46px',
                right: 0,
                width: '230px',
                background: 'var(--surface)',
                border: '1px solid var(--line)',
                borderRadius: '12px',
                boxShadow: '0 10px 30px rgba(41,35,64,.14)',
                padding: '8px',
                zIndex: 100,
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}
            >
              <div style={{ fontSize: '10px', color: 'var(--muted)', fontWeight: 700, padding: '4px 8px', letterSpacing: '0.5px' }}>
                SELECT MONTH
              </div>
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {availableMonths.map((item) => (
                  <button
                    key={`${item.m}-${item.y}`}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: 'none',
                      background: selectedMonth === item.m ? 'var(--lavender)' : 'transparent',
                      color: selectedMonth === item.m ? 'var(--accent)' : 'var(--ink)',
                      fontWeight: selectedMonth === item.m ? 700 : 500,
                      fontSize: '12px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                    onClick={() => {
                      onSelectMonth && onSelectMonth(item.m, item.y);
                      setMonthDropdownOpen(false);
                    }}
                  >
                    <span>{item.label}</span>
                    {selectedMonth === item.m && <span style={{ fontSize: '11px', color: 'var(--accent)' }}>● Active</span>}
                  </button>
                ))}
              </div>
              <div style={{ borderTop: '1px solid var(--line)', paddingTop: '6px', marginTop: '4px' }}>
                <button
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'var(--canvas)',
                    color: 'var(--accent)',
                    fontWeight: 700,
                    fontSize: '11px',
                    cursor: 'pointer',
                    textAlign: 'center'
                  }}
                  onClick={() => {
                    setMonthDropdownOpen(false);
                    onNavigate && onNavigate('Budgets');
                  }}
                >
                  Manage Monthly Budgets →
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Summary Cards */}
      <section className="stat-grid" aria-label="Financial summary">
        {/* Available Balance (Featured Dark Card with Orbs) */}
        <article className="stat-card featured" style={netBalance < 0 ? { borderLeft: '4px solid #ff7675' } : {}}>
          <div className="stat-top">
            <span>{netBalance < 0 ? 'Net Deficit' : 'Available balance'}</span>
            <div className="mini-icon dark">
              <Icon name="wallet" size={18} />
            </div>
          </div>
          <div className="stat-value" style={{ color: netBalance < 0 ? '#ff7675' : 'white' }}>
            {formatAmount(netBalance, symbol)}
          </div>
          <div className="stat-bottom light-text">
            <span className={`trend ${netBalance < 0 ? 'negative' : 'light'}`}>
              <Icon name={netBalance < 0 ? 'arrowDown' : 'arrowUp'} size={13} /> {netBalance < 0 ? 'Deficit' : 'Net Surplus'}
            </span> {currentMonthYear}
          </div>
          <div className="card-orb one"></div>
          <div className="card-orb two"></div>
        </article>

        {/* Income Card */}
        <article className="stat-card">
          <div className="stat-top">
            <span>Income</span>
            <div className="mini-icon mint">
              <Icon name="arrowDown" size={18} />
            </div>
          </div>
          <div className="stat-value">
            {formatAmount(totalIncome, symbol)}
          </div>
          <div className="stat-bottom">
            <span className="trend positive">
              <Icon name="arrowUp" size={13} /> 12.5%
            </span> from last month
          </div>
        </article>

        {/* Expenses Card */}
        <article className="stat-card">
          <div className="stat-top">
            <span>Expenses</span>
            <div className="mini-icon coral">
              <Icon name="arrowUp" size={18} />
            </div>
          </div>
          <div className="stat-value">
            {formatAmount(totalExpense, symbol)}
          </div>
          <div className="stat-bottom">
            <span className="trend negative">
              <Icon name="arrowUp" size={13} /> 4.1%
            </span> from last month
          </div>
        </article>
      </section>

      {/* Dashboard Middle Grid: Spending Overview + Monthly Budget */}
      <section className="dashboard-grid">
        {/* Spending Overview SVG Chart Panel */}
        <article className="panel spending-panel">
          <div className="panel-header">
            <div>
              <div className="panel-title" role="heading" aria-level={2}>
                Spending overview
              </div>
              <p>Your activity over the last 6 months</p>
            </div>
            <div className="chart-legend">
              <span className="legend-dot"></span> Savings
            </div>
          </div>

          <div className="chart">
            <div className="y-labels" style={{ minWidth: '42px', width: 'auto', paddingRight: '6px' }}>
              <span>{symbol}{Math.round(maxSavings / 1000)}k</span>
              <span>{symbol}{Math.round((maxSavings * 0.75) / 1000)}k</span>
              <span>{symbol}{Math.round((maxSavings * 0.5) / 1000)}k</span>
              <span>{symbol}{Math.round((maxSavings * 0.25) / 1000)}k</span>
              <span>{symbol}0</span>
            </div>

            <div 
              className="chart-area"
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const mouseX = e.clientX - rect.left;
                const ratio = Math.max(0, Math.min(1, mouseX / rect.width));
                const scaledX = ratio * chartWidth;

                let closest = points[0];
                let minDiff = Infinity;
                for (const p of points) {
                  const diff = Math.abs(p.x - scaledX);
                  if (diff < minDiff) {
                    minDiff = diff;
                    closest = p;
                  }
                }
                setHoveredPoint(closest);
              }}
              onMouseLeave={() => setHoveredPoint(null)}
              style={{ cursor: 'crosshair' }}
            >
              <div className="grid-lines">
                <i></i><i></i><i></i><i></i><i></i>
              </div>

              <svg viewBox="0 0 640 190" preserveAspectRatio="none" aria-label="Expenses chart">
                <defs>
                  <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity=".22" />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path className="area-path" d={areaD} />
                <path className="line-path" d={pathD} />

                {hoveredPoint && (
                  <line
                    x1={hoveredPoint.x}
                    y1="10"
                    x2={hoveredPoint.x}
                    y2="180"
                    stroke="var(--accent)"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    opacity="0.6"
                  />
                )}

                {hoveredPoint ? (
                  <circle
                    cx={hoveredPoint.x}
                    cy={hoveredPoint.y}
                    r="6"
                    fill="var(--accent)"
                    stroke="white"
                    strokeWidth="3"
                    className="chart-point"
                  />
                ) : (
                  <circle cx={points[points.length - 1]?.x ?? 640} cy={points[points.length - 1]?.y ?? 10} r="5" className="chart-point" />
                )}
              </svg>

              {/* Dynamic Interactive Savings Tooltip that moves along the line */}
              {hoveredPoint && (
                <div 
                  style={{
                    position: 'absolute',
                    top: `${Math.max(10, Math.min(100, hoveredPoint.y - 48))}px`,
                    left: `${Math.max(10, Math.min(84, (hoveredPoint.x / chartWidth) * 100))}%`,
                    transform: 'translateX(-50%)',
                    background: 'var(--surface)',
                    border: '1px solid var(--line)',
                    borderRadius: '10px',
                    padding: '6px 12px',
                    boxShadow: '0 8px 22px rgba(41,35,64,.14)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    pointerEvents: 'none',
                    zIndex: 10,
                    whiteSpace: 'nowrap'
                  }}
                >
                  <span style={{ fontSize: '9px', color: 'var(--muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                    {hoveredPoint.month} End-of-Month Savings
                  </span>
                  <strong style={{ fontSize: '13px', color: 'var(--mint-ink)', fontWeight: 800, marginTop: '2px' }}>
                    {formatAmount(hoveredPoint.savings, symbol)}
                  </strong>
                </div>
              )}

              <div className="x-labels">
                {chartPoints.map((p) => (
                  <span 
                    key={p.month}
                    style={{
                      fontWeight: hoveredPoint?.month === p.month ? 800 : 500,
                      color: hoveredPoint?.month === p.month ? 'var(--accent)' : 'var(--faint)'
                    }}
                  >
                    {p.month}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </article>

        {/* Monthly Budget Circular Ring Panel */}
        <article className="panel budget-panel">
          <div className="panel-header">
            <div>
              <div className="panel-title" role="heading" aria-level={2}>
                {isOverall ? 'Annual budget' : 'Monthly budget'}
              </div>
              <p>{isOverall ? `Year ${selectedYear} spending limit` : `${currentMonthYear} spending limit`}</p>
            </div>
            <button className="text-button" onClick={() => onNavigate && onNavigate('Budgets')}>
              Manage
            </button>
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
                  stroke: budgetPercent >= 100 ? 'var(--coral-ink)' : budgetPercent >= 80 ? '#f59e0b' : 'var(--accent)'
                }}
              />
            </svg>
            <div className="ring-center">
              <strong>{budgetPercent}%</strong>
              <span>used</span>
            </div>
          </div>

          <div className="budget-copy">
            <div>
              <span>Spent</span>
              <strong>{formatAmount(budgetSpent, symbol)}</strong>
            </div>
            <i></i>
            <div>
              <span>Remaining</span>
              <strong>{formatAmount(budgetRemaining, symbol)}</strong>
            </div>
          </div>

          <div className="budget-note">
            <Icon name="sparkle" size={16} />
            <span>
              {budgetRemaining > 0 
                ? <>You’re on track to save <strong>{formatAmount(budgetRemaining, symbol)}</strong> {isOverall ? 'this year' : 'this month'}.</>
                : <>Budget ceiling reached. Review expenses to stay on track.</>}
            </span>
          </div>
        </article>
      </section>

      {/* Dashboard Lower Grid: Transactions + Savings Goal */}
      <section className="lower-grid">
        {/* Transactions Panel */}
        <article className="panel transactions-panel">
          <div className="panel-header transaction-heading">
            <div>
              <div className="panel-title" role="heading" aria-level={2}>
                Transactions
              </div>
              <div className="tabs">
                {(['Recent', 'Upcoming']).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setTransactionTab(tab)}
                    className={transactionTab === tab ? 'selected' : ''}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            <button className="text-button" onClick={() => onNavigate && onNavigate('Transactions')}>
              View all <span>→</span>
            </button>
          </div>

          <div className="transaction-list">
            {displayedRows.map((item) => (
              <div className="transaction-row interactive" key={item.id} onClick={() => onNavigate && onNavigate('Transactions')}>
                <div className={`transaction-icon ${item.tone}`}>
                  <Icon name={item.icon} size={19} />
                </div>
                <div className="transaction-info">
                  <strong>{item.merchant}</strong>
                  <span>{item.detail}</span>
                </div>
                <div className="transaction-date">{item.date}</div>
                <div className={`transaction-amount ${item.income ? 'income' : ''}`}>
                  {item.amount}
                </div>
              </div>
            ))}
          </div>
        </article>

        {/* Savings Goal Panel */}
        <article className="panel savings-panel">
          <div className="panel-header">
            <div>
              <div className="panel-title" role="heading" aria-level={2}>
                Savings goal
              </div>
              <p>Dream vacation</p>
            </div>
            <button className="more-button large" aria-label="Savings options" onClick={() => onNavigate && onNavigate('Goals')}>
              •••
            </button>
          </div>

          <div className="goal-visual">
            <div className="goal-circle back"></div>
            <div className="goal-circle front">
              <span>✦</span>
            </div>
            <div className="plane">↗</div>
          </div>

          <div className="goal-numbers">
            <strong>{formatAmount(vacationSaved, symbol)}</strong>
            <span>of {formatAmount(vacationTarget, symbol)}</span>
          </div>

          <div className="progress-track">
            <span style={{ width: '75%' }}></span>
          </div>

          <div className="goal-footer">
            <span>75% complete</span>
            <strong>{formatAmount(vacationRemaining, symbol)} to go</strong>
          </div>
        </article>
      </section>
    </div>
  );
}
