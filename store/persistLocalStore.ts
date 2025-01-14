import AsyncStorage from '@react-native-async-storage/async-storage';
import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';
import {HOMEPAGE_WALKTHROUGH} from '../src/constants/AsyncStorageKeys';
import useWalkthroughStore from './walkthroughStore';

// Define the screen names
type ScreenName = 'homepage' | 'single-report' | 'multiple-report'; // Add more screens as needed

interface PersistState {
  userVisitedWalkthrough: {
    [screen in ScreenName]?: string[]; // Track visited walkthroughs per screen
  };
  setUserVisitedWalkthrough: (userId: string) => void;
  resetWalkthroughState: () => void;
}

const usePersistLocalStore = create<PersistState>()(
  persist(
    set => ({
      userVisitedWalkthrough: {},
      setUserVisitedWalkthrough: userId =>
        set(state => {
          const screenWalkthroughs =
            state.userVisitedWalkthrough[
              useWalkthroughStore.getState().currentWalkthroughScreen
            ] || [];
          return {
            userVisitedWalkthrough: {
              ...state.userVisitedWalkthrough,
              [useWalkthroughStore.getState().currentWalkthroughScreen]:
                screenWalkthroughs.includes(userId)
                  ? screenWalkthroughs
                  : [...screenWalkthroughs, userId],
            },
          };
        }),
      resetWalkthroughState: () => set({userVisitedWalkthrough: {}}),
    }),
    {
      name: HOMEPAGE_WALKTHROUGH,
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export default usePersistLocalStore;
