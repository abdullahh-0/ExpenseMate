import React, { useState, useEffect } from 'react';
import Icon from './Icon';
import { api } from '../services/api';

export default function EditTransactionModal({ isOpen, onClose, onSuccess, transaction, categories = [], currency = 'PKR' }) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [type, setType] = useState('expense');
  const [date, setDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (transaction) {
      setDescription(transaction.description || '');
      setAmount(transaction.amount || '');
      setCategoryId(transaction.category_id || '');
      setType(transaction.type || 'expense');
      setDate(transaction.date ? (typeof transaction.date === 'string' ? transaction.date.split('T')[0] : new Date(transaction.date).toISOString().split('T')[0]) : '');
      setPaymentMethod(transaction.payment_method || 'Cash');
    }
  }, [transaction]);

  if (!isOpen || !transaction) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount greater than 0.');
      return;
    }
    if (!description.trim()) {
      alert('Please enter a description.');
      return;
    }

    try {
      setSaving(true);
      await api.updateTransaction(transaction.id, {
        description: description.trim(),
        amount: parseFloat(amount),
        category_id: categoryId || null,
        type,
        date,
        currency: transaction.currency || currency,
        payment_method: paymentMethod
      });
      setSaving(false);
      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      setSaving(false);
      alert('Failed to update transaction: ' + err.message);
    }
  };

  const filteredCategories = categories.filter(c => !c.type || c.type === type);

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="edit-expense-title" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-title" id="edit-expense-title">Edit Transaction</div>
            <p>Update transaction details in your ledger.</p>
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
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              autoFocus
            />
          </label>

          <div className="form-row">
            <label>
              Amount ({transaction.currency || currency})
              <input
                required
                type="number"
                min="0.01"
                step="0.01"
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
              Type
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" className="secondary-button" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="primary-button" disabled={saving}>
              {saving ? "Saving..." : "Update Transaction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
