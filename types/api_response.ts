import {EncryptionAlgorithmSpec} from '@aws-sdk/client-kms';
import {
  Question,
  QuestionnaireGETReponse,
} from '../src/screens/auth/Register/Additional_Information/type';

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

export type SDK_NAME = 'binaah' | 'nuralogix';

export type AnuraSdkValue = {
  deepaffexLicenseKey: string;
  deepaffexStudyID: string;
  deepaffexAPIHostname: string;
};

type BaseSdkConfigResponse = {
  scan_duration: string;
  demographic_flag: 'True' | 'False';
  sdk_type: 'vital_scan' | 'full_scan';
};

export type BinahConfigResponse = BaseSdkConfigResponse & {
  sdk_name: 'binaah';
  sdk_value: string;
};

export type AnuraConfigResponse = BaseSdkConfigResponse & {
  sdk_name: 'nuralogix';
  sdk_value: string;
};

export type AnuraConfig = BaseSdkConfigResponse & {
  sdk_name: 'nuralogix';
  sdk_value: AnuraSdkValue;
};

// ----------------- Health Risks -----------------

export type HealthRisksResponse =
  | QuestionnaireResponse
  | ViewRiskScoreResponse
  | GenerateRiskScoreResponse;

export type ScreenName =
  | 'questionnaire'
  | 'generate_risk_score'
  | 'view_risk_score';

export type QuestionnaireResponse = {
  screen_name: 'questionnaire';
  data: QuestionnaireGETReponse;
};

export type RiskScoreInfo = {
  show_info: boolean;

  risk_level: string;
  probability: number;
  probability_color: string;
  category_color: string;
  risk_level_img_url: string;
  probability_img_url: string;

  pre_diabetes_probability?: number;
  diabetes_type_2_probability?: string;
  pre_diabetes_probability_color?: string;
  pre_diabetes_probability_img_url?: string;
  diabetes_type_2_probability_img_url?: string;
  diabetes_type_2_probability_color?: string;

  probability_text_color: string;
  category_text_color: string;

  pre_diabetes_probability_text_color?: string;
  diabetes_type_2_probability_text_color?: string;
};

export type ReportSection = {
  name: string;
  body: string;
  image_url?: string;
  list: string[];
};

export type PeriodicMonitoringSection = ReportSection & {
  action_name?: string;
};

export type LifeStyleSection = Omit<ReportSection, 'list'> & {
  list: {
    name: string;
    body: string;
    image_url?: string;
  }[];
};

export type ReportInfo = {
  result: ReportSection;
  medical_referral: ReportSection;
  periodic_monitoring: PeriodicMonitoringSection;
  lab_test: ReportSection;
  lifestyle_recommendation: LifeStyleSection;
  footer: ReportSection;
};

export type ViewRiskScoreData = {
  score_info: RiskScoreInfo;
  report_info: ReportInfo;
};

export type ViewRiskScoreResponse = {
  screen_name: 'view_risk_score';
  data: ViewRiskScoreData;
};

export type ListElement = {
  body: string;
  list: string[];
};

export type GenerateRiskScoreResponse = {
  screen_name: 'generate_risk_score';
  data: null;
};

// ----------------- VoiceScan -----------------

export type VoiceScanImageDataResponse = {
  image_id: string;
  image_url: string;
};

export type InitiateVoiceScanResponse = {message: string; session_id: string};

export type VoiceUploadResponse = {
  message: string;
  s3_key: string;
};

export type ProcessVoiceRecordResponse = {
  message: string;
  assessment_id: string;
};

export interface VoiceScanReportDetailErrorResponse {
  error: boolean;
  message: {
    header: string;
    description: string;
  };
}

export type VoiceScanReportDetailSuccessResponse = {
  error: false;
  data: {
    [key: string]: any;
  };
};

export interface VoiceScanReportItem {
  key: string;
  value: number;
  color?: string;
  category?: string;
}

interface ColorRange {
  range?: [number, number] | [string];
  color: string;
  category: string;
  map?: number;
}

interface ScaleConfigItem {
  display: string;
  unit?: string;
  range?: [number, number];
  color_range?: ColorRange[];
  scale?: string[];
  type?: string;
  short_info?: string;
  long_info?: string;
  long_intro?: string;
  scale_type?: number;
  short_intro?: string;
}

export interface VoiceScanReport {
  report_generation_time: string;
  wellness_score: number;
  voice_scan_report: VoiceScanReportItem[];
  scale_config: {
    [key: string]: ScaleConfigItem;
  };
  sub_categorization: {
    [category: string]: string[];
  };
}

export interface VoiceScanReportDetailPendingResponse
  extends VoiceScanReportDetailErrorResponse {
  error: false;
}

export type VoiceScanReportDetailResponse =
  | VoiceScanReportDetailPendingResponse
  | VoiceScanReportDetailErrorResponse
  | VoiceScanReport;

export function isVoiceScanReport(
  data: VoiceScanReportDetailResponse | undefined,
): data is VoiceScanReport {
  return (data as VoiceScanReport)?.voice_scan_report !== undefined;
}

export function isVoiceScanReportDetailError(
  data: VoiceScanReportDetailResponse | undefined,
): data is VoiceScanReportDetailErrorResponse {
  return (data as VoiceScanReportDetailErrorResponse)?.error === true;
}

export function isVoiceScanReportPending(
  data: VoiceScanReportDetailResponse,
): data is VoiceScanReportDetailPendingResponse {
  return (data as VoiceScanReportDetailErrorResponse).error === false;
}

export interface VoiceReportPaginationData {
  // reading_id: string;
  // WELLNESS_INDEX: number;
  // created_at: string;
  // reading_source: string;

  session_id: string;
  wellness_score: number;
  timestamp: string;
}

export type Stats = {
  min: number;
  max: number;
  count: number;
};

export interface VoiceReportPagination {
  reading_data: VoiceReportPaginationData[];
  count: number;
  stats: Stats;
}

export interface VoiceScanReportListResponse {
  statusCode: number;
  success: boolean;
  data: VoiceReportPagination;
}
