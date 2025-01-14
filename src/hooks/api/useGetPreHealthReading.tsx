import {useQuery, UseQueryOptions, UseQueryResult} from '@tanstack/react-query';
import {PreHealthConfiguration} from '../../../types/readings';
import {preReading} from '../../api/report';

interface GetPreReadingProps extends UseQueryOptions {}

const useGetPreHealthReading = (
  props?: Omit<GetPreReadingProps, 'queryKey'>,
) => {
  return useQuery({
    queryKey: ['pre-health-readings'],
    queryFn: preReading,
    ...props,
  }) as UseQueryResult<PreHealthConfiguration[]>;
};

export default useGetPreHealthReading;
