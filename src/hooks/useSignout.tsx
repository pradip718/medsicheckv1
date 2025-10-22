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
      // Try to notify server and sign out
      await notifyApi('logout');
      await signout();
    } catch (error) {
      console.log('Signout API error:', error);
      // Continue with local cleanup even if API calls fail
    } finally {
      // Always clear local state regardless of API success/failure
      try {
        // Reset all stores
        resetUserProfileState();
        setUserAuth({
          idToken: '',
          accessToken: '',
          refreshToken: '',
        });
        navigation.reset({index: 0, routes: [{name: 'Login'}]});
        queryClient.clear();
      } catch (cleanupError) {
        console.log('Cleanup error:', cleanupError);
      }

      setIsLoading(false);
    }
  };

  return {handleSignout, isLoading};
};

export default useSignout;
