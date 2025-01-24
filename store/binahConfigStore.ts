import {Session} from 'biosensesignal-react-native-sdk';
import {create} from 'zustand';
import {
  AnuraConfig,
  BinahConfigResponse,
  SDK_NAME,
} from '../types/api_response';

export type BinahErrorMessage = {
  code: number;
  name: string;
  cause: string;
  solution: string;
};

interface ProfileState {
  binahConfig: BinahConfigResponse;
  setBinahConfig: (config: BinahConfigResponse) => void;
  anuraConfig: AnuraConfig;
  setAnuraConfig: (config: AnuraConfig) => void;
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
    sdk_value: '',
    demographic_flag: 'False',
    sdk_name: 'binaah',
    sdk_type: 'full_scan',
  },
  anuraConfig: {
    demographic_flag: 'False',
    scan_duration: '80',
    sdk_type: 'full_scan',
    sdk_name: 'nuralogix',
    sdk_value: {
      deepaffexAPIHostname: '',
      deepaffexLicenseKey: '',
      deepaffexStudyID: '',
    },
  },
  setBinahConfig: config => set({binahConfig: config}),
  setAnuraConfig: config => {
    console.log('setting anura config', config);
    return set({anuraConfig: config});
  },
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
