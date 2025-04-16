import React from 'react';

type AudioContextType = {
  recordedTime: number;
  onSave: () => void;
};

const AudioContext = React.createContext<AudioContextType | null>(null);

export const useAudio = () => {
  const context = React.useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioContext.Provider');
  }
  return context;
};

export const AudioProvider = AudioContext.Provider;
