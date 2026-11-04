# ExpenseMate — Personal Expense Manager

> **University Assignment Project — Software Construction & Development (SCD)**  
> **Technology Stack**: Node.js, Express.js, React (Vite), PostgreSQL (with Dual In-Memory Fallback)

---

## 🌟 Overview & Highlights

**ExpenseMate** is a clean, modern, university-level personal expense management system designed to demonstrate the complete Software Construction lifecycle (**Requirements → Design → Construction → Testing → Maintenance → Evolution**).

### Key Features
1. **Financial Dashboard & Visual Analytics**: Dynamic summary metrics (Total Income, Total Expense, Net Balance) with Chart.js Doughnut (Expense by Category) and Bar (Income vs Expense) charts.
2. **Rule-Based Keyword Auto-Categorization**: Typing terms like `"Uber"`, `"Grocery"`, `"Salary"`, `"Electricity"` automatically suggests the correct category.
3. **Monthly Budget Ceiling Controls & Threshold Alerts**: Set monthly budget caps per category with visual color-coded badges:
   - `<80%`: **Normal** (Green)
   - `80-89%`: **Warning** (Yellow)
   - `90-99%`: **Critical** (Orange)
   - `100%+`: **Exceeded** (Red Alert)
4. **Excel (`.xlsx`) & CSV Dataset Import**: File preview wizard supporting `ExpenseMate_Dummy_Dataset_180.xlsx`, row-by-row validation table, and safe non-destructive database insertion.
5. **CSV Ledger Export**: Export all records into standard CSV format with a single click.
6. **Multi-Currency Support**: Switch between PKR (`Rs.`), USD (`$`), EUR (`€`), GBP (`£`), AED, and SAR across all dashboard displays.
7. **Dual Database Architecture (PostgreSQL + Automatic Memory Fallback)**: Runs seamlessly on PostgreSQL if active, or automatically falls back to an in-memory repository store if PostgreSQL is offline (guaranteeing zero-dependency viva demo capability!).

---

## 📁 Repository Structure

```text
Expense Tracker/
├── db/                         # Database Storage Layer
│   ├── schema.sql              # PostgreSQL DDL Table Creation
│   ├── seed.sql                # Default Categories & Sample Data
│   └── expensemate.db          # Database file
├── backend/                    # Express REST API Server Layer
│   ├── controllers/            # Express Request Controllers
│   ├── db/connection.js        # PostgreSQL Pool & Memory Store Fallback
│   ├── routes/                 # Express REST API Endpoints
│   ├── utils/                  # Categorizer Rule Engine & Validators
│   ├── tests/api.test.js       # Jest Automated API Unit Tests
│   ├── uploads/                # Temporary file uploads (Excel/CSV)
│   ├── server.js               # Backend Express Server Entry Point
│   ├── package.json            # Node Backend Dependencies
│   └── .env                    # Environment configuration (Port 5001)
├── frontend/                   # React (Vite) User Interface Layer
│   ├── src/
│   │   ├── components/         # Reusable React UI Components
│   │   ├── pages/              # Overview, Transactions, Budgets, Analytics, Goals, Settings
│   │   ├── services/api.js     # API Client Service Wrapper
│   │   ├── App.jsx             # React App Root
│   │   └── App.css             # Glassmorphic Design System CSS
│   ├── index.html
│   ├── dist/                   # Production build assets (served by backend)
│   ├── vite.config.js          # Vite configuration with /api proxy to port 5001
│   └── package.json            # React Frontend Dependencies
└── ExpenseMate_Dummy_Dataset_180.xlsx # Sample University Dataset File
```

---

## 🚀 How to Start the Project from the Terminal

### Option A: Production Mode (Single Terminal — Recommended for Viva Demo)
The backend is configured to directly serve both the **REST API** and the compiled **React frontend** on a single port (`5001`):

```powershell
# Navigate to backend and start
cd backend
npm start
```
*Open your browser at **`http://localhost:5001`**.*

---

### Option B: Live Developer Mode (Two Terminals with Hot-Reloading)
For active development with instant code updates:

1. **Terminal 1 — Start Backend Server**:
   ```powershell
   cd backend
   npm run dev    # or npm start
   ```
   *Backend listens on `http://localhost:5001`.*

2. **Terminal 2 — Start Frontend Vite Dev Server**:
   ```powershell
   cd frontend
   npm run dev
   ```
   *Open browser at **`http://localhost:3000`** (requests to `/api` are automatically proxied to port 5001).*

---

## 🧪 Running Automated Unit Tests

To run the backend Jest API integration tests:

```bash
cd backend
npm test
```

**Expected Test Output**:
```text
PASS tests/api.test.js
  ExpenseMate API Test Suite
    √ GET /api/categories - Should return list of default categories
    √ POST /api/transactions/suggest-category - Should suggest Transport for "Uber ride"
    √ POST /api/transactions - Should create a new transaction
    √ GET /api/transactions - Should retrieve transactions
    √ POST /api/budgets & GET /api/budgets - Should set and calculate budget status
    √ GET /api/dashboard - Should return complete financial metrics

Test Suites: 1 passed, 1 total
Tests:       6 passed, 6 total
Snapshots:   0 total
Time:        1.116 s
```

---

## 🎓 Viva Q&A Guide for Academic Evaluation

### Q1: What architecture does ExpenseMate follow?
> **Answer**: ExpenseMate uses a 3-Tier Layered Architecture consisting of a React Vite single-page application (Frontend Layer), Express.js REST API router/controllers (Backend Layer), and PostgreSQL database with an automatic in-memory fallback repository (DB Data Storage Layer).

### Q2: How does the auto-categorization feature work?
> **Answer**: It utilizes a rule-based engine (`backend/utils/categorizer.js`) that performs case-insensitive keyword matching on transaction descriptions. When typing terms like "Uber", "Metro", or "Salary", it maps the keyword to categories like "Transport", "Food", or "Salary" and allows manual user override.

### Q3: How are budget warning thresholds calculated?
> **Answer**: The backend calculates spending percentage: `(actual_spent / amount_limit) * 100`.
> - `< 80%`: Normal
> - `80-89%`: Warning
> - `90-99%`: Critical
> - `≥ 100%`: Exceeded (Red Alert)

### Q4: How does the system handle database dependency failures?
> **Answer**: `backend/db/connection.js` attempts a connection via PostgreSQL `pg.Pool`. If PostgreSQL is not installed or offline, it catches the connection error and automatically redirects query requests to an internal mock memory store without throwing errors or crashing.

---

## 📄 Academic Documentation Bundle
The complete academic submission documents for this assignment are located in the submission root folder:
- `SRS_Document.docx` (Software Requirements Specification)
- `Architecture_Document.docx` (High-Level Design & ERD)
- `Test_Cases.docx` (System & Integration Test Suite)
- `Metrics Report.docx` (Quality & Software Metrics)
- `Final_Report.docx` (Complete Project Lifecycle Report)
