export type PostUserPreferencePayload = {
  preference_id?: string;
  email_flag: boolean;
  whatsapp_flag: boolean;
  push_flag: boolean;
};

export type PostUserPreferenceResponse = {};

export type GetUserPreferenceResponse = {
  preference_id?: string;
  email_flag: boolean;
  whatsapp_flag: boolean;
  push_flag: boolean;
};
