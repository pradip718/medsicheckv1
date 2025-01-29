import {
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  UseInfiniteQueryResult,
} from '@tanstack/react-query';
import {
  ReportJsonPaginationResponse,
  ReportJsonResponse,
} from '../../../types/jsons';
import {getReportReading} from '../../api/report';

interface GetUserReadingsProps extends UseInfiniteQueryOptions {
  reading_id?: string;
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

type QueryResponseType<T> = T extends {reading_id: any}
  ? ReportJsonResponse
  : ReportJsonPaginationResponse;

const useGetUserReading = <
  T extends Omit<
    GetUserReadingsProps,
    'queryKey' | 'initialPageParam' | 'getNextPageParam'
  >,
>(
  props?: T,
) => {
  return useInfiniteQuery({
    queryKey: ['readings'],
    initialPageParam: 1,
    getNextPageParam: (lastPage, _, lastPageParam: number) => {
      const pageSize = lastPage?.reading_data?.length ?? 0;
      const totalCount = lastPage?.count ?? 0;
      if (pageSize === 0 || lastPageParam * pageSize >= totalCount) {
        return undefined;
      }
      return lastPageParam + 1;
    },
    queryFn: async ({pageParam}) => {
      if (typeof pageParam === 'number') {
        const reportData = await getReportReading(pageParam, props?.reading_id);
        let updatedReportData: QueryResponseType<T> =
          reportData as QueryResponseType<T>;
        if (props?.reading_id) {
          updatedReportData = {
            ...reportData,
            readings: {
              ...reportData?.readings,
              reading_data: modifyBloodPressure(
                reportData?.readings?.reading_data,
              ),
            },
          };
        }
        return updatedReportData;
      }
    },
    select: data => {
      if (props?.reading_id) {
        return data.pages[0];
      }

      return {
        data: {
          reading_data: data?.pages.flatMap(eachPage => eachPage?.reading_data),
          count: data?.pages?.[0]?.count,
          stats: data?.pages?.[0]?.stats,
        },
      };
    },
    ...props,
  }) as UseInfiniteQueryResult<QueryResponseType<T>>;
};

export default useGetUserReading;
