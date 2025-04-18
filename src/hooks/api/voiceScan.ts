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
import {getVoiceReportList} from '../../api/voicescan';
import {GET_VOICE_SCAN_REPORT_LIST} from '../../constants/hooks';

interface GetUserReadingsProps extends UseInfiniteQueryOptions {
  reading_id?: string;
}

type QueryResponseType<T> = T extends {reading_id: any}
  ? ReportJsonResponse
  : ReportJsonPaginationResponse;

export const useGetUserVoiceReportList = <
  T extends Omit<
    GetUserReadingsProps,
    'queryKey' | 'initialPageParam' | 'getNextPageParam'
  >,
>(
  props?: T,
) => {
  return useInfiniteQuery({
    queryKey: [GET_VOICE_SCAN_REPORT_LIST],
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
        const reportData = await getVoiceReportList(pageParam);
        return reportData;
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
