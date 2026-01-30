import React, { useEffect, useState } from 'react';
import { expenseApi, incomeApi, deductionApi, monthlyRecordApi } from '../services/api';
import type { Expense, Income, Deduction, MonthlyRecord } from '../types';
import { DollarSign, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [deductions, setDeductions] = useState<Deduction[]>([]);
  const [monthlyRecords, setMonthlyRecords] = useState<MonthlyRecord[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [expensesData, incomesData, deductionsData, monthlyData] = await Promise.all([
          expenseApi.getAll(),
          incomeApi.getAll(),
          deductionApi.getAll(),
          monthlyRecordApi.getAll(),
        ]);
        setExpenses(expensesData);
        setIncomes(incomesData);
        setDeductions(deductionsData);
        setMonthlyRecords(monthlyData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalIncomes = incomes.reduce((sum, i) => sum + i.amount, 0);
  const totalDeductions = deductions.reduce((sum, d) => sum + d.amount, 0);
  const netBalance = totalIncomes - totalExpenses - totalDeductions;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card income">
          <div className="stat-icon">
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <h3>Total Income</h3>
            <p className="stat-value">{formatCurrency(totalIncomes)}</p>
            <span className="stat-count">{incomes.length} transactions</span>
          </div>
        </div>
        
        <div className="stat-card expense">
          <div className="stat-icon">
            <TrendingDown size={24} />
          </div>
          <div className="stat-info">
            <h3>Total Expenses</h3>
            <p className="stat-value">{formatCurrency(totalExpenses)}</p>
            <span className="stat-count">{expenses.length} transactions</span>
          </div>
        </div>
        
        <div className="stat-card deduction">
          <div className="stat-icon">
            <DollarSign size={24} />
          </div>
          <div className="stat-info">
            <h3>Total Deductions</h3>
            <p className="stat-value">{formatCurrency(totalDeductions)}</p>
            <span className="stat-count">{deductions.length} transactions</span>
          </div>
        </div>
        
        <div className={`stat-card balance ${netBalance >= 0 ? 'positive' : 'negative'}`}>
          <div className="stat-icon">
            <Wallet size={24} />
          </div>
          <div className="stat-info">
            <h3>Net Balance</h3>
            <p className="stat-value">{formatCurrency(netBalance)}</p>
            <span className="stat-count">{monthlyRecords.length} months tracked</span>
          </div>
        </div>
      </div>

      <div className="recent-transactions">
        <h2>Recent Transactions</h2>
        <div className="transactions-list">
          {[...expenses, ...incomes, ...deductions]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 10)
            .map((transaction, index) => {
              const isExpense = 'amount' in transaction && !('isNetIncome' in transaction) && !('deductionType' in transaction);
              const isIncome = 'isNetIncome' in transaction;
              const type = isIncome ? 'income' : isExpense ? 'expense' : 'deduction';
              
              return (
                <div key={`${type}-${transaction.id}-${index}`} className={`transaction-item ${type}`}>
                  <div className="transaction-info">
                    <span className="transaction-description">{transaction.description}</span>
                    <span className="transaction-date">
                      {new Date(transaction.date).toLocaleDateString()}
                    </span>
                  </div>
                  <span className={`transaction-amount ${type}`}>
                    {type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </span>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
