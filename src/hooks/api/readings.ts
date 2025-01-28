import {useQuery, UseQueryOptions, UseQueryResult} from '@tanstack/react-query';
import {ReportJson} from '../../../types/jsons';
import {getReportReading} from '../../api/report';

interface GetUserReadingsProps extends UseQueryOptions {
  reading_id: string;
}
interface ReadingData {
  BLOOD_PRESSURE?: {
    systolic?: number;
    diastolic?: number;
  };
  [key: string]: any;
}

const modifyBloodPressure = (reading_data: ReadingData) => {
  return Object.entries(reading_data).reduce(
    (acc: ReadingData, [key, value]) => {
      if (key === 'systolic' || key === 'diastolic') {
        return {
          ...acc,
          BLOOD_PRESSURE: {
            ...acc.BLOOD_PRESSURE,
            [key]: value,
          },
        };
      }
      return {
        ...acc,
        [key]: value,
      };
    },
    {},
  );
};

const useGetUserReadingDetail = (
  props?: Omit<GetUserReadingsProps, 'queryKey'>,
) => {
  return useQuery({
    queryKey: ['reading-detail', props?.reading_id],
    queryFn: async () => {
      const reportData = (await getReportReading(
        0,
        props?.reading_id,
      )) as ReportJson;

      const updatedReportData: ReportJson = {
        ...reportData,
        readings: {
          ...reportData?.readings,
          reading_data: modifyBloodPressure(reportData?.readings?.reading_data),
        },
      };
      return updatedReportData;
    },
    ...props,
  }) as UseQueryResult<ReportJson>;
};

export {useGetUserReadingDetail};
