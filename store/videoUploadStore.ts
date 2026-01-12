import {create} from 'zustand';

interface VideoUploadState {
  isUploading: boolean;
  progress: number;
  readingId: string | null;
  setUploadProgress: (progress: number) => void;
  startUpload: (readingId: string) => void;
  completeUpload: () => void;
  resetUpload: () => void;
}

const useVideoUploadStore = create<VideoUploadState>()(set => ({
  isUploading: false,
  progress: 0,
  readingId: null,
  setUploadProgress: progress => set({progress}),
  startUpload: readingId => set({isUploading: true, progress: 0, readingId}),
  completeUpload: () => set({isUploading: false, progress: 100}),
  resetUpload: () => set({isUploading: false, progress: 0, readingId: null}),
}));

export default useVideoUploadStore;
