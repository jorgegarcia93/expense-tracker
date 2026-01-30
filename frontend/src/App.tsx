import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ExpensesPage from './pages/ExpensesPage';
import IncomesPage from './pages/IncomesPage';
import DeductionsPage from './pages/DeductionsPage';
import MonthlyRecordsPage from './pages/MonthlyRecordsPage';
import ImportPage from './pages/ImportPage';
import TrendsPage from './pages/TrendsPage';
import './App.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/expenses" element={<ExpensesPage />} />
          <Route path="/incomes" element={<IncomesPage />} />
          <Route path="/deductions" element={<DeductionsPage />} />
          <Route path="/months" element={<MonthlyRecordsPage />} />
          <Route path="/import" element={<ImportPage />} />
          <Route path="/trends" element={<TrendsPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
