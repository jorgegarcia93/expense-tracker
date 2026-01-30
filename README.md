# Expense Tracker

A comprehensive expense tracking application built with .NET 10 (backend) and React (frontend) with SQL Server database support.

## Features

### Core Transaction Management
- **Expenses**: Track all your expenses with category support
- **Incomes**: Record your income sources (marked as net income after taxes)
- **Deductions**: Track deductions like taxes, insurance, 401k contributions

### Recurrence Support
All transactions can be marked as recurrent with the following frequencies:
- One Time
- Daily
- Weekly
- Bi-Weekly
- Monthly
- Quarterly
- Yearly

### Monthly Records & Reconciliation
- Create monthly records to organize your finances
- Track totals for income, expenses, and deductions per month
- Calculate net balance automatically
- Reconcile months at the end of the month
- Lock reconciled months to prevent changes

### CSV Import
Import transactions from bank and credit card statements:
- Upload CSV files with configurable column mapping
- Review imported transactions before adding them
- Mark transactions as expenses, income, or deductions
- Set recurrence for imported transactions
- Assign transactions to specific monthly records

### Trends & Analysis
- View monthly trends with line charts
- Compare income vs expenses with bar charts
- See expense distribution by category with pie charts
- Compare any two months side-by-side
- View average monthly statistics

## Technology Stack

### Backend
- .NET 10 Web API
- Entity Framework Core with SQL Server
- RESTful API design
- CsvHelper for CSV parsing

### Frontend
- React 19 with TypeScript
- Vite for fast development
- React Router for navigation
- Recharts for data visualization
- Axios for API communication
- Lucide React for icons

## Getting Started

### Prerequisites
- .NET 10 SDK
- Node.js 20+
- SQL Server (or LocalDB for development)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend/ExpenseTracker.API
```

2. Update the connection string in `appsettings.json` if needed:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=ExpenseTrackerDb;Trusted_Connection=True;MultipleActiveResultSets=true"
  }
}
```

3. Run the API:
```bash
dotnet run
```

The API will be available at `https://localhost:5001` or `http://localhost:5000`.

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (optional) to configure the API URL:
```
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

## API Endpoints

### Expenses
- `GET /api/expenses` - Get all expenses
- `GET /api/expenses/{id}` - Get expense by ID
- `GET /api/expenses/month/{year}/{month}` - Get expenses by month
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/{id}` - Update expense
- `DELETE /api/expenses/{id}` - Delete expense

### Incomes
- `GET /api/incomes` - Get all incomes
- `GET /api/incomes/{id}` - Get income by ID
- `GET /api/incomes/month/{year}/{month}` - Get incomes by month
- `POST /api/incomes` - Create income
- `PUT /api/incomes/{id}` - Update income
- `DELETE /api/incomes/{id}` - Delete income

### Deductions
- `GET /api/deductions` - Get all deductions
- `GET /api/deductions/{id}` - Get deduction by ID
- `GET /api/deductions/month/{year}/{month}` - Get deductions by month
- `POST /api/deductions` - Create deduction
- `PUT /api/deductions/{id}` - Update deduction
- `DELETE /api/deductions/{id}` - Delete deduction

### Monthly Records
- `GET /api/monthlyrecords` - Get all monthly records
- `GET /api/monthlyrecords/{id}` - Get monthly record details
- `GET /api/monthlyrecords/{year}/{month}` - Get record by year/month
- `POST /api/monthlyrecords` - Create monthly record
- `POST /api/monthlyrecords/{id}/reconcile` - Reconcile month
- `POST /api/monthlyrecords/{id}/lock` - Lock month
- `POST /api/monthlyrecords/{id}/unlock` - Unlock month
- `GET /api/monthlyrecords/trends` - Get trend analysis
- `GET /api/monthlyrecords/compare` - Compare two months

### Import
- `POST /api/import/csv` - Upload CSV file
- `GET /api/import/batches` - Get all import batches
- `GET /api/import/batches/{id}` - Get import batch details
- `GET /api/import/pending` - Get pending transactions
- `POST /api/import/transactions/{id}/review` - Review transaction
- `POST /api/import/transactions/{id}/ignore` - Ignore transaction
- `POST /api/import/batches/{batchId}/add-all-to-month/{monthlyRecordId}` - Add all reviewed to month

## Project Structure

```
expense-tracker/
├── backend/
│   └── ExpenseTracker.API/
│       ├── Controllers/       # API Controllers
│       ├── Data/              # DbContext
│       ├── DTOs/              # Data Transfer Objects
│       ├── Models/            # Entity Models
│       ├── Services/          # Business Logic
│       └── Program.cs         # Application Entry Point
└── frontend/
    └── src/
        ├── components/        # Reusable UI Components
        ├── pages/             # Page Components
        ├── services/          # API Services
        └── types/             # TypeScript Types
```

## License

MIT