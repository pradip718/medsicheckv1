export enum QuestionType {
  Label = 'label',
  Welcome = 'welcome',
  SingleSelect = 'single-select',
  // TimeFormat = 'timeformat',
  DateFormat = 'date',
  TimeFormat = 'timeformat',
  DateTimeFormat = 'datetime',
  Text = 'text',
  MultiSelect = 'multi-select',
  FinalMessage = 'final_message',
  Submitted = 'submitted',
  END = 'end',
  FileUpload = 'file-upload',
}

export const ENGLISH_OTHER = 'Other';
export const SPANISH_OTHER = 'Otro';
export const ENGLISH_NONE_OF_THE_ABOVE = 'None of the above';
export const SPANISH_NONE_OF_THE_ABOVE = 'Ninguna de las anteriores';
export const ENGLISH_YES = 'Yes';
export const SPANISH_YES = 'Si';

export const MY_INFO = 'myInfo';
export const FAMILY_INFO = 'familyInfo';

export const ConfidenceLevels = {
  High: '#09BF06',
  Medium: '#EBCA52',
  Low: '#EB5252',

  Elevado: '#09BF06',
  Elevada: '#09BF06',
  Promedio: '#EBCA52',
  Promedia: '#EBCA52',
  Bajo: '#EB5252',
  Baja: '#EB5252',
  Default: '#D9D9D9',
};

export enum SYMPTOM_CODE {
  SELECT_BODY_PART = 'body_symptoms',
  FEEL_SYMPTOMS = 'physical_symptoms',
  PAIN_LEVEL = 'pain_level',
  SYMPTOMS_DURATION = 'experiencing_condition',
  STARTED_MEDICATION = 'medication_remedies',
  IMAGE_UPLOAD = 'image_upload',
  ADDITIONAL_DETAIL = 'additional_symptoms_details',
  OTHER_BODY_PART = 'other_body_symptoms',
  OTHER_SYMPTOMS = 'symptoms_other_parts',

  CONFIRMATION = 'pop_up',
}
