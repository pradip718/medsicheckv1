import {EncryptionAlgorithmSpec} from '@aws-sdk/client-kms';
import {create} from 'zustand';

interface AuthState {
  idToken: string;
  accessToken: string;
  refreshToken?: string;
}

interface DeeplinkState {
  token: string;
  session_id: string;
}

interface AWSCredentials {
  access_key: string;
  secret_access_key: string;
  kms_arn: string;
  kms_algorithm: EncryptionAlgorithmSpec;
}

interface AuthStore {
  userAuth: AuthState | null;
  setUserAuth: (user: AuthState) => void;
  deeplinkAuth: DeeplinkState | null;
  awsCred: AWSCredentials | null;
  setDeeplinkAuth: (user: DeeplinkState | null) => void;
  setAWSCred: (client: AWSCredentials | null) => void;
}

const useAuthStore = create<AuthStore>(set => ({
  userAuth: null,
  deeplinkAuth: null,
  awsCred: null,
  setUserAuth: user => set({userAuth: user}),
  setDeeplinkAuth: deeplinkDetails => set({deeplinkAuth: deeplinkDetails}),
  setAWSCred: cred => set({awsCred: cred}),
}));

export default useAuthStore;
