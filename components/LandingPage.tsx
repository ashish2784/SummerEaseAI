
import React, { useState } from 'react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const [showDemo, setShowDemo] = useState(false);

  return (
    <div className="bg-white dark:bg-slate-950 overflow-hidden transition-colors duration-300">
      {/* Demo Modal Overlay */}
      {showDemo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" onClick={() => setShowDemo(false)}></div>
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-4xl aspect-video rounded-[3rem] shadow-2xl overflow-hidden border border-white/10 flex flex-col items-center justify-center text-center p-12">
            <button 
              onClick={() => setShowDemo(false)}
              className="absolute top-8 right-8 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="h-24 w-24 bg-indigo-600 rounded-full flex items-center justify-center mb-8 animate-pulse shadow-2xl shadow-indigo-500/50">
              <svg className="h-12 w-12 text-white ml-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <h3 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter mb-4">Unrestricted Access</h3>
            <p className="text-gray-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed mb-10 text-lg">
              Observe how SummerEase ingests complex PDFs and generates strategic insights in near real-time. No caps. No credits.
            </p>
            <button 
              onClick={onGetStarted}
              className="px-12 py-5 bg-indigo-600 text-white font-bold rounded-2xl shadow-2xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all text-lg"
            >
              Start Your Vault
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 sm:pt-40 sm:pb-56 px-4">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-full mb-10 border border-indigo-100 dark:border-indigo-900/30">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
            </span>
            <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-[0.2em]">100% Free & Uncapped</span>
          </div>
          <h1 className="text-5xl sm:text-7xl lg:text-9xl font-black text-gray-900 dark:text-white tracking-tighter mb-10 leading-[0.9]">
            The intelligent <span className="text-indigo-600 dark:text-indigo-400">vault</span> for <br className="hidden sm:block"/> everyone.
          </h1>
          <p className="max-w-2xl mx-auto text-lg sm:text-2xl text-gray-500 dark:text-slate-400 leading-relaxed mb-14 px-4 sm:px-0">
            No daily limits. No subscription fees. SummerEase is a permanent, secure directory for your summarized intelligence—powered by Gemini 3 Flash.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 px-4 sm:px-0">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto px-12 py-6 bg-indigo-600 text-white rounded-3xl font-bold text-lg sm:text-xl hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 dark:shadow-none active:scale-95"
            >
              Get Started Now
            </button>
            <button 
              onClick={() => setShowDemo(true)}
              className="w-full sm:w-auto px-12 py-6 bg-white dark:bg-slate-900 text-gray-900 dark:text-white border-2 border-gray-100 dark:border-slate-800 rounded-3xl font-bold text-lg sm:text-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-all"
            >
              See the Engine
            </button>
          </div>
        </div>
        
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 w-full max-w-5xl h-full bg-gradient-to-b from-indigo-50/50 dark:from-indigo-900/10 to-transparent blur-3xl opacity-50"></div>
      </section>

      {/* Benefits */}
      <section className="py-24 sm:py-32 bg-[#fcfdff] dark:bg-slate-900 transition-colors">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16 sm:mb-24">
            <h2 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.4em] mb-4">Totally Free</h2>
            <p className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white tracking-tight">Zero Constraints, Pure Logic</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10 sm:gap-16">
            {[
              { step: 'Free', title: 'Always $0.00', desc: 'Every feature is unlocked by default. We believe intelligence synthesis should be an accessible standard for everyone.' },
              { step: 'Open', title: 'Infinite Synthesis', desc: 'Summarize 1000s of pages without ever hitting a paywall. Large PDF support and OCR analysis are standard.' },
              { step: 'Safe', title: 'Private Vault', desc: 'Your directory is encrypted and isolated. Only you can access your stored briefings and original source files.' }
            ].map((item, idx) => (
              <div key={idx} className="relative group p-8 rounded-[3rem] bg-white dark:bg-slate-800 border border-transparent hover:border-gray-100 dark:hover:border-slate-700 transition-all shadow-sm hover:shadow-xl">
                <div className="text-6xl sm:text-8xl font-black text-indigo-600/5 dark:text-indigo-400/5 mb-6 sm:mb-8 group-hover:text-indigo-600/10 dark:group-hover:text-indigo-400/10 transition-colors">{item.step}</div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">{item.title}</h3>
                <p className="text-gray-500 dark:text-slate-400 leading-relaxed text-sm sm:text-base">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
