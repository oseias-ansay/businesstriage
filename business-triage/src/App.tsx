import { useState } from 'react';
import PublicSite from './pages/PublicSite';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import type { View } from './types';

export default function App() {
  const [view, setView] = useState<View>('public');

  const go = (next: View) => {
    setView(next);
    window.scrollTo(0, 0);
  };

  if (view === 'login') {
    return <Login onBack={() => go('public')} onSubmit={() => go('dashboard')} />;
  }

  if (view === 'dashboard') {
    return <Dashboard onLogout={() => go('public')} />;
  }

  return <PublicSite onLogin={() => go('login')} />;
}
