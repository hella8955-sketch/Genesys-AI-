import React, { useState } from 'react';
import { Film, Image as ImageIcon, Wand2, Loader2, Lock } from 'lucide-react';
import { generateVeoVideo, generateProImage, editImageWithNano } from '../services/geminiService';

const MediaLab: React.FC = () => {
  const [tab, setTab] = useState<'veo' | 'gen-img' | 'edit-img'>('veo');
  const [prompt, setPrompt] = useState('');
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // For Edit Image
  const [editFile, setEditFile] = useState<File | null>(null);

  const getAIStudio = () => (window as any).aistudio;

  const ensureKey = async (): Promise<boolean> => {
    const aistudio = getAIStudio();
    if (!aistudio) {
        // Fallback for dev env without the specific wrapper, though strictly requested to use it.
        // If undefined, we can't select. We'll proceed assuming process.env.API_KEY is paid or try user prompt.
        // However, per instructions: "add a button which calls await window.aistudio.openSelectKey()"
        return true; 
    }
    const hasKey = await aistudio.hasSelectedApiKey();
    if (!hasKey) {
      await aistudio.openSelectKey();
      // Per instructions: Assume successful after trigger
      return true; 
    }
    return true;
  };

  const handleVeo = async () => {
    setLoading(true);
    setError(null);
    setResultUrl(null);
    try {
      if (getAIStudio()) await ensureKey();
      // Re-get API key from env as it might be injected now? 
      // Actually instruction says: "The selected API key is available via process.env.API_KEY"
      // But we need to handle the case where it might be missing initially.
      
      const url = await generateVeoVideo({
        prompt,
        resolution: '720p',
        aspectRatio: '16:9'
      }, process.env.API_KEY!);
      setResultUrl(url);
    } catch (e: any) {
        if(e.message?.includes('Requested entity was not found') && getAIStudio()) {
            await getAIStudio().openSelectKey();
        }
        setError("Generation failed. Ensure you have a paid Project selected.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenImage = async () => {
    setLoading(true);
    setError(null);
    setResultUrl(null);
    try {
      if(getAIStudio()) await ensureKey();
      const base64 = await generateProImage({
        prompt,
        size: '1K',
        aspectRatio: '16:9'
      }, process.env.API_KEY!);
      setResultUrl(base64);
    } catch (e) {
      setError("Image generation failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditImage = async () => {
    if (!editFile) return;
    setLoading(true);
    setError(null);
    setResultUrl(null);
    try {
        const reader = new FileReader();
        reader.readAsDataURL(editFile);
        reader.onload = async () => {
            const b64 = (reader.result as string).split(',')[1];
            try {
                const res = await editImageWithNano(b64, prompt);
                setResultUrl(res);
            } catch(e) { setError("Edit failed"); }
            finally { setLoading(false); }
        };
    } catch (e) {
        setError("Error processing file");
        setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex space-x-2 bg-slate-900 p-1 rounded-xl">
        <button onClick={() => setTab('veo')} className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 ${tab === 'veo' ? 'bg-cyan-900/50 text-cyan-400' : 'text-slate-400'}`}>
            <Film size={18} /> Veo Video
        </button>
        <button onClick={() => setTab('gen-img')} className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 ${tab === 'gen-img' ? 'bg-cyan-900/50 text-cyan-400' : 'text-slate-400'}`}>
            <ImageIcon size={18} /> Pro Image
        </button>
        <button onClick={() => setTab('edit-img')} className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2 ${tab === 'edit-img' ? 'bg-cyan-900/50 text-cyan-400' : 'text-slate-400'}`}>
            <Wand2 size={18} /> Magic Edit
        </button>
      </div>

      <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 space-y-4">
        <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={tab === 'edit-img' ? "What should be changed? (e.g., 'Make it cybernetic')" : "Describe what you want to generate..."}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-cyan-500 outline-none h-32 resize-none"
        />

        {tab === 'edit-img' && (
             <input type="file" accept="image/*" onChange={(e) => setEditFile(e.target.files?.[0] || null)} className="text-slate-400 text-sm" />
        )}

        <div className="flex justify-between items-center">
            {getAIStudio() && (tab === 'veo' || tab === 'gen-img') && (
                 <button onClick={() => getAIStudio()?.openSelectKey()} className="text-xs text-slate-500 hover:text-cyan-400 flex items-center gap-1">
                    <Lock size={12} /> Select Paid Key
                 </button>
            )}
            <div className="flex-1"></div>
            <button 
                onClick={tab === 'veo' ? handleVeo : tab === 'gen-img' ? handleGenImage : handleEditImage}
                disabled={loading || !prompt}
                className={`px-6 py-2 rounded-lg font-bold flex items-center gap-2 ${loading || !prompt ? 'bg-slate-700 text-slate-500' : 'bg-cyan-500 text-slate-900'}`}
            >
                {loading && <Loader2 className="animate-spin" size={16} />}
                GENERATE
            </button>
        </div>

        {error && <div className="text-red-400 text-sm bg-red-950/20 p-3 rounded">{error} <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="underline">Billing Docs</a></div>}

        {resultUrl && (
            <div className="mt-6 rounded-lg overflow-hidden border border-slate-700 bg-black">
                {tab === 'veo' ? (
                    <video src={resultUrl} controls className="w-full" autoPlay loop />
                ) : (
                    <img src={resultUrl} alt="Result" className="w-full" />
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default MediaLab;