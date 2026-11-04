import React from 'react';
import Icon from '../components/Icon';

export default function Settings({ currency = 'PKR', onCurrencyChange }) {
  return (
    <div className="content">
      {/* Header */}
      <section className="welcome-row">
        <div>
          <div className="eyebrow">
            <span></span> CONFIGURATION
          </div>
          <div className="page-title" role="heading" aria-level={1}>
            Settings & Preferences
          </div>
          <p>Manage application currency, system preferences, and architecture information.</p>
        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        {/* Currency Preference Panel */}
        <article className="panel">
          <div className="panel-header">
            <div>
              <div className="panel-title" role="heading" aria-level={2}>
                Display Currency
              </div>
              <p>Primary currency symbol across all dashboard cards</p>
            </div>
          </div>

          <div style={{ marginTop: '16px' }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: '7px', fontSize: '11px', fontWeight: 700, color: 'var(--ink)' }}>
              Selected Currency
              <select
                className="filter-input"
                style={{ height: '42px', width: '100%', borderRadius: '10px' }}
                value={currency}
                onChange={(e) => onCurrencyChange && onCurrencyChange(e.target.value)}
              >
                <option value="PKR">PKR - Pakistani Rupee (Rs.)</option>
                <option value="USD">USD - United States Dollar ($)</option>
                <option value="EUR">EUR - Euro (€)</option>
                <option value="GBP">GBP - British Pound (£)</option>
                <option value="AED">AED - UAE Dirham (AED)</option>
                <option value="SAR">SAR - Saudi Riyal (SAR)</option>
              </select>
            </label>
            <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '8px' }}>
              Transactions support multi-currency values. All overview metrics and budget ceilings adapt dynamically.
            </p>
          </div>
        </article>

        {/* Database Status Panel */}
        <article className="panel">
          <div className="panel-header">
            <div>
              <div className="panel-title" role="heading" aria-level={2}>
                Database Engine Status
              </div>
              <p>Resilient dual-engine storage architecture</p>
            </div>
          </div>

          <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge badge-mint">
                <Icon name="check" size={12} /> Active Storage Engine
              </span>
              <span style={{ fontSize: '11px', color: 'var(--muted)' }}>PostgreSQL 18</span>
            </div>

            <p style={{ fontSize: '11px', color: 'var(--muted)', margin: 0, lineHeight: 1.5 }}>
              ExpenseMate executes SQL queries against local PostgreSQL with automatic fallback to an in-memory repository if the database service is paused.
            </p>
          </div>
        </article>
      </div>

      {/* Academic Project Info Panel */}
      <article className="panel" style={{ marginTop: '20px' }}>
        <div className="panel-header">
          <div>
            <div className="panel-title" role="heading" aria-level={2}>
              Academic Project Specification
            </div>
            <p>Software Construction & Development (SCD) — Assignment 1</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '18px', fontSize: '12px' }}>
          <div>
            <span style={{ color: 'var(--faint)', fontSize: '10px', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Application</span>
            <strong>ExpenseMate Personal Expense Tracker</strong>
          </div>
          <div>
            <span style={{ color: 'var(--faint)', fontSize: '10px', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Architecture</span>
            <strong>3-Tier Layered (Frontend / Backend / Database)</strong>
          </div>
          <div>
            <span style={{ color: 'var(--faint)', fontSize: '10px', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Tech Stack</span>
            <strong>React (Vite) + Express.js + PostgreSQL</strong>
          </div>
          <div>
            <span style={{ color: 'var(--faint)', fontSize: '10px', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Version</span>
            <strong>v2.0.0 (Clean Reference Architecture)</strong>
          </div>
        </div>
      </article>
    </div>
  );
}
