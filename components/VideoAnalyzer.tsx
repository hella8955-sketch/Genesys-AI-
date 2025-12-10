import React, { useState, useRef } from 'react';
import { Upload, FileVideo, Search, MapPin, Loader2 } from 'lucide-react';
import { analyzeVideo } from '../services/geminiService';
import { AnalysisResult } from '../types';

interface VideoAnalyzerProps {
  onResult: (result: AnalysisResult, file: File) => void;
}

const VideoAnalyzer: React.FC<VideoAnalyzerProps> = ({ onResult }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [checkSearch, setCheckSearch] = useState(false);
  const [checkLocation, setCheckLocation] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data url prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleScan = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    try {
      let userLoc = undefined;
      // Only check location if feature is selected
      if (checkLocation && navigator.geolocation) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => 
            navigator.geolocation.getCurrentPosition(resolve, reject)
          );
          userLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        } catch (e) {
          console.warn("Geolocation failed", e);
        }
      }

      const base64 = await fileToBase64(file);
      
      const result = await analyzeVideo(base64, file.type, checkSearch, checkLocation, userLoc);
      onResult(result, file);
    } catch (error) {
      console.error("Analysis failed:", error);
      alert("Analysis failed. Please try a shorter video or check your connection.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6 space-y-8">
      {/* Upload Zone */}
      <div 
        className={`relative border-2 border-dashed rounded-2xl p-12 transition-all ${
          file ? 'border-cyan-500/50 bg-cyan-950/10' : 'border-slate-700 hover:border-cyan-500/30'
        }`}
      >
        <input
          type="file"
          accept="video/*"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileChange}
          ref={fileInputRef}
        />
        
        {!file ? (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto">
              <Upload className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-lg font-display font-bold text-white">Upload Video Evidence</h3>
              <p className="text-slate-400 text-sm mt-1">Drag & drop or click to browse (Max 20MB)</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
             <video src={preview || ""} className="w-full max-h-64 rounded-lg border border-slate-700 bg-black" controls />
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-cyan-300">
                  <FileVideo className="w-5 h-5" />
                  <span className="text-sm font-mono truncate max-w-[200px]">{file.name}</span>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); }}
                  className="text-red-400 text-sm hover:underline z-10 relative"
                >
                  Remove
                </button>
             </div>
          </div>
        )}
      </div>

      {/* Configuration */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => setCheckSearch(!checkSearch)}
          className={`relative flex items-center p-4 rounded-xl border transition-all ${
            checkSearch ? 'bg-cyan-950/30 border-cyan-500/50 text-cyan-100' : 'bg-slate-900 border-slate-800 text-slate-400'
          }`}
        >
          <Search className={`w-5 h-5 mr-3 ${checkSearch ? 'text-cyan-400' : ''}`} />
          <div className="text-left">
            <div className="font-semibold text-sm flex items-center gap-2">Web Cross-Reference</div>
            <div className="text-xs opacity-70">Verify events with Google Search</div>
          </div>
        </button>

        <button
          onClick={() => setCheckLocation(!checkLocation)}
          className={`relative flex items-center p-4 rounded-xl border transition-all ${
            checkLocation ? 'bg-cyan-950/30 border-cyan-500/50 text-cyan-100' : 'bg-slate-900 border-slate-800 text-slate-400'
          }`}
        >
          <MapPin className={`w-5 h-5 mr-3 ${checkLocation ? 'text-cyan-400' : ''}`} />
          <div className="text-left">
            <div className="font-semibold text-sm">Location Metadata</div>
            <div className="text-xs opacity-70">Verify landmarks with Maps</div>
          </div>
        </button>
      </div>

      {/* Action Button */}
      <button
        onClick={handleScan}
        disabled={!file || isAnalyzing}
        className={`w-full py-4 rounded-xl font-display font-bold text-lg tracking-wide transition-all shadow-lg ${
          !file || isAnalyzing
            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
            : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/25'
        }`}
      >
        {isAnalyzing ? (
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin" />
            ANALYZING FRAMES...
          </div>
        ) : (
          `INITIATE SCAN`
        )}
      </button>
    </div>
  );
};

export default VideoAnalyzer;