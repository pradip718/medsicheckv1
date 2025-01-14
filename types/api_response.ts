import {EncryptionAlgorithmSpec} from '@aws-sdk/client-kms';
import {Question} from '../src/screens/auth/Register/Additional_Information/type';

export type AIHealthList = {
  created_at: string;
  lastmodified_at: string;
  token_id: string;
  report_link: string;
};

export type AIHealthReportResponse = {
  data: AIHealthList[];
  count: number;
};

export type AIUserDetails = {
  birthday: string;
  first_name: string;
  gender: string;
  height_cm: string;
  last_name: string;
  weight_kg: string;
};

export type AIContactDetails = {
  email: string;
  telephone_number: string;
};

export interface AIHealthReportDetailResponse {
  ai_response: string;
  meta_data: string;
  payload: {
    questionnaire: Question[];
    scan_data: string;
    user_details: AIUserDetails;
    contact_info: AIContactDetails;
  };
  report_link: string;
  summary_id: string;
  text_summary: string | null;
}

export type LabReportList = {
  created_at: string;
  lastmodified_at: string;
  report_link: string;
  token_id: string;
};

export interface LabReportListResponse {
  data: LabReportList[];
  count: number;
}

export interface LabReportDetailResponse {
  ai_response: string;
  meta_data: string;
  file_link: string;
  payload: {
    questionnaire: Question[];
    scan_data: string;
    user_details: AIUserDetails;
    contact_info: AIContactDetails;
  };
  report_link: string;
  summary_id: string;
  text_summary: string | null;
}

export type LabUserDetails = {
  birthday: string;
  first_name: string;
  gender: string;
  height_cm: string;
  last_name: string;
  weight_kg: string;
};

export type MiscellanousFilesType = {
  created_at: string;
  lastmodified_at: string;
  s3_link: string;
  upload_id: string;
};

export type MiscellanousFilesResponse = {
  data: MiscellanousFilesType[];
  count: number;
};

export type UserPreferencesError = {
  message: string;
  whatsapp_verified: boolean;
};

export type ValidateWhatsappOTP = {
  otp_value: string;
};

export type VerifySession = {
  token?: string;
  error_title?: string;
  error_msg?: string;
};

export type AWSTokenResponse = {
  token: string;
};

export type AWSSecretKeysResponse = {
  access_key: string;
  secret_access_key: string;
  kms_arn: string;
  kms_algorithm: EncryptionAlgorithmSpec;
};

export type LoginSuccessResponse = {
  data: string;
  is_verified: boolean;
  generation_time: string;
  expiry_time: string;
  user_id: string;
  user_name: string;
  phone_number: string;
  phone_verification_flag: boolean;
  email_verification_flag: boolean;
};
export type LoginErrorResponse = {
  error: string;
  is_verified: boolean;
};

export type LoginOTPResponse = {
  otp_sent: boolean;
  session: string;
  user_id: string;
  user_name: string;
  error?: string;
};

interface LoginVerifyErrorResponse {
  session: string;
  user_name: string;
}

export type VerifyLoginOTPResponse =
  | LoginVerifyErrorResponse
  | LoginSuccessResponse;

export interface SignUpSuccessResponse {
  data: string;
  user_id: string;
  email_verification_flag: boolean;
  phone_verification_flag: boolean;
}

export type CheckAppUpdateResponse = {
  force_update: boolean;
  update: boolean;
};
