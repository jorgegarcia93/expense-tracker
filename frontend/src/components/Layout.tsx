import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  DollarSign, 
  TrendingUp, 
  MinusCircle, 
  Calendar, 
  Upload, 
  BarChart3 
} from 'lucide-react';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="layout">
      <nav className="sidebar">
        <div className="logo">
          <DollarSign size={32} />
          <span>ExpenseTracker</span>
        </div>
        
        <ul className="nav-links">
          <li>
            <NavLink to="/" end>
              <Home size={20} />
              <span>Dashboard</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/expenses">
              <MinusCircle size={20} />
              <span>Expenses</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/incomes">
              <TrendingUp size={20} />
              <span>Incomes</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/deductions">
              <DollarSign size={20} />
              <span>Deductions</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/months">
              <Calendar size={20} />
              <span>Monthly Records</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/import">
              <Upload size={20} />
              <span>Import CSV</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/trends">
              <BarChart3 size={20} />
              <span>Trends</span>
            </NavLink>
          </li>
        </ul>
      </nav>
      
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;
