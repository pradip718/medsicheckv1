import {useMutation} from '@tanstack/react-query';
import useBinahConfigStore, {BinahConfig} from '../../store/binahConfigStore';
import {getBinahConfiguration} from '../api/binah';
import useFullPageLoader from './useFullPageLoader';

const useFetchBinahConfig = () => {
  const {setBinahConfig} = useBinahConfigStore();
  const {showLoader, hideLoader} = useFullPageLoader();

  return useMutation({
    mutationKey: ['binahConfig'],
    onMutate: showLoader,
    onSettled: hideLoader,
    mutationFn: async () => {
      return await getBinahConfiguration();
    },
    onSuccess: setting => {
      setBinahConfig({
        binaah_sdk_key: setting?.sdk_value,
        demographic_flag: setting?.demographic_flag,
        scan_duration: setting?.scan_duration,
      } as BinahConfig);
      return {
        scan_duration: setting?.scan_duration,
        binaah_sdk_key: setting?.sdk_value,
        demographic_flag: setting?.demographic_flag,
      };
    },
    onError: () => {
      setBinahConfig({binaah_sdk_key: ''} as BinahConfig);
    },
  });
};

export default useFetchBinahConfig;
