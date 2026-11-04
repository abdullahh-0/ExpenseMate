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
  const num = Math.abs(Number(amt) || 0);
  return `${symbol}${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function Goals({ currency = 'PKR' }) {
  const symbol = CURRENCY_SYMBOLS[currency] || '$';

  const isPKR = currency === 'PKR';
  const isGulf = currency === 'AED' || currency === 'SAR';

  const defaultGoals = [
    { 
      id: 1, 
      title: 'Dream vacation', 
      target: isPKR ? 1200000 : isGulf ? 50000 : 16000, 
      current: isPKR ? 900000 : isGulf ? 37500 : 12000, 
      iconChar: '✦' 
    },
    { 
      id: 2, 
      title: 'Emergency fund', 
      target: isPKR ? 2000000 : isGulf ? 100000 : 30000, 
      current: isPKR ? 1450000 : isGulf ? 72000 : 21500, 
      iconChar: '🛡️' 
    },
    { 
      id: 3, 
      title: 'New vehicle fund', 
      target: isPKR ? 3500000 : isGulf ? 120000 : 35000, 
      current: isPKR ? 2450000 : isGulf ? 85000 : 24500, 
      iconChar: '🚗' 
    }
  ];

  const [goals, setGoals] = useState(defaultGoals);

  const [modalOpen, setModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [newCurrent, setNewCurrent] = useState('');

  const handleAddGoal = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newTarget || parseFloat(newTarget) <= 0) {
      alert('Please fill out a goal name and positive target amount.');
      return;
    }
    const goalObj = {
      id: Date.now(),
      title: newTitle.trim(),
      target: parseFloat(newTarget),
      current: parseFloat(newCurrent || 0),
      iconChar: '✦'
    };
    setGoals([...goals, goalObj]);
    setModalOpen(false);
    setNewTitle('');
    setNewTarget('');
    setNewCurrent('');
  };

  return (
    <div className="content">
      {/* Header */}
      <section className="welcome-row">
        <div>
          <div className="eyebrow">
            <span></span> SAVINGS TARGETS
          </div>
          <div className="page-title" role="heading" aria-level={1}>
            Savings Goals
          </div>
          <p>Track your financial targets and savings progress.</p>
        </div>
        <button className="primary-button" onClick={() => setModalOpen(true)}>
          <Icon name="plus" size={18} /> New Goal
        </button>
      </section>

      {/* Goals Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {goals.map((g) => {
          const percent = g.target > 0 ? Math.min(100, Math.round((g.current / g.target) * 100)) : 0;
          const remaining = Math.max(0, g.target - g.current);

          return (
            <article key={g.id} className="panel savings-panel">
              <div className="panel-header">
                <div>
                  <div className="panel-title" role="heading" aria-level={2}>
                    Savings goal
                  </div>
                  <p>{g.title}</p>
                </div>
                <button className="more-button large" aria-label="Savings options">•••</button>
              </div>

              <div className="goal-visual">
                <div className="goal-circle back"></div>
                <div className="goal-circle front">
                  <span>{g.iconChar}</span>
                </div>
                <div className="plane">↗</div>
              </div>

              <div className="goal-numbers">
                <strong>{formatAmount(g.current, symbol)}</strong>
                <span>of {formatAmount(g.target, symbol)}</span>
              </div>

              <div className="progress-track">
                <span style={{ width: `${percent}%` }}></span>
              </div>

              <div className="goal-footer">
                <span>{percent}% complete</span>
                <strong>{formatAmount(remaining, symbol)} to go</strong>
              </div>
            </article>
          );
        })}
      </div>

      {/* Add Goal Modal */}
      {modalOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setModalOpen(false)}>
          <div className="modal" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="modal-title">Create Savings Goal</div>
                <p>Define a new target to build your savings</p>
              </div>
              <button className="icon-button" onClick={() => setModalOpen(false)} aria-label="Close">
                <Icon name="close" />
              </button>
            </div>

            <form onSubmit={handleAddGoal}>
              <label>
                Goal Name
                <input
                  required
                  placeholder="e.g. Master's Degree, New Laptop, Holiday"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  autoFocus
                />
              </label>

              <div className="form-row">
                <label>
                  Target Amount ({currency})
                  <input
                    required
                    type="number"
                    min="1"
                    placeholder="5000"
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value)}
                  />
                </label>
                <label>
                  Current Saved ({currency})
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={newCurrent}
                    onChange={(e) => setNewCurrent(e.target.value)}
                  />
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" className="secondary-button" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
