import React from 'react';
import { Globe } from 'lucide-react';

export default function Navbar({ title, subtitle, selectedCurrency = 'PKR', setSelectedCurrency }) {
  const currencies = ['PKR', 'USD', 'EUR', 'GBP', 'AED', 'SAR'];

  return (
    <header className="top-header">
      <div className="page-title">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>
          <Globe size={16} />
          <span>Currency:</span>
        </div>
        <select
          className="form-control"
          style={{ width: '110px', padding: '6px 10px', fontSize: '13px', cursor: 'pointer' }}
          value={selectedCurrency}
          onChange={(e) => setSelectedCurrency && setSelectedCurrency(e.target.value)}
        >
          {currencies.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
    </header>
  );
}
