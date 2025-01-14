import {
  BinahListener,
  DeviceCapabilities,
  MeasurementReport,
  healthMonitorManager,
} from 'biosensesignal-react-native-sdk';
import {useEffect} from 'react';
import {LICENSE_KEY} from '../../MeasurementScreen';

const useInitializeHealthMonitor = () => {
  useEffect(() => {
    const initializeHealthMonitor = async () => {
      let _errorListener: BinahListener;
      try {
        const manager = await healthMonitorManager.init(LICENSE_KEY);

        _errorListener = manager.onError((code: number) => {
          console.log(`Error has arrived! code: ${code}`);
        });

        /*  When we'll want to remove a listener we'll do the following: */
        _errorListener.remove();

        manager.onEnabledVitalSigns((enabledVitalSigns: DeviceCapabilities) => {
          console.log(
            `The following enabled vital signs are: ${enabledVitalSigns}`,
          );
        });

        /* There's an option to get `enabledVitalSigns` by method call as well */
        const currentEnabledVitalSigns = await manager.getEnabledVitalSigns();
        console.log(
          `These are the current enabled vital signs: ${currentEnabledVitalSigns}`,
        );

        manager.onOfflineMeasurements(
          (offlineMeasurements: MeasurementReport) => {
            console.log(
              `The following offline measurements are: ${offlineMeasurements}`,
            );
          },
        );

        /* There's an option to get `offlineMeasurements` by method call as well */
        const currentOfflineMeasurements =
          await manager.getOfflineMeasurements();
        console.log(
          `These are the current offline measurements: ${currentOfflineMeasurements}`,
        );
      } catch (err: any) {
        console.log(`Failed to intiallize health manager! code ${err.code}`);
      }
    };

    initializeHealthMonitor();
  }, []);

  return;
};

export default useInitializeHealthMonitor;
