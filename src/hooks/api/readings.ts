import {useQuery, UseQueryOptions, UseQueryResult} from '@tanstack/react-query';
import {Reading, ReportJsonResponse} from '../../../types/jsons';
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

const modifyBloodPressure = (reportData: ReportJsonResponse) => {
  return reportData.data.readings.map((reading: Reading) => {
    const updatedReadingData = Object.entries(reading.reading_data).reduce(
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
    return {
      ...reading,
      reading_data: updatedReadingData,
    };
  });
};

const useGetUserReadingDetail = (
  props?: Omit<GetUserReadingsProps, 'queryKey'>,
) => {
  return useQuery({
    queryKey: ['reading-detail'],
    queryFn: async () => {
      const reportData = (await getReportReading(
        0,
        props?.reading_id,
      )) as ReportJsonResponse;

      const updatedReportData: ReportJsonResponse = {
        ...reportData,
        data: {
          ...reportData.data,
          readings: modifyBloodPressure(reportData),
        },
      };
      return updatedReportData;
    },
    ...props,
  }) as UseQueryResult<ReportJsonResponse>;
};

export {useGetUserReadingDetail};
