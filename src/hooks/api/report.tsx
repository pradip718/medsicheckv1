import {
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  UseInfiniteQueryResult,
  useMutation,
  UseMutationOptions,
  UseMutationResult,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';
import useLanguageStore from '../../../store/languageStore';
import {
  AIHealthReportDetailResponse,
  AIHealthReportResponse,
  LabReportDetailResponse,
  LabReportListResponse,
  MiscellanousFilesResponse,
} from '../../../types/api_response';
import {
  LabReportFileUploadJsonResponse,
  ReportJsonResponse,
} from '../../../types/jsons';
import {
  PostQuestionnairePayload,
  Questionnaire,
} from '../../../types/personalisedai';
import {SCAN_SESSION_STATUS} from '../../../types/readings';
import {errorToast} from '../../../utils/toast';
import {
  deleteLabReport,
  getLabReportQuestionnaire,
  postLabReportFileUpload,
  postLabReportQuestionnaire,
} from '../../api/lapreport';
import {
  captureUserImage,
  deletePersonalisedAIReports,
  getAIReportList,
  getLabReportList,
  getMiscellanousFileDetails,
  getReportReadingById,
  syncScanSession,
} from '../../api/report';
import {
  CAPTURE_USER_IMAGE,
  DELETE_LAB_REPORT,
  DELETE_PERSONALISED_AI_REPORT,
  GET_AI_REPORT,
  GET_AI_REPORT_DETAILS,
  GET_LAB_REPORT_DETAIL,
  GET_LAB_REPORT_LIST,
  GET_LAB_REPORT_QUESTIONNAIRE,
  GET_MISCELLANOUSE_FILE,
  GET_REPORT_READING_BY_ID,
  POST_LAB_REPORT_FILE,
} from '../../constants/hooks';

interface GetQuestionsProps extends UseInfiniteQueryOptions {
  token?: string;
}

interface GetLabReportProps extends UseInfiniteQueryOptions {
  token?: string;
}

interface GetLabReportDetailsProps extends UseQueryOptions {
  token?: string;
}

interface GetAIReportDetailsProps extends UseQueryOptions {
  token?: string;
}
interface GetReadingByIdProps extends UseQueryOptions {
  readingId: string;
}

interface GetLabReportQuestionnaireProps extends UseQueryOptions {
  type: string;
  q_id?: string;
}
interface GetMiscellanouseFileDetailsProps extends UseInfiniteQueryOptions {}

export const useGetAIReport = (
  props?: Omit<
    GetQuestionsProps,
    'queryKey' | 'initialPageParam' | 'getNextPageParam'
  >,
) => {
  return useInfiniteQuery({
    initialPageParam: 1,
    getNextPageParam: (lastPage, _, lastPageParam) => {
      const pageSize = lastPage?.data?.length ?? 0;
      const totalCount = lastPage?.count ?? 0;
      if (pageSize === 0 || lastPageParam * pageSize >= totalCount) {
        return undefined;
      }
      return lastPageParam + 1;
    },
    queryKey: [GET_AI_REPORT],
    queryFn: async ({pageParam = 1}) => {
      if (typeof pageParam === 'number') {
        return await getAIReportList(null, pageParam);
      }
    },
    select: data => {
      if (props?.token) {
        return data.pages[0];
      }
      return {
        data: data?.pages.flatMap(eachPage => eachPage?.data),
        count: data?.pages?.[0]?.count,
      };
    },
    ...props,
  }) as UseInfiniteQueryResult<AIHealthReportResponse>;
};

export const useGetAIReportDetails = (
  props?: Omit<GetAIReportDetailsProps, 'queryKey'>,
) => {
  return useQuery({
    queryKey: [GET_AI_REPORT_DETAILS],
    queryFn: async () => await getAIReportList(props?.token),
    ...props,
  }) as UseQueryResult<AIHealthReportDetailResponse[]>;
};

export const useGetReportReadingById = (
  props?: Omit<GetReadingByIdProps, 'queryKey'>,
) => {
  return useQuery({
    queryKey: [GET_REPORT_READING_BY_ID],
    queryFn: async () => await getReportReadingById(props?.readingId || ''),
    ...props,
  }) as UseQueryResult<ReportJsonResponse>;
};

export const useDeletePersonalisedAIReports = (
  props?: Omit<UseMutationOptions<any, Error, string[], unknown>, 'mutationFn'>,
) => {
  return useMutation({
    mutationKey: [DELETE_PERSONALISED_AI_REPORT],
    mutationFn: deletePersonalisedAIReports,
    ...props,
  }) as UseMutationResult<any>;
};

//----------------------------------LabReport----------------------------------//

export const useGetLabReportQuestionnaire = ({
  type,
  q_id,
  ...restProps
}: Omit<GetLabReportQuestionnaireProps, 'queryKey'>) => {
  return useQuery({
    queryKey: [GET_LAB_REPORT_QUESTIONNAIRE],
    queryFn: async () => await getLabReportQuestionnaire(type, q_id),
    ...restProps,
  }) as UseQueryResult<Questionnaire>;
};

export const useGetLabReportList = (
  props?: Omit<
    GetLabReportProps,
    'queryKey' | 'initialPageParam' | 'getNextPageParam'
  >,
) => {
  return useInfiniteQuery({
    initialPageParam: 1,
    getNextPageParam: (lastPage, _, lastPageParam) => {
      const pageSize = lastPage?.data?.length ?? 0;
      const totalCount = lastPage?.count ?? 0;
      if (pageSize === 0 || lastPageParam * pageSize >= totalCount) {
        return undefined;
      }
      return lastPageParam + 1;
    },
    queryKey: [GET_LAB_REPORT_LIST],
    queryFn: async ({pageParam = 1}) => {
      if (typeof pageParam === 'number') {
        return await getLabReportList(null, pageParam);
      }
    },
    select: data => {
      if (props?.token) {
        return data.pages[0];
      }
      return {
        data: data?.pages.flatMap(eachPage => eachPage?.data),
        count: data?.pages?.[0]?.count,
      };
    },
    ...props,
  }) as UseInfiniteQueryResult<LabReportListResponse>;
};

export const useGetLabReportDetails = (
  props?: Omit<GetLabReportDetailsProps, 'queryKey'>,
) => {
  return useQuery({
    queryKey: [GET_LAB_REPORT_DETAIL],
    queryFn: async () => await getLabReportList(props?.token),
    ...props,
  }) as UseQueryResult<LabReportDetailResponse[]>;
};

export const useUploadLabReportFile = (
  props?: Omit<
    UseMutationOptions<
      LabReportFileUploadJsonResponse,
      Error,
      FormData,
      unknown
    >,
    'mutationFn'
  >,
) => {
  return useMutation({
    mutationKey: [POST_LAB_REPORT_FILE],
    mutationFn: postLabReportFileUpload,
    ...props,
  }) as UseMutationResult<LabReportFileUploadJsonResponse>;
};

export const usePostLabReportQuestionnaire = (
  props?: Omit<
    UseMutationOptions<any, Error, PostQuestionnairePayload, unknown>,
    'mutationFn'
  >,
) => {
  return useMutation({
    mutationFn: postLabReportQuestionnaire,
    ...props,
  });
};

export const useDeleteLabReports = (
  props?: Omit<UseMutationOptions<any, Error, string[], unknown>, 'mutationFn'>,
) => {
  return useMutation({
    mutationKey: [DELETE_LAB_REPORT],
    mutationFn: deleteLabReport,
    ...props,
  }) as UseMutationResult<any>;
};

//----------------------------------------------------------------Miscellaneous----------------------------------------------------------------//
export const useGetMiscellanouseFileDetails = (
  props?: Omit<GetMiscellanouseFileDetailsProps, 'queryKey'>,
) => {
  return useInfiniteQuery({
    initialPageParam: 1,
    getNextPageParam: (lastPage, _, lastPageParam) => {
      const pageSize = lastPage?.data?.length ?? 0;
      const totalCount = lastPage?.count ?? 0;
      if (pageSize === 0 || lastPageParam * pageSize >= totalCount) {
        return undefined;
      }
      return lastPageParam + 1;
    },
    queryKey: [GET_MISCELLANOUSE_FILE],
    queryFn: async ({pageParam = 1}) => {
      if (typeof pageParam === 'number') {
        return await getMiscellanousFileDetails(pageParam);
      }
    },
    select: data => {
      return {
        data: data?.pages.flatMap(eachPage => eachPage?.data),
        count: data?.pages?.[0]?.count,
      };
    },
    ...props,
  }) as UseInfiniteQueryResult<MiscellanousFilesResponse>;
};

//----------------------------------------------------------------FaceScan----------------------------------------------------------------//
export const useUploadFacescanImage = (
  props?: Omit<
    UseMutationOptions<
      any,
      Error,
      {reading_id: string; data: FormData},
      unknown
    >,
    'mutationFn'
  >,
) => {
  return useMutation({
    mutationKey: [CAPTURE_USER_IMAGE],
    mutationFn: captureUserImage,
    ...props,
  }) as UseMutationResult<any>;
};
