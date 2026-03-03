import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArtistService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

// ===========================================
// TYPES
// ===========================================
interface WalletData {
  wallet: {
    id: string;
    availableBalance: number;
    pendingBalance: number;
    lifetimeEarnings: number;
    currency: string;
    minPayoutThreshold: number;
  } | null;
  recentPayouts: Array<{
    id: string;
    amount: number;
    currency: string;
    method: string;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    requestedAt: string;
    processedAt: string | null;
    transactionId: string | null;
  }>;
  pendingRoyalties: number;
}

interface PayoutMethod {
  id: string;
  name: string;
  icon: string;
  minAmount: number;
  fee: number | string;
  processingTime: string;
}

// ===========================================
// CONSTANTS
// ===========================================
const PAYOUT_METHODS: PayoutMethod[] = [
  { id: 'paypal', name: 'PayPal', icon: 'account_balance', minAmount: 25, fee: 'Free', processingTime: '1-2 business days' },
  { id: 'bank_transfer', name: 'Bank Transfer (ACH)', icon: 'account_balance', minAmount: 50, fee: 'Free', processingTime: '3-5 business days' },
  { id: 'wire', name: 'Wire Transfer', icon: 'swap_horiz', minAmount: 100, fee: '$25', processingTime: '1-3 business days' },
  { id: 'wise', name: 'Wise', icon: 'language', minAmount: 20, fee: 'Free', processingTime: '1-2 business days' },
  { id: 'payoneer', name: 'Payoneer', icon: 'credit_card', minAmount: 50, fee: 'Free', processingTime: '2-3 business days' },
];

// ===========================================
// UTILITY FUNCTIONS
// ===========================================
const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'COMPLETED': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'PENDING': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case 'PROCESSING': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    case 'FAILED': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  }
};

const getStatusIcon = (status: string): string => {
  switch (status) {
    case 'COMPLETED': return 'check_circle';
    case 'PENDING': return 'schedule';
    case 'PROCESSING': return 'sync';
    case 'FAILED': return 'error';
    default: return 'help';
  }
};

