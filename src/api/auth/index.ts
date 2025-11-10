import {StackActions} from '@react-navigation/native';
import {AxiosError} from 'axios';
import {Alert} from 'react-native';
import Config from 'react-native-config';
import EncryptedStorage from 'react-native-encrypted-storage';
import axiosInstance from '..';
import {navigationRef} from '../../../RootNavigation';
import useAuthStore from '../../../store/authStore';
import useUserProfileStore from '../../../store/profileStore';
import {
  ConfirmPasswordPayload,
  ForgotPasswordPayload,
  LoginOTPPayload,
  LoginPayload,
  ResendEmailConfirmationPayload,
  sendPhoneOTPPayload,
  SignUpPayload,
  VerifyEmailPayload,
  VerifyLoginOTPPayload,
  VerifyPhonePayload,
} from '../../../types/api_payload';
import {
  GetPublicKeyResponse,
  LoginErrorResponse,
  LoginOTPResponse,
  LoginSuccessResponse,
  SignUpSuccessResponse,
  VerifyLoginOTPResponse,
  VerifySession,
} from '../../../types/api_response';
import {getDeviceLocaleInformation} from '../../../utils/methods';
import {errorToast} from '../../../utils/toast';
import {REMEMBERED_USER_SESSION} from '../../constants/AsyncStorageKeys';
import axiosSessionInstance from '../sessionConfiguration';

async function signup(payload: SignUpPayload): Promise<SignUpSuccessResponse> {
  try {
    const response = await axiosInstance({
      method: 'POST',
      url: 'v1/sign-up-v2?flow_type=sign_up',
      data: payload,
    });

    return response?.data;
  } catch (error) {
    throw error;
  }
}

export const signupOTP = async (
  payload: SignUpPayload,
): Promise<SignUpSuccessResponse> => {
  try {
    const locale = getDeviceLocaleInformation();

    const response = await axiosInstance({
      method: 'POST',
      url: `v1/sign-up-otp?locale=${locale}`,
      data: payload,
    });

    return response?.data;
  } catch (error) {
    throw error;
  }
};

export async function verifyEmail(payload: VerifyEmailPayload) {
  try {
    const response = await axiosInstance({
      method: 'POST',
      url: 'v1/sign-up-v2?flow_type=verify_email',
      data: payload,
    });

    return response?.data;
  } catch (error) {
    throw error;
  }
}

export async function verifyPhone(payload: VerifyPhonePayload) {
  try {
    const response = await axiosInstance({
      method: 'POST',
      url: 'v1/sign-up-v2?flow_type=verify_phone',
      data: payload,
    });

    return response?.data;
  } catch (error) {
    throw error;
  }
}

export async function login(payload: LoginPayload) {
  try {
    const response = await axiosInstance({
      method: 'POST',
      url: 'v1/login-v2',
      data: payload,
    });

    return response?.data as LoginSuccessResponse;
  } catch (error) {
    if (error instanceof AxiosError) {
      errorToast(error?.response?.data?.error);
    }
    throw error as LoginErrorResponse;
  }
}

export async function signout() {
  try {
    const response = await axiosInstance({
      method: 'GET',
      url: 'v1/sign-out',
    });

    try {
      await EncryptedStorage.removeItem(REMEMBERED_USER_SESSION);
    } catch (storageError) {
      console.log('Could not remove remembered session:', storageError);
    }

    return response?.data;
  } catch (error) {
    navigationRef.dispatch(StackActions.replace('Login'));
    throw error;
  }
}

export async function forgotPassword(payload: ForgotPasswordPayload) {
  try {
    const response = await axiosInstance({
      method: 'POST',
      url: 'v1/sign-up?flow_type=forgot_password',
      data: payload,
    });

    return response?.data;
  } catch (error) {
    throw error;
  }
}

export async function sendLoginOTP(
  payload: LoginOTPPayload,
): Promise<LoginOTPResponse | LoginSuccessResponse> {
  try {
    const response = await axiosInstance({
      method: 'POST',
      url: 'v1/login-v2?auth_type=otp',
      data: payload,
    });

    return response?.data;
  } catch (error) {
    throw error;
  }
}

export async function sendSignUpOTP(
  payload: LoginOTPPayload,
): Promise<LoginOTPResponse> {
  try {
    const response = await axiosInstance({
      method: 'POST',
      url: 'v1/sign-up-otp?auth_type=otp',
      data: payload,
    });

    return response?.data;
  } catch (error) {
    throw error;
  }
}

export async function resendSignUpOTP(
  payload: LoginOTPPayload,
): Promise<LoginOTPResponse> {
  try {
    const response = await axiosInstance({
      method: 'POST',
      url: 'v1/sign-up-otp?auth_type=resend_otp',
      data: payload,
    });

    return response?.data;
  } catch (error) {
    throw error;
  }
}

