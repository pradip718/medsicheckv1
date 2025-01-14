import {create} from 'zustand';

export type FaceScanParams = {
  startMeasurement: () => void;
  proceedToReportScreen: () => Promise<void>;
};

type DefaultParams = {};

type Message<T> = {
  title: string;
  content: string;
  params?: T;
};

type Action = {
  onOkPressed: () => void;
  onCancelPressed: () => void;
};

interface AlertState<T = DefaultParams> {
  visible: boolean;
  showAlert: <P extends T>(message: Message<P>, action?: Action) => void;
  hideAlert: () => void;
  message?: Message<T>;
  action?: Action | null;
}

const useAlertStore = create<AlertState>()(set => ({
  visible: false,
  showAlert: (message, action) => set({visible: true, message, action}),
  hideAlert: () =>
    set({
      visible: false,
      message: {title: '', content: ''},
      action: null,
    }),
}));

export default useAlertStore;
