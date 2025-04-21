import {
  useInfiniteQuery,
  UseInfiniteQueryResult,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';
import {
  VoiceScanReportDetailResponse,
  VoiceScanReportListResponse,
} from '../../../types/api_response';
import {ReportJsonPaginationResponse} from '../../../types/jsons';
import {
  getVoiceReportList,
  getVoiceScanReportDetail,
} from '../../api/voicescan';
import {
  GET_VOICE_SCAN_REPORT_DETAIL,
  GET_VOICE_SCAN_REPORT_LIST,
} from '../../constants/hooks';

interface GetVoiceScanReportDetailProps extends UseQueryOptions {
  session_id: string;
}

export const useGetUserVoiceReportList = <
  T extends Omit<{}, 'queryKey' | 'initialPageParam' | 'getNextPageParam'>,
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
      return {
        data: {
          reading_data: data?.pages.flatMap(eachPage => eachPage?.reading_data),
          count: data?.pages?.[0]?.count,
          stats: data?.pages?.[0]?.stats,
        },
      };
    },
    ...props,
  }) as UseInfiniteQueryResult<VoiceScanReportListResponse>;
};

export const useGetUserVoiceReportDetail = (
  props?: Omit<GetVoiceScanReportDetailProps, 'queryKey'>,
) => {
  return useQuery({
    queryKey: [GET_VOICE_SCAN_REPORT_DETAIL],
    queryFn: () =>
      getVoiceScanReportDetail({sessoin_id: props?.session_id ?? ''}),
  }) as UseQueryResult<VoiceScanReportDetailResponse>;
};
