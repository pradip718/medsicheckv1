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

interface AuthStore {
  userAuth: AuthState | null;
  setUserAuth: (user: AuthState) => void;
  deeplinkAuth: DeeplinkState | null;
  setDeeplinkAuth: (user: DeeplinkState | null) => void;
}

const useAuthStore = create<AuthStore>(set => ({
  userAuth: null,
  deeplinkAuth: null,
  setUserAuth: user => set({userAuth: user}),
  setDeeplinkAuth: deeplinkDetails => set({deeplinkAuth: deeplinkDetails}),
}));

export default useAuthStore;
