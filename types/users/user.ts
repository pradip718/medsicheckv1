export type User = {
  user_id?: string;
  bmi: string;
  bmi_category: string;
  birthdate: string;
  gender: 'male' | 'female' | 'other';
  given_name: string;
  family_name: string;
  middle_name?: string;
  email: string;
  relation: string;
  other_relation?: string;
  locale?: string;
  height: string;
  weight: string;
  height_unit: 'cm' | 'in' | 'feet';
  weight_unit: 'kg' | 'lbs';
  phone_number?: string;
};

export type Family = User & {
  email?: string;
  phone_number?: string;
  profile_id?: string;
};

export type UserAttributesResponse = {
  data: Record<'user_attributes', User>;
  statusCode: number;
  success: boolean;
};

export type FamilyMembers = User & {
  // family_name: string;
  // given_name: string;
  profile_id: string;
  relation: string;
  // user_id: string;
};

export type RescanConfiguration = {
  rescan_flag: boolean;
  error: string;
  error_msg: string;
};

export type AccountStatus = {
  approved: boolean;
  error: string;
  error_msg: string;
  content: {
    header: string;
    sub_header: string;
    progress_msg: string;
  };
};

export type FeedbackPayload = {
  rating: number;
  feedback_title: string;
  feedback_content: string;
};

export type ProfileType = 'myInfo' | 'familyInfo';

export type PostFamilyAttributesFailureResponse = {
  email_duplication: boolean;
  phone_duplication: boolean;
};
export type PostFamilyAttributesSuccessResponse = {
  // data: {
  profile_id: string;
  // };
};
