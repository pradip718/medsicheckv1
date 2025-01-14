// import Toast, {ToastOptions} from 'react-native-toast-message';
import Toast, {ToastOptions} from 'react-native-toast-message';
import useLanguageStore from '../store/languageStore';

export const successToast = (
  message: string = 'Done!',
  options: ToastOptions = {},
) => {
  Toast.show({
    type: 'success',
    text1: message || 'Something went wrong',
    position: 'top',
    visibilityTime: 3000,
    topOffset: 60,
    ...options,
  });
};

export const errorToast = (
  message: string = useLanguageStore.getState().languages
    ?.generic_error_message,
  options: ToastOptions = {},
) => {
  Toast.show({
    type: 'error',
    text1: message || '',
    position: 'top',
    visibilityTime: 3000,
    topOffset: 60,
    ...options,
  });
};

export const infoToast = (message: string, options: ToastOptions = {}) => {
  Toast.show({
    type: 'info',
    text1: message || 'Something went wrong',
    position: 'top',
    visibilityTime: 3000,
    topOffset: 60,
    ...options,
  });
};
