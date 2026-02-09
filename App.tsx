
import React, { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { View, User, SummaryItem } from './types';
import { supabase } from './lib/supabase';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import AuthForm from './components/AuthForm';
import Dashboard from './components/Dashboard';
import NewSummary from './components/NewSummary';
import SummaryDetailView from './components/SummaryDetailView';
import History from './components/History';

const App: React.FC = () => {
  const [view, setView] = useState<View>('Home');
  const [returnView, setReturnView] = useState<View>('Dashboard');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [history, setHistory] = useState<SummaryItem[]>([]);
  const [totalHistoryCount, setTotalHistoryCount] = useState(0);
  const [selectedSummary, setSelectedSummary] = useState<SummaryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced');
  const [lastSync, setLastSync] = useState<string>('');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('summerease_theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('summerease_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('summerease_theme', 'light');
    }
  }, [isDarkMode]);

  const fetchTotalCount = async (uid: string) => {
    const { count, error } = await supabase
      .from('summaries')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', uid);
    if (!error) {
      setTotalHistoryCount(count || 0);
      setLastSync(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const user: User = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
            subscriptionStatus: 'pro'
          };
          setCurrentUser(user);
          await fetchTotalCount(session.user.id);
          setView('Dashboard');
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const user: User = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User',
          subscriptionStatus: 'pro'
        };
        setCurrentUser(user);
        fetchTotalCount(session.user.id);
        if (view === 'Home' || view === 'Login' || view === 'Signup') {
          setView('Dashboard');
        }
      } else {
        setCurrentUser(null);
        setHistory([]);
        setTotalHistoryCount(0);
        setSelectedSummary(null);
        setView('Home');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    setSyncStatus('syncing');
    await supabase.auth.signOut();
    setSyncStatus('synced');
  };

  const handleNewSummary = (summary: SummaryItem) => {
    if (summary.userId !== currentUser?.id) return;
    setHistory(prev => [summary, ...prev].slice(0, 50));
    setTotalHistoryCount(prev => prev + 1);
    setSelectedSummary(summary);
    setReturnView('Dashboard');
    setView('SummaryDetail');
  };

  const handleUpdateHistory = (items: SummaryItem[]) => {
    if (currentUser) {
      const safeItems = items.filter(i => i.userId === currentUser.id);
      setHistory(safeItems);
      setLastSync(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }
  };

  const handleDeleteSummary = async (id: string): Promise<boolean> => {
    setSyncStatus('syncing');
    try {
      const { error } = await supabase.from('summaries').delete().eq('id', id);
      if (error) throw error;
      setHistory(prev => prev.filter(item => item.id !== id));
      setTotalHistoryCount(prev => Math.max(0, prev - 1));
      setSyncStatus('synced');
      setView(returnView);
      return true;
    } catch (e) {
      console.error("Delete failure:", e);
      setSyncStatus('error');
      return false;
    }
  };

  const navigateToDetail = (item: SummaryItem, origin: View) => {
    if (item.userId !== currentUser?.id) return;
    setSelectedSummary(item);
    setReturnView(origin);
    setView('SummaryDetail');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="mt-4 text-indigo-600 font-bold tracking-widest text-[10px] uppercase">SummerEase Secure Load</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fcfdff] dark:bg-slate-950 transition-colors duration-300">
      <Navbar
        user={currentUser}
        syncStatus={syncStatus}
        lastSync={lastSync}
        onLogout={handleLogout}
        onNavigate={setView}
        currentView={view}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
      />

      <main className="flex-grow">
        {view === 'Home' && <LandingPage onGetStarted={() => setView('Signup')} />}
        {view === 'Login' && <AuthForm type="login" onToggle={() => setView('Signup')} onBack={() => setView('Home')} />}
        {view === 'Signup' && <AuthForm type="signup" onToggle={() => setView('Login')} onBack={() => setView('Home')} />}

        {currentUser && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
            {view === 'Dashboard' && (
              <Dashboard
                user={currentUser}
                history={history}
                totalCount={totalHistoryCount}
                onUpdateHistory={handleUpdateHistory}
                onNew={() => setView('NewSummary')}
                onViewDetail={(item) => navigateToDetail(item, 'Dashboard')}
                onViewAll={() => setView('History')}
              />
            )}
            {view === 'History' && (
              <History
                user={currentUser}
                history={history}
                onUpdateHistory={handleUpdateHistory}
                onViewDetail={(item) => navigateToDetail(item, 'History')}
                onNew={() => setView('NewSummary')}
                onBack={() => setView('Dashboard')}
              />
            )}
            {view === 'NewSummary' && (
              <NewSummary
                user={currentUser}
                setSyncStatus={setSyncStatus}
                onComplete={handleNewSummary}
                onCancel={() => setView('Dashboard')}
              />
            )}
            {view === 'SummaryDetail' && selectedSummary && (
              <SummaryDetailView
                summary={selectedSummary}
                onDelete={handleDeleteSummary}
                onBack={() => setView(returnView)}
              />
            )}
          </div>
        )}
      </main>

      <footer className="bg-white dark:bg-slate-900 border-t dark:border-slate-800 py-10 text-center text-gray-400 dark:text-slate-500 text-[9px] font-bold tracking-[0.3em] uppercase transition-colors">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse"></div>
          <span>Unrestricted Intelligence Vault v5.0.0</span>
        </div>
        SummerEase AI Directory &copy; {new Date().getFullYear()}
      </footer>

      <Analytics />
      <SpeedInsights />
    </div>
  );
};

export default App;
