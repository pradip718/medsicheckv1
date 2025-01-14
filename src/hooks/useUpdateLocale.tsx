import {useEffect} from 'react';
import {AppState, AppStateStatus} from 'react-native';
import useAuthStore from '../../store/authStore';
import {updateLocaleInfo} from '../../utils/methods';

const useUpdateLocale = () => {
  const {userAuth} = useAuthStore();

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      (appState: AppStateStatus) => {
        if (appState === 'active' && userAuth?.idToken) {
          updateLocaleInfo();
        }
      },
    );

    return subscription.remove;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (userAuth?.idToken) {
      updateLocaleInfo();
    }
  }, [userAuth]);

  return {};
};

export default useUpdateLocale;
