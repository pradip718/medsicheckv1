import {NavigationProp, useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {Switch, View} from 'react-native';
import {Portal} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import useLanguageStore from '../../../store/languageStore';
import {MainStackParamList} from '../../../types/navigation';
import {errorToast} from '../../../utils/toast';
import GenericModal from '../../components/AlertModal/GenericModal';
import BasicContainer from '../../components/BasicContainer';
import Icon from '../../components/Icon';
import Navbar from '../../components/Navbar';
import CustomText from '../../components/Text';
import {
  useGetUserPreference,
  usePostUserPreference,
  useSendWhatsappOTP,
} from '../../hooks/api/settings';
import useGetUserAttributes from '../../hooks/api/useGetUserAttributes';
import useFullPageLoader from '../../hooks/useFullPageLoader';
import customColor from '../../theme/customColor';

type LocalUserPreference = {
  email: boolean;
  whatsapp: boolean;
  push: boolean;
};
type PreferenceKey = keyof LocalUserPreference;

const CommunicationPreferences = () => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const {languages} = useLanguageStore();
  const {showLoader, hideLoader} = useFullPageLoader();

  const [localUserPreferences, setLocalUserPreference] =
    useState<LocalUserPreference>({
      email: false,
      whatsapp: false,
      push: false,
    });
  const [isVerificationModalVisible, setIsVerificationModalVisible] =
    useState(false);

  const {data: userAttributes} = useGetUserAttributes();

  const {
    data: userPreference,
    refetch: refetchUserPreferences,
    isLoading,
  } = useGetUserPreference();
  const {mutateAsync: syncUserPreference, isPending: isSubmitting} =
    usePostUserPreference({
      onSuccess: async () => {
        await refetchUserPreferences();
      },
      onError: async error => {
        if (!error?.whatsapp_verified) {
          showVerificationModal();
        }
      },
    });

  const {mutateAsync: sendWhatsAppOTP} = useSendWhatsappOTP({
    onMutate: showLoader,
    onSuccess: () => {
      navigation?.navigate('MobileVerification');
    },
    onError: error => {
      errorToast(error?.message);
    },
    onSettled: hideLoader,
  });

  useEffect(() => {
    if (isLoading) {
      showLoader();
    } else {
      hideLoader();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  useEffect(() => {
    setLocalUserPreference({
      email: userPreference?.email_flag || false,
      whatsapp: userPreference?.whatsapp_flag || false,
      push: userPreference?.push_flag || false,
    });
  }, [userPreference]);

  const changeUserPreference = async (key: PreferenceKey, value: boolean) => {
    setLocalUserPreference(prevState => ({
      ...prevState,
      [key]: value,
    }));
    let payload = {
      email_flag: key === 'email' ? value : localUserPreferences.email,
      whatsapp_flag: key === 'whatsapp' ? value : localUserPreferences.whatsapp,
      push_flag: key === 'push' ? value : localUserPreferences.push,
      preference_id: userPreference?.preference_id,
    };
    if (!payload?.preference_id) {
      delete payload.preference_id;
    }
    try {
      await syncUserPreference(payload);
    } catch (error) {
      setLocalUserPreference(prevState => ({
        ...prevState,
        [key]: !value,
      }));
    }
  };

  const hideVerificationModal = () => {
    setIsVerificationModalVisible(false);
  };
  const showVerificationModal = () => {
    setIsVerificationModalVisible(true);
  };

  const onProceedVerification = async () => {
    hideVerificationModal();
    await sendWhatsAppOTP();
  };

  const phoneNumber = userAttributes?.phone_number;
  const maskedPhoneNumber = phoneNumber ? `****${phoneNumber.slice(-4)}` : '';

  return (
    <BasicContainer className="bg-white h-full">
      <SafeAreaView>
        <View className="p-4">
          <Navbar />
        </View>
        <View className="px-4 space-y-4 mt-10">
          <View className="flex-row items-center border border-slate-400 rounded-xl px-6 py-4 justify-between">
            <View className="flex-row space-x-2 items-center">
              <Icon name="mail" color={customColor.ultramarineBlue} size={16} />
              <CustomText className="text-sm font-isidoraMedium mediumPhone:text-lg flex-wrap">
                {languages?.email}
              </CustomText>
            </View>
            <Switch
              trackColor={{
                false: customColor.lightGrey,
                true: customColor.ultramarineBlue,
              }}
              thumbColor={'#FFF'}
              ios_backgroundColor={customColor.lightGrey}
              onValueChange={(val: boolean) =>
                changeUserPreference('email', val)
              }
              value={localUserPreferences?.email}
              style={{transform: [{scaleX: 0.8}, {scaleY: 0.8}]}}
              disabled={
                isSubmitting ||
                languages?.communication_preferences_disabled.email === 'true'
              }
            />
          </View>

          <View className="flex-row items-center border border-slate-400 rounded-xl px-6 py-4 justify-between">
            <View className="flex-row space-x-2 items-center">
              <Icon name="whatsapp" color={'#128c7e'} size={24} />
              <CustomText className="text-sm font-isidoraMedium mediumPhone:text-lg flex-wrap">
                {languages?.whatsapp}
              </CustomText>
            </View>
            <Switch
              trackColor={{
                false: customColor.lightGrey,
                true: customColor.ultramarineBlue,
              }}
              thumbColor={'#FFF'}
              ios_backgroundColor={customColor.lightGrey}
              style={{transform: [{scaleX: 0.8}, {scaleY: 0.8}]}}
              onValueChange={(val: boolean) =>
                changeUserPreference('whatsapp', val)
              }
              value={localUserPreferences?.whatsapp}
              disabled={
                isSubmitting ||
                languages?.communication_preferences_disabled.whatsapp ===
                  'true'
              }
            />
          </View>

          <View className="flex-row items-center border border-slate-400 rounded-xl px-6 py-4 justify-between">
            <View className="flex-row items-center space-x-1">
              <Icon
                name="bell-o"
                color={customColor.ultramarineBlue}
                size={20}
              />
              <CustomText className="text-sm font-isidoraMedium mediumPhone:text-lg flex-wrap">
                {languages?.notification}
              </CustomText>
            </View>
            <Switch
              trackColor={{
                false: customColor.lightGrey,
                true: customColor.ultramarineBlue,
              }}
              thumbColor={'#FFF'}
              ios_backgroundColor={customColor.lightGrey}
              style={{transform: [{scaleX: 0.8}, {scaleY: 0.8}]}}
              onValueChange={(val: boolean) =>
                changeUserPreference('push', val)
              }
              value={localUserPreferences?.push}
              disabled={
                isSubmitting ||
                languages?.communication_preferences_disabled.push === 'true'
              }
            />
          </View>
        </View>
      </SafeAreaView>
      <Portal>
        <GenericModal
          hideAlert={hideVerificationModal}
          visible={isVerificationModalVisible}
          handleOk={onProceedVerification}
          handleCancel={hideVerificationModal}
          message={{
            title: languages?.mobile_verification_message_title,
            content:
              languages?.mobile_verification_message_content +
              (phoneNumber ? '\n' + maskedPhoneNumber : ''),
          }}
        />
      </Portal>
    </BasicContainer>
  );
};

export default CommunicationPreferences;
