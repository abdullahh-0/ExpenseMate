import React from 'react';

const VARIANT_COLORS = {
  success: '#10b981',
  danger: '#f43f5e',
  primary: '#06b6d4',
  info: '#a855f7',
  warning: '#f59e0b'
};

export default function SummaryCard({
  title,
  label,
  amount,
  value,
  subtitle,
  subtext,
  icon: Icon,
  variant = 'primary',
  colorClass
}) {
  const displayLabel = label || title;
  const displayValue = value !== undefined ? value : amount;
  const displaySubtext = subtext || subtitle;
  const iconColor = VARIANT_COLORS[variant] || 'var(--primary)';

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)' }}>
          {displayLabel}
        </span>
        {Icon && (
          <div style={{
            padding: '8px',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Icon size={18} style={{ color: iconColor }} />
          </div>
        )}
      </div>

      <div style={{
        fontSize: '1.4rem',
        fontWeight: 700,
        color: variant === 'danger' ? 'var(--danger)' : variant === 'success' ? 'var(--success)' : 'var(--text-main)',
        letterSpacing: '-0.5px'
      }}>
        {displayValue}
      </div>

      {displaySubtext && (
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          {displaySubtext}
        </div>
      )}
    </div>
  );
}
