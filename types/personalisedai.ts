import {KeyboardTypeOptions} from 'react-native';
import {QuestionType} from '../src/constants/enums';

export type ValidationType = {
  type?: KeyboardTypeOptions;
  max?: string;
  min?: string;
  previous_flag: boolean;
  size: 'small' | 'medium' | 'large';
};

export type TimeValidation = {
  type: string;
  max_difference: number;
  min_difference: number;
  error_msg: {eng: string; spanish: string};
};

export type QuestionnaireItem = {
  q_id: string;
  eng_question: string;
  spanish_question: string;
  question_type: QuestionType;
  eng_choices: null;
  spanish_choices: null;
  validation: ValidationType & TimeValidation;
  linked_image: null;
  user_eng_choices: string;
  user_spanish_choices: string;
  answer_id?: string;
  path_type: string;
  token_id?: string;
  retry?: number;
  retryDelay?: number;
};

export type Questionnaire = QuestionnaireItem[];

export type PostQuestionnairePayload = {
  q_id: string;
  eng_choices: string;
  spanish_choices: string;
  answer_id?: string;
  timestamp?: string;
  timezone?: string;
  path_type: string;
};

export type PostQuestionnaireResponse = {
  q_id: string;
  question_type: string;
  eng_question: string;
  spanish_question: string;
  eng_choices: string;
  spanish_choices: string;
  validation: string | null;
  response_based_sequence: boolean;
  linked_image: string | null;
};

export type OtherOption = {
  name: string;
  text: string;
};
