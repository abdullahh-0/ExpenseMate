# ExpenseMate

A personal expense manager for tracking income and spending, setting monthly budgets, and understanding where your money goes. ExpenseMate pairs a React dashboard with an Express REST API and a PostgreSQL database, and it keeps working with built-in sample data even when no database is installed.

Built as a two-person group project for the Software Construction and Development (SCD) course at FAST NUCES.

## Features

- **Dashboard:** see total income, total expenses and net balance for any month, with charts for spending by category and income versus expense.
- **Transactions:** add, edit, delete, search and filter your income and expense records.
- **Auto-categorization:** type a description like "Uber ride" or "Grocery" and the app suggests a category. You can always override it.
- **Monthly budgets:** set a spending cap per category and watch it fill up with colour-coded alerts (see the table below).
- **Import and export:** upload a CSV or Excel file, review a row-by-row validation preview, then confirm the import. Export all records to CSV with one click.
- **Multi-currency:** switch between PKR, USD, EUR, GBP, AED and SAR across the whole interface.
- **Analytics:** spending by category (for a single month or all time), monthly income versus expense, and balances per currency.
- **Savings goals:** add goals and track progress toward them.
- **Zero-setup mode:** if PostgreSQL is not running, the app falls back to an in-memory store so you can still try everything.

### Budget alerts

The percentage used is the amount spent divided by the budget limit, rounded.

| Used | Status | Colour |
|------|--------|--------|
| Below 80% | Normal | Green |
| 80% to 89% | Warning | Yellow |
| 90% to 99% | Critical | Orange |
| 100% or more | Exceeded | Red |

## Tech Stack

| Layer | Technologies |
|-------|--------------|
| Frontend | React 18, Vite, Chart.js (react-chartjs-2), Lucide icons |
| Backend | Node.js, Express |
| Database | PostgreSQL, with an in-memory fallback |
| File import | multer, csv-parser, xlsx |
| Testing | Jest, Supertest |

## Getting Started

### Prerequisites

- Node.js 18 or newer
- PostgreSQL (optional, see below)

### 1. Clone and install

```bash
git clone https://github.com/abdullahh-0/ExpenseMate.git
cd ExpenseMate

cd backend
npm install

cd ../frontend
npm install
cd ..
```

### 2. Configure the environment

Copy the example file to create your own `.env` inside the `backend` folder:

```bash
# macOS / Linux
cp backend/.env.example backend/.env

# Windows (Command Prompt)
copy backend\.env.example backend\.env
```

Open `backend/.env` and set `DB_PASSWORD` and `DATABASE_URL` to match your own PostgreSQL password. If you skip PostgreSQL, you can leave the file as it is.

### 3. Set up PostgreSQL (optional)

Create an empty database. The server creates the tables from `db/schema.sql` and loads the default categories and sample data from `db/seed.sql` the first time it starts.

```bash
psql -U postgres -c "CREATE DATABASE expensemate_db;"
```

If PostgreSQL is not available, the server prints "Running on Memory Fallback mode" and uses built-in sample data instead. In that mode, anything you add is lost when the server restarts.

### 4. Run the app

**Option A: single terminal (the backend serves the built frontend)**

```bash
cd frontend
npm run build

cd ../backend
npm start
```

Open http://localhost:5001 in your browser.

**Option B: development mode with hot reloading (two terminals)**

Terminal 1, backend:

```bash
cd backend
npm run dev
```

Terminal 2, frontend:

```bash
cd frontend
npm run dev
```

Open http://localhost:3000. Requests to `/api` are proxied to the backend on port 5001.

## Importing Your Own Data

Open the Import / Export page and upload a `.csv` or `.xlsx` file (up to 16 MB). The app shows a preview that marks each row as valid or invalid, and nothing is saved until you confirm.

A sample file, `ExpenseMate_Dummy_Dataset_180.xlsx`, is included in the project root. It has 180 transactions with these columns:

| Column | Example |
|--------|---------|
| Transaction_ID | TXN-0076 |
| Date | 2026-01-01 |
| Description | Gas Bill |
| Category | Bills |
| Type | Expense |
| Amount | 11700 |

The importer also accepts an optional Currency column. Rows without one use the default currency you choose in the import screen.

## Running the Tests

```bash
cd backend
npm test
```

The Jest suite covers the main API endpoints: categories, category suggestion, creating and listing transactions, budgets, and the dashboard.

## API Reference

All endpoints are under `/api`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Check that the server is running |
| GET | `/api/categories` | List categories (optional `?type=income` or `?type=expense`) |
| GET | `/api/transactions` | List transactions (filters: `search`, `type`, `category_id`, `currency`, `sort_by`, `startDate`, `endDate`) |
| POST | `/api/transactions` | Create a transaction |
| PUT | `/api/transactions/:id` | Update a transaction |
| DELETE | `/api/transactions/:id` | Delete a transaction |
| POST | `/api/transactions/suggest-category` | Suggest a category from a description |
| GET | `/api/budgets` | List budgets with spending status (`month`, `year`, `currency`) |
| POST | `/api/budgets` | Create or update a monthly budget |
| DELETE | `/api/budgets/:id` | Delete a budget |
| GET | `/api/dashboard` | Dashboard totals and chart data (`month`, `year`, `currency`) |
| POST | `/api/import/preview` | Upload a CSV or Excel file and get a validation preview |
| POST | `/api/import/confirm` | Save the previewed records |
| GET | `/api/export/csv` | Download all transactions as CSV |

## Project Structure

```
ExpenseMate/
├── backend/
│   ├── controllers/        # Request handling and business logic
│   ├── db/connection.js    # PostgreSQL pool and in-memory fallback
│   ├── routes/             # REST API routes
│   ├── utils/              # Auto-categorizer and input validators
│   ├── tests/              # Jest API tests
│   ├── server.js           # Express entry point
│   └── .env.example        # Environment template
├── db/
│   ├── schema.sql          # Table definitions
│   └── seed.sql            # Default categories and sample data
├── frontend/
│   ├── src/
│   │   ├── components/     # Sidebar, topbar, modals and shared UI
│   │   ├── pages/          # Overview, Transactions, Analytics, Budgets, Goals, Settings, Import/Export
│   │   ├── services/api.js # API client
│   │   └── App.jsx         # App root
│   └── vite.config.js      # Dev server and API proxy
└── ExpenseMate_Dummy_Dataset_180.xlsx
```

## Database

Three tables, created from `db/schema.sql`:

- **categories:** `id`, `name` (unique), `type` (income or expense)
- **transactions:** `id`, `date`, `description`, `amount` (must be positive), `type`, `category_id`, `currency`, `created_at`
- **budgets:** `id`, `category_id`, `month`, `year`, `amount`, `currency`, with one budget allowed per category, month, year and currency

## How It Works

- **Architecture:** a three-tier design. The React app talks to the Express API, which talks to the database layer.
- **Auto-categorization:** `backend/utils/categorizer.js` does case-insensitive keyword matching on the description, for example "uber" gives Transport and "salary" gives Salary. If nothing matches, it suggests Other.
- **Validation:** amounts must be greater than zero, dates must be valid, and the type must be income or expense. Invalid input is rejected with a clear message.
- **Database fallback:** the server tries PostgreSQL first. If it cannot connect, it switches to an in-memory store without crashing.

## Known Limitations

- There is no user login, so the app is meant for single-user, local use.
- Savings goals live only in the browser session and are not saved to the database, so they reset when you reload the page.
- In memory-fallback mode, data is not saved between server restarts.
