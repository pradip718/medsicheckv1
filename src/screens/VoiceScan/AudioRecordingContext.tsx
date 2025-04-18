import React from 'react';
import {VoiceScanImageDataResponse} from '../../../types/api_response';

type AudioContextType = {
  recordedTime: number;
  onSave: () => void;
  imageData: VoiceScanImageDataResponse | undefined;
  onSetSession: (session: string) => void;
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
