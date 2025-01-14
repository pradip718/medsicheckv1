import {useQueryClient} from '@tanstack/react-query';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Modal} from 'react-native-paper';
import {navigationRef} from '../../../RootNavigation';
import useAuthStore from '../../../store/authStore';
import useLanguageStore from '../../../store/languageStore';
import useLoaderStore from '../../../store/loaderStore';
import useUserProfileStore from '../../../store/profileStore';
import {signout} from '../../api/auth';
import {notifyApi} from '../../api/user';
import useFullPageLoader from '../../hooks/useFullPageLoader';
import RoundedButton from '../RoundedButton';
import CustomText from '../Text';

const SignoutModal = ({visible}: {visible: boolean}) => {
  const {setSignoutModalVisibility} = useLoaderStore();
  const {languages} = useLanguageStore();
  const {setUserAuth} = useAuthStore();
  const {resetUserProfileState} = useUserProfileStore();
  const hideModal = () => setSignoutModalVisibility(false);
  const queryClient = useQueryClient();
  const {showLoader, hideLoader} = useFullPageLoader();

  const onProceed = async () => {
    showLoader();
    try {
      await notifyApi('logout');
      await signout();
      setUserAuth({
        idToken: '',
        accessToken: '',
        refreshToken: '',
      });
      resetUserProfileState();
      navigationRef?.reset({index: 0, routes: [{name: 'Login'}]});
      queryClient.clear();
    } catch (error) {
      console.log('error', error);
    } finally {
      hideModal();
      hideLoader();
    }
  };
  return (
    <Modal
      visible={visible}
      onDismiss={hideModal}
      style={styles.modalStyle}
      contentContainerStyle={styles.modalContentContainer}>
      <View className="justify-center items-center bg-white h-[160px] min-w-[240px] max-w-[300px] rounded-3xl">
        <CustomText className="text-lg font-isidoraSemiBold">
          {languages?.close_app}
        </CustomText>
        <View className="flex-row mt-4 justify-center space-x-4  w-full">
          <RoundedButton
            resetStyle
            className="px-4 py-2 bg-gray-400"
            onPress={hideModal}>
            <CustomText className="text-white font-isidoraMedium text-sm">
              {languages?.cancel}
            </CustomText>
          </RoundedButton>
          <RoundedButton
            resetStyle
            className="px-4 py-2 bg-red-500"
            onPress={onProceed}>
            <CustomText className="text-white font-isidoraMedium text-sm">
              {languages?.sign_out}
            </CustomText>
          </RoundedButton>
        </View>
      </View>
    </Modal>
  );
};

export default SignoutModal;

const styles = StyleSheet.create({
  modalContentContainer: {
    // paddingTop: 170,
    // marginRight: 20,
  },
  modalStyle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
