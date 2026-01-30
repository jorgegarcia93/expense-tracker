import React, { useEffect, useState } from 'react';
import { deductionApi } from '../services/api';
import type { Deduction, CreateDeduction } from '../types';
import { frequencyLabels } from '../types';
import TransactionForm, { type TransactionFormData } from '../components/TransactionForm';
import { Plus, Edit, Trash2 } from 'lucide-react';
import './TransactionsPage.css';

const DeductionsPage: React.FC = () => {
  const [deductions, setDeductions] = useState<Deduction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDeduction, setEditingDeduction] = useState<Deduction | null>(null);

  const fetchDeductions = async () => {
    try {
      const data = await deductionApi.getAll();
      setDeductions(data);
    } catch (error) {
      console.error('Error fetching deductions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeductions();
  }, []);

  const handleSubmit = async (formData: TransactionFormData) => {
    const deductionData: CreateDeduction = {
      description: formData.description,
      amount: formData.amount,
      date: formData.date,
      category: formData.category || undefined,
      deductionType: formData.deductionType || undefined,
      isRecurrent: formData.isRecurrent,
      frequency: formData.frequency,
    };

    try {
      if (editingDeduction) {
        await deductionApi.update(editingDeduction.id, deductionData);
      } else {
        await deductionApi.create(deductionData);
      }
      setShowForm(false);
      setEditingDeduction(null);
      fetchDeductions();
    } catch (error) {
      console.error('Error saving deduction:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this deduction?')) {
      try {
        await deductionApi.delete(id);
        fetchDeductions();
      } catch (error) {
        console.error('Error deleting deduction:', error);
      }
    }
  };

  const handleEdit = (deduction: Deduction) => {
    setEditingDeduction(deduction);
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
        <h1>Deductions</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={18} />
          Add Deduction
        </button>
      </div>

      <div className="transactions-table">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Type</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Recurrent</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {deductions.map((deduction) => (
              <tr key={deduction.id}>
                <td>{new Date(deduction.date).toLocaleDateString()}</td>
                <td>{deduction.description}</td>
                <td>{deduction.deductionType || '-'}</td>
                <td>{deduction.category || '-'}</td>
                <td className="amount deduction">{formatCurrency(deduction.amount)}</td>
                <td>
                  {deduction.isRecurrent ? (
                    <span className="badge recurrent">
                      {frequencyLabels[deduction.frequency]}
                    </span>
                  ) : (
                    <span className="badge one-time">One-time</span>
                  )}
                </td>
                <td className="actions">
                  <button className="btn-icon" onClick={() => handleEdit(deduction)}>
                    <Edit size={16} />
                  </button>
                  <button className="btn-icon danger" onClick={() => handleDelete(deduction.id)}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {deductions.length === 0 && (
              <tr>
                <td colSpan={7} className="empty-state">
                  No deductions found. Add your first deduction!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <TransactionForm
          title={editingDeduction ? 'Edit Deduction' : 'Add Deduction'}
          type="deduction"
          initialData={
            editingDeduction
              ? {
                  description: editingDeduction.description,
                  amount: editingDeduction.amount,
                  date: editingDeduction.date.split('T')[0],
                  category: editingDeduction.category || '',
                  deductionType: editingDeduction.deductionType || '',
                  isRecurrent: editingDeduction.isRecurrent,
                  frequency: editingDeduction.frequency,
                }
              : undefined
          }
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingDeduction(null);
          }}
        />
      )}
    </div>
  );
};

export default DeductionsPage;
