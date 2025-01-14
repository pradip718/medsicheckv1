import {
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';
import {
  UserPreferencesError,
  ValidateWhatsappOTP,
} from '../../../types/api_response';
import {
  GetUserPreferenceResponse,
  PostUserPreferencePayload,
} from '../../../types/settings';
import {
  getUserPreference,
  sendOTPInWhatsapp,
  submitUserPreferences,
  validateOTPForWhatsapp,
} from '../../api/settings';
import {GET_USER_PREFERENCES} from '../../constants/hooks';

interface GetUserPreferenceProps extends UseQueryOptions {}

export const useGetUserPreference = (
  props?: Omit<GetUserPreferenceProps, 'queryKey'>,
) => {
  return useQuery({
    queryKey: [GET_USER_PREFERENCES],
    queryFn: getUserPreference,
    // gcTime: 0,
    ...props,
  }) as UseQueryResult<GetUserPreferenceResponse>;
};

export const usePostUserPreference = (
  props?: Omit<
    UseMutationOptions<
      any,
      UserPreferencesError,
      PostUserPreferencePayload,
      unknown
    >,
    'mutationFn'
  >,
) => {
  return useMutation({
    mutationFn: submitUserPreferences,
    ...props,
  });
};

export const useSendWhatsappOTP = (props?: UseMutationOptions) => {
  return useMutation({
    mutationFn: sendOTPInWhatsapp,
    ...props,
  });
};

export const useValidateWhatsappOTP = (
  props?: Omit<
    UseMutationOptions<any, Error, ValidateWhatsappOTP, unknown>,
    'mutationFn'
  >,
) => {
  return useMutation({
    mutationFn: validateOTPForWhatsapp,
    ...props,
  });
};
