import React, { useState, useEffect } from 'react';
import { Sparkles, Save, X } from 'lucide-react';
import { api } from '../services/api';

export default function TransactionForm({ onSubmit, initialData = null, onCancel = null, categories = [] }) {
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    description: '',
    category_id: '',
    date: new Date().toISOString().split('T')[0],
    payment_method: 'Cash',
    currency: 'PKR'
  });

  const [suggestedCategory, setSuggestedCategory] = useState(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        type: initialData.type || 'expense',
        amount: initialData.amount || '',
        description: initialData.description || '',
        category_id: initialData.category_id || '',
        date: initialData.date ? (typeof initialData.date === 'string' ? initialData.date.split('T')[0] : new Date(initialData.date).toISOString().split('T')[0]) : new Date().toISOString().split('T')[0],
        payment_method: initialData.payment_method || 'Cash',
        currency: initialData.currency || 'PKR'
      });
    }
  }, [initialData]);

  // Handle Description Auto-categorization trigger
  const handleDescriptionChange = async (e) => {
    const val = e.target.value;
    setFormData(prev => ({ ...prev, description: val }));

    if (val.trim().length >= 3 && !initialData) {
      try {
        const res = await api.suggestCategory(val);
        if (res.suggested_category_name) {
          setSuggestedCategory(res);
          if (res.suggested_category_id) {
            setFormData(prev => ({
              ...prev,
              category_id: res.suggested_category_id,
              type: res.suggested_type || prev.type
            }));
          }
        }
      } catch (err) {
        console.error('Categorization error:', err);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.amount || Number(formData.amount) <= 0) {
      alert('Please enter a valid amount greater than 0');
      return;
    }
    if (!formData.description.trim()) {
      alert('Please enter a transaction description');
      return;
    }
    onSubmit(formData);
  };

  const filteredCategories = categories.filter(c => c.type === formData.type);

  return (
    <div className="modal-backdrop" style={{ zIndex: 1000 }}>
      <div className="modal-card" style={{ maxWidth: '600px', width: '90%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>
            {initialData ? 'Edit Transaction' : 'New Transaction'}
          </h3>
          {onCancel && (
            <button 
              type="button" 
              onClick={onCancel} 
              className="btn btn-secondary btn-sm"
              style={{ padding: '6px', borderRadius: '50%' }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Type Selector */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Transaction Type</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                className={`btn ${formData.type === 'expense' ? 'btn-danger' : 'btn-secondary'}`}
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => setFormData({ ...formData, type: 'expense', category_id: '' })}
              >
                Expense
              </button>
              <button
                type="button"
                className={`btn ${formData.type === 'income' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => setFormData({ ...formData, type: 'income', category_id: '' })}
              >
                Income
              </button>
            </div>
          </div>

          {/* Description with Auto-Categorization */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>
              Description <span style={{ color: 'var(--primary)', fontSize: '0.75rem' }}>(Auto-Categorization Enabled)</span>
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Uber Ride, Grocery Shopping, Salary"
              value={formData.description}
              onChange={handleDescriptionChange}
              required
            />
            {suggestedCategory && (
              <div style={{ marginTop: '6px', fontSize: '0.8rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={14} /> Auto-suggested Category: <strong>{suggestedCategory.suggested_category_name}</strong>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {/* Amount */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Amount</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>

            {/* Category */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Category</label>
              <select
                className="form-control"
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                required
              >
                <option value="">Select Category</option>
                {filteredCategories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
            {/* Date */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Date</label>
              <input
                type="date"
                className="form-control"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            {/* Payment Method */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Payment Method</label>
              <select
                className="form-control"
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
              >
                <option value="Cash">Cash</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Mobile Wallet">Mobile Wallet</option>
              </select>
            </div>

            {/* Currency */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Currency</label>
              <select
                className="form-control"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              >
                <option value="PKR">PKR (Rs.)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="AED">AED</option>
                <option value="SAR">SAR</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            {onCancel && (
              <button type="button" onClick={onCancel} className="btn btn-secondary">
                Cancel
              </button>
            )}
            <button type="submit" className="btn btn-primary">
              <Save size={16} />
              {initialData ? 'Update Transaction' : 'Save Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
