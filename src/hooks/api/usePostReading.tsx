import {useMutation} from '@tanstack/react-query';
import {postReading} from '../../api/report';

const usePostReadings = () => {
  return useMutation({
    mutationFn: postReading,
  });
};

export default usePostReadings;
