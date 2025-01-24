import {useMutation, UseMutationOptions} from '@tanstack/react-query';
import {postReading} from '../../api/report';

const usePostReadings = (
  props?: Omit<UseMutationOptions<any, Error, any, unknown>, 'mutationFn'>,
) => {
  return useMutation({
    mutationFn: postReading,
    ...props,
  });
};

export default usePostReadings;
