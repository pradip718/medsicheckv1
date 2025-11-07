import {SYMPTOM_CODE} from '../src/constants/enums';
import {
  Question,
  QuestionnaireGETReponse,
} from '../src/screens/auth/Register/Additional_Information/type';

export type AIHealthList = {
  created_at: string;
  lastmodified_at: string;
  token_id: string;
  report_link: string;
  status: 'success' | 'processed';
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
  status: 'success' | 'processed';
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
  user_password: boolean;
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

export interface GetSymptomParams {
  type: 'latest' | 'single_question' | 'previous';
  restart_flag?: 'true' | 'false';
  q_id?: string;
}

export enum SymptomGenerationScreen {
  QUESTIONNAIRE = 'questionnaire',
  POPUP = 'pop-up',
  REVIEW = 'review',
}

export interface SymptomQuestionResponse {
  data: SymptomQuestion | (SymptomQuestion & {isEdit: boolean});
  screen: SymptomGenerationScreen;
  is_follow?: boolean;
}

export interface SymptomQuestion {
  q_id: string;
  question_sequence: number;
  question_type: string;
  eng_question: string;

  spanish_question: string;
  eng_choices: string;
  spanish_choices: string;
  multi_select: boolean;
  code: SYMPTOM_CODE;
  image_url: {id: string; url: string}[] | null;
  user_eng_choices: any;
  user_spanish_choices: any;
  answer_id: string | null;
  meta_data?: Record<string, string>;
}

export interface SymptomQuestionPayload {
  q_id?: string;
  eng_choices?: string;
  spanish_choices?: string;
  answer_id?: string | null;
  type?: string;
  email_flag?: string;
}

export type SymptomReportList = {
  created_at: string;
  lastmodified_at: string;
  token_id: string;
  report_link: string;
  status: 'success' | 'processed';
};

export type SymptomReportListResponse = {
  count: number;
  data: SymptomReportList[];
};

export interface SymptomCheckerDetailResponse {
  ai_response: string;
  created_at: string;
  report_link: string;
}

export interface FirstHypothesis {
  first_hypothesis_name: string;
  first_hypothesis_text: string;
  first_hypothesis_percentage: string;
  first_hypothesis_level_risk?: string;
}

export interface SecondHypothesis {
  second_hypothesis_name: string;
  second_hypothesis_text: string;
  second_hypothesis_percentage: string;
  second_hypothesis_level_risk?: string;
}

export interface ThirdHypothesis {
  third_hypothesis_name: string;
  third_hypothesis_text: string;
  third_hypothesis_percentage: string;
  third_hypothesis_level_risk?: string;
}

export interface FourthHypothesis {
  fourth_hypothesis_name: string;
  fourth_hypothesis_text: string;
  fourth_hypothesis_percentage: string;
  fourth_hypothesis_level_risk?: string;
}

export interface SymptomCheckerImmediateRecommendation {
  restrictions: string;
  hygiene: string;
  home_remedies: string;
  justification: string;
}

export interface SymptomMedicalConsultations {
  specialty_name: string;
  reason: string;
  urgency_level: string;
}
export interface SymptomCheckerDetail {
  patient_age: string;
  initial_text: string;
  location_of_lesion: string;
  lesion_specifications: string;
  medical_images: string[];
  first_hypothesis?: FirstHypothesis;
  second_hypothesis?: SecondHypothesis;
  third_hypothesis?: ThirdHypothesis;
  fourth_hypothesis?: FourthHypothesis;
  immediately_recommendations: SymptomCheckerImmediateRecommendation;
  medical_consultations: SymptomMedicalConsultations[];
  additional_exams: {
    exam_name: string;
    reason: string;
    preparation: string;
  }[];
  symptom_monitoring: {
    frequency: string;
    method: string;
    methods?: string[];
    reason: string;
  }[];
  lesion_monitoring: {
    frequency: string;
    method: string;
    reason: string;
  }[];
}

export function isLoginSuccessResponse(
  data: LoginSuccessResponse | LoginOTPResponse | null,
): data is LoginSuccessResponse {
  return data !== null && 'is_verified' in data;
}

export function isLoginOTPResponse(
  data: LoginSuccessResponse | LoginOTPResponse | null,
): data is LoginOTPResponse {
  return data !== null && 'otp_sent' in data && 'session' in data;
}

export function isLoginErrorResponse(
  data:
    | LoginSuccessResponse
    | LoginOTPResponse
    | LoginErrorResponse
    | null
    | undefined,
): data is LoginErrorResponse {
  return (
    data !== null &&
    data !== undefined &&
    'error' in data &&
    !('otp_sent' in data) // Distinguish from LoginOTPResponse which can also have 'error'
  );
}

export type GetPublicKeyResponse = {
  token: string;
  public_key: string;
};
