
import React, { useEffect, useState } from 'react';
import { User, SummaryItem } from '../types';
import { supabase } from '../lib/supabase';

interface DashboardProps {
  user: User;
  history: SummaryItem[];
  totalCount: number;
  onUpdateHistory: (items: SummaryItem[]) => void;
  onNew: () => void;
  onViewDetail: (item: SummaryItem) => void;
  onViewAll: () => void;
}

const DASHBOARD_TIPS = [
  "Forward your long emails to yourself and paste them here for a quick briefing.",
  "Gemini 3 Flash can analyze complex PDF tables and charts—try uploading data-heavy reports.",
  "Use the 'Typography' feature in the summary detail to customize reading density.",
  "Summaries are encrypted at rest. Your vault is private and secure.",
  "Click 'Browse Full Library' to search through your entire history of summarized intelligence."
];

const SkeletonCard = () => (
  <div className="bg-white dark:bg-slate-900 p-7 sm:p-8 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm flex items-start gap-8 animate-pulse">
    <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gray-100 dark:bg-slate-800 flex-shrink-0"></div>
    <div className="flex-grow pt-2">
      <div className="flex justify-between mb-4">
        <div className="h-6 w-1/2 bg-gray-100 dark:bg-slate-800 rounded-lg"></div>
        <div className="h-4 w-16 bg-gray-50 dark:bg-slate-800 rounded-lg"></div>
      </div>
      <div className="space-y-2">
        <div className="h-4 w-full bg-gray-50 dark:bg-slate-800 rounded-lg"></div>
        <div className="h-4 w-3/4 bg-gray-50 dark:bg-slate-800 rounded-lg"></div>
      </div>
    </div>
  </div>
);

const Dashboard: React.FC<DashboardProps> = ({ user, history, totalCount, onUpdateHistory, onNew, onViewDetail, onViewAll }) => {
  const [loading, setLoading] = useState(history.length === 0);
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % DASHBOARD_TIPS.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function fetchHistory() {
      setLoading(true);
      const { data, error } = await supabase
        .from('summaries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) {
        console.error('Error fetching dashboard preview:', error);
      } else if (data) {
        const items: SummaryItem[] = data.map(item => ({
          id: item.id,
          userId: item.user_id,
          title: item.title,
          originalText: item.original_text,
          summary: item.summary,
          createdAt: new Date(item.created_at).getTime(),
          category: item.category as any
        }));
        onUpdateHistory(items);
      }
      setTimeout(() => setLoading(false), 800);
    }

    fetchHistory();
  }, [user.id]);

  const recentItems = history.slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
      <div className="grid lg:grid-cols-12 gap-8 lg:gap-16">
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-slate-900 dark:bg-slate-900/40 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-indigo-200 dark:shadow-none border border-transparent dark:border-slate-800 transition-all">
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-3xl font-black tracking-tight">Vault Overview</h2>
            </div>
            <p className="text-slate-400 text-sm mb-10">Intelligence summary for {user.name.split(' ')[0]}.</p>
            
            <button
              onClick={onNew}
              className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-5 rounded-2xl text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-500/20 mb-10 active:scale-95"
            >
              Analyze New Document
            </button>

            <div className="space-y-6 pt-8 border-t border-slate-800">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Entries Stored</span>
                <span className="text-2xl font-black text-indigo-400 tracking-tight">{totalCount} Summaries</span>
              </div>
              
              <div className="p-4 bg-white/5 rounded-2xl flex justify-between items-center cursor-pointer hover:bg-white/10 transition-colors" onClick={onViewAll}>
                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Library Health</span>
                <span className="text-[9px] font-black text-green-400 uppercase tracking-widest flex items-center gap-2">
                  Verified Optimal
                  <svg className="h-2 w-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M5 13l4 4L19 7" strokeWidth={3} /></svg>
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 border border-gray-100 dark:border-slate-800 shadow-sm hidden sm:block transition-all">
            <h3 className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-6">Intelligence Tips</h3>
            <p className="text-gray-600 dark:text-slate-400 text-sm leading-relaxed min-h-[4rem] animate-in fade-in duration-500">
              {DASHBOARD_TIPS[tipIndex]}
            </p>
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Recent Intelligence</h3>
              <p className="text-sm text-gray-400 dark:text-slate-500 font-medium">Synthesized briefings from your personal library</p>
            </div>
            <button 
              onClick={onViewAll}
              className="group flex items-center gap-2 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
            >
              Browse Full Library
              <svg className="h-3 w-3 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="space-y-6">
            {loading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : recentItems.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-slate-800 p-24 text-center transition-colors">
                <div className="h-16 w-16 bg-gray-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <svg className="h-8 w-8 text-gray-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <p className="text-gray-400 dark:text-slate-500 text-sm font-bold uppercase tracking-widest leading-relaxed">No briefings found.</p>
                <button onClick={onNew} className="mt-8 bg-indigo-600 text-white px-10 py-4 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg active:scale-95">Analyze First Document</button>
              </div>
            ) : (
              recentItems.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => onViewDetail(item)}
                  className="bg-white dark:bg-slate-900 p-7 sm:p-8 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:border-indigo-100 dark:hover:border-indigo-900/30 transition-all cursor-pointer group flex items-start gap-8 active:scale-[0.99] animate-in fade-in duration-500"
                >
                  <div className={`h-16 w-16 sm:h-20 sm:w-20 rounded-2xl flex-shrink-0 flex items-center justify-center transition-all group-hover:scale-110 ${item.category === 'Document' ? 'bg-orange-50 dark:bg-orange-900/10 text-orange-500' : 'bg-indigo-50 dark:bg-indigo-900/10 text-indigo-600 dark:text-indigo-400'}`}>
                    <svg className="h-8 w-8 sm:h-10 sm:w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {item.category === 'Document' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                      )}
                    </svg>
                  </div>
                  <div className="flex-grow min-w-0 pt-2">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-gray-900 dark:text-white text-lg sm:text-2xl group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">{item.title}</h4>
                      <span className="text-[10px] text-gray-400 dark:text-slate-600 font-black uppercase tracking-widest whitespace-nowrap ml-6">{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm sm:text-base text-gray-500 dark:text-slate-400 line-clamp-2 leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity">{item.summary.replace(/[#*]/g, '')}</p>
                  </div>
                  <div className="hidden sm:flex self-center h-12 w-12 items-center justify-center rounded-full bg-gray-50 dark:bg-slate-800 text-gray-300 dark:text-slate-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7-7 7" /></svg>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
