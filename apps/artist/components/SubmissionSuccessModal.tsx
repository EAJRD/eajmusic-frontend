import React from 'react';

interface SubmissionSuccessModalProps {
    onClose: () => void;
    onViewStatus: () => void;
}

const SubmissionSuccessModal: React.FC<SubmissionSuccessModalProps> = ({ onClose, onViewStatus }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity"></div>

            {/* Modal Content */}
            <div className="relative bg-white dark:bg-card-dark w-full max-w-md rounded-3xl p-8 shadow-2xl transform transition-all scale-100 border border-white/10 flex flex-col items-center text-center">

                {/* Visual Icon */}
                <div className="size-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-4xl text-emerald-500 animate-bounce">check_circle</span>
                </div>

                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Submission Received!</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                    Your release <span className="font-bold text-slate-900 dark:text-white">"Midnight Memories"</span> has been successfully submitted for review.
                </p>

                {/* Timeline / Status Steps */}
                <div className="w-full space-y-4 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="size-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-white text-[14px] font-bold">check</span>
                        </div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Uploaded & Analyzed</p>
                    </div>
                    <div className="flex items-center gap-4 opacity-50">
                        <div className="size-6 rounded-full border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center shrink-0">
                            <div className="size-2 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
                        </div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Quality Check (Est. 24h)</p>
                    </div>
                    <div className="flex items-center gap-4 opacity-30">
                        <div className="size-6 rounded-full border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center shrink-0"></div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Sent to Stores</p>
                    </div>
                </div>

                <div className="w-full flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                        Close
                    </button>
                    <button
                        onClick={onViewStatus}
                        className="flex-1 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/25 hover:bg-blue-600 transition-colors"
                    >
                        View Status
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SubmissionSuccessModal;
