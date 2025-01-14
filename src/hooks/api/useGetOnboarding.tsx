import {useQuery, UseQueryOptions, UseQueryResult} from '@tanstack/react-query';
import {getOnboardingApi} from '../../api/auth';
import {OnboardingResponse} from '../../screens/auth/Login/type';

interface GetOnBoardingProps extends UseQueryOptions {}

const useGetOnboarding = (props?: Omit<GetOnBoardingProps, 'queryKey'>) => {
  return useQuery({
    queryKey: ['onboarding'],
    queryFn: getOnboardingApi,
    ...props,
  }) as UseQueryResult<OnboardingResponse>;
};

export default useGetOnboarding;
