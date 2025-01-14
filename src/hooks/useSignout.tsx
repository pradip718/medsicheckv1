import {NavigationProp, useNavigation} from '@react-navigation/native';
import {useQueryClient} from '@tanstack/react-query';
import {useState} from 'react';
import useAuthStore from '../../store/authStore';
import useUserProfileStore from '../../store/profileStore';
import {MainStackParamList} from '../../types/navigation';
import {signout} from '../api/auth';
import {notifyApi} from '../api/user';

const useSignout = () => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const {setUserAuth} = useAuthStore();
  const {resetUserProfileState} = useUserProfileStore();

  const handleSignout = async () => {
    setIsLoading(true);
    try {
      await notifyApi('logout');
      await signout();
      setUserAuth({
        idToken: '',
        accessToken: '',
        refreshToken: '',
      });
      resetUserProfileState();
      navigation.reset({index: 0, routes: [{name: 'Login'}]});
      queryClient.clear();
    } catch (error) {
      console.log('error', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {handleSignout, isLoading};
};

export default useSignout;
