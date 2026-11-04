import React from 'react';
import { Edit2, Trash2, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

const CURRENCY_SYMBOLS = {
  PKR: 'Rs.',
  USD: '$',
  EUR: '€',
  GBP: '£',
  AED: 'AED ',
  SAR: 'SAR '
};

export default function TransactionTable({ transactions = [], onEdit, onDelete, isLoading }) {
  if (isLoading) {
    return <div className="card p-6 text-center text-secondary">Loading transactions...</div>;
  }

  if (!transactions.length) {
    return <div className="card p-6 text-center text-secondary">No transactions found. Add your first transaction above!</div>;
  }

  return (
    <div className="card overflow-hidden">
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              <th style={{ padding: '12px 16px' }}>Date</th>
              <th style={{ padding: '12px 16px' }}>Type</th>
              <th style={{ padding: '12px 16px' }}>Description</th>
              <th style={{ padding: '12px 16px' }}>Category</th>
              <th style={{ padding: '12px 16px' }}>Payment Method</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Amount</th>
              <th style={{ padding: '12px 16px', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => {
              const isIncome = tx.type === 'income';
              const symbol = CURRENCY_SYMBOLS[tx.currency] || tx.currency || 'Rs.';
              
              return (
                <tr 
                  key={tx.id} 
                  style={{ 
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    transition: 'background 0.2s ease'
                  }}
                  className="table-row-hover"
                >
                  <td style={{ padding: '12px 16px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    {tx.date ? (typeof tx.date === 'string' ? tx.date.split('T')[0] : new Date(tx.date).toISOString().split('T')[0]) : 'N/A'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span className={`badge ${isIncome ? 'badge-success' : 'badge-danger'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      {isIncome ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                      {tx.type}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 500 }}>{tx.description}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span className="badge badge-info">{tx.category_name || 'Uncategorized'}</span>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                    {tx.payment_method || 'Cash'}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: isIncome ? 'var(--accent-emerald)' : 'var(--text-primary)' }}>
                    {isIncome ? '+' : '-'}{symbol}{Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button 
                        onClick={() => onEdit(tx)} 
                        className="btn btn-secondary btn-icon"
                        title="Edit Transaction"
                        style={{ padding: '6px 10px' }}
                      >
                        <Edit2 size={15} />
                      </button>
                      <button 
                        onClick={() => onDelete(tx.id)} 
                        className="btn btn-danger btn-icon"
                        title="Delete Transaction"
                        style={{ padding: '6px 10px' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
