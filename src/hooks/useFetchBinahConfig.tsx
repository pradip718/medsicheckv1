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
    onSuccess: data => {
      const normalizedConfig = data?.reduce(
        (acc, {setting_name, setting_value}) => {
          acc[setting_name] = setting_value;
          return acc;
        },
        {} as any,
      );
      setBinahConfig(normalizedConfig as BinahConfig);
      return normalizedConfig as BinahConfig;
    },
    onError: () => {
      setBinahConfig({binaah_sdk_key: ''} as BinahConfig);
    },
  });
};

export default useFetchBinahConfig;
