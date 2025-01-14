import {useQuery, UseQueryOptions, UseQueryResult} from '@tanstack/react-query';
import {FamilyMembers} from '../../../types/users/user';
import {getMembers} from '../../api/user';

interface GetQuestionsProps extends UseQueryOptions {}

const useGetFamilyMembers = (props?: Omit<GetQuestionsProps, 'queryKey'>) => {
  return useQuery({
    queryKey: ['family-members'],
    queryFn: getMembers,
    ...props,
  }) as UseQueryResult<FamilyMembers[]>;
};

export default useGetFamilyMembers;
