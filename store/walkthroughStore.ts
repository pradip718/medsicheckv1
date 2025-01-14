import {create} from 'zustand';

interface Walkthrough {
  order: number;
  visible: boolean;
}

export type WalkthroughKey =
  | 'scan_button'
  | 'menu_button'
  | 'drawer_button'
  | 'view_report'
  | 'share_report'
  | 'report_history'
  | 'dashboard_personalised_report';

type ScreenName = 'homepage' | 'single-report' | 'multiple-report';

type State = {
  currentWalkthroughScreen: ScreenName;
  userVisitedWalkthrough: string[];
  isWalkthroughVisible: boolean;
  walkthroughs: {
    [screen in ScreenName]: {
      [key in WalkthroughKey]?: Walkthrough; // WalkthroughKey is optional as not all screens may have all keys
    };
  };
};

interface WalkthroughState extends State {
  setCurrentWalkthroughScreen: (screen: ScreenName) => void;
  setUserVisitedWalkthrough: (walkthrough: string) => void;
  setWalkthrough: (
    screen: ScreenName,
    key: WalkthroughKey,
    order: number,
    visible: boolean,
  ) => void;
  showNextWalkthrough: (currentOrder: number) => void;
  showPreviousWalkthrough: (currentOrder: number) => void;
  startWalkthrough: (key: WalkthroughKey) => void;
  isFirstWalkthrough: (currentOrder: number) => boolean;
  isLastWalkthrough: (currentOrder: number) => boolean;
  setIsWalkthroughVisible: (walkthrough_state: boolean) => void;
  endWalkthrough: (screen: ScreenName) => void;
  isAnyWalkthroughVisible: () => boolean;
  resetState: () => State;
  combineWalkthrough: (
    baseWalkthrough: ScreenName,
    toCombine: ScreenName,
  ) => void;
}

const intiialState: State = {
  currentWalkthroughScreen: 'homepage',

  userVisitedWalkthrough: [],
  isWalkthroughVisible: false,
  walkthroughs: {
    homepage: {
      menu_button: {order: 1, visible: false},
      scan_button: {order: 2, visible: false},
      drawer_button: {order: 3, visible: false},
    },
    'single-report': {
      view_report: {order: 1, visible: false},
      share_report: {order: 2, visible: false},
    },
    'multiple-report': {
      report_history: {order: 1, visible: false},
      dashboard_personalised_report: {order: 2, visible: false},
    },
  },
};

