import React from 'react';
import { AlertTriangle, AlertOctagon, CheckCircle2, ShieldAlert, Trash2 } from 'lucide-react';

const STATUS_CONFIG = {
  NORMAL: {
    color: '#10b981',
    badgeClass: 'badge-success',
    icon: CheckCircle2,
    label: 'Normal (<80%)'
  },
  WARNING: {
    color: '#f59e0b',
    badgeClass: 'badge-warning',
    icon: AlertTriangle,
    label: 'Warning (80-89%)'
  },
  CRITICAL: {
    color: '#f97316',
    badgeClass: 'badge-warning',
    icon: ShieldAlert,
    label: 'Critical (90-99%)'
  },
  EXCEEDED: {
    color: '#ef4444',
    badgeClass: 'badge-danger',
    icon: AlertOctagon,
    label: 'Exceeded (100%+)'
  }
};

const CURRENCY_SYMBOLS = {
  PKR: 'Rs.',
  USD: '$',
  EUR: '€',
  GBP: '£',
  AED: 'AED ',
  SAR: 'SAR '
};

export default function BudgetCard({ budget, onDelete }) {
  const warningStatus = (budget.warning_status || budget.status || 'NORMAL').toUpperCase();
  const status = STATUS_CONFIG[warningStatus] || STATUS_CONFIG.NORMAL;
  const StatusIcon = status.icon;

  const actualSpent = Number(budget.actual_spent !== undefined ? budget.actual_spent : budget.spent || 0);
  const amountLimit = Number(budget.amount_limit !== undefined ? budget.amount_limit : budget.amount || budget.budgetAmount || 0);
  const rawPercentage = Number(budget.percentage_used !== undefined ? budget.percentage_used : budget.percentage || 0);
  const percentage = Math.min(rawPercentage, 100);
  const remainingBudget = Number(budget.remaining_budget !== undefined ? budget.remaining_budget : budget.remaining || (amountLimit - actualSpent));
  const symbol = CURRENCY_SYMBOLS[budget.currency] || budget.currency || 'Rs.';

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
            {budget.category_name}
          </h4>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Monthly Budget Cap
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className={`badge ${status.badgeClass}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <StatusIcon size={14} />
            {status.label}
          </span>
          {onDelete && (
            <button 
              onClick={() => onDelete(budget.id)} 
              className="btn btn-secondary btn-sm" 
              style={{ padding: '6px', color: 'var(--danger)' }}
              title="Delete Budget Limit"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Actual Spent</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: warningStatus === 'EXCEEDED' ? 'var(--danger)' : 'var(--text-main)' }}>
            {symbol}{actualSpent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Budget Limit</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            {symbol}{amountLimit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px', color: 'var(--text-muted)' }}>
          <span>Usage: {rawPercentage}%</span>
          <span>
            {remainingBudget >= 0 
              ? `Remaining: ${symbol}${remainingBudget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
              : `Over by: ${symbol}${Math.abs(remainingBudget).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </span>
        </div>
        <div style={{ height: '10px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '5px', overflow: 'hidden' }}>
          <div 
            style={{ 
              height: '100%', 
              width: `${percentage}%`, 
              backgroundColor: status.color,
              borderRadius: '5px',
              transition: 'width 0.4s ease'
            }}
          />
        </div>
      </div>
    </div>
  );
}
