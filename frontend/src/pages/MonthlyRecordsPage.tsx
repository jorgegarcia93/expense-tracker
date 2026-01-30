import React, { useEffect, useState } from 'react';
import { monthlyRecordApi } from '../services/api';
import type { MonthlyRecord, MonthlyRecordDetail } from '../types';
import { statusLabels, MonthStatus } from '../types';
import { Plus, Eye, Lock, Unlock, CheckCircle } from 'lucide-react';
import './MonthlyRecordsPage.css';

const MonthlyRecordsPage: React.FC = () => {
  const [records, setRecords] = useState<MonthlyRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<MonthlyRecordDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newYear, setNewYear] = useState(new Date().getFullYear());
  const [newMonth, setNewMonth] = useState(new Date().getMonth() + 1);

  const fetchRecords = async () => {
    try {
      const data = await monthlyRecordApi.getAll();
      setRecords(data);
    } catch (error) {
      console.error('Error fetching records:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleCreateMonth = async () => {
    try {
      await monthlyRecordApi.create(newYear, newMonth);
      setShowCreateModal(false);
      fetchRecords();
    } catch (error) {
      console.error('Error creating month:', error);
    }
  };

  const handleViewDetails = async (id: number) => {
    try {
      const detail = await monthlyRecordApi.getById(id);
      setSelectedRecord(detail);
    } catch (error) {
      console.error('Error fetching details:', error);
    }
  };

  const handleReconcile = async (id: number) => {
    try {
      await monthlyRecordApi.reconcile(id);
      fetchRecords();
      if (selectedRecord?.id === id) {
        const detail = await monthlyRecordApi.getById(id);
        setSelectedRecord(detail);
      }
    } catch (error) {
      console.error('Error reconciling:', error);
    }
  };

  const handleLock = async (id: number) => {
    try {
      await monthlyRecordApi.lock(id);
      fetchRecords();
      if (selectedRecord?.id === id) {
        const detail = await monthlyRecordApi.getById(id);
        setSelectedRecord(detail);
      }
    } catch (error) {
      console.error('Error locking:', error);
    }
  };

  const handleUnlock = async (id: number) => {
    try {
      await monthlyRecordApi.unlock(id);
      fetchRecords();
      if (selectedRecord?.id === id) {
        const detail = await monthlyRecordApi.getById(id);
        setSelectedRecord(detail);
      }
    } catch (error) {
      console.error('Error unlocking:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getMonthName = (month: number) => {
    return new Date(2000, month - 1, 1).toLocaleString('default', { month: 'long' });
  };

  const getStatusClass = (status: MonthStatus) => {
    switch (status) {
      case MonthStatus.Open:
        return 'status-open';
      case MonthStatus.Reconciled:
        return 'status-reconciled';
      case MonthStatus.Locked:
        return 'status-locked';
      default:
        return '';
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="monthly-records-page">
      <div className="page-header">
        <h1>Monthly Records</h1>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          <Plus size={18} />
          New Month
        </button>
      </div>

      <div className="records-grid">
        {records.map((record) => (
          <div key={record.id} className="record-card">
            <div className="record-header">
              <h3>{getMonthName(record.month)} {record.year}</h3>
              <span className={`status-badge ${getStatusClass(record.status)}`}>
                {statusLabels[record.status]}
              </span>
            </div>
            
            <div className="record-stats">
              <div className="stat-row">
                <span>Income:</span>
                <span className="income">{formatCurrency(record.totalIncome)}</span>
              </div>
              <div className="stat-row">
                <span>Expenses:</span>
                <span className="expense">{formatCurrency(record.totalExpenses)}</span>
              </div>
              <div className="stat-row">
                <span>Deductions:</span>
                <span className="deduction">{formatCurrency(record.totalDeductions)}</span>
              </div>
              <div className="stat-row total">
                <span>Net Balance:</span>
                <span className={record.netBalance >= 0 ? 'positive' : 'negative'}>
                  {formatCurrency(record.netBalance)}
                </span>
              </div>
            </div>

            <div className="record-actions">
              <button className="btn-icon" onClick={() => handleViewDetails(record.id)} title="View Details">
                <Eye size={16} />
              </button>
              
              {record.status === MonthStatus.Open && (
                <button 
                  className="btn-icon" 
                  onClick={() => handleReconcile(record.id)} 
                  title="Reconcile"
                >
                  <CheckCircle size={16} />
                </button>
              )}
              
              {record.status === MonthStatus.Reconciled && (
                <button 
                  className="btn-icon" 
                  onClick={() => handleLock(record.id)} 
                  title="Lock"
                >
                  <Lock size={16} />
                </button>
              )}
              
              {record.status === MonthStatus.Locked && (
                <button 
                  className="btn-icon" 
                  onClick={() => handleUnlock(record.id)} 
                  title="Unlock"
                >
                  <Unlock size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
        
        {records.length === 0 && (
          <div className="empty-state">
            <p>No monthly records found. Create your first month!</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedRecord && (
        <div className="modal-overlay" onClick={() => setSelectedRecord(null)}>
          <div className="modal-content detail-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{getMonthName(selectedRecord.month)} {selectedRecord.year}</h2>
            
            <div className="detail-section">
              <h3>Summary</h3>
              <div className="summary-grid">
                <div className="summary-item">
                  <span>Total Income</span>
                  <span className="income">{formatCurrency(selectedRecord.totalIncome)}</span>
                </div>
                <div className="summary-item">
                  <span>Total Expenses</span>
                  <span className="expense">{formatCurrency(selectedRecord.totalExpenses)}</span>
                </div>
                <div className="summary-item">
                  <span>Total Deductions</span>
                  <span className="deduction">{formatCurrency(selectedRecord.totalDeductions)}</span>
                </div>
                <div className="summary-item highlight">
                  <span>Net Balance</span>
                  <span className={selectedRecord.netBalance >= 0 ? 'positive' : 'negative'}>
                    {formatCurrency(selectedRecord.netBalance)}
                  </span>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h3>Expenses ({selectedRecord.expenses.length})</h3>
              <div className="transaction-list">
                {selectedRecord.expenses.map((expense) => (
                  <div key={expense.id} className="transaction-item">
                    <span>{expense.description}</span>
                    <span className="expense">{formatCurrency(expense.amount)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="detail-section">
              <h3>Incomes ({selectedRecord.incomes.length})</h3>
              <div className="transaction-list">
                {selectedRecord.incomes.map((income) => (
                  <div key={income.id} className="transaction-item">
                    <span>{income.description}</span>
                    <span className="income">{formatCurrency(income.amount)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="detail-section">
              <h3>Deductions ({selectedRecord.deductions.length})</h3>
              <div className="transaction-list">
                {selectedRecord.deductions.map((deduction) => (
                  <div key={deduction.id} className="transaction-item">
                    <span>{deduction.description}</span>
                    <span className="deduction">{formatCurrency(deduction.amount)}</span>
                  </div>
                ))}
              </div>
            </div>

            <button className="btn btn-secondary" onClick={() => setSelectedRecord(null)}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Create Month Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Month</h2>
            <div className="form-row">
              <div className="form-group">
                <label>Year</label>
                <input
                  type="number"
                  value={newYear}
                  onChange={(e) => setNewYear(parseInt(e.target.value))}
                  min="2000"
                  max="2100"
                />
              </div>
              <div className="form-group">
                <label>Month</label>
                <select value={newMonth} onChange={(e) => setNewMonth(parseInt(e.target.value))}>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>
                      {getMonthName(m)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-actions">
              <button className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleCreateMonth}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyRecordsPage;
