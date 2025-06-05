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
