
import React, { useEffect, useState, useMemo } from 'react';
import { User, SummaryItem } from '../types';
import { supabase } from '../lib/supabase';

interface HistoryProps {
  user: User;
  history: SummaryItem[];
  onUpdateHistory: (items: SummaryItem[]) => void;
  onViewDetail: (item: SummaryItem) => void;
  onNew: () => void;
  onBack?: () => void;
}

const HistorySkeleton = () => (
  <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] border border-gray-100 dark:border-slate-800 animate-pulse">
    <div className="flex justify-between mb-6">
      <div className="h-5 w-16 bg-gray-100 dark:bg-slate-800 rounded-full"></div>
      <div className="h-4 w-12 bg-gray-50 dark:bg-slate-800 rounded-lg"></div>
    </div>
    <div className="h-6 w-3/4 bg-gray-100 dark:bg-slate-800 rounded-lg mb-4"></div>
    <div className="space-y-2 mb-8">
      <div className="h-4 w-full bg-gray-50 dark:bg-slate-800 rounded-lg"></div>
      <div className="h-4 w-full bg-gray-50 dark:bg-slate-800 rounded-lg"></div>
      <div className="h-4 w-2/3 bg-gray-50 dark:bg-slate-800 rounded-lg"></div>
    </div>
    <div className="pt-6 border-t border-gray-50 dark:border-slate-800">
      <div className="h-4 w-24 bg-gray-50 dark:bg-slate-800 rounded-lg"></div>
    </div>
  </div>
);

const History: React.FC<HistoryProps> = ({ user, history, onUpdateHistory, onViewDetail, onNew, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<'All' | 'Text' | 'Document'>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'alphabetical'>('newest');

  useEffect(() => {
    async function fetchHistory() {
      setLoading(true);
      const { data, error } = await supabase
        .from('summaries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching full library:', error);
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

  const filteredHistory = useMemo(() => {
    let result = [...history];

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(item => 
        item.title.toLowerCase().includes(lowerSearch) || 
        item.summary.toLowerCase().includes(lowerSearch)
      );
    }

    if (filterCategory !== 'All') {
      result = result.filter(item => item.category === filterCategory);
    }

    if (sortBy === 'newest') result.sort((a, b) => b.createdAt - a.createdAt);
    if (sortBy === 'oldest') result.sort((a, b) => a.createdAt - b.createdAt);
    if (sortBy === 'alphabetical') result.sort((a, b) => a.title.localeCompare(b.title));

    return result;
  }, [history, searchTerm, filterCategory, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
      <div className="mb-10">
        {onBack && (
          <button 
            onClick={onBack}
            className="group flex items-center text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 transition-colors mb-6"
          >
            <svg className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Return to Dashboard
          </button>
        )}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 sm:gap-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-2">Vault Library</h1>
            <p className="text-sm sm:text-base text-gray-500 dark:text-slate-400 font-medium">Browse and manage all summarized intelligence entries.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative w-full sm:w-auto">
              <input 
                type="text" 
                placeholder="Search secure vault..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl text-sm dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none w-full sm:w-64 shadow-sm"
              />
              <svg className="h-4 w-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button 
              onClick={onNew}
              className="w-full sm:w-auto bg-indigo-600 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 active:scale-95 transition-all"
            >
              Process New Data
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 p-4 sm:p-8 shadow-sm mb-8 sm:mb-12 flex flex-col sm:flex-row gap-6 sm:gap-8 items-start sm:items-center justify-between transition-colors">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
          <span className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Type</span>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {(['All', 'Text', 'Document'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-xl text-[10px] sm:text-xs font-bold transition-all ${
                  filterCategory === cat ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
          <span className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">Sort Order</span>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full sm:w-auto bg-gray-50 dark:bg-slate-800 border-0 text-[10px] sm:text-xs font-bold text-gray-700 dark:text-slate-300 py-2.5 sm:py-2 pl-4 pr-10 rounded-xl focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="newest">Recent First</option>
            <option value="oldest">Historical First</option>
            <option value="alphabetical">Title A-Z</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <HistorySkeleton />
          <HistorySkeleton />
          <HistorySkeleton />
          <HistorySkeleton />
          <HistorySkeleton />
          <HistorySkeleton />
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="text-center py-20 sm:py-32 bg-white dark:bg-slate-900 rounded-[2rem] sm:rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-slate-800 px-4 transition-colors animate-in fade-in duration-500">
          <div className="h-12 w-12 sm:h-16 sm:w-16 bg-gray-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="h-6 w-6 sm:h-8 sm:w-8 text-gray-200 dark:text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <p className="text-gray-400 dark:text-slate-500 font-bold uppercase tracking-widest text-[9px] sm:text-[10px]">No records found in current view</p>
          <button onClick={() => {setSearchTerm(''); setFilterCategory('All');}} className="mt-4 text-indigo-600 dark:text-indigo-400 font-bold text-sm hover:underline">Reset Search Filters</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredHistory.map((item) => (
            <div 
              key={item.id} 
              onClick={() => onViewDetail(item)}
              className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] shadow-sm border border-gray-100 dark:border-slate-800 hover:shadow-xl dark:hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all cursor-pointer group flex flex-col h-full active:scale-[0.98] animate-in fade-in duration-500"
            >
              <div className="flex justify-between items-start mb-4 sm:mb-6">
                <span className={`text-[8px] sm:text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-widest ${
                  item.category === 'Document' ? 'bg-orange-500 text-white' : 'bg-indigo-600 text-white'
                }`}>
                  {item.category}
                </span>
                <span className="text-[9px] sm:text-[10px] text-gray-300 dark:text-slate-600 font-bold uppercase tracking-tighter">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">{item.title}</h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 line-clamp-3 leading-relaxed mb-6 sm:mb-8 flex-grow">{item.summary.replace(/[#*]/g, '')}</p>
              <div className="flex items-center justify-between mt-auto pt-4 sm:pt-6 border-t border-gray-50 dark:border-slate-800">
                <span className="text-[9px] sm:text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest group-hover:translate-x-1 transition-transform inline-flex items-center">
                  Analyze Insight
                  <svg className="h-3 w-3 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
