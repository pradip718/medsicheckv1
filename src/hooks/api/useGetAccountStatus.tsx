import {useQuery, UseQueryOptions, UseQueryResult} from '@tanstack/react-query';
import {AccountStatus} from '../../../types/users/user';
import {getAccountStatus} from '../../api/auth';
import {ACCOUNT_STATUS} from '../../constants/hooks';

interface GetAccountStatusProps extends UseQueryOptions {}

const useGetAccountStatus = (
  props?: Omit<GetAccountStatusProps, 'queryKey'>,
) => {
  return useQuery({
    queryKey: [ACCOUNT_STATUS],
    queryFn: getAccountStatus,
    ...props,
  }) as UseQueryResult<AccountStatus>;
};

export default useGetAccountStatus;
