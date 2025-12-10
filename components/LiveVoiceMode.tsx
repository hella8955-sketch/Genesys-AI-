import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Volume2, Activity } from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { createBlob, decode, decodeAudioData } from '../services/geminiService';
import { MODELS } from '../constants';

const LiveVoiceMode: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Refs for audio handling
  const nextStartTimeRef = useRef<number>(0);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);

  const cleanup = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (inputAudioContextRef.current) {
      inputAudioContextRef.current.close();
      inputAudioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
      outputAudioContextRef.current.close();
      outputAudioContextRef.current = null;
    }
    sourcesRef.current.forEach(s => s.stop());
    sourcesRef.current.clear();
    setIsConnected(false);
  };

  const startSession = async () => {
    try {
      setError(null);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Init Audio Contexts
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      inputAudioContextRef.current = inputCtx;
      outputAudioContextRef.current = outputCtx;
      const outputNode = outputCtx.createGain();
      outputNode.connect(outputCtx.destination); // Connect to speakers

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const sessionPromise = ai.live.connect({
        model: MODELS.LIVE,
        callbacks: {
          onopen: () => {
            console.log("Live Session Open");
            setIsConnected(true);
            
            // Audio In Pipeline
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
               const inputData = e.inputBuffer.getChannelData(0);
               const pcmBlob = createBlob(inputData);
               sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            // Audio Out Pipeline
            const base64Audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), outputCtx, 24000, 1);
              
              const source = outputCtx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputNode);
              source.addEventListener('ended', () => sourcesRef.current.delete(source));
              
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }

            if (msg.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => {
            console.log("Session Closed");
            setIsConnected(false);
          },
          onerror: (e) => {
            console.error("Live Error", e);
            setError("Connection error");
            setIsConnected(false);
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: "You are Genesys, an advanced AI security interface. Speak clearly and concisely.",
        }
      });
      
      sessionRef.current = await sessionPromise;

    } catch (e) {
      console.error(e);
      setError("Failed to start audio session. Check permissions.");
      cleanup();
    }
  };

  useEffect(() => {
    return cleanup;
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-[600px] w-full max-w-4xl mx-auto">
      <div className={`relative w-48 h-48 rounded-full flex items-center justify-center transition-all duration-500 ${
        isConnected ? 'bg-cyan-500/20 shadow-[0_0_50px_rgba(34,211,238,0.4)] animate-pulse' : 'bg-slate-800'
      }`}>
        <div className={`w-32 h-32 rounded-full flex items-center justify-center border-2 ${
          isConnected ? 'border-cyan-400' : 'border-slate-600'
        }`}>
            {isConnected ? <Activity className="w-16 h-16 text-cyan-400 animate-bounce" /> : <Volume2 className="w-16 h-16 text-slate-500" />}
        </div>
      </div>

      <div className="mt-8 text-center space-y-2">
        <h2 className="text-2xl font-display font-bold text-white">Secure Voice Channel</h2>
        <p className="text-slate-400">{isConnected ? "Listening... Speak naturally." : "Start session to speak with Genesys AI."}</p>
        {error && <p className="text-red-400 text-sm">{error}</p>}
      </div>

      <button
        onClick={isConnected ? cleanup : startSession}
        className={`mt-8 px-8 py-4 rounded-full font-bold flex items-center gap-2 transition-all ${
          isConnected 
            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
            : 'bg-cyan-500 text-slate-900 hover:bg-cyan-400 shadow-lg shadow-cyan-500/20'
        }`}
      >
        {isConnected ? (
          <>
            <MicOff className="w-5 h-5" /> Terminate Link
          </>
        ) : (
          <>
            <Mic className="w-5 h-5" /> Initialize Voice
          </>
        )}
      </button>
    </div>
  );
};

export default LiveVoiceMode;
