import {useQuery, UseQueryOptions} from '@tanstack/react-query';
import {getOnboardingStepsApi} from '../../api/auth';

interface GetOnBoardingStepsProps extends UseQueryOptions {}

const useGetOnboardingSteps = (
  props?: Omit<GetOnBoardingStepsProps, 'queryKey'>,
) => {
  return useQuery({
    queryKey: ['onboardingSteps'],
    queryFn: getOnboardingStepsApi,
    ...props,
  });
};

export default useGetOnboardingSteps;
