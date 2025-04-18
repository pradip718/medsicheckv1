import {create} from 'zustand';
import {VoiceScanReport} from '../types/api_response';

interface VoiceScabState {
  reportDetail: VoiceScanReport | null;
  setReportDetail: (report: VoiceScanReport | null) => void;
}

const useVoiceScanStore = create<VoiceScabState>(set => ({
  reportDetail: null,
  setReportDetail: report => set({reportDetail: report}),
  resetReportDetail: () => set({reportDetail: null}),
}));

export default useVoiceScanStore;
