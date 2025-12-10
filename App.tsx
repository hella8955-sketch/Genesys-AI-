import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import VideoAnalyzer from './components/VideoAnalyzer';
import ResultsDashboard from './components/ResultsDashboard';
import ChatAssistant from './components/ChatAssistant';
import LiveVoiceMode from './components/LiveVoiceMode';
import HistoryList from './components/HistoryList';
import { AppMode, AnalysisResult, HistoryItem } from './types';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.SCAN);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem('genesys_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const saveHistory = (items: HistoryItem[]) => {
    setHistory(items);
    localStorage.setItem('genesys_history', JSON.stringify(items));
  };

  const handleAnalysisResult = (result: AnalysisResult, file: File) => {
    setAnalysisResult(result);
    
    // Add to history
    const newItem: HistoryItem = {
      id: crypto.randomUUID(),
      fileName: file.name,
      timestamp: Date.now(),
      score: result.score,
      result: result.verdict,
      thumbnail: '' // In a real app we'd generate a thumb, keeping simple for now
    };
    
    // Add to top of list
    const newHistory = [newItem, ...history];
    saveHistory(newHistory);
  };

  const handleHistorySelect = (item: HistoryItem) => {
    // Reconstruct a partial result for display. 
    // In a full app we would store the full AnalysisResult in history.
    // For now we just show what we have in the dashboard or just basic info.
    // Let's create a minimal result object to view the score/verdict again.
    const result: AnalysisResult = {
      score: item.score,
      verdict: item.result,
      details: "Historical record retrieved from local database.",
      anomalies: ["Refer to original scan time for detailed anomalies."],
    };
    setAnalysisResult(result);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearHistory = () => {
    if (window.confirm("Clear all scan history?")) {
      saveHistory([]);
    }
  };

  const resetAnalysis = () => {
    setAnalysisResult(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-slate-200 font-sans selection:bg-cyan-500/30">
      <Header currentMode={mode} setMode={setMode} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {mode === AppMode.SCAN && (
          <div className="animate-fade-in">
            {!analysisResult ? (
              <div className="space-y-12">
                <div className="text-center space-y-4 pt-8">
                  <h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight">
                    Verify Reality in <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Real-Time</span>
                  </h1>
                  <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                    Advanced forensic analysis powered by Gemini Intelligence to detect deepfakes, verify locations, and validate content sources.
                  </p>
                </div>
                <VideoAnalyzer onResult={handleAnalysisResult} />
                
                <HistoryList 
                  history={history} 
                  onSelect={handleHistorySelect} 
                  onClear={clearHistory} 
                />
              </div>
            ) : (
              <ResultsDashboard result={analysisResult} onReset={resetAnalysis} />
            )}
          </div>
        )}

        {mode === AppMode.CHAT && <ChatAssistant />}
        
        {mode === AppMode.LIVE && <LiveVoiceMode />}
      </main>

      {/* Footer / Status */}
      <footer className="fixed bottom-0 w-full py-2 bg-slate-950 border-t border-slate-900 text-center text-xs text-slate-600 z-50 bg-slate-950/90 backdrop-blur">
        <p>POWERED BY GEMINI 3 PRO & VEO • GENESYS SECURITY SYSTEMS v1.0</p>
      </footer>
    </div>
  );
};

export default App;