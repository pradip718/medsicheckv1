import {View} from 'moti';
import React, {useEffect, useState} from 'react';
import {Linking, Platform, ScrollView, StyleSheet} from 'react-native';
import Config from 'react-native-config';
import {Dialog, Portal} from 'react-native-paper';
import VersionCheck from 'react-native-version-check';
import useLanguageStore, {Language} from '../../../store/languageStore';
import {CheckAppUpdateResponse} from '../../../types/api_response';
import {getFcmToken} from '../../../utils/notification';
import {checkAppUpdate} from '../../api/binah';
import customColor from '../../theme/customColor';
import RoundedButton from '../RoundedButton';
import CustomText from '../Text';

const AppUpdateModal = ({
  triggerMaintenanceMode,
}: {
  triggerMaintenanceMode: () => void;
}) => {
  const {languages} = useLanguageStore();
  const [isVisible, setIsVisible] = useState(false);
  const [updateData, setUpdateData] = useState<CheckAppUpdateResponse | null>();

  useEffect(() => {
    checkToShowAppUpdate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [languages]);

  const checkToShowAppUpdate = async () => {
    setUpdateData(null);
    const token = await getFcmToken();
    const [appUpdateData] = await Promise.all([checkAppUpdate(token || '')]);
    setUpdateData(appUpdateData);

    if (appUpdateData?.update && Config.Environment === 'production') {
      checkAppVersion(languages);
    }
  };

  const checkMaintenanceMode = (localLanguage: Language) => {
    const shouldEnableMaintenanceMode =
      localLanguage?.is_under_maintenance === 'true' &&
      (localLanguage?.compare_with_app_version === 'false' ||
        localLanguage?.compare_with_app_version === 'true');

    if (shouldEnableMaintenanceMode) {
      triggerMaintenanceMode();
    }
  };

  const checkAppVersion = async (localLanguage: Language) => {
    try {
      const latestVersion = await fetchLatestVersion();
      const currentVersion = VersionCheck.getCurrentVersion();

      if (latestVersion && latestVersion > currentVersion) {
        setIsVisible(true);
      } else {
        checkMaintenanceMode(localLanguage);
      }
    } catch (error) {
      console.error('Error fetching latest version:', error);
    }
  };

  const fetchLatestVersion = async () => {
    return VersionCheck.getLatestVersion({
      provider: Platform.OS === 'android' ? 'playStore' : 'appStore',
      packageName: 'mx.medsi.medsicheck',
    });
  };

  const hideModal = () => {
    setIsVisible(false);
  };

  const openStore = () => {
    const storeLink =
      Platform.OS === 'android'
        ? languages?.android_store_link
        : languages?.ios_store_link;
    return Linking.openURL(storeLink);
  };

  return (
    <Portal>
      <Dialog
        visible={isVisible}
        onDismiss={hideModal}
        dismissable={false}
        style={{
          backgroundColor: customColor.white,
        }}>
        <ScrollView className="space-y-2 my-4 px-4" style={styles.dialogText}>
          <CustomText className="text-2xl font-isidoraSemiBold text-black text-center">
            {updateData?.force_update
              ? languages?.force_update_heading
              : languages?.normal_update_heading}
          </CustomText>

          <CustomText className="text-base font-isidoraMedium text-black text-center">
            {updateData?.force_update
              ? languages?.force_update_content
              : languages?.normal_update_content}
          </CustomText>
        </ScrollView>

        <Dialog.Actions>
          <View
            className="w-full flex-row justify-center space-x-4"
            from={{scaleY: 0}}
            animate={{scaleY: 1}}
            transition={{type: 'timing', duration: 500} as any}>
            <RoundedButton
              onPress={openStore}
              resetStyle
              className="bg-ultramarineBlue flex-1 py-2">
              <CustomText className="text-base font-isidoraBold text-white text-center">
                {languages?.update_now_button}
              </CustomText>
            </RoundedButton>
            {!updateData?.force_update && (
              <RoundedButton
                onPress={hideModal}
                resetStyle
                className="bg-ultramarineBlue flex-1 py-2">
                <CustomText className="text-base font-isidoraBold text-white text-center">
                  {languages?.later_button}
                </CustomText>
              </RoundedButton>
            )}
          </View>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export default AppUpdateModal;

const styles = StyleSheet.create({
  dialogText: {
    maxHeight: 300,
  },
});
