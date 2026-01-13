import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useUserStore } from '@/store/userStore';
import { Home, Coins, UserCircle2, ArrowLeft } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

const Layout = () => {
  const { balance, claimDailyBonus } = useUserStore();
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';

  const handleBonus = () => {
    const res = claimDailyBonus();
    if (res.success) {
      alert("Bonus Claimed! +100");
    } else {
      alert(res.message);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-white font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/10 px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {!isHome && (
            <button onClick={() => navigate('/')} className="p-2 hover:bg-white/5 rounded-full">
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </button>
          )}
          <div className="font-bold text-xl tracking-tighter bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            KAZIK
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
          <Coins className="w-4 h-4 text-warning" />
          <span className="font-mono font-bold text-warning">{balance.toLocaleString()}</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-lg border-t border-white/10 px-6 py-3 pb-safe flex justify-between items-center z-50">
        <NavItem icon={<Home />} label="Lobby" active={isHome} onClick={() => navigate('/')} />
        <button 
          onClick={handleBonus}
          className="relative -top-5 bg-gradient-to-tr from-accent to-emerald-400 p-4 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-transform active:scale-95"
        >
          <Coins className="w-6 h-6 text-black" />
        </button>
        <NavItem icon={<UserCircle2 />} label="Profile" active={false} onClick={() => alert("Profile Coming Soon")} />
      </nav>
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick }: any) => (
  <button onClick={onClick} className={clsx("flex flex-col items-center gap-1 transition-colors", active ? "text-primary" : "text-gray-500")}>
    {React.cloneElement(icon, { size: 20 })}
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);

export default Layout;