export async function verifyLoginOTP(
  payload: VerifyLoginOTPPayload,
): Promise<VerifyLoginOTPResponse> {
  try {
    const response = await axiosInstance({
      method: 'POST',
      url: 'v1/login-v2?auth_type=verify_auth_otp',
      data: payload,
    });

    return response?.data as VerifyLoginOTPResponse;
  } catch (error) {
    throw error;
  }
}

export async function verifySignUpOTP(
  payload: VerifyLoginOTPPayload,
): Promise<VerifyLoginOTPResponse> {
  try {
    const response = await axiosInstance({
      method: 'POST',
      url: 'v1/sign-up-otp?auth_type=verify_otp',
      data: payload,
    });

    return response?.data as VerifyLoginOTPResponse;
  } catch (error) {
    throw error;
  }
}

export async function postConfirmPassword(payload: ConfirmPasswordPayload) {
  try {
    const response = await axiosInstance({
      method: 'POST',
      url: 'v1/sign-up?flow_type=confirm_password',
      data: payload,
    });

    return response?.data;
  } catch (error) {
    throw error;
  }
}

export async function resendEmailConfirmation(
  payload: ResendEmailConfirmationPayload,
) {
  try {
    const response = await axiosInstance({
      method: 'POST',
      url: 'v1/sign-up-v2?flow_type=send_email_otp',
      data: payload,
    });

    return response?.data;
  } catch (error) {
    throw error;
  }
}

export async function sendPhoneOTP(payload: sendPhoneOTPPayload) {
  try {
    const response = await axiosInstance({
      method: 'POST',
      url: 'v1/sign-up-v2?flow_type=send_phone_otp',
      data: payload,
    });

    return response?.data;
  } catch (error) {
    throw error;
  }
}

export async function refreshToken() {
  try {
    const response = await axiosInstance({
      method: 'GET',
      url: 'v1/refresh-token',
    });

    return response?.data;
  } catch (error) {
    throw error;
  }
}

async function getOnboardingApi() {
  const {deeplinkAuth} = useAuthStore.getState();
  const activeAxiosInstance = deeplinkAuth?.session_id
    ? axiosSessionInstance
    : axiosInstance;

  try {
    const response = await activeAxiosInstance({
      method: 'GET',
      url: 'v1/onboarding',
    });

    return response?.data;
  } catch (error) {
    throw error;
  }
}

async function getOnboardingStepsApi() {
  try {
    const {deeplinkAuth} = useAuthStore.getState();
    const activeAxiosInstance = deeplinkAuth?.session_id
      ? axiosSessionInstance
      : axiosInstance;

    const response = await activeAxiosInstance({
      method: 'GET',
      url: 'v1/onboarding-steps',
    });

    return {
      ...response?.data,
      data:
        response?.data?.data?.sort(
          (a: any, b: any) => a.order_id - b.order_id,
        ) || [],
    };
  } catch (error) {
    throw error;
  }
}

async function getAccountStatus() {
  const locale = getDeviceLocaleInformation();
  const profile_id = useUserProfileStore.getState().currentActiveProfileId;
  const {deeplinkAuth} = useAuthStore.getState();
  const activeAxiosInstance = deeplinkAuth?.session_id
    ? axiosSessionInstance
    : axiosInstance;

  try {
    const response = await activeAxiosInstance({
      method: 'GET',
      url: `v1/account_status?locale=${locale}${
        profile_id ? 'profile_id=' + profile_id : ''
      }`,
    });

    return response?.data;
  } catch (error) {
    throw error;
  }
}

async function getSessionToken({
  session_id,
  profile_id,
  customErrorHandle = false,
}: {
  session_id: string;
  profile_id: string;
  customErrorHandle?: boolean;
}): Promise<VerifySession> {
  try {
    const response = await axiosSessionInstance({
      method: 'GET',
      url: `v1/verify-session?session_id=${session_id}${
        profile_id ? '&profile_id=' + profile_id : ''
      }`,
    });

    return response?.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError && !customErrorHandle) {
      Alert.alert(
        error.response?.data?.error_title || '',
        error.response?.data?.error_msg || '',
      );
    }
    throw error;
  }
}

async function getAWSPublicKeys(): Promise<GetPublicKeyResponse | null> {
  const tokenResponse = await axiosInstance({
    method: 'GET',
    url: `v1/generate-token?env=${Config.Environment}`,
  });

  return tokenResponse?.data;
}

export {
  getAccountStatus,
  getAWSPublicKeys,
  getOnboardingApi,
  getOnboardingStepsApi,
  getSessionToken,
  signup,
};
