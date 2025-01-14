import {MainStackParamList} from '../../types/navigation';

export const DEEPLINK_CONFIG: Record<string, keyof MainStackParamList> = {
  'face-scan': 'FaceScan',
  face_scan: 'QRFaceScan',
  login: 'Login',
  register: 'Register',
  'about-app': 'AboutApp',
  'health-wallet': 'HealthWallet',
  additional_info: 'AdditionalDetail',
  initiate_ai_report: 'PersonalisedAI',
  initiate_lab_report: 'LabReport',
  initiate_face_scan: 'FaceScan',
  lab_report: 'LabReportDetail',
  ai_report: 'AIHealthReportDetail',
  scan_report: 'ReportStackScreens',
  // Add more paths as needed
};
