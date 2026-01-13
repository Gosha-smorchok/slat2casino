import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useUserStore } from '@/store/userStore';
import { Home, Coins, UserCircle2, ArrowLeft } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import AdminPanel from '@/components/AdminPanel';

const Layout = () => {
  const { balance, claimDailyBonus } = useUserStore();
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';
  
  // Admin Logic
  const [showAdmin, setShowAdmin] = React.useState(false);
  const [isAdminUser, setIsAdminUser] = React.useState(false);

  React.useEffect(() => {
      // Check Telegram User
      const tg = (window as any).Telegram?.WebApp;
      if (tg) {
          tg.ready();
          const user = tg.initDataUnsafe?.user;
          // Check for username 'DedGrishaka'
          if (user?.username === 'DedGrishaka') {
              setIsAdminUser(true);
          }
      }
      
      // Fallback for local dev testing (Optional: Remove in prod if strict)
      // setIsAdminUser(true); 
  }, []);
  
  const handleLogoClick = () => {
      navigate('/');
  };
  
  // Hide visual clutter on game pages for immersion
  const isGameRoute = ['/roulette', '/mines', '/keepie-uppie', '/lumberjack', '/dungeon', '/crash', '/plinko'].includes(location.pathname);

  const handleBonus = () => {
    const res = claimDailyBonus();
    if (res.success) {
      alert("Bonus Claimed! +100");
    } else {
      alert(res.message);
    }
  };

  return (
    // Outer container for Desktop centering
    <div className="flex justify-center min-h-screen bg-black/90">
      {/* Mobile App Container */}
      <div className="w-full max-w-md bg-background h-[100dvh] flex flex-col relative shadow-2xl overflow-hidden">
        
        {/* Header */}
        <header className="absolute top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/10 px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {!isHome && (
              <button onClick={() => navigate('/')} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </button>
            )}
            <div className="font-bold text-xl tracking-tighter bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent select-none cursor-pointer" onClick={handleLogoClick}>
              KAZIK <span className="text-[10px] text-white/50 bg-white/10 px-1 rounded font-mono align-top ml-1">v2.4</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 shadow-inner">
            <Coins className="w-4 h-4 text-warning animate-pulse" />
            <span className="font-mono font-bold text-warning select-none">{balance.toLocaleString()}</span>
          </div>

          {/* Admin Button for DedGrishaka */}
          {isAdminUser && (
              <button 
                onClick={() => setShowAdmin(true)}
                className="ml-2 bg-red-500/20 text-red-400 border border-red-500/50 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider hover:bg-red-500/40"
              >
                  Admin
              </button>
          )}
        </header>

        {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} />}

        {/* Main Content Area */}
        {/* Added pt-16 to account for absolute header */}
        <main className={clsx("flex-1 overflow-y-auto overflow-x-hidden pt-16 scroll-smooth", isGameRoute ? "pb-0" : "pb-24")}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Bottom Nav - Hidden in Games */}
        {!isGameRoute && (
          <nav className="absolute bottom-0 left-0 right-0 bg-background/90 backdrop-blur-lg border-t border-white/10 px-6 py-2 pb-[env(safe-area-inset-bottom,20px)] flex justify-between items-end z-50">
            <NavItem 
              icon={<Home />} 
              label="Lobby" 
              active={isHome} 
              onClick={() => navigate('/')} 
            />
            
            <button 
              onClick={handleBonus}
              className="group relative -top-6"
            >
              <div className="absolute inset-0 bg-accent blur-lg opacity-40 group-hover:opacity-60 transition-opacity rounded-full"></div>
              <div className="relative bg-gradient-to-tr from-accent to-emerald-400 p-4 rounded-full shadow-xl border-4 border-background transition-transform active:scale-95">
                <Coins className="w-6 h-6 text-black fill-black/20" />
              </div>
            </button>

            <NavItem 
              icon={<UserCircle2 />} 
              label="Profile" 
              active={false} 
              onClick={() => alert("Profile Coming Soon")} 
            />
          </nav>
        )}
      </div>
    </div>
  );
};

// Simplified NavItem component
const NavItem = ({ icon, label, active, onClick }: { icon: React.ReactElement, label: string, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick} 
    className={clsx(
      "flex flex-col items-center gap-1 p-2 rounded-xl transition-all w-16", 
      active ? "text-primary bg-primary/10" : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
    )}
  >
    {React.cloneElement(icon, { size: 24, strokeWidth: active ? 2.5 : 2 })}
    <span className="text-[10px] font-medium tracking-wide">{label}</span>
  </button>
);

export default Layout;