// ===========================================
// PAYOUT MODAL COMPONENT
// ===========================================
const PayoutModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  availableBalance: number;
  minThreshold: number;
  onSuccess: () => void;
}> = ({ isOpen, onClose, availableBalance, minThreshold, onSuccess }) => {
  const [step, setStep] = useState<'method' | 'amount' | 'confirm' | 'success'>('method');
  const [selectedMethod, setSelectedMethod] = useState<PayoutMethod | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [methodDetails, setMethodDetails] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amountNum = parseFloat(amount) || 0;
  const selectedMethodData = PAYOUT_METHODS.find(m => m.id === selectedMethod?.id);
  const minAmount = Math.max(selectedMethodData?.minAmount || 0, minThreshold);
  const isValidAmount = amountNum >= minAmount && amountNum <= availableBalance;

  const handleSubmit = async () => {
    if (!selectedMethod || !isValidAmount) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await ArtistService.requestPayout(amountNum, selectedMethod.id, methodDetails);
      setStep('success');
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to submit payout request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetModal = () => {
    setStep('method');
    setSelectedMethod(null);
    setAmount('');
    setMethodDetails({});
    setError(null);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={handleClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-dark-900 border border-dark-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-dark-700">
            <h2 className="text-xl font-bold text-white">Request Payout</h2>
            <button
              onClick={handleClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {/* Step 1: Select Method */}
              {step === 'method' && (
                <motion.div
                  key="method"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <p className="text-sm text-slate-400 mb-4">Select your preferred payout method</p>

                  <div className="space-y-2">
                    {PAYOUT_METHODS.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setSelectedMethod(method)}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                          selectedMethod?.id === method.id
                            ? 'border-brand-500 bg-brand-500/10'
                            : 'border-dark-700 hover:border-dark-600 bg-dark-800/50'
                        }`}
                      >
                        <div className={`p-3 rounded-lg ${selectedMethod?.id === method.id ? 'bg-brand-500' : 'bg-dark-700'}`}>
                          <span className="material-symbols-outlined text-white">{method.icon}</span>
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-bold text-white">{method.name}</p>
                          <p className="text-xs text-slate-500">
                            Min: {formatCurrency(method.minAmount)} • Fee: {method.fee} • {method.processingTime}
                          </p>
                        </div>
                        {selectedMethod?.id === method.id && (
                          <span className="material-symbols-outlined text-brand-400">check_circle</span>
                        )}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setStep('amount')}
                    disabled={!selectedMethod}
                    className="w-full mt-4 py-3 bg-brand-600 hover:bg-brand-500 disabled:bg-dark-700 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors"
                  >
                    Continue
                  </button>
                </motion.div>
              )}

              {/* Step 2: Enter Amount */}
              {step === 'amount' && (
                <motion.div
                  key="amount"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <p className="text-sm text-slate-400 mb-2">Available balance</p>
                    <p className="text-3xl font-black text-white">{formatCurrency(availableBalance)}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-400 mb-2">
                      Amount to withdraw
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-slate-500">$</span>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        min={minAmount}
                        max={availableBalance}
                        step="0.01"
                        className="w-full bg-dark-800 border border-dark-700 rounded-xl pl-10 pr-4 py-4 text-2xl font-bold text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 text-center"
                      />
                    </div>
                    <div className="flex justify-between mt-2 text-xs">
                      <span className={amountNum < minAmount ? 'text-rose-400' : 'text-slate-500'}>
                        Minimum: {formatCurrency(minAmount)}
                      </span>
                      <button
                        onClick={() => setAmount(availableBalance.toFixed(2))}
                        className="text-brand-400 hover:text-brand-300"
                      >
                        Withdraw all
                      </button>
                    </div>
                  </div>

                  {/* Method-specific fields */}
                  {selectedMethod?.id === 'paypal' && (
                    <div>
                      <label className="block text-sm font-bold text-slate-400 mb-2">PayPal Email</label>
                      <input
                        type="email"
                        value={methodDetails.email || ''}
                        onChange={(e) => setMethodDetails({ ...methodDetails, email: e.target.value })}
                        placeholder="your@email.com"
                        className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  )}

                  {selectedMethod?.id === 'bank_transfer' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-400 mb-2">Account Holder Name</label>
                        <input
                          type="text"
                          value={methodDetails.accountName || ''}
                          onChange={(e) => setMethodDetails({ ...methodDetails, accountName: e.target.value })}
                          placeholder="John Doe"
                          className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-400 mb-2">Routing Number</label>
                          <input
                            type="text"
                            value={methodDetails.routingNumber || ''}
                            onChange={(e) => setMethodDetails({ ...methodDetails, routingNumber: e.target.value })}
                            placeholder="123456789"
                            className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-400 mb-2">Account Number</label>
                          <input
                            type="text"
                            value={methodDetails.accountNumber || ''}
                            onChange={(e) => setMethodDetails({ ...methodDetails, accountNumber: e.target.value })}
                            placeholder="987654321"
                            className="w-full bg-dark-800 border border-dark-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 flex items-center gap-2 text-rose-400 text-sm">
                      <span className="material-symbols-outlined text-sm">error</span>
                      {error}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep('method')}
                      className="flex-1 py-3 bg-dark-800 hover:bg-dark-700 text-white font-bold rounded-xl transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setStep('confirm')}
                      disabled={!isValidAmount}
                      className="flex-1 py-3 bg-brand-600 hover:bg-brand-500 disabled:bg-dark-700 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors"
                    >
                      Review
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Confirm */}
              {step === 'confirm' && (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-dark-800 rounded-xl p-6 text-center">
                    <p className="text-sm text-slate-400 mb-2">You will receive</p>
                    <p className="text-4xl font-black text-white">{formatCurrency(amountNum)}</p>
                    <p className="text-sm text-slate-500 mt-2">via {selectedMethod?.name}</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Payout method</span>
                      <span className="text-white font-bold">{selectedMethod?.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Processing time</span>
                      <span className="text-white">{selectedMethod?.processingTime}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Fee</span>
                      <span className="text-emerald-400">{selectedMethod?.fee}</span>
                    </div>
                    <hr className="border-dark-700" />
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Remaining balance</span>
                      <span className="text-white font-bold">{formatCurrency(availableBalance - amountNum)}</span>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 flex items-center gap-2 text-rose-400 text-sm">
                      <span className="material-symbols-outlined text-sm">error</span>
                      {error}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep('amount')}
                      disabled={isSubmitting}
                      className="flex-1 py-3 bg-dark-800 hover:bg-dark-700 text-white font-bold rounded-xl transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="flex-1 py-3 bg-brand-600 hover:bg-brand-500 disabled:bg-brand-600/50 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined">send</span>
                          Confirm Payout
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Success */}
              {step === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="material-symbols-outlined text-5xl text-emerald-400">check_circle</span>
                  </div>
                  <h3 className="text-2xl font-black text-white mb-2">Payout Requested!</h3>
                  <p className="text-slate-400 mb-6">
                    Your request for {formatCurrency(amountNum)} has been submitted.
                    <br />
                    Expected processing time: {selectedMethod?.processingTime}
                  </p>
                  <button
                    onClick={handleClose}
                    className="px-8 py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl transition-colors"
                  >
                    Done
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// ===========================================
// MAIN COMPONENT
// ===========================================
const Wallet: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<WalletData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchWalletData = async () => {
    setIsLoading(true);
    try {
      const result = await ArtistService.getWallet();
      setData(result);
    } catch (error) {
      // Use mock data if API fails
      console.log('Using mock wallet data');
      setData({
        wallet: {
          id: '1',
          availableBalance: 3240.50,
          pendingBalance: 456.25,
          lifetimeEarnings: 12450.00,
          currency: 'USD',
          minPayoutThreshold: 50,
        },
        recentPayouts: [
          { id: '1', amount: 500, currency: 'USD', method: 'paypal', status: 'COMPLETED', requestedAt: '2024-01-15T10:00:00Z', processedAt: '2024-01-17T14:30:00Z', transactionId: 'TXN-001' },
          { id: '2', amount: 250, currency: 'USD', method: 'bank_transfer', status: 'PROCESSING', requestedAt: '2024-01-20T09:00:00Z', processedAt: null, transactionId: null },
          { id: '3', amount: 150, currency: 'USD', method: 'paypal', status: 'COMPLETED', requestedAt: '2024-01-05T11:00:00Z', processedAt: '2024-01-07T16:00:00Z', transactionId: 'TXN-002' },
        ],
        pendingRoyalties: 125.75,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-3 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
          <p className="text-slate-400">Loading wallet...</p>
        </div>
      </div>
    );
  }

  const wallet = data?.wallet;
  const canRequestPayout = (wallet?.availableBalance || 0) >= (wallet?.minPayoutThreshold || 50);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <header>
        <h1 className="text-2xl md:text-3xl font-black text-white mb-1">Wallet & Payouts</h1>
        <p className="text-slate-400 text-sm">Manage your earnings and payment methods</p>
      </header>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Available Balance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-2 bg-gradient-to-br from-brand-600 to-indigo-600 rounded-2xl p-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="relative">
            <p className="text-brand-200 text-sm font-bold uppercase tracking-wider mb-1">Available Balance</p>
            <p className="text-4xl md:text-5xl font-black text-white mb-4">
              {formatCurrency(wallet?.availableBalance || 0)}
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              disabled={!canRequestPayout}
              className="px-6 py-3 bg-white/20 hover:bg-white/30 disabled:bg-white/10 disabled:cursor-not-allowed backdrop-blur-sm text-white font-bold rounded-xl transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined">account_balance_wallet</span>
              Request Payout
            </button>
            {!canRequestPayout && (
              <p className="text-brand-200/70 text-xs mt-2">
                Minimum payout: {formatCurrency(wallet?.minPayoutThreshold || 50)}
              </p>
            )}
          </div>
        </motion.div>

        {/* Pending & Lifetime */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-dark-800/50 backdrop-blur-xl border border-dark-700 rounded-2xl p-5"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-amber-500/20 rounded-lg">
                <span className="material-symbols-outlined text-amber-400">schedule</span>
              </div>
              <span className="text-sm text-slate-400">Pending</span>
            </div>
            <p className="text-2xl font-black text-white">{formatCurrency(wallet?.pendingBalance || 0)}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-dark-800/50 backdrop-blur-xl border border-dark-700 rounded-2xl p-5"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <span className="material-symbols-outlined text-emerald-400">trending_up</span>
              </div>
              <span className="text-sm text-slate-400">Lifetime Earnings</span>
            </div>
            <p className="text-2xl font-black text-white">{formatCurrency(wallet?.lifetimeEarnings || 0)}</p>
          </motion.div>
        </div>
      </div>

      {/* Pending Royalties Banner */}
      {(data?.pendingRoyalties || 0) > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-4 flex items-center gap-4"
        >
          <div className="p-3 bg-purple-500/20 rounded-xl">
            <span className="material-symbols-outlined text-purple-400">hourglass_top</span>
          </div>
          <div className="flex-1">
            <p className="font-bold text-white">Royalties Processing</p>
            <p className="text-sm text-purple-300/70">
              {formatCurrency(data?.pendingRoyalties || 0)} in royalties are being calculated and will be available soon
            </p>
          </div>
        </motion.div>
      )}

      {/* Payout History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-dark-800/50 backdrop-blur-xl border border-dark-700 rounded-2xl overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-dark-700">
          <h2 className="text-lg font-bold text-white">Payout History</h2>
        </div>

        {data?.recentPayouts && data.recentPayouts.length > 0 ? (
          <div className="divide-y divide-dark-700">
            {data.recentPayouts.map((payout) => (
              <div key={payout.id} className="px-6 py-4 flex items-center gap-4 hover:bg-dark-700/30 transition-colors">
                <div className={`p-2 rounded-lg ${
                  payout.status === 'COMPLETED' ? 'bg-emerald-500/20' :
                  payout.status === 'PROCESSING' ? 'bg-blue-500/20' :
                  payout.status === 'PENDING' ? 'bg-amber-500/20' : 'bg-rose-500/20'
                }`}>
                  <span className={`material-symbols-outlined ${
                    payout.status === 'COMPLETED' ? 'text-emerald-400' :
                    payout.status === 'PROCESSING' ? 'text-blue-400' :
                    payout.status === 'PENDING' ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {getStatusIcon(payout.status)}
                  </span>
                </div>

                <div className="flex-1">
                  <p className="font-bold text-white">{formatCurrency(payout.amount)}</p>
                  <p className="text-xs text-slate-500">
                    via {payout.method.replace('_', ' ')} • {formatDate(payout.requestedAt)}
                  </p>
                </div>

                <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${getStatusColor(payout.status)}`}>
                  {payout.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <span className="material-symbols-outlined text-4xl text-slate-600 mb-2">receipt_long</span>
            <p className="text-slate-500">No payout history yet</p>
            <p className="text-sm text-slate-600">Your payout requests will appear here</p>
          </div>
        )}
      </motion.div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-dark-800/50 border border-dark-700 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <span className="material-symbols-outlined text-blue-400">info</span>
            </div>
            <h3 className="font-bold text-white">How Payouts Work</h3>
          </div>
          <ul className="space-y-2 text-sm text-slate-400">
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-sm text-brand-400 mt-0.5">check</span>
              Royalties are calculated monthly from streaming data
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-sm text-brand-400 mt-0.5">check</span>
              Minimum payout threshold: {formatCurrency(wallet?.minPayoutThreshold || 50)}
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-sm text-brand-400 mt-0.5">check</span>
              Processing time depends on your chosen method
            </li>
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-dark-800/50 border border-dark-700 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <span className="material-symbols-outlined text-amber-400">help</span>
            </div>
            <h3 className="font-bold text-white">Need Help?</h3>
          </div>
          <p className="text-sm text-slate-400 mb-4">
            Having issues with your payouts or have questions about your earnings?
          </p>
          <button className="text-brand-400 hover:text-brand-300 text-sm font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">support_agent</span>
            Contact Support
          </button>
        </motion.div>
      </div>

      {/* Payout Modal */}
      <PayoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        availableBalance={wallet?.availableBalance || 0}
        minThreshold={wallet?.minPayoutThreshold || 50}
        onSuccess={fetchWalletData}
      />
    </div>
  );
};

export default Wallet;
