import React, { useEffect, useState } from 'react';
import { incomeApi } from '../services/api';
import type { Income, CreateIncome } from '../types';
import { frequencyLabels } from '../types';
import TransactionForm, { type TransactionFormData } from '../components/TransactionForm';
import { Plus, Edit, Trash2 } from 'lucide-react';
import './TransactionsPage.css';

const IncomesPage: React.FC = () => {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);

  const fetchIncomes = async () => {
    try {
      const data = await incomeApi.getAll();
      setIncomes(data);
    } catch (error) {
      console.error('Error fetching incomes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncomes();
  }, []);

  const handleSubmit = async (formData: TransactionFormData) => {
    const incomeData: CreateIncome = {
      description: formData.description,
      amount: formData.amount,
      date: formData.date,
      category: formData.category || undefined,
      isRecurrent: formData.isRecurrent,
      frequency: formData.frequency,
      isNetIncome: formData.isNetIncome ?? true,
    };

    try {
      if (editingIncome) {
        await incomeApi.update(editingIncome.id, incomeData);
      } else {
        await incomeApi.create(incomeData);
      }
      setShowForm(false);
      setEditingIncome(null);
      fetchIncomes();
    } catch (error) {
      console.error('Error saving income:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this income?')) {
      try {
        await incomeApi.delete(id);
        fetchIncomes();
      } catch (error) {
        console.error('Error deleting income:', error);
      }
    }
  };

  const handleEdit = (income: Income) => {
    setEditingIncome(income);
    setShowForm(true);
  };

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
    <div className="transactions-page">
      <div className="page-header">
        <h1>Incomes</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={18} />
          Add Income
        </button>
      </div>

      <div className="transactions-table">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Net Income</th>
              <th>Recurrent</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {incomes.map((income) => (
              <tr key={income.id}>
                <td>{new Date(income.date).toLocaleDateString()}</td>
                <td>{income.description}</td>
                <td>{income.category || '-'}</td>
                <td className="amount income">{formatCurrency(income.amount)}</td>
                <td>{income.isNetIncome ? 'Yes' : 'No'}</td>
                <td>
                  {income.isRecurrent ? (
                    <span className="badge recurrent">
                      {frequencyLabels[income.frequency]}
                    </span>
                  ) : (
                    <span className="badge one-time">One-time</span>
                  )}
                </td>
                <td className="actions">
                  <button className="btn-icon" onClick={() => handleEdit(income)}>
                    <Edit size={16} />
                  </button>
                  <button className="btn-icon danger" onClick={() => handleDelete(income.id)}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {incomes.length === 0 && (
              <tr>
                <td colSpan={7} className="empty-state">
                  No incomes found. Add your first income!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <TransactionForm
          title={editingIncome ? 'Edit Income' : 'Add Income'}
          type="income"
          initialData={
            editingIncome
              ? {
                  description: editingIncome.description,
                  amount: editingIncome.amount,
                  date: editingIncome.date.split('T')[0],
                  category: editingIncome.category || '',
                  isRecurrent: editingIncome.isRecurrent,
                  frequency: editingIncome.frequency,
                  isNetIncome: editingIncome.isNetIncome,
                }
              : undefined
          }
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingIncome(null);
          }}
        />
      )}
    </div>
  );
};

export default IncomesPage;
