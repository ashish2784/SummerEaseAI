
import React, { useState, useEffect } from 'react';
import { SummaryItem, User } from '../types';
import { summarizeContent, generateTitle, FilePart } from '../services/geminiService';
import { supabase } from '../lib/supabase';

interface NewSummaryProps {
  user: User;
  setSyncStatus: (status: 'synced' | 'syncing' | 'error') => void;
  onComplete: (summary: SummaryItem) => void;
  onCancel: () => void;
}

declare const pdfjsLib: any;

const NewSummary: React.FC<NewSummaryProps> = ({ user, setSyncStatus, onComplete, onCancel }) => {
  const [inputText, setInputText] = useState('');
  const [category, setCategory] = useState<'Text' | 'Document'>('Text');
  const [status, setStatus] = useState<string>('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isVisualMode, setIsVisualMode] = useState(false);
  const [error, setError] = useState('');
  const [pendingFile, setPendingFile] = useState<{name: string, data: string, type: string, previewUrl?: string} | null>(null);

  const cleanExtractedText = (text: string) => {
    return text
      .replace(/[^\x20-\x7E\n\r\t]/g, ' ') 
      .replace(/\s+/g, ' ')
      .trim();
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const extractTextFromPDF = async (data: ArrayBuffer): Promise<{text: string, preview?: string, isScanned: boolean}> => {
    try {
      const uint8Data = new Uint8Array(data);
      const loadingTask = pdfjsLib.getDocument({ data: uint8Data });
      const pdf = await loadingTask.promise;
      
      let fullText = "";
      let hasText = false;
      const numPages = pdf.numPages;

      for (let i = 1; i <= Math.min(numPages, 20); i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(" ");
          
        if (pageText.trim().length > 5) hasText = true;
        fullText += `[PAGE ${i}]\n${pageText}\n\n`;
      }

      let preview = '';
      try {
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 0.5 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (context) {
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          await page.render({ canvasContext: context, viewport }).promise;
          preview = canvas.toDataURL('image/jpeg', 0.6);
        }
      } catch (e) {
        console.warn("Preview generation failed", e);
      }

      const textDensity = fullText.trim().length / Math.min(numPages, 20);
      const isScanned = !hasText || textDensity < 100; 
      
      return { text: cleanExtractedText(fullText), preview, isScanned };
    } catch (e: any) {
      console.error("PDF Parsing Critical Error:", e);
      throw e;
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 25 * 1024 * 1024) { // Increased to 25MB for everyone
      setError("File exceeds 25MB vault limit.");
      return;
    }

    setError('');
    setStatus('Inhaling document...');
    setIsSummarizing(true);

    try {
      if (file.type === 'text/plain') {
        const reader = new FileReader();
        reader.onload = (event) => {
          setInputText(cleanExtractedText(event.target?.result as string));
          setCategory('Text');
          setPendingFile(null);
          setIsSummarizing(false);
          setStatus('');
        };
        reader.readAsText(file);
      } else if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        try {
          const { text, preview, isScanned } = await extractTextFromPDF(arrayBuffer);
          setStatus('Encoding for AI transmission...');
          const base64 = await fileToBase64(file);

          setPendingFile({
            name: file.name,
            data: base64,
            type: 'application/pdf',
            previewUrl: preview
          });
          
          setCategory('Document');
          setInputText(text);
          setIsVisualMode(isScanned);
        } catch (pdfErr: any) {
          setError("Could not read PDF: Document structure is unreadable.");
        } finally {
          setIsSummarizing(false);
          setStatus('');
        }
      } else {
        setError('Format not supported.');
        setIsSummarizing(false);
        setStatus('');
      }
    } catch (err) {
      setError("Critical ingestion failure.");
      setIsSummarizing(false);
      setStatus('');
    }
  };

  const handleProcess = async () => {
    if (!inputText.trim() && !pendingFile) return;

    setError('');
    setIsSummarizing(true);
    setSyncStatus('syncing');
    setStatus('Negotiating with Gemini Flash...');

    try {
      let filePart: FilePart | undefined;
      if (pendingFile) {
        filePart = {
          inlineData: {
            data: pendingFile.data,
            mimeType: pendingFile.type
          }
        };
      }

      setStatus(isVisualMode ? 'Multimodal Reasoning...' : 'Crunching Intelligence...');
      const summaryText = await summarizeContent(inputText, category, filePart);
      
      setStatus('Finalizing metadata...');
      const titleText = await generateTitle(inputText || summaryText, filePart);

      const { data, error: dbError } = await supabase
        .from('summaries')
        .insert({
          user_id: user.id,
          title: titleText,
          original_text: inputText.substring(0, 10000) || "Rich Media Document", // Increased stored text limit
          summary: summaryText,
          category: category
        })
        .select()
        .single();

      if (dbError) throw dbError;

      const newItem: SummaryItem = {
        id: data.id,
        userId: data.user_id,
        title: data.title,
        originalText: data.original_text,
        summary: data.summary,
        createdAt: new Date(data.created_at).getTime(),
        category: data.category as any,
      };

      setSyncStatus('synced');
      onComplete(newItem);
    } catch (err: any) {
      setError(err.message || "Strategic synthesis failed.");
      setSyncStatus('error');
    } finally {
      setIsSummarizing(false);
      setStatus('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <div className="mb-6">
        <button 
          onClick={onCancel}
          className="group flex items-center text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 transition-colors"
        >
          <svg className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Return to Dashboard
        </button>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl dark:shadow-none border border-gray-100 dark:border-slate-800 overflow-hidden transition-colors">
        <div className="p-6 sm:p-14">
          <div className="flex items-center justify-between mb-8 sm:mb-12">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Intelligence Feed</h2>
              <p className="text-[10px] sm:text-xs text-indigo-600 dark:text-indigo-400 mt-1 font-bold uppercase tracking-widest">
                Infinite AI Processing Active for all users
              </p>
            </div>
            <button onClick={onCancel} className="text-gray-300 dark:text-slate-600 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20" title="Cancel synthesis">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex gap-2 mb-8 sm:mb-10 bg-slate-50 dark:bg-slate-950 p-1.5 rounded-2xl w-fit border border-gray-100 dark:border-slate-800">
            {(['Text', 'Document'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-6 sm:px-10 py-2 sm:py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                  category === cat ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-md ring-1 ring-black/5 dark:ring-white/5' : 'text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="mb-8 sm:mb-10 relative">
            {pendingFile ? (
              <div className={`p-6 sm:p-10 rounded-[1.5rem] sm:rounded-[2rem] border-2 flex flex-col sm:flex-row items-center gap-6 sm:gap-10 transition-all duration-500 ${isVisualMode ? 'bg-amber-50/30 border-amber-100 dark:bg-amber-900/10 dark:border-amber-900/30' : 'bg-indigo-50/20 border-indigo-100 dark:bg-indigo-900/10 dark:border-indigo-900/30'}`}>
                {pendingFile.previewUrl ? (
                  <img src={pendingFile.previewUrl} className="w-24 h-32 sm:w-28 sm:h-36 object-cover rounded-2xl shadow-xl ring-4 sm:ring-8 ring-white dark:ring-slate-800" />
                ) : (
                  <div className="w-24 h-32 sm:w-28 sm:h-36 bg-indigo-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
                    <svg className="h-10 w-10 sm:h-12 sm:w-12 text-indigo-300 dark:text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                )}
                <div className="flex-grow text-center sm:text-left">
                  <h4 className="font-bold text-gray-900 dark:text-white text-xl sm:text-2xl truncate max-w-sm">{pendingFile.name}</h4>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                    <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${isVisualMode ? 'bg-amber-500 text-white' : 'bg-indigo-600 text-white'}`}>
                      {isVisualMode ? 'Visual Analysis' : 'Native Extraction'}
                    </span>
                    <span className="text-[9px] sm:text-[10px] text-gray-300 dark:text-slate-600 font-bold uppercase">System Optimal</span>
                  </div>
                </div>
              </div>
            ) : (
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste content for briefing synthesis..."
                className="w-full h-64 sm:h-80 p-6 sm:p-10 rounded-[1.5rem] sm:rounded-[2.5rem] border-2 border-gray-100 dark:border-slate-800 focus:border-indigo-500 outline-none resize-none bg-slate-50/20 dark:bg-slate-950/20 text-sm dark:text-white leading-relaxed transition-all focus:bg-white dark:focus:bg-slate-950 shadow-inner"
              />
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            <label className="flex-[1] cursor-pointer flex items-center justify-center px-6 sm:px-10 py-4 sm:py-6 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 rounded-2xl sm:rounded-3xl border-2 border-gray-100 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800 hover:bg-indigo-50/10 transition-all font-bold text-[10px] uppercase tracking-[0.2em] active:scale-[0.98]">
              Upload Source
              <input type="file" className="hidden" accept=".txt,.pdf" onChange={handleFileUpload} />
            </label>

            <button
              disabled={isSummarizing || (!inputText.trim() && !pendingFile)}
              onClick={handleProcess}
              className="flex-[2] bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-300 dark:disabled:text-slate-600 text-white font-bold py-4 sm:py-6 rounded-2xl sm:rounded-3xl text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-100 dark:shadow-none flex items-center justify-center group active:scale-[0.98]"
            >
              {isSummarizing ? (
                <div className="flex items-center">
                  <svg className="animate-spin h-5 w-5 mr-4 text-current" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {status || 'Processing...'}
                </div>
              ) : (
                <>Initiate Full Synthesis</>
              )}
            </button>
          </div>

          {error && (
            <div className="mt-8 p-4 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-2xl text-[10px] font-bold uppercase tracking-widest text-center">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewSummary;
