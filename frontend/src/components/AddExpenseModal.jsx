import React, { useState } from 'react';
import Icon from './Icon';
import { api } from '../services/api';

export default function AddExpenseModal({ isOpen, onClose, onSuccess, categories = [], currency = 'PKR' }) {
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [type, setType] = useState('expense');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleDescriptionChange = async (e) => {
    const val = e.target.value;
    setMerchant(val);
    if (val.trim().length >= 3 && !categoryId) {
      try {
        const res = await api.suggestCategory(val);
        if (res && res.suggested_category_id) {
          setCategoryId(res.suggested_category_id);
          if (res.suggested_type) setType(res.suggested_type);
        }
      } catch (err) {
        // silent fallback
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount greater than 0.');
      return;
    }
    if (!merchant.trim()) {
      alert('Please enter a description / merchant.');
      return;
    }

    try {
      setSaving(true);
      await api.createTransaction({
        description: merchant.trim(),
        amount: parseFloat(amount),
        category_id: categoryId || null,
        type,
        date,
        currency,
        payment_method: paymentMethod,
        note: note.trim()
      });

      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        setSaving(false);
        onSuccess && onSuccess();
        onClose();
      }, 700);
    } catch (err) {
      setSaving(false);
      alert('Failed to save expense: ' + err.message);
    }
  };

  const filteredCategories = categories.filter(c => !c.type || c.type === type);

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="expense-title" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-title" id="expense-title">Add a new expense</div>
            <p>Keep your spending picture up to date.</p>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close">
            <Icon name="close" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <label>
            Merchant / Description
            <input
              required
              placeholder="e.g. Bistro Avenue, Grocery, Shell station"
              value={merchant}
              onChange={handleDescriptionChange}
              autoFocus
            />
          </label>

          <div className="form-row">
            <label>
              Amount ({currency})
              <input
                required
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </label>
            <label>
              Category
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">Select Category</option>
                {filteredCategories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="form-row">
            <label>
              Date
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
            <label>
              Payment Method
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="Cash">Cash</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Mobile Wallet">Mobile Wallet</option>
              </select>
            </label>
          </div>

          <label>
            Note <span>(optional)</span>
            <input
              placeholder="What was this for?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>

          <div className="modal-actions">
            <button type="button" className="secondary-button" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="primary-button" disabled={saving}>
              {saved ? "Expense saved" : saving ? "Saving..." : "Save expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
