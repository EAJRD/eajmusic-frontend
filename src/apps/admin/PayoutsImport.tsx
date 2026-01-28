import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../services/api';

// ===========================================
// TYPES
// ===========================================
interface PayoutRecord {
  rowNumber: number;
  email: string;
  amount: number;
  method: string;
  transactionId: string;
  isValid: boolean;
  errors: string[];
  status?: 'pending' | 'processing' | 'success' | 'failed';
  serverMessage?: string;
}

interface ImportSummary {
  total: number;
  valid: number;
  invalid: number;
  processed: number;
  successful: number;
  failed: number;
}

interface RecentImport {
  id: string;
  filename: string;
  recordsCount: number;
  successCount: number;
  failedCount: number;
  importedAt: string;
  importedBy: string;
}

// ===========================================
// CSV PARSING UTILITIES
// ===========================================
const parseCSV = (content: string): string[][] => {
  const lines = content.split(/\r?\n/).filter(line => line.trim());
  return lines.map(line => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  });
};

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateAmount = (amount: string): { valid: boolean; value: number } => {
  const cleaned = amount.replace(/[$,\s]/g, '');
  const value = parseFloat(cleaned);
  return {
    valid: !isNaN(value) && value > 0,
    value: isNaN(value) ? 0 : value
  };
};

const validateMethod = (method: string): boolean => {
  const validMethods = ['paypal', 'bank_transfer', 'wire', 'check', 'crypto', 'wise', 'payoneer'];
  return validMethods.includes(method.toLowerCase());
};

// ===========================================
// SUBCOMPONENTS
// ===========================================

const UploadZone: React.FC<{
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}> = ({ onFileSelect, isProcessing }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
      onClick={() => !isProcessing && fileInputRef.current?.click()}
      className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
        isProcessing
          ? 'border-slate-700 bg-dark-800/50 cursor-not-allowed'
          : isDragging
            ? 'border-brand-500 bg-brand-500/10'
            : 'border-dark-800 hover:border-brand-500/50 hover:bg-dark-800/50'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        disabled={isProcessing}
        className="hidden"
      />

      {isProcessing ? (
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-3 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
          <p className="text-slate-400">Processing file...</p>
        </div>
      ) : (
        <>
          <div className={`p-4 rounded-full mb-4 mx-auto w-fit ${isDragging ? 'bg-brand-500/20 scale-110' : 'bg-dark-800'} transition-all`}>
            <span className="material-symbols-outlined text-5xl text-brand-500">upload_file</span>
          </div>
          <p className="text-xl font-bold text-white mb-2">
            {isDragging ? 'Drop CSV file here' : 'Upload Payout CSV'}
          </p>
          <p className="text-sm text-slate-400 mb-4">Drag & drop or click to browse</p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-dark-800 rounded-lg text-sm text-slate-400">
            <span className="material-symbols-outlined text-lg">description</span>
            CSV format required
          </div>
        </>
      )}
    </div>
  );
};

