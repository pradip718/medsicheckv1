/**
 * Analytics event types and property interfaces
 */

// Event name constants
export const ANALYTICS_EVENTS = {
  // Screen tracking
  SCREEN_VIEWED: 'Screen Viewed',

  // FaceScan events
  FACESCAN_CAMERA_VIEWED: 'FaceScanCamera Viewed',
  FACESCAN_MEASUREMENT_STARTED: 'FaceScan Measurement Started',
  FACESCAN_MEASUREMENT_STOPPED: 'FaceScan Measurement Stopped',
  FACESCAN_MEASUREMENT_SUCCESS: 'FaceScan Measurement Success',
  FACESCAN_MEASUREMENT_ERROR: 'FaceScan Measurement Error',
  FACESCAN_VIDEO_RECORDING_STARTED: 'FaceScan Video Recording Started',
  FACESCAN_VIDEO_RECORDING_STOPPED: 'FaceScan Video Recording Stopped',
  FACESCAN_VIDEO_RECORDING_ENABLED: 'FaceScan Video Recording Enabled',
  FACESCAN_VIDEO_RECORDING_DISABLED_CELLULAR:
    'FaceScan Video Recording Disabled - Cellular',
  FACESCAN_VIDEO_RECORDING_DISABLED_EXPENSIVE:
    'FaceScan Video Recording Disabled - Expensive Connection',
  FACESCAN_VIDEO_RECORDING_DISABLED_LOW_LINK_SPEED:
    'FaceScan Video Recording Disabled - Low Link Speed',
  FACESCAN_VIDEO_RECORDING_DISABLED_LOW_SIGNAL:
    'FaceScan Video Recording Disabled - Low Signal Strength',
  FACESCAN_VIDEO_RECORDING_DISABLED_LOW_BANDWIDTH:
    'FaceScan Video Recording Disabled - Low Bandwidth',
  FACESCAN_VIDEO_UPLOAD_STARTED: 'FaceScan Video Upload Started',
  FACESCAN_VIDEO_UPLOAD_SUCCESS: 'FaceScan Video Upload Success',
  FACESCAN_VIDEO_UPLOAD_ERROR: 'FaceScan Video Upload Error',
  FACESCAN_ERROR: 'FaceScan Error',
  FACESCAN_LOW_CONFIDENCE: 'FaceScan Low Confidence',
  FACESCAN_REPORT_SUBMITTED: 'FaceScan Report Submitted',
  FACESCAN_REPORT_SUBMISSION_ERROR: 'FaceScan Report Submission Error',
  FACESCAN_RETRY: 'FaceScan Retry',
  FACESCAN_CONTINUE: 'FaceScan Continue',

  // Authentication events
  USER_LOGIN_STARTED: 'User Login Started',
  USER_LOGIN_SUCCESS: 'User Login Success',
  USER_LOGIN_ERROR: 'User Login Error',
  USER_REGISTRATION_STARTED: 'User Registration Started',
  USER_REGISTRATION_SUCCESS: 'User Registration Success',
  USER_REGISTRATION_ERROR: 'User Registration Error',
  USER_LOGOUT: 'User Logout',
  OTP_VERIFICATION_STARTED: 'OTP Verification Started',
  OTP_VERIFICATION_SUCCESS: 'OTP Verification Success',
  OTP_VERIFICATION_ERROR: 'OTP Verification Error',

  // Profile events
  PROFILE_VIEWED: 'Profile Viewed',
  PROFILE_UPDATED: 'Profile Updated',
  FAMILY_MEMBER_ADDED: 'Family Member Added',
  FAMILY_MEMBER_UPDATED: 'Family Member Updated',
  FAMILY_MEMBER_DELETED: 'Family Member Deleted',

  // Health Risks events
  HEALTH_RISK_ASSESSMENT_STARTED: 'Health Risk Assessment Started',
  HEALTH_RISK_ASSESSMENT_COMPLETED: 'Health Risk Assessment Completed',
  HEALTH_RISK_QUESTIONNAIRE_VIEWED: 'Health Risk Questionnaire Viewed',
  HEALTH_RISK_SCORE_VIEWED: 'Health Risk Score Viewed',

  // Voice Scan events
  VOICE_SCAN_STARTED: 'Voice Scan Started',
  VOICE_SCAN_COMPLETED: 'Voice Scan Completed',
  VOICE_SCAN_ERROR: 'Voice Scan Error',
  VOICE_SCAN_REPORT_VIEWED: 'Voice Scan Report Viewed',

  // Symptom Checker events
  SYMPTOM_CHECKER_STARTED: 'Symptom Checker Started',
  SYMPTOM_CHECKER_COMPLETED: 'Symptom Checker Completed',
  SYMPTOM_CHECKER_REPORT_GENERATED: 'Symptom Checker Report Generated',

  // Report events
  REPORT_VIEWED: 'Report Viewed',
  REPORT_SHARED: 'Report Shared',
  REPORT_DOWNLOADED: 'Report Downloaded',

  // Settings events
  SETTINGS_VIEWED: 'Settings Viewed',
  SETTING_CHANGED: 'Setting Changed',
  LANGUAGE_CHANGED: 'Language Changed',
  NOTIFICATION_PREFERENCES_UPDATED: 'Notification Preferences Updated',
} as const;

export type AnalyticsEventName =
  (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

// Property interfaces for different event types
export interface ScreenViewedProperties {
  screen_name: string;
  previous_screen?: string;
}

export interface FaceScanMeasurementStartedProperties {
  reading_id: string;
  scan_duration?: number;
}

export interface FaceScanVideoRecordingProperties {
  reading_id: string;
  video_path?: string;
}

export interface FaceScanVideoUploadProperties {
  reading_id: string;
  file_size?: number;
  upload_duration?: number;
  error_message?: string;
}

export interface FaceScanErrorProperties {
  reading_id: string;
  error_type?: string;
  error_code?: string | number;
  image_validity?: Record<string, number>;
  error_message?: string;
}

export interface FaceScanMeasurementSuccessProperties {
  reading_id: string;
  final_value?: Record<string, unknown>;
}

export interface UserLoginErrorProperties {
  error_type?: string;
  error_message?: string;
}

export interface ProfileUpdatedProperties {
  fields_changed?: string[];
}

export interface ReportViewedProperties {
  report_type: string;
  report_id?: string;
}

export interface SettingChangedProperties {
  setting_name: string;
  setting_value: string | boolean | number;
}

// Generic properties type
export type AnalyticsProperties =
  | ScreenViewedProperties
  | FaceScanMeasurementStartedProperties
  | FaceScanVideoRecordingProperties
  | FaceScanVideoUploadProperties
  | FaceScanErrorProperties
  | FaceScanMeasurementSuccessProperties
  | UserLoginErrorProperties
  | ProfileUpdatedProperties
  | ReportViewedProperties
  | SettingChangedProperties
  | Record<string, unknown>;

// User properties interface
export interface UserProperties {
  user_id?: string;
  profile_id?: string;
  email?: string;
  phone_number?: string;
  given_name?: string;
  family_name?: string;
  middle_name?: string;
  gender?: string;
  age?: number;
  birthdate?: string;
  height?: string;
  weight?: string;
  height_unit?: string;
  weight_unit?: string;
  bmi?: string;
  bmi_category?: string;
  relation?: string;
  locale?: string;
}
