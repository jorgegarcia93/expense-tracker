import React, { useEffect, useState, useCallback } from 'react';
import { importApi, monthlyRecordApi } from '../services/api';
import type { ImportBatch, ImportedTransaction, MonthlyRecord } from '../types';
import { 
  TransactionType, 
  Frequency, 
  transactionTypeLabels, 
  frequencyLabels
} from '../types';
import { Upload, Check, X, FileText } from 'lucide-react';
import './ImportPage.css';

const ImportPage: React.FC = () => {
  const [batches, setBatches] = useState<ImportBatch[]>([]);
  const [pendingTransactions, setPendingTransactions] = useState<ImportedTransaction[]>([]);
  const [monthlyRecords, setMonthlyRecords] = useState<MonthlyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  // Upload configuration
  const [dateColumnIndex, setDateColumnIndex] = useState(0);
  const [descriptionColumnIndex, setDescriptionColumnIndex] = useState(1);
  const [amountColumnIndex, setAmountColumnIndex] = useState(2);
  const [categoryColumnIndex, setCategoryColumnIndex] = useState<number | undefined>(undefined);
  const [dateFormat, setDateFormat] = useState('MM/dd/yyyy');
  const [hasHeader, setHasHeader] = useState(true);
  const [source, setSource] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [batchesData, pendingData, recordsData] = await Promise.all([
        importApi.getAllBatches(),
        importApi.getPendingTransactions(),
        monthlyRecordApi.getAll(),
      ]);
      setBatches(batchesData);
      setPendingTransactions(pendingData);
      setMonthlyRecords(recordsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await importApi.uploadCsv(file, {
        dateColumnIndex,
        descriptionColumnIndex,
        amountColumnIndex,
        categoryColumnIndex,
        dateFormat,
        hasHeader,
        source: source || undefined,
      });
      fetchData();
    } catch (error) {
      console.error('Error uploading CSV:', error);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleReviewTransaction = async (
    transactionId: number,
    type: TransactionType,
    isRecurrent: boolean,
    frequency: Frequency,
    monthlyRecordId?: number
  ) => {
    try {
      await importApi.reviewTransaction(transactionId, {
        assignedType: type,
        isRecurrent,
        frequency,
        monthlyRecordId,
      });
      fetchData();
    } catch (error) {
      console.error('Error reviewing transaction:', error);
    }
  };

  const handleIgnoreTransaction = async (id: number) => {
    try {
      await importApi.ignoreTransaction(id);
      fetchData();
    } catch (error) {
      console.error('Error ignoring transaction:', error);
    }
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
    <div className="import-page">
      <h1>Import CSV</h1>

      {/* Upload Section */}
      <div className="upload-section">
        <h2>Upload Bank/Credit Card Statement</h2>
        <div className="upload-config">
          <div className="config-row">
            <div className="config-item">
              <label>Date Column Index</label>
              <input
                type="number"
                value={dateColumnIndex}
                onChange={(e) => setDateColumnIndex(parseInt(e.target.value))}
                min="0"
              />
            </div>
            <div className="config-item">
              <label>Description Column Index</label>
              <input
                type="number"
                value={descriptionColumnIndex}
                onChange={(e) => setDescriptionColumnIndex(parseInt(e.target.value))}
                min="0"
              />
            </div>
            <div className="config-item">
              <label>Amount Column Index</label>
              <input
                type="number"
                value={amountColumnIndex}
                onChange={(e) => setAmountColumnIndex(parseInt(e.target.value))}
                min="0"
              />
            </div>
            <div className="config-item">
              <label>Category Column (optional)</label>
              <input
                type="number"
                value={categoryColumnIndex ?? ''}
                onChange={(e) => setCategoryColumnIndex(e.target.value ? parseInt(e.target.value) : undefined)}
                min="0"
                placeholder="N/A"
              />
            </div>
          </div>
          <div className="config-row">
            <div className="config-item">
              <label>Date Format</label>
              <input
                type="text"
                value={dateFormat}
                onChange={(e) => setDateFormat(e.target.value)}
                placeholder="MM/dd/yyyy"
              />
            </div>
            <div className="config-item">
              <label>Source (Bank Name)</label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="e.g., Chase, Amex"
              />
            </div>
            <div className="config-item checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={hasHeader}
                  onChange={(e) => setHasHeader(e.target.checked)}
                />
                CSV has header row
              </label>
            </div>
          </div>
        </div>

        <div className="upload-area">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            disabled={uploading}
            id="csv-upload"
          />
          <label htmlFor="csv-upload" className="upload-label">
            <Upload size={32} />
            <span>{uploading ? 'Uploading...' : 'Click to upload CSV file'}</span>
          </label>
        </div>
      </div>

      {/* Pending Transactions */}
      <div className="pending-section">
        <h2>Pending Review ({pendingTransactions.length})</h2>
        {pendingTransactions.length > 0 ? (
          <div className="pending-table">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Source</th>
                  <th>Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingTransactions.map((transaction) => (
                  <TransactionRow
                    key={transaction.id}
                    transaction={transaction}
                    monthlyRecords={monthlyRecords}
                    onReview={handleReviewTransaction}
                    onIgnore={handleIgnoreTransaction}
                    formatCurrency={formatCurrency}
                  />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="empty-message">No pending transactions to review.</p>
        )}
      </div>

      {/* Import History */}
      <div className="history-section">
        <h2>Import History</h2>
        <div className="batches-list">
          {batches.map((batch) => (
            <div key={batch.id} className="batch-card">
              <div className="batch-icon">
                <FileText size={24} />
              </div>
              <div className="batch-info">
                <h4>{batch.fileName}</h4>
                <p>{batch.source || 'Unknown source'}</p>
                <span className="batch-date">
                  {new Date(batch.importedAt).toLocaleString()}
                </span>
              </div>
              <div className="batch-stats">
                <span>{batch.processedTransactions} / {batch.totalTransactions} processed</span>
              </div>
            </div>
          ))}
          {batches.length === 0 && (
            <p className="empty-message">No import history yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

interface TransactionRowProps {
  transaction: ImportedTransaction;
  monthlyRecords: MonthlyRecord[];
  onReview: (id: number, type: TransactionType, isRecurrent: boolean, frequency: Frequency, monthlyRecordId?: number) => void;
  onIgnore: (id: number) => void;
  formatCurrency: (amount: number) => string;
}

const TransactionRow: React.FC<TransactionRowProps> = ({
  transaction,
  monthlyRecords,
  onReview,
  onIgnore,
  formatCurrency,
}) => {
  const [selectedType, setSelectedType] = useState<TransactionType>(
    transaction.assignedType ?? TransactionType.Expense
  );
  const [isRecurrent, setIsRecurrent] = useState(false);
  const [frequency, setFrequency] = useState<Frequency>(Frequency.OneTime);
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>(undefined);

  const handleApprove = () => {
    onReview(transaction.id, selectedType, isRecurrent, frequency, selectedMonth);
  };

  return (
    <tr>
      <td>{new Date(transaction.transactionDate).toLocaleDateString()}</td>
      <td>{transaction.description}</td>
      <td>{formatCurrency(transaction.amount)}</td>
      <td>{transaction.source || '-'}</td>
      <td>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(parseInt(e.target.value) as TransactionType)}
        >
          {Object.entries(transactionTypeLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </td>
      <td>
        <div className="action-controls">
          <label className="recurrent-checkbox">
            <input
              type="checkbox"
              checked={isRecurrent}
              onChange={(e) => setIsRecurrent(e.target.checked)}
            />
            Recurrent
          </label>
          {isRecurrent && (
            <select
              value={frequency}
              onChange={(e) => setFrequency(parseInt(e.target.value) as Frequency)}
            >
              {Object.entries(frequencyLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          )}
          <select
            value={selectedMonth ?? ''}
            onChange={(e) => setSelectedMonth(e.target.value ? parseInt(e.target.value) : undefined)}
          >
            <option value="">Select Month</option>
            {monthlyRecords
              .filter((m) => m.status === 0) // Open status
              .map((m) => (
                <option key={m.id} value={m.id}>
                  {new Date(m.year, m.month - 1).toLocaleDateString('default', {
                    year: 'numeric',
                    month: 'long',
                  })}
                </option>
              ))}
          </select>
          <button className="btn-icon approve" onClick={handleApprove} title="Approve">
            <Check size={16} />
          </button>
          <button
            className="btn-icon danger"
            onClick={() => onIgnore(transaction.id)}
            title="Ignore"
          >
            <X size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default ImportPage;
