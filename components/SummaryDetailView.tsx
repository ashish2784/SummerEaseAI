
import React, { useState, useEffect } from 'react';
import { SummaryItem } from '../types';

interface SummaryDetailViewProps {
  summary: SummaryItem;
  onDelete: (id: string) => Promise<boolean>;
  onBack: () => void;
}

type FontSize = 'text-sm' | 'text-base' | 'text-lg' | 'text-xl';
type LineSpacing = 'leading-tight' | 'leading-normal' | 'leading-relaxed' | 'leading-loose';

const SummaryDetailView: React.FC<SummaryDetailViewProps> = ({ summary, onDelete, onBack }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);
  
  const [fontSize, setFontSize] = useState<FontSize>('text-base');
  const [lineSpacing, setLineSpacing] = useState<LineSpacing>('leading-relaxed');
  const [showReadingControls, setShowReadingControls] = useState(false);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const triggerDelete = async () => {
    setIsDeleting(true);
    setShowConfirmModal(false);
    const success = await onDelete(summary.id);
    if (!success) {
      setIsDeleting(false);
      setToast({ 
        message: "Strategic purge failed. Security layer or network latency interrupted the request.", 
        type: 'error' 
      });
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(summary.summary);
    setCopied(true);
    setToast({ message: "Briefing copied to secure clipboard.", type: 'success' });
    setTimeout(() => setCopied(false), 2000);
  };

  // Simple formatter to handle bold and list markers
  const formatContent = (content: string) => {
    return content.split('\n').map((line, idx) => {
      // Handle Bold **text**
      const formattedLine = line.split(/(\*\*.*?\*\*)/).map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} className="text-gray-900 dark:text-white font-black">{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      // Handle Bullet points
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        return (
          <div key={idx} className="flex gap-3 mb-2 ml-4">
            <span className="text-indigo-500 font-black flex-shrink-0">•</span>
            <div>{formattedLine.map((f, fIdx) => (typeof f === 'string' ? f.replace(/^[*-]\s+/, '') : f))}</div>
          </div>
        );
      }

      return <p key={idx} className="mb-4">{formattedLine}</p>;
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 relative">
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4 fade-in duration-500 w-full max-w-md px-4">
          <div className={`flex items-center gap-5 p-5 rounded-[2rem] shadow-2xl border backdrop-blur-xl ${
            toast.type === 'error' 
              ? 'bg-red-50/95 border-red-100 dark:bg-red-950/40 dark:border-red-900/50 text-red-900 dark:text-red-400' 
              : 'bg-indigo-50/95 border-indigo-100 dark:bg-indigo-950/40 dark:border-indigo-900/50 text-indigo-900 dark:text-indigo-400'
          }`}>
            <div className={`flex-shrink-0 h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm ${
              toast.type === 'error' ? 'bg-red-100 dark:bg-red-900/40' : 'bg-indigo-100 dark:bg-indigo-900/40'
            }`}>
              {toast.type === 'error' ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <div className="flex-grow">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-1">
                {toast.type === 'error' ? 'System Warning' : 'Operation Success'}
              </p>
              <p className="text-sm font-bold leading-snug">{toast.message}</p>
            </div>
            <button onClick={() => setToast(null)} className="p-2 opacity-40 hover:opacity-100 transition-opacity">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {showConfirmModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity" onClick={() => setShowConfirmModal(false)}></div>
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl p-10 relative max-w-sm w-full transition-all border border-gray-100 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="h-16 w-16 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mb-6">
              <svg className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Delete Insight?</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-8 leading-relaxed">This action is irreversible. All synthesized data and metadata for this entry will be wiped from the encrypted directory.</p>
            <div className="flex flex-col gap-3">
              <button onClick={triggerDelete} className="w-full bg-red-600 text-white font-bold py-4 rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-200 dark:shadow-none active:scale-95 uppercase text-[10px] tracking-widest">Wipe Strategy Data</button>
              <button onClick={() => setShowConfirmModal(false)} className="w-full bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-400 font-bold py-4 rounded-2xl transition-all active:scale-95 uppercase text-[10px] tracking-widest">Keep Record</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-10">
        <button onClick={onBack} className="group flex items-center text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 transition-colors">
          <svg className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Return to Vault
        </button>
        <button 
          onClick={() => setShowConfirmModal(true)} 
          disabled={isDeleting} 
          className="text-[10px] font-black text-gray-400 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 uppercase tracking-[0.3em] transition-all"
        >
          {isDeleting ? 'Purging Intelligence...' : 'Destroy Record'}
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="p-10 sm:p-14 border-b border-gray-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/20">
          <div className="flex items-center gap-2 mb-6">
            <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-lg shadow-sm ${
              summary.category === 'Document' ? 'bg-orange-500 text-white' : 'bg-indigo-600 text-white'
            }`}>
              {summary.category}
            </span>
            <span className="text-[10px] font-bold text-gray-400 dark:text-slate-600 uppercase tracking-widest ml-2">ID: {summary.id.substring(0, 8)}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-gray-900 dark:text-white leading-tight tracking-tight">{summary.title}</h1>
        </div>
        
        <div className="p-10 sm:p-14">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.4em]">AI Synthesis Briefing</h3>
            <button 
              onClick={() => setShowReadingControls(!showReadingControls)} 
              className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${showReadingControls ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10" /></svg>
              {showReadingControls ? 'Close Config' : 'Typography'}
            </button>
          </div>

          {showReadingControls && (
            <div className="mb-10 p-8 bg-slate-50 dark:bg-slate-950/40 rounded-[2rem] border border-gray-100 dark:border-slate-800 flex flex-wrap gap-10 items-center transition-all animate-in slide-in-from-top-4 duration-300">
              <div className="space-y-4">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Readability Scale</span>
                <div className="flex gap-2">
                  {(['text-sm', 'text-base', 'text-lg', 'text-xl'] as FontSize[]).map(size => (
                    <button 
                      key={size}
                      onClick={() => setFontSize(size)}
                      className={`h-10 w-10 rounded-xl flex items-center justify-center text-sm font-black transition-all active:scale-95 ${fontSize === size ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 dark:shadow-none' : 'bg-white dark:bg-slate-800 text-gray-400 border border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
                    >
                      A
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Vertical Rhythm</span>
                <div className="flex gap-2">
                  {(['leading-tight', 'leading-normal', 'leading-relaxed', 'leading-loose'] as LineSpacing[]).map(spacing => (
                    <button 
                      key={spacing}
                      onClick={() => setLineSpacing(spacing)}
                      className={`h-10 px-4 rounded-xl flex items-center justify-center text-[10px] font-black transition-all active:scale-95 ${lineSpacing === spacing ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 dark:shadow-none' : 'bg-white dark:bg-slate-800 text-gray-400 border border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700'}`}
                    >
                      ↕
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className={`transition-all duration-300 font-medium text-gray-800 dark:text-slate-200 ${fontSize} ${lineSpacing}`}>
            {formatContent(summary.summary)}
          </div>

          <div className="mt-14 flex flex-col sm:flex-row items-center gap-4">
            <button 
              onClick={handleCopy} 
              className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
              {copied ? 'Intelligence Copied' : 'Secure Copy Briefing'}
            </button>
            <p className="text-[10px] font-bold text-gray-400 dark:text-slate-600 uppercase tracking-widest text-center sm:text-left">Processed on {new Date(summary.createdAt).toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="mt-10 bg-white dark:bg-slate-900 p-10 sm:p-14 rounded-[3rem] border border-gray-100 dark:border-slate-800 transition-colors">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.4em]">Strategic Source Data</h3>
          <span className="text-[10px] font-bold text-indigo-500/50 dark:text-indigo-400/30 uppercase tracking-widest">Read-Only Vault</span>
        </div>
        <div className="text-sm sm:text-base text-gray-500 dark:text-slate-400 line-clamp-[12] leading-relaxed font-medium">
          {summary.originalText}
        </div>
      </div>
    </div>
  );
};

export default SummaryDetailView;
