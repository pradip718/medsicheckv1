import {format, parseISO} from 'date-fns';

export const formatDate = (date: string, dateFormat?: string) => {
  if (!date) {
    return '';
  }

  const dateObject = parseISO(date);
  return format(dateObject, dateFormat || 'dd-MM-yyyy');
};

export const formatTime = (date: string) => {
  if (!date) {
    return '';
  }

  const dateObject = parseISO(date);
  return format(dateObject, 'h:mm a');
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

export const SymptomCodeScreenMapper = {
  [SYMPTOM_CODE.SELECT_BODY_PART]: 'SymptomSelectBody',
  [SYMPTOM_CODE.FEEL_SYMPTOMS]: 'SymptomFeelSymptoms',
  [SYMPTOM_CODE.PAIN_LEVEL]: 'SymptomPainLevel',
  [SYMPTOM_CODE.SYMPTOMS_DURATION]: 'SymptomSymptomsDuration',
  [SYMPTOM_CODE.STARTED_MEDICATION]: 'SymptomStartedMedication',
  [SYMPTOM_CODE.IMAGE_UPLOAD]: 'SymptomImageUpload',
  [SYMPTOM_CODE.ADDITIONAL_DETAIL]: 'SymptomAdditionalDetails',
  [SYMPTOM_CODE.OTHER_BODY_PART]: 'SymptomOtherBodyPart',
  [SYMPTOM_CODE.OTHER_SYMPTOMS]: 'SymptomOtherSymptoms',

  review: 'SymptomReview',
  [SYMPTOM_CODE.CONFIRMATION]: 'SymptomConfirmation',
} as any;

export function getBodyImage(part: string) {
  if (part === 'Forehead') {
    return require('../assets/images/SymptomChecker/forehead.png');
  }
  if (part === 'Mouth') {
    return require('../assets/images/SymptomChecker/mouth.png');
  }
  if (part === 'Nose') {
    return require('../assets/images/SymptomChecker/nose.png');
  }
  if (part === 'Eyes') {
    return require('../assets/images/SymptomChecker/eyes.png');
  }
  if (part === 'Ear') {
    return require('../assets/images/SymptomChecker/ear.png');
  }
  if (part === 'Neck') {
    return require('../assets/images/SymptomChecker/neck.png');
  }
  if (part === 'Back') {
    return require('../assets/images/SymptomChecker/back.png');
  }
  if (part === 'Shoulder') {
    return require('../assets/images/SymptomChecker/shoulder.png');
  }
  if (part === 'Upper back') {
    return require('../assets/images/SymptomChecker/upper_back.png');
  }
  if (part === 'Upper Arm') {
    return require('../assets/images/SymptomChecker/upper_arm.png');
  }
  if (part === 'Lower Back') {
    return require('../assets/images/SymptomChecker/lower_back.png');
  }
  if (part === 'Forearm') {
    return require('../assets/images/SymptomChecker/forearm.png');
  }
  if (part === 'Chest') {
    return require('../assets/images/SymptomChecker/chest.png');
  }
  if (part === 'Hands') {
    return require('../assets/images/SymptomChecker/hands.png');
  }
  if (part === 'Waist/Torso') {
    return require('../assets/images/SymptomChecker/waist.png');
  }
  if (part === 'Hips') {
    return require('../assets/images/SymptomChecker/hips.png');
  }
  if (part === 'Calves') {
    return require('../assets/images/SymptomChecker/calves.png');
  }
  if (part === 'Thighs') {
    return require('../assets/images/SymptomChecker/thighs.png');
  }
  if (part === 'Feet') {
    return require('../assets/images/SymptomChecker/feet.png');
  }
  if (part === 'Heels') {
    return require('../assets/images/SymptomChecker/heels.png');
  }
  return require('../assets/images/SymptomChecker/body.png');
}
