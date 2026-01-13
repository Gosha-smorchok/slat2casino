import React, { useState } from 'react';
import { useUserStore } from '@/store/userStore';
import { X, DollarSign, Wallet, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

interface AdminPanelProps {
  onClose: () => void;
}

const AdminPanel = ({ onClose }: AdminPanelProps) => {
  const { balance, setBalance, resetBalance, lastDailyBonus } = useUserStore();
  const [customAmount, setCustomAmount] = useState('');

  const handleSetBalance = () => {
    const amount = parseInt(customAmount);
    if (!isNaN(amount)) {
      setBalance(amount);
      setCustomAmount('');
    }
  };

  const addMillion = () => setBalance(balance + 1000000);
  
  // Hack to reset daily bonus: we can't easily edit the state directly via a simple method unless we added one,
  // but for now let's focus on money.
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-sm bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-800">
          <h2 className="text-xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
            ADMIN PANEL
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Current Balance */}
          <div className="bg-slate-800 p-3 rounded-xl flex items-center justify-between">
            <span className="text-sm text-slate-400 font-bold">CURRENT BALANCE</span>
            <span className="font-mono text-xl font-bold text-emerald-400">{balance.toLocaleString()}</span>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
             <button 
                onClick={addMillion}
                className="p-3 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl font-bold hover:bg-emerald-500/30 active:scale-95 transition-all flex flex-col items-center gap-1"
             >
                <DollarSign />
                <span>+1,000,000</span>
             </button>
             
             <button 
                onClick={() => setBalance(999999999)}
                className="p-3 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-xl font-bold hover:bg-purple-500/30 active:scale-95 transition-all flex flex-col items-center gap-1"
             >
                <Wallet />
                <span>INFINITE</span>
             </button>
          </div>

          {/* Custom Set */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">Set Custom Balance</label>
            <div className="flex gap-2">
              <input 
                type="number" 
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="Enter amount..."
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-indigo-500"
              />
              <button 
                onClick={handleSetBalance}
                className="bg-indigo-600 px-4 rounded-lg font-bold hover:bg-indigo-500"
              >
                SET
              </button>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="pt-4 border-t border-white/5">
             <button 
                onClick={resetBalance}
                className="w-full py-3 flex items-center justify-center gap-2 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
             >
               <RotateCcw size={16} />
               <span>Reset User Data</span>
             </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminPanel;
