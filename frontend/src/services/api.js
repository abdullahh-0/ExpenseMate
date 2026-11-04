const API_BASE = '/api';

export const api = {
  // Categories
  async getCategories(type = '') {
    const res = await fetch(`${API_BASE}/categories${type ? `?type=${type}` : ''}`);
    const json = await res.json();
    return json.data || (Array.isArray(json) ? json : []);
  },

  // Transactions
  async getTransactions(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    const res = await fetch(`${API_BASE}/transactions?${params}`);
    const json = await res.json();
    return json.data || (Array.isArray(json) ? json : []);
  },

  async createTransaction(data) {
    const res = await fetch(`${API_BASE}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    return json.data || json;
  },

  async updateTransaction(id, data) {
    const res = await fetch(`${API_BASE}/transactions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    return json.data || json;
  },

  async deleteTransaction(id) {
    const res = await fetch(`${API_BASE}/transactions/${id}`, { method: 'DELETE' });
    return res.json();
  },

  async suggestCategory(description) {
    const res = await fetch(`${API_BASE}/transactions/suggest-category`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description })
    });
    const json = await res.json();
    return {
      suggested_category_name: json.suggestedCategory || (json.category && json.category.name),
      suggested_category_id: json.category ? json.category.id : null,
      suggested_type: json.category ? json.category.type : 'expense'
    };
  },

  // Budgets
  async getBudgets(month = 9, year = 2026, currency = 'PKR') {
    const res = await fetch(`${API_BASE}/budgets?month=${month}&year=${year}&currency=${currency}`);
    const json = await res.json();
    return json.data || (Array.isArray(json) ? json : []);
  },

  async saveBudget(data) {
    const res = await fetch(`${API_BASE}/budgets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    return json.data || json;
  },

  async deleteBudget(id) {
    const res = await fetch(`${API_BASE}/budgets/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Dashboard
  async getDashboard(month = 9, year = 2026, currency = 'PKR') {
    const res = await fetch(`${API_BASE}/dashboard?month=${month}&year=${year}&currency=${currency}`);
    const json = await res.json();
    return json.data || json;
  },

  // Import & Export
  async previewImport(formData) {
    const res = await fetch(`${API_BASE}/import/preview`, {
      method: 'POST',
      body: formData
    });
    return res.json();
  },

  async confirmImport(validRecords) {
    const res = await fetch(`${API_BASE}/import/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ validRecords })
    });
    return res.json();
  },

  getExportUrl() {
    return `${API_BASE}/export/csv`;
  }
};
