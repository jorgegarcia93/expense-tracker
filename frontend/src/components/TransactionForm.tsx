import React, { useState } from 'react';
import { Frequency, frequencyLabels } from '../types';
import './TransactionForm.css';

interface TransactionFormProps {
  onSubmit: (data: TransactionFormData) => void;
  onCancel: () => void;
  initialData?: Partial<TransactionFormData>;
  title: string;
  type: 'expense' | 'income' | 'deduction';
}

export interface TransactionFormData {
  description: string;
  amount: number;
  date: string;
  category: string;
  isRecurrent: boolean;
  frequency: Frequency;
  isNetIncome?: boolean;
  deductionType?: string;
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  onSubmit,
  onCancel,
  initialData,
  title,
  type,
}) => {
  const [formData, setFormData] = useState<TransactionFormData>({
    description: initialData?.description || '',
    amount: initialData?.amount || 0,
    date: initialData?.date || new Date().toISOString().split('T')[0],
    category: initialData?.category || '',
    isRecurrent: initialData?.isRecurrent || false,
    frequency: initialData?.frequency || Frequency.OneTime,
    isNetIncome: initialData?.isNetIncome ?? true,
    deductionType: initialData?.deductionType || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{title}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <input
              type="text"
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="amount">Amount</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              step="0.01"
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <input
              type="text"
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
            />
          </div>

          {type === 'deduction' && (
            <div className="form-group">
              <label htmlFor="deductionType">Deduction Type</label>
              <input
                type="text"
                id="deductionType"
                name="deductionType"
                value={formData.deductionType}
                onChange={handleChange}
                placeholder="e.g., Tax, Insurance, 401k"
              />
            </div>
          )}

          {type === 'income' && (
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="isNetIncome"
                  checked={formData.isNetIncome}
                  onChange={handleChange}
                />
                Net Income (after taxes)
              </label>
            </div>
          )}

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="isRecurrent"
                checked={formData.isRecurrent}
                onChange={handleChange}
              />
              Recurrent Transaction
            </label>
          </div>

          {formData.isRecurrent && (
            <div className="form-group">
              <label htmlFor="frequency">Frequency</label>
              <select
                id="frequency"
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
              >
                {Object.entries(frequencyLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;