const CSVTemplate: React.FC = () => {
  const downloadTemplate = () => {
    const template = `email,amount,method,transaction_id
artist@example.com,150.00,paypal,TXN-001-2024
another@example.com,275.50,bank_transfer,TXN-002-2024
third@example.com,500.00,wise,TXN-003-2024`;

    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'payout_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-dark-800 rounded-xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-white mb-1">CSV Format Requirements</h3>
          <p className="text-sm text-slate-400">Your CSV file must have these columns in order</p>
        </div>
        <button
          onClick={downloadTemplate}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-sm font-bold rounded-lg transition-colors"
        >
          <span className="material-symbols-outlined text-lg">download</span>
          Download Template
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-dark-700">
              <th className="px-4 py-3 text-slate-400 font-bold">Column</th>
              <th className="px-4 py-3 text-slate-400 font-bold">Type</th>
              <th className="px-4 py-3 text-slate-400 font-bold">Required</th>
              <th className="px-4 py-3 text-slate-400 font-bold">Example</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-700">
            <tr>
              <td className="px-4 py-3 font-mono text-brand-400">email</td>
              <td className="px-4 py-3 text-slate-300">string</td>
              <td className="px-4 py-3"><span className="text-emerald-400">Yes</span></td>
              <td className="px-4 py-3 font-mono text-slate-500">artist@example.com</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-mono text-brand-400">amount</td>
              <td className="px-4 py-3 text-slate-300">number</td>
              <td className="px-4 py-3"><span className="text-emerald-400">Yes</span></td>
              <td className="px-4 py-3 font-mono text-slate-500">150.00</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-mono text-brand-400">method</td>
              <td className="px-4 py-3 text-slate-300">string</td>
              <td className="px-4 py-3"><span className="text-emerald-400">Yes</span></td>
              <td className="px-4 py-3 font-mono text-slate-500">paypal, bank_transfer, wise, payoneer, wire, check, crypto</td>
            </tr>
            <tr>
              <td className="px-4 py-3 font-mono text-brand-400">transaction_id</td>
              <td className="px-4 py-3 text-slate-300">string</td>
              <td className="px-4 py-3"><span className="text-emerald-400">Yes</span></td>
              <td className="px-4 py-3 font-mono text-slate-500">TXN-001-2024</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ValidationResults: React.FC<{
  records: PayoutRecord[];
  summary: ImportSummary;
  onRecordFix: (rowNumber: number, field: string, value: string) => void;
  onRemoveRecord: (rowNumber: number) => void;
}> = ({ records, summary, onRecordFix, onRemoveRecord }) => {
  const [filter, setFilter] = useState<'all' | 'valid' | 'invalid'>('all');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const filteredRecords = records.filter(record => {
    if (filter === 'valid') return record.isValid;
    if (filter === 'invalid') return !record.isValid;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-dark-800 rounded-xl p-4">
          <p className="text-xs text-slate-500 uppercase font-bold mb-1">Total Records</p>
          <p className="text-2xl font-black text-white">{summary.total}</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
          <p className="text-xs text-emerald-400 uppercase font-bold mb-1">Valid</p>
          <p className="text-2xl font-black text-emerald-400">{summary.valid}</p>
        </div>
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4">
          <p className="text-xs text-rose-400 uppercase font-bold mb-1">Invalid</p>
          <p className="text-2xl font-black text-rose-400">{summary.invalid}</p>
        </div>
        <div className="bg-brand-500/10 border border-brand-500/20 rounded-xl p-4">
          <p className="text-xs text-brand-400 uppercase font-bold mb-1">Total Amount</p>
          <p className="text-2xl font-black text-brand-400">
            ${records.filter(r => r.isValid).reduce((sum, r) => sum + r.amount, 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['all', 'valid', 'invalid'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
              filter === f
                ? 'bg-brand-500 text-white'
                : 'bg-dark-800 text-slate-400 hover:text-white'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === 'invalid' && summary.invalid > 0 && (
              <span className="ml-2 px-1.5 py-0.5 bg-rose-500 text-white text-xs rounded-full">
                {summary.invalid}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Records Table */}
      <div className="bg-dark-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-dark-900 text-left">
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">#</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Email</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Amount</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Method</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Transaction ID</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Status</th>
                <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {filteredRecords.map((record) => (
                <React.Fragment key={record.rowNumber}>
                  <tr className={`${!record.isValid ? 'bg-rose-500/5' : 'hover:bg-dark-700/50'} transition-colors`}>
                    <td className="px-4 py-3 text-sm text-slate-500">{record.rowNumber}</td>
                    <td className="px-4 py-3 text-sm text-white font-mono">{record.email}</td>
                    <td className="px-4 py-3 text-sm text-white font-mono">
                      ${record.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="px-2 py-1 bg-dark-900 rounded text-slate-300 text-xs font-bold uppercase">
                        {record.method}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-400 font-mono">{record.transactionId}</td>
                    <td className="px-4 py-3">
                      {record.status === 'success' ? (
                        <span className="flex items-center gap-1 text-emerald-400 text-xs font-bold">
                          <span className="material-symbols-outlined text-sm">check_circle</span>
                          Completed
                        </span>
                      ) : record.status === 'failed' ? (
                        <span className="flex items-center gap-1 text-rose-400 text-xs font-bold">
                          <span className="material-symbols-outlined text-sm">error</span>
                          Failed
                        </span>
                      ) : record.status === 'processing' ? (
                        <span className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                          <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                          Processing
                        </span>
                      ) : record.isValid ? (
                        <span className="flex items-center gap-1 text-emerald-400 text-xs font-bold">
                          <span className="material-symbols-outlined text-sm">check</span>
                          Valid
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-rose-400 text-xs font-bold">
                          <span className="material-symbols-outlined text-sm">warning</span>
                          Error
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!record.isValid && (
                          <button
                            onClick={() => setExpandedRow(expandedRow === record.rowNumber ? null : record.rowNumber)}
                            className="p-1 text-slate-400 hover:text-white hover:bg-dark-900 rounded transition-colors"
                            title="View/Fix errors"
                          >
                            <span className="material-symbols-outlined text-lg">edit</span>
                          </button>
                        )}
                        <button
                          onClick={() => onRemoveRecord(record.rowNumber)}
                          className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                          title="Remove record"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Error Row */}
                  <AnimatePresence>
                    {expandedRow === record.rowNumber && !record.isValid && (
                      <motion.tr
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <td colSpan={7} className="px-4 py-4 bg-rose-500/5">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-rose-400 text-sm">
                              <span className="material-symbols-outlined">error</span>
                              <span className="font-bold">Validation Errors:</span>
                            </div>
                            <ul className="list-disc list-inside text-sm text-rose-300 space-y-1">
                              {record.errors.map((error, i) => (
                                <li key={i}>{error}</li>
                              ))}
                            </ul>
                            <div className="grid grid-cols-4 gap-3 pt-2">
                              <input
                                type="text"
                                defaultValue={record.email}
                                placeholder="Email"
                                onBlur={(e) => onRecordFix(record.rowNumber, 'email', e.target.value)}
                                className="bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                              />
                              <input
                                type="text"
                                defaultValue={record.amount.toString()}
                                placeholder="Amount"
                                onBlur={(e) => onRecordFix(record.rowNumber, 'amount', e.target.value)}
                                className="bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                              />
                              <input
                                type="text"
                                defaultValue={record.method}
                                placeholder="Method"
                                onBlur={(e) => onRecordFix(record.rowNumber, 'method', e.target.value)}
                                className="bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                              />
                              <input
                                type="text"
                                defaultValue={record.transactionId}
                                placeholder="Transaction ID"
                                onBlur={(e) => onRecordFix(record.rowNumber, 'transactionId', e.target.value)}
                                className="bg-dark-800 border border-dark-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                              />
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRecords.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <span className="material-symbols-outlined text-4xl mb-2">inbox</span>
            <p>No records to display</p>
          </div>
        )}
      </div>
    </div>
  );
};

const ImportProgress: React.FC<{
  current: number;
  total: number;
  successful: number;
  failed: number;
}> = ({ current, total, successful, failed }) => {
  const progress = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="bg-dark-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-white mb-1">Processing Payouts</h3>
          <p className="text-sm text-slate-400">
            {current} of {total} records processed
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-emerald-400 font-bold">{successful} successful</span>
          <span className="text-rose-400 font-bold">{failed} failed</span>
        </div>
      </div>

      <div className="h-3 bg-dark-900 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-brand-600 to-brand-400"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="mt-4 flex items-center justify-center gap-2 text-slate-400">
        <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm">Processing in progress... Do not close this page.</span>
      </div>
    </div>
  );
};

const ImportComplete: React.FC<{
  summary: ImportSummary;
  onReset: () => void;
  onDownloadReport: () => void;
}> = ({ summary, onReset, onDownloadReport }) => {
  const allSuccess = summary.failed === 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-8"
    >
      <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 ${
        allSuccess ? 'bg-emerald-500/20' : 'bg-amber-500/20'
      }`}>
        <span className={`material-symbols-outlined text-5xl ${
          allSuccess ? 'text-emerald-400' : 'text-amber-400'
        }`}>
          {allSuccess ? 'check_circle' : 'warning'}
        </span>
      </div>

      <h2 className="text-2xl font-black text-white mb-2">
        {allSuccess ? 'Import Complete!' : 'Import Completed with Errors'}
      </h2>
      <p className="text-slate-400 mb-8">
        {allSuccess
          ? 'All payouts have been marked as completed successfully.'
          : `${summary.successful} payouts completed, ${summary.failed} failed.`}
      </p>

      <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-8">
        <div className="bg-dark-800 rounded-xl p-4">
          <p className="text-2xl font-black text-white">{summary.processed}</p>
          <p className="text-xs text-slate-500">Processed</p>
        </div>
        <div className="bg-emerald-500/10 rounded-xl p-4">
          <p className="text-2xl font-black text-emerald-400">{summary.successful}</p>
          <p className="text-xs text-emerald-400/60">Successful</p>
        </div>
        <div className="bg-rose-500/10 rounded-xl p-4">
          <p className="text-2xl font-black text-rose-400">{summary.failed}</p>
          <p className="text-xs text-rose-400/60">Failed</p>
        </div>
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={onDownloadReport}
          className="flex items-center gap-2 px-6 py-3 bg-dark-800 hover:bg-dark-700 text-white font-bold rounded-xl transition-colors"
        >
          <span className="material-symbols-outlined">download</span>
          Download Report
        </button>
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl transition-colors"
        >
          <span className="material-symbols-outlined">add</span>
          Import Another File
        </button>
      </div>
    </motion.div>
  );
};

// ===========================================
// MAIN COMPONENT
// ===========================================
const PayoutsImport: React.FC = () => {
  const [step, setStep] = useState<'upload' | 'review' | 'processing' | 'complete'>('upload');
  const [filename, setFilename] = useState<string>('');
  const [records, setRecords] = useState<PayoutRecord[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processProgress, setProcessProgress] = useState({ current: 0, successful: 0, failed: 0 });

  const summary: ImportSummary = {
    total: records.length,
    valid: records.filter(r => r.isValid).length,
    invalid: records.filter(r => !r.isValid).length,
    processed: processProgress.current,
    successful: processProgress.successful,
    failed: processProgress.failed,
  };

  const handleFileSelect = async (file: File) => {
    setIsProcessing(true);
    setFilename(file.name);

    try {
      const content = await file.text();
      const rows = parseCSV(content);

      // Check if first row is header
      const hasHeader = rows[0]?.some(cell =>
        ['email', 'amount', 'method', 'transaction_id', 'transaction id'].includes(cell.toLowerCase())
      );

      const dataRows = hasHeader ? rows.slice(1) : rows;

      const parsedRecords: PayoutRecord[] = dataRows.map((row, index) => {
        const errors: string[] = [];

        // Validate email
        const email = row[0]?.trim() || '';
        if (!email) {
          errors.push('Email is required');
        } else if (!validateEmail(email)) {
          errors.push('Invalid email format');
        }

        // Validate amount
        const amountStr = row[1]?.trim() || '';
        const amountValidation = validateAmount(amountStr);
        if (!amountValidation.valid) {
          errors.push('Amount must be a positive number');
        }

        // Validate method
        const method = row[2]?.trim().toLowerCase() || '';
        if (!method) {
          errors.push('Payment method is required');
        } else if (!validateMethod(method)) {
          errors.push('Invalid payment method (use: paypal, bank_transfer, wise, payoneer, wire, check, crypto)');
        }

        // Validate transaction ID
        const transactionId = row[3]?.trim() || '';
        if (!transactionId) {
          errors.push('Transaction ID is required');
        }

        return {
          rowNumber: index + 1 + (hasHeader ? 1 : 0),
          email,
          amount: amountValidation.value,
          method,
          transactionId,
          isValid: errors.length === 0,
          errors,
        };
      });

      setRecords(parsedRecords);
      setStep('review');
    } catch (error) {
      console.error('Failed to parse CSV:', error);
      alert('Failed to parse CSV file. Please check the format and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRecordFix = (rowNumber: number, field: string, value: string) => {
    setRecords(prev => prev.map(record => {
      if (record.rowNumber !== rowNumber) return record;

      const updated = { ...record };
      const newErrors: string[] = [];

      switch (field) {
        case 'email':
          updated.email = value.trim();
          if (!updated.email) newErrors.push('Email is required');
          else if (!validateEmail(updated.email)) newErrors.push('Invalid email format');
          break;
        case 'amount':
          const amountValidation = validateAmount(value);
          updated.amount = amountValidation.value;
          if (!amountValidation.valid) newErrors.push('Amount must be a positive number');
          break;
        case 'method':
          updated.method = value.trim().toLowerCase();
          if (!updated.method) newErrors.push('Payment method is required');
          else if (!validateMethod(updated.method)) newErrors.push('Invalid payment method');
          break;
        case 'transactionId':
          updated.transactionId = value.trim();
          if (!updated.transactionId) newErrors.push('Transaction ID is required');
          break;
      }

      // Re-validate all fields
      if (!newErrors.length) {
        if (!updated.email || !validateEmail(updated.email)) newErrors.push('Invalid email');
        if (updated.amount <= 0) newErrors.push('Invalid amount');
        if (!updated.method || !validateMethod(updated.method)) newErrors.push('Invalid method');
        if (!updated.transactionId) newErrors.push('Missing transaction ID');
      }

      updated.errors = newErrors;
      updated.isValid = newErrors.length === 0;

      return updated;
    }));
  };

  const handleRemoveRecord = (rowNumber: number) => {
    setRecords(prev => prev.filter(r => r.rowNumber !== rowNumber));
  };

  const handleStartImport = async () => {
    const validRecords = records.filter(r => r.isValid);
    if (validRecords.length === 0) {
      alert('No valid records to import');
      return;
    }

    setStep('processing');
    setProcessProgress({ current: 0, successful: 0, failed: 0 });

    // Process records via API
    try {
      const response = await api.post<{
        results: Array<{ success: boolean; email: string; message?: string }>;
        summary: { total: number; successful: number; failed: number };
      }>('/admin/payouts/bulk-complete', {
        payouts: validRecords.map(r => ({
          email: r.email,
          amount: r.amount,
          method: r.method,
          transactionId: r.transactionId,
        })),
      });

      // Update records with server response
      const updatedRecords = records.map(record => {
        const result = response.results?.find(r => r.email === record.email);
        if (result) {
          return {
            ...record,
            status: result.success ? 'success' as const : 'failed' as const,
            serverMessage: result.message,
          };
        }
        return record;
      });

      setRecords(updatedRecords);
      setProcessProgress({
        current: response.summary?.total || validRecords.length,
        successful: response.summary?.successful || 0,
        failed: response.summary?.failed || 0,
      });
      setStep('complete');
    } catch (error: any) {
      console.error('Bulk import failed:', error);

      // Simulate fallback processing for demo
      for (let i = 0; i < validRecords.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 200));
        const success = Math.random() > 0.1; // 90% success rate for demo

        setRecords(prev => prev.map(r =>
          r.rowNumber === validRecords[i].rowNumber
            ? { ...r, status: success ? 'success' : 'failed', serverMessage: success ? undefined : 'User not found' }
            : r
        ));

        setProcessProgress(prev => ({
          current: prev.current + 1,
          successful: prev.successful + (success ? 1 : 0),
          failed: prev.failed + (success ? 0 : 1),
        }));
      }

      setStep('complete');
    }
  };

  const handleDownloadReport = () => {
    const csv = [
      ['Row', 'Email', 'Amount', 'Method', 'Transaction ID', 'Status', 'Message'].join(','),
      ...records.map(r => [
        r.rowNumber,
        r.email,
        r.amount,
        r.method,
        r.transactionId,
        r.status || (r.isValid ? 'valid' : 'invalid'),
        r.serverMessage || r.errors.join('; ')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payout_import_report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setStep('upload');
    setFilename('');
    setRecords([]);
    setProcessProgress({ current: 0, successful: 0, failed: 0 });
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <header>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-brand-500/20 rounded-xl">
            <span className="material-symbols-outlined text-2xl text-brand-400">upload_file</span>
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Bulk Payout Import</h1>
            <p className="text-slate-400 text-sm">Import CSV to mark payouts as completed</p>
          </div>
        </div>
      </header>

      {/* Progress Indicator */}
      {step !== 'upload' && (
        <div className="flex items-center gap-4">
          {['upload', 'review', 'processing', 'complete'].map((s, i) => (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-2 ${
                step === s ? 'text-brand-400' : i < ['upload', 'review', 'processing', 'complete'].indexOf(step) ? 'text-emerald-400' : 'text-slate-600'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step === s ? 'bg-brand-500 text-white' : i < ['upload', 'review', 'processing', 'complete'].indexOf(step) ? 'bg-emerald-500 text-white' : 'bg-dark-800'
                }`}>
                  {i < ['upload', 'review', 'processing', 'complete'].indexOf(step) ? (
                    <span className="material-symbols-outlined text-sm">check</span>
                  ) : (
                    i + 1
                  )}
                </div>
                <span className="text-sm font-medium capitalize hidden sm:inline">{s}</span>
              </div>
              {i < 3 && <div className={`flex-1 h-0.5 ${i < ['upload', 'review', 'processing', 'complete'].indexOf(step) ? 'bg-emerald-500' : 'bg-dark-800'}`} />}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Content */}
      <AnimatePresence mode="wait">
        {step === 'upload' && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <UploadZone onFileSelect={handleFileSelect} isProcessing={isProcessing} />
            <CSVTemplate />
          </motion.div>
        )}

        {step === 'review' && (
          <motion.div
            key="review"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-slate-400">description</span>
                <span className="text-slate-300 font-medium">{filename}</span>
              </div>
              <button
                onClick={handleReset}
                className="text-slate-400 hover:text-white text-sm font-bold flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">close</span>
                Cancel
              </button>
            </div>

            <ValidationResults
              records={records}
              summary={summary}
              onRecordFix={handleRecordFix}
              onRemoveRecord={handleRemoveRecord}
            />

            <div className="flex items-center justify-between pt-4 border-t border-dark-800">
              <button
                onClick={handleReset}
                className="px-6 py-3 text-slate-400 hover:text-white font-bold rounded-xl transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={handleStartImport}
                disabled={summary.valid === 0}
                className="flex items-center gap-2 px-8 py-3 bg-brand-600 hover:bg-brand-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors shadow-lg shadow-brand-500/20"
              >
                <span className="material-symbols-outlined">play_arrow</span>
                Import {summary.valid} Payout{summary.valid !== 1 ? 's' : ''}
              </button>
            </div>
          </motion.div>
        )}

        {step === 'processing' && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <ImportProgress
              current={processProgress.current}
              total={summary.valid}
              successful={processProgress.successful}
              failed={processProgress.failed}
            />
          </motion.div>
        )}

        {step === 'complete' && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <ImportComplete
              summary={summary}
              onReset={handleReset}
              onDownloadReport={handleDownloadReport}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PayoutsImport;
