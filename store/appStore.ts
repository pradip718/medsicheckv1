import {create} from 'zustand';

interface screen {
  previous: string;
  current: string;
}

interface AppState {
  screenName: screen;
  isFaceScanDeeplink: boolean;
  setScreenName(screen: screen): void;
  setIsFaceScanDeeplink(isFaceScan: boolean): void;
}

const useAppStore = create<AppState>(set => ({
  screenName: {
    current: '',
    previous: '',
  }, // Change from {} to null
  isFaceScanDeeplink: false,
  setScreenName: screen =>
    set({
      screenName: {
        current: screen.current,
        previous: screen.previous,
      },
    }),
  setIsFaceScanDeeplink: isFaceScan => set({isFaceScanDeeplink: isFaceScan}),
}));

export default useAppStore;
