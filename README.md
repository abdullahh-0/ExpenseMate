# ExpenseMate - Personal Expense Manager

Software Construction and Development (SCD) - Assignment 1

ExpenseMate is a web application for recording income and expenses, setting monthly budgets and viewing spending summaries. It was built to demonstrate the full software construction cycle: requirements, design, construction, testing and maintenance.

Team: Areebah Khan and Muhammad Abdullah

## Features

1. Dashboard with total income, total expense and net balance, plus doughnut (expense by category) and bar (income vs expense) charts.
2. Transactions page to add, edit, delete, search and filter records.
3. Automatic category suggestion from the description (for example "Uber" gives Transport). The user can change the suggestion.
4. Monthly budget ceilings per category with status levels:
   - below 80%: Normal
   - 80% to 89%: Warning
   - 90% to 99%: Critical
   - 100% or more: Exceeded
5. Import of .xlsx and .csv files with a preview and row validation before saving.
6. Export of all records to CSV.
7. Multi-currency display (PKR, USD, EUR, GBP, AED, SAR).
8. PostgreSQL storage with an automatic in-memory fallback when no database server is available.

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 5, Chart.js |
| Backend | Node.js, Express 4 |
| Database | PostgreSQL (via pg), in-memory fallback |
| Testing | Jest, Supertest |

## Project Structure

```text
Expense Tracker/
|-- db/
|   |-- schema.sql              PostgreSQL tables
|   |-- seed.sql                default categories and sample data
|-- backend/
|   |-- controllers/            request handlers
|   |-- routes/                 REST API routes
|   |-- db/connection.js        PostgreSQL pool and memory fallback
|   |-- utils/                  categorizer and validators
|   |-- tests/api.test.js       API tests
|   |-- server.js               entry point (port 5001)
|   |-- .env.example            environment template
|   |-- package.json
|-- frontend/
|   |-- src/
|   |   |-- components/         reusable UI components
|   |   |-- pages/              Overview, Transactions, Budgets, Analytics, Goals, Import/Export, Settings
|   |   |-- services/api.js     API client
|   |-- vite.config.js          dev server on port 3000, /api proxied to 5001
|   |-- package.json
|-- ExpenseMate_Dummy_Dataset_180.xlsx   sample dataset for import
```

## Prerequisites

- Node.js 18 or newer and npm
- PostgreSQL (optional). Without it the application runs in in-memory mode and data is lost when the server stops.

## Setup

1. Install the dependencies:

   ```bash
   cd backend
   npm install
   cd ../frontend
   npm install
   ```

2. Create the environment file. Copy `backend/.env.example` to `backend/.env` and set your PostgreSQL password:

   ```text
   PORT=5001
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=expensemate_db
   DB_USER=postgres
   DB_PASSWORD=your_password
   DATABASE_URL=postgres://postgres:your_password@localhost:5432/expensemate_db
   ```

3. Create the database (skip this to use in-memory mode):

   ```sql
   CREATE DATABASE expensemate_db;
   ```

   The tables and default categories are created automatically on first start.

## Running the Application

### Option A: single server (production build)

```bash
cd frontend
npm run build
cd ../backend
npm start
```

Open http://localhost:5001

### Option B: development mode (two terminals)

Terminal 1:

```bash
cd backend
npm run dev
```

Terminal 2:

```bash
cd frontend
npm run dev
```

Open http://localhost:3000

## API Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | /api/categories | list categories |
| GET | /api/transactions | list transactions (search and filter options) |
| POST | /api/transactions | create a transaction |
| PUT | /api/transactions/:id | update a transaction |
| DELETE | /api/transactions/:id | delete a transaction |
| POST | /api/transactions/suggest-category | suggest a category from a description |
| GET | /api/budgets | budget summary with status |
| POST | /api/budgets | create or update a budget |
| DELETE | /api/budgets/:id | delete a budget |
| GET | /api/dashboard | dashboard totals and breakdowns |
| POST | /api/import/preview | upload and validate a spreadsheet |
| POST | /api/import/confirm | save the validated rows |
| GET | /api/export/csv | download all records as CSV |

## Running the Tests

```bash
cd backend
npm test
```

Expected result: 1 suite, 6 tests, all passing (categories, category suggestion, create transaction, list transactions, budget status, dashboard).

## Importing the Sample Dataset

Open the Import / Export page, choose `ExpenseMate_Dummy_Dataset_180.xlsx`, check the preview and click the confirm button.

## Documentation

The Assignment 1 documents are in the submission folder: SRS_Document, Architecture_Document, Test_Cases, Metrics Report and Final_Report.
