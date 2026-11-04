import React from 'react';
import Icon from './Icon';

export default function Topbar({ onAddExpense }) {
  return (
    <header className="topbar">
      <div className="mobile-brand">
        <div className="brand-mark">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <strong>ExpenseMate</strong>
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
        <button className="primary-button" onClick={onAddExpense}>
          <Icon name="plus" size={18} /> Add expense
        </button>
      </div>
    </header>
  );
}
