import {NativeModules, Platform} from 'react-native';
import SpInAppUpdates, {
  IAUInstallStatus,
  IAUUpdateKind,
  StartUpdateOptions,
} from 'sp-react-native-in-app-updates';
import useLanguageStore from '../store/languageStore';

export const checkForUpdate = async ({
  isForceUpdate,
}: {
  isForceUpdate: boolean;
}): Promise<boolean | undefined> => {
  const languages = useLanguageStore.getState().languages;
  const inAppUpdates = new SpInAppUpdates(false);

  try {
    const result = await inAppUpdates.checkNeedsUpdate();
    if (!result.shouldUpdate) {
      return false;
    }

    let updateOptions: StartUpdateOptions = {};
    if (Platform.OS === 'android') {
      updateOptions = {
        updateType: isForceUpdate
          ? IAUUpdateKind.IMMEDIATE
          : IAUUpdateKind.FLEXIBLE,
      };
    } else if (Platform.OS === 'ios') {
      updateOptions = {
        title: languages?.update_title,
        message: languages?.update_description,
        buttonUpgradeText: languages?.update,
        buttonCancelText: languages?.cancel,
        forceUpgrade: isForceUpdate,
      };
    }

    inAppUpdates.addStatusUpdateListener(downloadStatus => {
      if (downloadStatus.status === IAUInstallStatus.DOWNLOADED) {
        console.log('Update downloaded');
        inAppUpdates.installUpdate();

        inAppUpdates.removeStatusUpdateListener(finalStatus => {
          console.log('final status', finalStatus);
        });
      }
    });

    if (isForceUpdate) {
      inAppUpdates.addIntentSelectionListener(installationResult => {
        if (Number(installationResult) === 6) {
          const {ExitApp} = NativeModules;
          if (ExitApp) {
            ExitApp.exitApp();
          }
        }
        inAppUpdates.removeIntentSelectionListener(finalStatus => {
          console.log('final status', finalStatus);
        });
      });
    }

    inAppUpdates.startUpdate(updateOptions);

    return true;
  } catch (error) {
    console.error('Error during update check:', error);
    return false;
  }
};
