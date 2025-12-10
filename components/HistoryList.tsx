import React from 'react';
import { HistoryItem } from '../types';
import { Clock, FileVideo, Trash2, ChevronRight, ShieldCheck, ShieldAlert, HelpCircle } from 'lucide-react';

interface HistoryListProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
}

const HistoryList: React.FC<HistoryListProps> = ({ history, onSelect, onClear }) => {
  if (history.length === 0) return null;

  return (
    <div className="w-full max-w-3xl mx-auto mt-12 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-cyan-400" /> Recent Scans
        </h3>
        <button 
          onClick={onClear}
          className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
        >
          <Trash2 className="w-3 h-3" /> Clear History
        </button>
      </div>

      <div className="space-y-3">
        {history.map((item) => (
          <div 
            key={item.id}
            onClick={() => onSelect(item)}
            className="group relative bg-slate-900/50 border border-slate-800 hover:border-cyan-500/50 rounded-xl p-4 transition-all cursor-pointer hover:bg-slate-800/50"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  item.result === 'Real' ? 'bg-cyan-950/30 text-cyan-400' :
                  item.result === 'Fake' ? 'bg-red-950/30 text-red-400' :
                  'bg-yellow-950/30 text-yellow-400'
                }`}>
                  <FileVideo className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-medium text-slate-200 group-hover:text-white transition-colors">
                    {item.fileName}
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    {new Date(item.timestamp).toLocaleDateString()} • {new Date(item.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className={`text-sm font-bold ${
                     item.result === 'Real' ? 'text-cyan-400' :
                     item.result === 'Fake' ? 'text-red-400' :
                     'text-yellow-400'
                  }`}>
                    {item.result.toUpperCase()}
                  </div>
                  <div className="text-xs text-slate-500">Score: {item.score}</div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-cyan-400 transition-colors" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryList;