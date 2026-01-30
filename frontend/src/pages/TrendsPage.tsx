import React, { useEffect, useState } from 'react';
import { monthlyRecordApi } from '../services/api';
import type { TrendAnalysis, MonthComparison, MonthlyRecord } from '../types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import './TrendsPage.css';

const COLORS = ['#4ade80', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'];

const TrendsPage: React.FC = () => {
  const [trendData, setTrendData] = useState<TrendAnalysis | null>(null);
  const [monthlyRecords, setMonthlyRecords] = useState<MonthlyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Comparison state
  const [compareMonth1, setCompareMonth1] = useState<number | null>(null);
  const [compareMonth2, setCompareMonth2] = useState<number | null>(null);
  const [comparisonData, setComparisonData] = useState<MonthComparison[] | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trends, records] = await Promise.all([
          monthlyRecordApi.getTrends(),
          monthlyRecordApi.getAll(),
        ]);
        setTrendData(trends);
        setMonthlyRecords(records);
      } catch (error) {
        console.error('Error fetching trend data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCompare = async () => {
    if (!compareMonth1 || !compareMonth2) return;

    const month1 = monthlyRecords.find((m) => m.id === compareMonth1);
    const month2 = monthlyRecords.find((m) => m.id === compareMonth2);

    if (!month1 || !month2) return;

    try {
      const data = await monthlyRecordApi.compare(
        month1.year,
        month1.month,
        month2.year,
        month2.month
      );
      setComparisonData(data);
    } catch (error) {
      console.error('Error comparing months:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getMonthLabel = (year: number, month: number) => {
    return new Date(year, month - 1).toLocaleDateString('default', {
      year: 'numeric',
      month: 'short',
    });
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  const chartData = trendData?.monthlyData.map((m) => ({
    name: getMonthLabel(m.year, m.month),
    income: m.totalIncome,
    expenses: m.totalExpenses,
    deductions: m.totalDeductions,
    netBalance: m.netBalance,
  })) || [];

  // Get category data for pie chart
  const expenseCategoryData = trendData?.monthlyData.reduce((acc, m) => {
    Object.entries(m.expensesByCategory).forEach(([category, amount]) => {
      acc[category] = (acc[category] || 0) + amount;
    });
    return acc;
  }, {} as Record<string, number>) || {};

  const pieData = Object.entries(expenseCategoryData).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="trends-page">
      <h1>Trends & Analysis</h1>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <h3>Avg Monthly Income</h3>
          <p className="amount income">{formatCurrency(trendData?.averageMonthlyIncome || 0)}</p>
        </div>
        <div className="summary-card">
          <h3>Avg Monthly Expenses</h3>
          <p className="amount expense">{formatCurrency(trendData?.averageMonthlyExpense || 0)}</p>
        </div>
        <div className="summary-card">
          <h3>Avg Monthly Deductions</h3>
          <p className="amount deduction">{formatCurrency(trendData?.averageMonthlyDeductions || 0)}</p>
        </div>
        <div className="summary-card">
          <h3>Avg Net Balance</h3>
          <p className={`amount ${(trendData?.averageNetBalance || 0) >= 0 ? 'positive' : 'negative'}`}>
            {formatCurrency(trendData?.averageNetBalance || 0)}
          </p>
        </div>
      </div>

      {/* Line Chart - Monthly Trends */}
      <div className="chart-section">
        <h2>Monthly Trends</h2>
        {chartData.length > 0 ? (
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip formatter={(value) => value != null ? formatCurrency(Number(value)) : ''} />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#4ade80" name="Income" strokeWidth={2} />
                <Line type="monotone" dataKey="expenses" stroke="#ef4444" name="Expenses" strokeWidth={2} />
                <Line type="monotone" dataKey="deductions" stroke="#f59e0b" name="Deductions" strokeWidth={2} />
                <Line type="monotone" dataKey="netBalance" stroke="#3b82f6" name="Net Balance" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="no-data">No data available. Start tracking your finances!</p>
        )}
      </div>

      {/* Bar Chart - Income vs Expenses */}
      <div className="chart-section">
        <h2>Income vs Expenses by Month</h2>
        {chartData.length > 0 ? (
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip formatter={(value) => value != null ? formatCurrency(Number(value)) : ''} />
                <Legend />
                <Bar dataKey="income" fill="#4ade80" name="Income" />
                <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="no-data">No data available.</p>
        )}
      </div>

      {/* Pie Chart - Expense Categories */}
      <div className="chart-section">
        <h2>Expense Distribution by Category</h2>
        {pieData.length > 0 ? (
          <div className="chart-container pie-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                  outerRadius={100}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => value != null ? formatCurrency(Number(value)) : ''} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="no-data">No expense data available.</p>
        )}
      </div>

      {/* Month Comparison */}
      <div className="comparison-section">
        <h2>Compare Months</h2>
        <div className="comparison-controls">
          <select
            value={compareMonth1 ?? ''}
            onChange={(e) => setCompareMonth1(e.target.value ? parseInt(e.target.value) : null)}
          >
            <option value="">Select Month 1</option>
            {monthlyRecords.map((m) => (
              <option key={m.id} value={m.id}>
                {getMonthLabel(m.year, m.month)}
              </option>
            ))}
          </select>
          <span>vs</span>
          <select
            value={compareMonth2 ?? ''}
            onChange={(e) => setCompareMonth2(e.target.value ? parseInt(e.target.value) : null)}
          >
            <option value="">Select Month 2</option>
            {monthlyRecords.map((m) => (
              <option key={m.id} value={m.id}>
                {getMonthLabel(m.year, m.month)}
              </option>
            ))}
          </select>
          <button
            className="btn btn-primary"
            onClick={handleCompare}
            disabled={!compareMonth1 || !compareMonth2}
          >
            Compare
          </button>
        </div>

        {comparisonData && comparisonData.length === 2 && (
          <div className="comparison-results">
            <div className="comparison-grid">
              <div className="comparison-header">
                <span></span>
                <span>{getMonthLabel(comparisonData[0].year, comparisonData[0].month)}</span>
                <span>{getMonthLabel(comparisonData[1].year, comparisonData[1].month)}</span>
                <span>Difference</span>
              </div>
              <div className="comparison-row">
                <span>Total Income</span>
                <span className="income">{formatCurrency(comparisonData[0].totalIncome)}</span>
                <span className="income">{formatCurrency(comparisonData[1].totalIncome)}</span>
                <span className={comparisonData[1].totalIncome - comparisonData[0].totalIncome >= 0 ? 'positive' : 'negative'}>
                  {formatCurrency(comparisonData[1].totalIncome - comparisonData[0].totalIncome)}
                </span>
              </div>
              <div className="comparison-row">
                <span>Total Expenses</span>
                <span className="expense">{formatCurrency(comparisonData[0].totalExpenses)}</span>
                <span className="expense">{formatCurrency(comparisonData[1].totalExpenses)}</span>
                <span className={comparisonData[1].totalExpenses - comparisonData[0].totalExpenses <= 0 ? 'positive' : 'negative'}>
                  {formatCurrency(comparisonData[1].totalExpenses - comparisonData[0].totalExpenses)}
                </span>
              </div>
              <div className="comparison-row">
                <span>Total Deductions</span>
                <span className="deduction">{formatCurrency(comparisonData[0].totalDeductions)}</span>
                <span className="deduction">{formatCurrency(comparisonData[1].totalDeductions)}</span>
                <span>
                  {formatCurrency(comparisonData[1].totalDeductions - comparisonData[0].totalDeductions)}
                </span>
              </div>
              <div className="comparison-row highlight">
                <span>Net Balance</span>
                <span className={comparisonData[0].netBalance >= 0 ? 'positive' : 'negative'}>
                  {formatCurrency(comparisonData[0].netBalance)}
                </span>
                <span className={comparisonData[1].netBalance >= 0 ? 'positive' : 'negative'}>
                  {formatCurrency(comparisonData[1].netBalance)}
                </span>
                <span className={comparisonData[1].netBalance - comparisonData[0].netBalance >= 0 ? 'positive' : 'negative'}>
                  {formatCurrency(comparisonData[1].netBalance - comparisonData[0].netBalance)}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrendsPage;
