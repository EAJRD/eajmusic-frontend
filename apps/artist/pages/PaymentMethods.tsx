import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const PaymentMethods: React.FC = () => {
    const [athMovilEnabled, setAthMovilEnabled] = useState(true); // Default to true for demo, should be fetched
    const [linkedPhone, setLinkedPhone] = useState<string | null>(null);
    const [phoneInput, setPhoneInput] = useState('');

    const handleLinkAthMovil = (e: React.FormEvent) => {
        e.preventDefault();
        // Validation could go here
        setLinkedPhone(phoneInput);
    };

    return (
        <div className="flex-1 px-4 md:px-10 lg:px-20 py-8 max-w-[1200px] w-full mx-auto font-display text-slate-900 dark:text-white">
            <header className="mb-8">
                <motion.h1 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl font-black tracking-tight mb-2"
                >
                    Payment Methods
                </motion.h1>
                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-slate-500 dark:text-slate-400"
                >
                    Manage your withdrawal methods
                </motion.p>
            </header>

            <div className="space-y-6">
                {athMovilEnabled && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-[#2FCB6F]/10 to-[#2FCB6F]/5 dark:from-[#2FCB6F]/20 dark:to-transparent rounded-2xl p-6 border border-[#2FCB6F]/30 shadow-sm"
                    >
                        <div className="flex items-start gap-4">
                            <div className="bg-[#2FCB6F] text-white p-3 rounded-xl shadow-lg shadow-[#2FCB6F]/30">
                                <span className="material-symbols-outlined">smartphone</span>
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">ATH Móvil</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Fastest payout method for Puerto Rico artists</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {linkedPhone ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#2FCB6F]/10 text-[#2FCB6F] text-xs font-bold">
                                                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                                Verified
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-bold">
                                                Not Configured
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-6">
                                    {linkedPhone ? (
                                        <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                                            <div className="flex items-center gap-3">
                                                <input type="radio" name="defaultMethod" defaultChecked className="text-[#2FCB6F] focus:ring-[#2FCB6F]" />
                                                <span className="font-mono text-sm font-bold text-slate-700 dark:text-slate-300">{linkedPhone}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => setLinkedPhone(null)} className="text-sm text-rose-500 hover:text-rose-600 font-bold transition-colors">Remove</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleLinkAthMovil} className="flex gap-3">
                                            <input 
                                                type="text" 
                                                value={phoneInput}
                                                onChange={(e) => setPhoneInput(e.target.value)}
                                                placeholder="+1 (787) 000-0000" 
                                                className="flex-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2FCB6F] focus:border-transparent dark:text-white"
                                            />
                                            <button type="submit" className="bg-[#2FCB6F] hover:bg-[#28b562] text-white font-bold py-2 px-6 rounded-xl transition-colors shadow-lg shadow-[#2FCB6F]/20">
                                                Link Account
                                            </button>
                                        </form>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-card-dark rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm"
                >
                    <div className="flex items-start gap-4">
                        <div className="bg-blue-500 text-white p-3 rounded-xl shadow-lg shadow-blue-500/30">
                            <span className="material-symbols-outlined">mail</span>
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">PayPal</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Receive payouts globally to your PayPal email</p>
                                </div>
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-bold">
                                    Not Configured
                                </span>
                            </div>
                            <div className="mt-4 flex gap-3">
                                <input type="email" placeholder="PayPal Email Address" className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white" />
                                <button className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-2 px-6 rounded-xl transition-colors">
                                    Add
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-card-dark rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm"
                >
                    <div className="flex items-start gap-4">
                        <div className="bg-slate-700 text-white p-3 rounded-xl shadow-lg shadow-slate-700/30">
                            <span className="material-symbols-outlined">account_balance</span>
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Bank Transfer</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Direct deposit to your local bank account</p>
                                </div>
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-bold">
                                    Not Configured
                                </span>
                            </div>
                            <div className="mt-4 space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <input type="text" placeholder="Bank Name" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 dark:text-white" />
                                    <input type="text" placeholder="Routing Number" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 dark:text-white" />
                                </div>
                                <div className="flex gap-3">
                                    <input type="text" placeholder="Account Number" className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 dark:text-white" />
                                    <button className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-2 px-6 rounded-xl transition-colors">
                                        Add
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white dark:bg-card-dark rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm"
                >
                    <div className="flex items-start gap-4">
                        <div className="bg-indigo-500 text-white p-3 rounded-xl shadow-lg shadow-indigo-500/30">
                            <span className="material-symbols-outlined">language</span>
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Wire Transfer</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">International bank transfer (SWIFT)</p>
                                </div>
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-bold">
                                    Not Configured
                                </span>
                            </div>
                            <div className="mt-4">
                                <button className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-2 px-6 rounded-xl transition-colors w-full text-left flex items-center justify-between">
                                    <span>Enter international banking details</span>
                                    <span className="material-symbols-outlined">chevron_right</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default PaymentMethods;
