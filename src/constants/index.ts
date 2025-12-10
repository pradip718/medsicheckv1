import {MainStackParamList} from '../../types/navigation';

export const DEEPLINK_CONFIG: Record<string, keyof MainStackParamList> = {
  'face-scan': 'FaceScan',
  face_scan: 'QRFaceScan',
  login: 'Login',
  register: 'Register',
  'about-app': 'AboutApp',
  'health-wallet': 'HealthWallet',
  additional_info: 'AdditionalDetail',
  questionniare_section: 'QuestionnaireSection',
  initiate_ai_report: 'PersonalisedAI',
  initiate_lab_report: 'LabReport',
  initiate_face_scan: 'FaceScan',
  lab_report: 'LabReportDetail',
  ai_report: 'AIHealthReportDetail',
  scan_report: 'ReportStackScreens',
  health_risks: 'HealthRisks',
  voice_scan: 'VoiceScanScreen',
  voice_scan_report_detail: 'VoiceScanReport',
  // Add more paths as needed
};

export const PUBLIC_DEEPLINK_PATH = [
  'face-scan',
  'face_scan',
  'login',
  'register',
  'about-app',
];

export const MEDSI_ALERT_LIMITS = {
  MIN_HEIGHT_CM: 50,
  MAX_HEIGHT_CM: 300,
  MIN_WEIGHT_KG: 20,
  MAX_WEIGHT_KG: 250,
} as const;

export const BINAH_ALERT_LIMITS = {
  MIN_HEIGHT_CM: 130,
  MAX_HEIGHT_CM: 230,
  MIN_WEIGHT_KG: 40,
  MAX_WEIGHT_KG: 200,
  MIN_AGE_YEARS: 18,
  MAX_AGE_YEARS: 110,
} as const;

export const HEIGHT_LIMITS_FEET = {
  min: 1.5,
  max: 9,
};

export const WEIGHT_LIMITS_LBS = {
  min: 44,
  max: 551,
};
