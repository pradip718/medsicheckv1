export type SignUpPayload = {
  username: string;
  password: string;
  phone_number: string;
};

export type VerifyEmailPayload = {
  username: string;
  otp_value: string;
};

export type LoginPayload = {
  username: string;
  password: string;
};

export type ResendEmailConfirmationPayload =
  | {username: string; update_flag?: false}
  | {username: string; update_flag: true; updated_value: string};

export type ForgotPasswordPayload = {
  username: string;
};

export type ConfirmPasswordPayload = {
  username: string;
  otp_value: string;
  password: string;
};

export type OTPChannel = 'sms' | 'whatsapp';

export type LoginOTPPayload = {
  username: string;
  type?: 'login';
  channel?: OTPChannel;
};

export type VerifyLoginOTPPayload = {
  username: string;
  session: string;
  otp_value: string;
  type?: 'login';
  channel?: OTPChannel;
};

type BasePhoneOTPPayload = {
  user_id: string;
  username: string;
  channel?: OTPChannel;
};

export type sendPhoneOTPPayload =
  | (BasePhoneOTPPayload & {update_flag?: false})
  | (BasePhoneOTPPayload & {update_flag: true; updated_value: string});

export type VerifyPhonePayload = {
  user_id: string;
  username: string;
  otp_value: string;
  channel?: OTPChannel;
};

export type ChangePasswordPayload = {
  username: string;
  session: string;
  password: string;
};

//--------------------------------------------Health Risks--------------------------------------------
export type HealthRisksPayload = {
  risk_type: string;
};

//--------------------------------------------Voice Scan--------------------------------------------
export type InitiateVoiceScanPayload = {
  image_id: string;
};

export type VoiceUploadPayload = {
  audio_file: string;
  session_id: string;
  format: 'm4a';
  duration: number;
};

export type ProcessVoiceRecordPayload = {
  session_id: string;
};

export type VoiceScanReportDetailPayload = {
  sessoin_id: string;
};
