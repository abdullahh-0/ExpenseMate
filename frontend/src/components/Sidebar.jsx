import React from 'react';
import Icon from './Icon';

const NAV_ITEMS = [
  { label: 'Overview', icon: 'grid' },
  { label: 'Transactions', icon: 'swap' },
  { label: 'Analytics', icon: 'chart' },
  { label: 'Budgets', icon: 'wallet' },
  { label: 'Goals', icon: 'target' },
  { label: 'Import & Export', icon: 'fileSpreadsheet' }
];

export default function Sidebar({ activeNav, onSelectNav, transactionCount = 0 }) {
  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="brand" onClick={() => onSelectNav('Overview')}>
        <div className="brand-mark">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <div className="brand-name">ExpenseMate</div>
      </div>

      {/* Navigation */}
      <nav className="nav-list" aria-label="Main navigation">
        <div className="nav-label">Workspace</div>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.label}
            className={`nav-item ${activeNav === item.label ? 'active' : ''}`}
            onClick={() => onSelectNav(item.label)}
          >
            <Icon name={item.icon} />
            <span>{item.label}</span>
            {item.label === 'Transactions' && (
              <span className="nav-count">{transactionCount || 0}</span>
            )}
          </button>
        ))}
      </nav>

      {/* Sidebar Bottom (Upgrade card & profile removed per user request) */}
      <div className="sidebar-bottom">
        <button
          className={`nav-item ${activeNav === 'Settings' ? 'active' : ''}`}
          onClick={() => onSelectNav('Settings')}
        >
          <Icon name="settings" />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
}
