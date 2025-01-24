import {Session} from 'biosensesignal-react-native-sdk';
import {create} from 'zustand';
import {AnuraConfigResponse, SDK_NAME} from '../types/api_response';

export type BinahConfig = {
  scan_duration: string;
  binaah_sdk_key: string;
  demographic_flag: 'True' | 'False';
};
export type BinahErrorMessage = {
  code: number;
  name: string;
  cause: string;
  solution: string;
};

interface ProfileState {
  binahConfig: BinahConfig;
  setBinahConfig: (config: BinahConfig) => void;
  anuraConfig: AnuraConfigResponse;
  setAnuraConfig: (config: AnuraConfigResponse) => void;
  currentSdk: SDK_NAME | null;
  setCurrentSdk: (sdk: SDK_NAME) => void;
  errorMessages: BinahErrorMessage[];
  setErrorMessage: (errors: BinahErrorMessage[]) => void;

  session?: Session;
  setSession: (newSession: Session | undefined) => void;
}

const useBinahConfigStore = create<ProfileState>()(set => ({
  binahConfig: {
    scan_duration: '80',
    binaah_sdk_key: '',
    demographic_flag: 'False',
  },
  setBinahConfig: (config: BinahConfig) => set({binahConfig: config}),
  anuraConfig: {
    demographic_flag: 'False',
    scan_duration: '80',
    sdk_type: 'vital_scan',
    sdk_name: 'neurologix',
    sdk_value: {
      deepaffexAPIHostname: '',
      deepaffexLicenseKey: '',
      deepaffexStudyID: '',
    },
  },
  setAnuraConfig: (config: AnuraConfigResponse) => set({anuraConfig: config}),
  currentSdk: null,
  setCurrentSdk: (sdk: SDK_NAME) => set({currentSdk: sdk}),
  errorMessages: [],
  setErrorMessage: (errors: BinahErrorMessage[]) =>
    set({errorMessages: errors}),

  session: undefined,
  setSession: newSession => {
    set({session: newSession});
  },
}));

export default useBinahConfigStore;
