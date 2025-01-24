import {useMutation} from '@tanstack/react-query';
import useBinahConfigStore from '../../store/binahConfigStore';
import {getBinahConfiguration} from '../api/binah';
import useFullPageLoader from './useFullPageLoader';

const useFetchBinahConfig = () => {
  const {setBinahConfig, setAnuraConfig, setCurrentSdk} = useBinahConfigStore();
  const {showLoader, hideLoader} = useFullPageLoader();

  return useMutation({
    mutationKey: ['binahConfig'],
    onMutate: showLoader,
    onSettled: hideLoader,
    mutationFn: async () => {
      return await getBinahConfiguration();
    },
    onSuccess: setting => {
      if (setting?.sdk_name === 'binaah') {
        setBinahConfig(setting);
      }
      if (setting?.sdk_name === 'nuralogix') {
        const sdkValue = JSON.parse(setting?.sdk_value);
        setAnuraConfig({
          ...setting,
          sdk_value: sdkValue,
        });
      }
      setCurrentSdk(setting?.sdk_name);
      return setting;
    },
    onError: () => {
      setBinahConfig({
        sdk_value: '',
        scan_duration: '80',
        demographic_flag: 'False',
        sdk_name: 'binaah',
        sdk_type: 'full_scan',
      });
    },
  });
};

export default useFetchBinahConfig;
