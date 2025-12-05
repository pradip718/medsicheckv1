/**
 * Type definition for language/translation strings used in validation schemas
 */
export type ValidationLanguages = {
  // Email validation
  email_empty?: string;
  email_required?: string;
  email_validation_error_msg?: string;

  // Password validation
  password_is_required?: string;
  password_requirements_message_with_length_and_requirements?: string;
  confirm_password_is_required?: string;
  password_does_not_match_error_message?: string;

  // Phone validation
  required_phone_number?: string;
  phone_number_must_be_valid?: string;
  duplicate_phone_content?: string;

  // Name validation
  first_name_required?: string;
  last_name_required?: string;
  letter_space_validation?: string;
  min_name_character?: string;

  // Height validation
  height_required?: string;
  min_height_cm_error?: string;
  max_height_cm_error?: string;
  min_height_ft_error?: string;
  max_height_ft_error?: string;
  valid_height_error?: string;

  // Weight validation
  weight_required?: string;
  min_weight_kgs_error?: string;
  max_weight_kgs_error?: string;
  min_weight_lbs_error?: string;
  max_weight_lbs_error?: string;
  valid_weight_error?: string;

  // Other
  duplicate_email_content?: string;
  dob_validation_subheader?: string;
};
