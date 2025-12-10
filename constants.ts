export const MODELS = {
  ANALYSIS_VIDEO: 'gemini-3-pro-preview', // Video understanding
  ANALYSIS_FAST: 'gemini-2.5-flash-lite-latest', // Fast responses
  CHECK_FACTS: 'gemini-2.5-flash', // Search/Maps grounding
  CHAT: 'gemini-3-pro-preview', // High quality chat
  LIVE: 'gemini-2.5-flash-native-audio-preview-09-2025', // Live API
  TTS: 'gemini-2.5-flash-preview-tts', // Speech
  IMAGE_GEN: 'gemini-3-pro-image-preview', // High quality image gen
  IMAGE_EDIT: 'gemini-2.5-flash-image', // Image editing (nano banana)
  VIDEO_GEN: 'veo-3.1-fast-generate-preview' // Video generation
};

export const MOCK_HISTORY = [
  {
    id: '1',
    thumbnail: 'https://picsum.photos/100/100?random=1',
    fileName: 'speech_v1.mp4',
    timestamp: Date.now() - 10000000,
    score: 92,
    result: 'Real'
  },
  {
    id: '2',
    thumbnail: 'https://picsum.photos/100/100?random=2',
    fileName: 'interview_clip.mov',
    timestamp: Date.now() - 5000000,
    score: 15,
    result: 'Fake'
  }
] as const;