import {useQuery, UseQueryOptions, UseQueryResult} from '@tanstack/react-query';
import {PreHealthConfiguration} from '../../../types/readings';
import {preReading} from '../../api/report';

interface GetPreReadingProps extends UseQueryOptions {
  longitude?: number;
  latitude?: number;
  altitude?: number;
}

const useGetPreHealthReading = (
  props?: Omit<GetPreReadingProps, 'queryKey'>,
) => {
  const getParams = () => {
    const params: {longitude?: number; latitude?: number; altitude?: number} =
      {};

    if (props?.longitude !== undefined) {
      params.longitude = props.longitude;
    }
    if (props?.latitude !== undefined) {
      params.latitude = props.latitude;
    }
    if (props?.altitude !== undefined) {
      params.altitude = props.altitude;
    }

    return params;
  };

  return useQuery({
    queryKey: [
      'pre-health-readings',
      props?.longitude,
      props?.latitude,
      props?.altitude,
    ],
    queryFn: () => preReading(getParams()),
    ...props,
  }) as UseQueryResult<PreHealthConfiguration[]>;
};

export default useGetPreHealthReading;
