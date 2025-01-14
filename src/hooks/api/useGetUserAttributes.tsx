import {useQuery, UseQueryOptions, UseQueryResult} from '@tanstack/react-query';
import {FamilyMembers} from '../../../types/users/user';
import {getUserAttributes} from '../../api/user';

interface GetUserAttributesProps extends UseQueryOptions {}

const useGetUserAttributes = (
  props?: Omit<GetUserAttributesProps, 'queryKey'>,
) => {
  return useQuery({
    queryKey: ['user-attributes'],
    queryFn: getUserAttributes,
    staleTime: Infinity,
    ...props,
  }) as UseQueryResult<FamilyMembers>;
};

export default useGetUserAttributes;
