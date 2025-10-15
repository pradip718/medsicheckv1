import {
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  UseInfiniteQueryResult,
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';

import {
  GetSymptomParams,
  SymptomCheckerDetailResponse,
  SymptomQuestion,
  SymptomQuestionPayload,
  SymptomQuestionResponse,
  SymptomReportListResponse,
} from '../../../types/api_response';
import {
  deleteSymptomReports,
  getSymptomQuestion,
  getSymptomReport,
  postSymptomFileUpload,
  postSymptomQuestion,
  updateSymptomQuestion,
} from '../../api/symptomchecker';
import {SYMPTOM_CHECKER_REPORTS} from '../../constants/hooks';

interface GetSymptomQuestionProps extends UseQueryOptions {
  params: GetSymptomParams;
}

export const useGetSymptomQuestion = (
  props: Omit<GetSymptomQuestionProps, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    queryKey: ['symptom-checker', props.params.type],
    queryFn: () => getSymptomQuestion(props.params),
    ...props,
  }) as UseQueryResult<{data: SymptomQuestion[]}>;
};

interface GetSymptomReportsProps extends UseInfiniteQueryOptions {}
export const useGetSymptomReports = (
  props?: Omit<
    GetSymptomReportsProps,
    'queryKey' | 'initialPageParam' | 'getNextPageParam'
  >,
) => {
  return useInfiniteQuery({
    initialPageParam: 1,
    getNextPageParam: (lastPage: any, _, lastPageParam: any) => {
      const pageSize = lastPage?.data?.length ?? 0;
      const totalCount = lastPage?.count ?? 0;
      if (pageSize === 0 || lastPageParam * pageSize >= totalCount) {
        return undefined;
      }
      return lastPageParam + 1;
    },
    queryKey: [SYMPTOM_CHECKER_REPORTS],
    queryFn: async ({pageParam = 1}) => {
      if (typeof pageParam === 'number') {
        return await getSymptomReport(null, pageParam);
      }
    },
    select: (data: any) => {
      return {
        data: data?.pages.flatMap((eachPage: any) => eachPage.data),
        count: data?.pages?.[0]?.count,
      };
    },
    ...props,
  }) as UseInfiniteQueryResult<SymptomReportListResponse>;
};

interface useGetSymptomReportDetailsProps extends UseQueryOptions {
  token_id?: string;
}
export const useGetSymptomReportDetails = (
  props?: Omit<useGetSymptomReportDetailsProps, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    queryKey: ['symptom-checker-reports', props?.token_id || 'all'],
    queryFn: () => getSymptomReport(props?.token_id),
    ...props,
  }) as UseQueryResult<SymptomCheckerDetailResponse[]>;
};

export const usePostSymptomQuestion = (
  args?: Omit<
    UseMutationOptions<
      SymptomQuestionResponse,
      Error,
      SymptomQuestionPayload,
      unknown
    >,
    'mutationFn'
  >,
) => {
  return useMutation({
    mutationFn: postSymptomQuestion,
    ...args,
  });
};

export const usePostSymptomFileUpload = (
  args?: Omit<
    UseMutationOptions<
      {image_url: string; token_id: string}[],
      Error,
      FormData,
      unknown
    >,
    'mutationFn'
  >,
) => {
  return useMutation({
    mutationFn: postSymptomFileUpload,
    ...args,
  });
};

export const useUpdateSymptomQuestion = (
  args?: Omit<
    UseMutationOptions<
      SymptomQuestionResponse,
      Error,
      SymptomQuestionPayload,
      unknown
    >,
    'mutationFn'
  >,
) => {
  return useMutation({
    mutationFn: updateSymptomQuestion,
    ...args,
  });
};

export const useDeleteSymptomReports = (
  props?: Omit<
    UseMutationOptions<unknown, Error, string[], unknown>,
    'mutationFn'
  >,
) => {
  return useMutation({
    mutationKey: ['delete-symptom-report'],
    mutationFn: deleteSymptomReports,
    ...props,
  });
};
