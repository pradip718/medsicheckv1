import {useQuery, UseQueryOptions, UseQueryResult} from '@tanstack/react-query';
import {RescanConfiguration} from '../../../types/users/user';
import {getRescanConfigurations} from '../../api/user';
import {RESCAN_CONFIGURATION} from '../../constants/hooks';

interface GetRescanConfigurationProps extends UseQueryOptions {}

const useGetRescanConfiguration = (
  props?: Omit<GetRescanConfigurationProps, 'queryKey'>,
) => {
  return useQuery({
    queryKey: [RESCAN_CONFIGURATION],
    queryFn: getRescanConfigurations,
    ...props,
  }) as UseQueryResult<RescanConfiguration>;
};

export default useGetRescanConfiguration;
