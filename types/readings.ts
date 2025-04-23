export type PreHealthConfiguration = {
  name: string;
  value: string;
  unit: string;
  vitalType: number;
  iconName: string;
  config: {
    relative: number;
  };
};

export type USER_ACTIVITY =
  | 'scan_intent_failed'
  | 'start_scan'
  | 'scan_error'
  | 'end_scan'
  | 'stop_scan'
  | 'update_admin_detail'
  | 'adding_profile'
  | 'update_profile_detail'
  | 'delete_account'
  | 'delete_profile'
  | 'delete_report'
  | 'delete_voice_scan_report'
  | 'create_questionnaire'
  | 'update_questionnaire'
  | 'restart_questionnaire'
  | 'submit_questionnaire'
  | 'scan_ai_report'
  | 'onboarding_step'
  | 'share_report'
  | 'login'
  | 'logout'
  | 'change_pwd'
  | 'geo_location_permission_granted'
  | 'has_geo_locaton_permission'
  | 'anura_event'
  | 'camera_permission_granted'
  | 'voice_scan_start'
  | 'voice_scan_recording_start'
  | 'voice_scan_recording_stop'
  | 'voice_scan_recording_error'
  | 'voice_scan_upload_start'
  | 'voice_scan_upload_complete'
  | 'voice_scan_upload_error'
  | 'voice_scan_report_generation_start'
  | 'voice_scan_report_generation_complete'
  | 'voice_scan_report_generation_error'
  | 'voice_scan_report_view'
  | 'voice_scan_report_share';

export type SCAN_SESSION_STATUS =
  | 'start_scan'
  | 'scan_error'
  | 'end_scan'
  | 'stop_scan'
  | 'deeplink_opened'
  | 'ongoing_session';
