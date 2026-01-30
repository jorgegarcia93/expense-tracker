import React, { useEffect, useState } from 'react';
import { expenseApi } from '../services/api';
import type { Expense, CreateExpense } from '../types';
import { frequencyLabels } from '../types';
import TransactionForm, { type TransactionFormData } from '../components/TransactionForm';
import { Plus, Edit, Trash2 } from 'lucide-react';
import './TransactionsPage.css';

const ExpensesPage: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const fetchExpenses = async () => {
    try {
      const data = await expenseApi.getAll();
      setExpenses(data);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleSubmit = async (formData: TransactionFormData) => {
    const expenseData: CreateExpense = {
      description: formData.description,
      amount: formData.amount,
      date: formData.date,
      category: formData.category || undefined,
      isRecurrent: formData.isRecurrent,
      frequency: formData.frequency,
    };

    try {
      if (editingExpense) {
        await expenseApi.update(editingExpense.id, expenseData);
      } else {
        await expenseApi.create(expenseData);
      }
      setShowForm(false);
      setEditingExpense(null);
      fetchExpenses();
    } catch (error) {
      console.error('Error saving expense:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await expenseApi.delete(id);
        fetchExpenses();
      } catch (error) {
        console.error('Error deleting expense:', error);
      }
    }
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
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
        <h1>Expenses</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={18} />
          Add Expense
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
              <th>Recurrent</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr key={expense.id}>
                <td>{new Date(expense.date).toLocaleDateString()}</td>
                <td>{expense.description}</td>
                <td>{expense.category || '-'}</td>
                <td className="amount expense">{formatCurrency(expense.amount)}</td>
                <td>
                  {expense.isRecurrent ? (
                    <span className="badge recurrent">
                      {frequencyLabels[expense.frequency]}
                    </span>
                  ) : (
                    <span className="badge one-time">One-time</span>
                  )}
                </td>
                <td className="actions">
                  <button className="btn-icon" onClick={() => handleEdit(expense)}>
                    <Edit size={16} />
                  </button>
                  <button className="btn-icon danger" onClick={() => handleDelete(expense.id)}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {expenses.length === 0 && (
              <tr>
                <td colSpan={6} className="empty-state">
                  No expenses found. Add your first expense!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <TransactionForm
          title={editingExpense ? 'Edit Expense' : 'Add Expense'}
          type="expense"
          initialData={
            editingExpense
              ? {
                  description: editingExpense.description,
                  amount: editingExpense.amount,
                  date: editingExpense.date.split('T')[0],
                  category: editingExpense.category || '',
                  isRecurrent: editingExpense.isRecurrent,
                  frequency: editingExpense.frequency,
                }
              : undefined
          }
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingExpense(null);
          }}
        />
      )}
    </div>
  );
};

export default ExpensesPage;
