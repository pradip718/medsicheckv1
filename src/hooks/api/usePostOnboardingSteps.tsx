import {useMutation, useQueryClient} from '@tanstack/react-query';
import axiosInstance from '../../api';
import {notifyApi} from '../../api/user';

const usePostOnboardingSteps = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({milestone}: {milestone: string}) =>
      axiosInstance.post('v1/onboarding', {
        milestone,
      }),
    onSuccess: (_, variables) => {
      const {milestone} = variables;
      notifyApi('onboarding_step', {
        milestone: milestone,
      });
      // Invalidate and refetch
      queryClient.invalidateQueries({queryKey: ['onboarding']});
    },
  });
};

export default usePostOnboardingSteps;
