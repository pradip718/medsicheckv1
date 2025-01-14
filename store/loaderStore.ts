import {create} from 'zustand';

interface LoaderState {
  visible: boolean;
  setVisibility: (visible: boolean) => void;
  signoutModalVisibility: boolean;
  setSignoutModalVisibility: (visibility: boolean) => void;
}

const useLoaderStore = create<LoaderState>()(set => ({
  visible: false,
  setVisibility: visibility => set({visible: visibility}),
  signoutModalVisibility: false,
  setSignoutModalVisibility: visibility =>
    set({signoutModalVisibility: visibility}),
}));

export default useLoaderStore;
