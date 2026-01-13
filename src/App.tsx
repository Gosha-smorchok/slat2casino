import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import Roulette from '@/pages/Roulette';
import KeepieUppie from '@/pages/KeepieUppie';
import Mines from '@/pages/Mines';
import { useUserStore } from '@/store/userStore';

function App() {
  const { initUser } = useUserStore();

  useEffect(() => {
    initUser();
    // Expand TG WebApp
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      window.Telegram.WebApp.enableClosingConfirmation();
    }
  }, [initUser]);

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="roulette" element={<Roulette />} />
        <Route path="keepie-uppie" element={<KeepieUppie />} />
        <Route path="mines" element={<Mines />} />
      </Route>
    </Routes>
  );
}

export default App;
