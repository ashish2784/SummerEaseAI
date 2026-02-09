
import React, { useState } from 'react';
import { User, View } from '../types';

interface NavbarProps {
  user: User | null;
  syncStatus?: 'synced' | 'syncing' | 'error';
  lastSync?: string;
  onLogout: () => void;
  onNavigate: (view: View) => void;
  currentView: View;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, syncStatus = 'synced', lastSync, onLogout, onNavigate, currentView, isDarkMode, onToggleTheme }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavigate = (view: View) => {
    onNavigate(view);
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b dark:border-slate-800 sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 sm:h-20 items-center">
          <div 
            className="flex items-center cursor-pointer group" 
            onClick={() => handleNavigate(user ? 'Dashboard' : 'Home')}
          >
            <div className="bg-indigo-600 p-2 rounded-xl mr-2 sm:mr-3 shadow-lg shadow-indigo-100 dark:shadow-none group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <span className="text-lg sm:text-xl font-black text-gray-900 dark:text-white tracking-tighter">SummerEase</span>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-8">
            {user && (
              <div className="hidden lg:flex items-center space-x-6 mr-6">
                <button 
                  onClick={() => handleNavigate('Dashboard')}
                  className={`text-xs font-bold uppercase tracking-widest transition-colors ${currentView === 'Dashboard' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-slate-500 hover:text-gray-900 dark:hover:text-white'}`}
                >
                  Dashboard
                </button>
                <button 
                  onClick={() => handleNavigate('History')}
                  className={`flex items-center space-x-2 text-xs font-bold uppercase tracking-widest transition-colors ${currentView === 'History' || currentView === 'SummaryDetail' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 dark:text-slate-500 hover:text-gray-900 dark:hover:text-white'}`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Library History</span>
                </button>
              </div>
            )}

            <div className="flex items-center space-x-2 sm:space-x-4">
              {user ? (
                <>
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-sm font-bold text-gray-900 dark:text-white">{user.name}</span>
                    <div className="flex items-center space-x-1">
                      <div className={`h-1.5 w-1.5 rounded-full ${syncStatus === 'synced' ? 'bg-green-500' : syncStatus === 'syncing' ? 'bg-amber-400 animate-pulse' : 'bg-red-500'}`}></div>
                      <span className="text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-tighter">
                        {syncStatus === 'synced' ? `Verified ${lastSync || 'Now'}` : 'Syncing...'}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={onLogout}
                    className="bg-gray-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-bold transition-all border border-transparent hover:border-red-100 dark:hover:border-red-900/30"
                  >
                    Logout
                  </button>
                  <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="lg:hidden p-2 text-gray-500 dark:text-slate-400 hover:text-indigo-600"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} />
                    </svg>
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => handleNavigate('Login')}
                    className="text-gray-500 dark:text-slate-400 hover:text-indigo-600 text-[10px] sm:text-xs font-bold uppercase tracking-widest px-2"
                  >
                    Log in
                  </button>
                  <button 
                    onClick={() => handleNavigate('Signup')}
                    className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 sm:px-6 py-2 sm:py-3 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-indigo-100 dark:shadow-none"
                  >
                    Join
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {isMenuOpen && user && (
        <div className="lg:hidden bg-white dark:bg-slate-900 border-b dark:border-slate-800 animate-in slide-in-from-top duration-300">
          <div className="px-4 pt-2 pb-6 space-y-2">
            <button 
              onClick={() => handleNavigate('Dashboard')}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest ${currentView === 'Dashboard' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' : 'text-gray-500'}`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => handleNavigate('History')}
              className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest ${currentView === 'History' || currentView === 'SummaryDetail' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' : 'text-gray-500'}`}
            >
              Library History
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
