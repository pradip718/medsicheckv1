import {create} from 'zustand';

interface UserState {
  name: string;
  email?: string;
}

interface ProfileState {
  currentUserDetails: UserState;
  setCurrentUserDetails: (user: UserState) => void;
  currentActiveProfileId: string;
  setCurrentActiveProfileId: (profileId: string) => void;
  walkthroughVisibility: boolean;
  setIsWalkThroughVisible: (visible: boolean) => void;
  resetUserProfileState: () => void;
}

const initialState = {
  currentUserDetails: {name: ''},
  currentActiveProfileId: '',
  walkthroughVisibility: false,
};

const useUserProfileStore = create<ProfileState>()(set => ({
  ...initialState,
  setCurrentUserDetails: user => set({currentUserDetails: user}),
  setCurrentActiveProfileId: profileId =>
    set({currentActiveProfileId: profileId}),
  setIsWalkThroughVisible: visible => set({walkthroughVisibility: visible}),
  resetUserProfileState: () => set(initialState),
}));

export default useUserProfileStore;