const useWalkthroughStore = create<WalkthroughState>(set => ({
  ...intiialState,
  setCurrentWalkthroughScreen: screen =>
    set({currentWalkthroughScreen: screen}),
  setUserVisitedWalkthrough: walkthrough =>
    set(state => ({
      userVisitedWalkthrough: [...state.userVisitedWalkthrough, walkthrough],
    })),

  setWalkthrough: (screen, key, order, visible) =>
    set(state => ({
      walkthroughs: {
        ...state.walkthroughs,
        [screen]: {
          ...state.walkthroughs[screen],
          [key]: {order, visible},
        },
      },
    })),

  combineWalkthrough: (baseWalkthrough, toCombineWalkthrough) =>
    set(state => {
      const baseSteps = intiialState.walkthroughs[baseWalkthrough];
      const toCombineSteps = intiialState.walkthroughs[toCombineWalkthrough];
      const maxOrder = Math.max(...Object.values(baseSteps).map(w => w.order));
      const updatedWalkthrough = {
        walkthroughs: {
          ...state.walkthroughs,
          [baseWalkthrough]: {
            ...baseSteps,
            ...Object.fromEntries(
              Object.entries(toCombineSteps).map(([key, value]) => [
                key,
                {...value, order: value.order + maxOrder},
              ]),
            ),
          },
          [toCombineWalkthrough]: Object.fromEntries(
            Object.entries(toCombineSteps).map(([key, value]) => [
              key,
              {...value, visible: false},
            ]),
          ),
        },
      };
      console.log('combine walkthrough', updatedWalkthrough);

      return updatedWalkthrough;
    }),
  showNextWalkthrough: currentOrder =>
    set(state => {
      const screen = state.currentWalkthroughScreen;
      const steps = state.walkthroughs[screen];
      const currentStepKey = Object.keys(steps).find(
        key => steps[key as WalkthroughKey]?.order === currentOrder,
      ) as WalkthroughKey;
      const nextStepKey = Object.keys(steps).find(
        key => steps[key as WalkthroughKey]?.order === currentOrder + 1,
      ) as WalkthroughKey;
      console.log('state', state);
      console.log('currentStepKey', currentStepKey);
      console.log('previousStepKey', nextStepKey);
      console.log('steps', steps);
      console.log('steps[currentStepKey]', steps[currentStepKey]);
      const updatedWalkthrough = {
        walkthroughs: {
          ...state.walkthroughs,
          [screen]: {
            ...steps,
            [currentStepKey]: {
              ...steps[currentStepKey],
              visible: false,
            },
            [nextStepKey]: {
              ...steps[nextStepKey],
              visible: true,
            },
          },
        },
      };
      console.log('updatedWalkthrough', updatedWalkthrough);

      if (currentStepKey && nextStepKey) {
        return updatedWalkthrough;
      }
      return state;
    }),
  showPreviousWalkthrough: currentOrder =>
    set(state => {
      const screen = state.currentWalkthroughScreen;
      const steps = state.walkthroughs[screen];
      const currentStepKey = Object.keys(steps).find(
        key => steps[key as WalkthroughKey]?.order === currentOrder,
      ) as WalkthroughKey;
      const previousStepKey = Object.keys(steps).find(
        key => steps[key as WalkthroughKey]?.order === currentOrder - 1,
      ) as WalkthroughKey;

      if (currentStepKey && previousStepKey) {
        return {
          walkthroughs: {
            ...state.walkthroughs,
            [screen]: {
              ...steps,
              [currentStepKey]: {
                ...steps[currentStepKey],
                visible: false,
              },
              [previousStepKey]: {
                ...steps[previousStepKey],
                visible: true,
              },
            },
          },
        };
      }
      return state;
    }),
  startWalkthrough: key =>
    set(state => ({
      walkthroughs: {
        ...state.walkthroughs,
        [state.currentWalkthroughScreen]: {
          ...state.walkthroughs[state.currentWalkthroughScreen],
          [key]: {
            ...state.walkthroughs[state.currentWalkthroughScreen][key],
            visible: true,
          },
        },
      },
    })),
  isFirstWalkthrough: currentOrder => {
    return currentOrder === 1;
  },
  isLastWalkthrough: currentOrder => {
    const steps =
      useWalkthroughStore.getState().walkthroughs[
        useWalkthroughStore.getState().currentWalkthroughScreen
      ];
    const maxOrder = Math.max(...Object.values(steps).map(w => w.order));
    return currentOrder === maxOrder;
  },
  endWalkthrough: () =>
    set(state => ({
      ...intiialState,
      currentWalkthroughScreen: state.currentWalkthroughScreen,
    })),
  setIsWalkthroughVisible: walkthrough_state =>
    set(() => ({
      isWalkthroughVisible: walkthrough_state,
    })),

  isAnyWalkthroughVisible: () => {
    const state = useWalkthroughStore.getState();
    for (const screen in state.walkthroughs) {
      if (Object.prototype.hasOwnProperty.call(state.walkthroughs, screen)) {
        const steps = state.walkthroughs[screen as ScreenName];
        for (const key in steps) {
          if (Object.prototype.hasOwnProperty.call(steps, key)) {
            if (steps[key as WalkthroughKey]?.visible) {
              return true;
            }
          }
        }
      }
    }
    return false;
  },

  resetState: () => intiialState,
}));

export default useWalkthroughStore;
