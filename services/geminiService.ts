
import { GoogleGenAI, Type } from "@google/genai";
import { MODELS } from "../constants";
import { AnalysisResult } from "../types";

// Helper to get client (handles API Key selection for paid features if needed)
export const getGenAIClient = (apiKeyOverride?: string) => {
  const apiKey = apiKeyOverride || process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

// --- CORE ANALYSIS ---

export const analyzeVideo = async (
  fileBase64: string, 
  mimeType: string, 
  checkSearch: boolean,
  checkLocation: boolean,
  userLocation?: { lat: number, lng: number }
): Promise<AnalysisResult> => {
  const ai = getGenAIClient();
  
  // 1. Core Deepfake Analysis (Gemini 3 Pro)
  // We use JSON schema to get structured data about the "Truth"
  const schema = {
    type: Type.OBJECT,
    properties: {
      score: { type: Type.INTEGER, description: "0-100 likelihood of being REAL content." },
      verdict: { type: Type.STRING, enum: ["Real", "Fake", "Uncertain"] },
      details: { type: Type.STRING, description: "Detailed explanation of findings." },
      anomalies: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of visual/audio artifacts found." }
    },
    required: ["score", "verdict", "details", "anomalies"]
  };

  const model = MODELS.ANALYSIS_VIDEO;
  
  const analysisResponse = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { inlineData: { data: fileBase64, mimeType } },
        { text: "Analyze this video for signs of deepfake manipulation, AI generation, or inconsistencies. Provide a truth score." }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
      systemInstruction: "You are a forensic video expert. Be critical."
    }
  });

  const analysisData = JSON.parse(analysisResponse.text || "{}");

  // 2. Optional Grounding Checks (Parallel)
  let searchResult = undefined;
  let locationResult = undefined;

  if (checkSearch || checkLocation) {
    // Separate call for grounding as it requires specific tools and flash model is faster/cheaper for this
    const grounderAI = getGenAIClient();
    const tools: any[] = [];
    if (checkSearch) tools.push({ googleSearch: {} });
    if (checkLocation) tools.push({ googleMaps: {} });

    const toolConfig: any = {};
    if (checkLocation && userLocation) {
      toolConfig.retrievalConfig = {
        latLng: { latitude: userLocation.lat, longitude: userLocation.lng }
      };
    }

    try {
      const groundingResponse = await grounderAI.models.generateContent({
        model: MODELS.CHECK_FACTS,
        contents: {
          parts: [
             { inlineData: { data: fileBase64, mimeType } },
             { text: "Verify the events or locations depicted in this video using Google Search and Maps if relevant." }
          ]
        },
        config: { tools, toolConfig }
      });

      const chunks = groundingResponse.candidates?.[0]?.groundingMetadata?.groundingChunks;
      
      if (checkSearch && chunks) {
         // Filter for web chunks
         const webSources = chunks.filter((c: any) => c.web).map((c: any) => ({ title: c.web.title, uri: c.web.uri }));
         if (webSources.length > 0) {
            searchResult = { verified: true, sources: webSources };
         }
      }

      if (checkLocation && chunks) {
        // Filter for map chunks
        const mapSources = chunks.filter((c: any) => c.maps).map((c: any) => ({ title: c.maps.title, uri: c.maps.uri }));
        if (mapSources.length > 0) {
            locationResult = { verified: true, matches: mapSources };
        }
      }

    } catch (e) {
      console.error("Grounding failed", e);
    }
  }

  return {
    ...analysisData,
    searchVerification: searchResult,
    locationVerification: locationResult
  };
};

// --- CHAT ---

export const sendChatMessage = async (history: {role: string, parts: {text: string}[]}[], message: string) => {
  const ai = getGenAIClient();
  const chat = ai.chats.create({
    model: MODELS.CHAT,
    history: history,
    config: { systemInstruction: "You are Genesys, an AI security assistant." }
  });
  
  const result = await chat.sendMessage({ message });
  return result.text;
};

// --- MEDIA GENERATION ---

export const generateVeoVideo = async (
  params: { prompt: string; resolution: string; aspectRatio: string },
  apiKey: string
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey }); // Use the specific key provided (user selected paid key)
  
  let operation = await ai.models.generateVideos({
    model: MODELS.VIDEO_GEN,
    prompt: params.prompt,
    config: {
      numberOfVideos: 1,
      resolution: params.resolution as '720p' | '1080p',
      aspectRatio: params.aspectRatio as '16:9' | '9:16'
    }
  });

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    operation = await ai.operations.getVideosOperation({operation});
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) throw new Error("Video generation failed to return a URI");

  // Fetch content with key to get displayable blob
  const response = await fetch(`${downloadLink}&key=${apiKey}`);
  if (!response.ok) throw new Error("Failed to download video content");

  const blob = await response.blob();
  return URL.createObjectURL(blob);
};

export const generateProImage = async (
  params: { prompt: string; size: string; aspectRatio: string },
  apiKey: string
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey });
  
  const response = await ai.models.generateContent({
    model: MODELS.IMAGE_GEN,
    contents: {
      parts: [{ text: params.prompt }]
    },
    config: {
      imageConfig: {
        aspectRatio: params.aspectRatio as "16:9" | "1:1" | "3:4" | "4:3" | "9:16",
        imageSize: params.size as "1K" | "2K" | "4K"
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData && part.inlineData.data) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image data generated");
};

export const editImageWithNano = async (
  base64Image: string,
  prompt: string
): Promise<string> => {
  const ai = getGenAIClient();
  
  const response = await ai.models.generateContent({
    model: MODELS.IMAGE_EDIT,
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Image,
            mimeType: 'image/png' // Assuming standard image
          }
        },
        { text: prompt }
      ]
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData && part.inlineData.data) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("Image edit failed");
};

// --- AUDIO HELPERS ---

/**
 * Encodes a Uint8Array to a base64 string.
 */
export function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Decodes a base64 string to a Uint8Array.
 */
export function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Decodes raw PCM audio data into an AudioBuffer for playback.
 */
export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

/**
 * Creates a base64-encoded PCM blob from Float32 audio data.
 */
export function createBlob(data: Float32Array): { data: string; mimeType: string } {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}
