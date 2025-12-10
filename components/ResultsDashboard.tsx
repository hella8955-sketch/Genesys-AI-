import React from 'react';
import { AnalysisResult } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { ShieldAlert, ShieldCheck, HelpCircle, ExternalLink, Map } from 'lucide-react';

interface ResultsDashboardProps {
  result: AnalysisResult;
  onReset: () => void;
}

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ result, onReset }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#22d3ee'; // Cyan (Real)
    if (score >= 50) return '#fbbf24'; // Yellow (Uncertain)
    return '#f87171'; // Red (Fake)
  };

  const chartData = [
    { name: 'Truth', value: result.score },
    { name: 'Fake', value: 100 - result.score },
  ];

  const color = getScoreColor(result.score);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      
      {/* Top Banner */}
      <div className={`p-6 rounded-2xl border flex items-center justify-between ${
        result.verdict === 'Real' ? 'bg-cyan-950/20 border-cyan-500/30' : 
        result.verdict === 'Fake' ? 'bg-red-950/20 border-red-500/30' : 
        'bg-yellow-950/20 border-yellow-500/30'
      }`}>
        <div className="flex items-center gap-4">
           {result.verdict === 'Real' ? <ShieldCheck className="w-12 h-12 text-cyan-400"/> :
            result.verdict === 'Fake' ? <ShieldAlert className="w-12 h-12 text-red-400"/> :
            <HelpCircle className="w-12 h-12 text-yellow-400"/>}
           <div>
             <h2 className="text-2xl font-display font-bold text-white">VERDICT: {result.verdict.toUpperCase()}</h2>
             <p className="text-slate-400">Confidence Score: {result.score}/100</p>
           </div>
        </div>
        <div className="w-24 h-24 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                innerRadius={35}
                outerRadius={45}
                paddingAngle={5}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
              >
                <Cell fill={color} />
                <Cell fill="#1e293b" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold" style={{ color }}>{result.score}</span>
          </div>
        </div>
      </div>

      {/* Analysis Details */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
          <h3 className="text-lg font-bold text-white mb-4">AI Analysis</h3>
          <p className="text-slate-300 mb-4 text-sm leading-relaxed">{result.details}</p>
          
          <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Detected Anomalies</h4>
          <ul className="space-y-2">
            {result.anomalies.map((a, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-red-200 bg-red-950/20 p-2 rounded">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5"></span>
                {a}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-6">
          {/* External Verification */}
          {result.searchVerification && (
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <ExternalLink className="w-5 h-5 text-cyan-400" /> Web Verification
              </h3>
              <div className="space-y-2">
                {result.searchVerification.sources.map((s, i) => (
                   <a key={i} href={s.uri} target="_blank" rel="noopener noreferrer" className="block p-3 rounded bg-slate-800 hover:bg-slate-700 transition-colors">
                     <div className="text-cyan-300 text-sm font-medium truncate">{s.title}</div>
                     <div className="text-slate-500 text-xs truncate">{s.uri}</div>
                   </a>
                ))}
              </div>
            </div>
          )}

          {/* Location Verification */}
          {result.locationVerification && (
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Map className="w-5 h-5 text-green-400" /> Location Check
              </h3>
               <div className="space-y-2">
                {result.locationVerification.matches.map((s, i) => (
                   <a key={i} href={s.uri} target="_blank" rel="noopener noreferrer" className="block p-3 rounded bg-slate-800 hover:bg-slate-700 transition-colors">
                     <div className="text-green-300 text-sm font-medium truncate">{s.title}</div>
                     <div className="text-slate-500 text-xs truncate">{s.uri}</div>
                   </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <button onClick={onReset} className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors">
        Analyze Another Video
      </button>
    </div>
  );
};

export default ResultsDashboard;
