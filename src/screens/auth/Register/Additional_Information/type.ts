type QuestionType = 'textbox' | 'dropdown';

export type DropdownItem = {
  label: string;
  value: string;
  txt?: string;
};

export type NestedChoice = {[key: string]: string | string[]};
export type Choice = string | NestedChoice;

export type Choices = Choice[];

export type BaseQuestion = {
  created_at: string;
  lastmodified_at: string;
  q_id: string;
  eng_question: string;
  spanish_question: string;
  question_type: QuestionType;
  multi_select: boolean;
  question_sequence: number;
  final_question?: boolean;
};

export type QuestionnaireReponse = BaseQuestion & {
  eng_choices: string;
  spanish_choices: string;
};

export type Question = BaseQuestion & {
  eng_choices: Choices;
  spanish_choices: Choices;
};

export type QuestionSet = {
  data: Question[];
  success: boolean;
};

export type QuestionStatus = {
  startFlag: boolean;
  completionFlag: boolean;
};

export type ResponseQuestionSet = {
  data: QuestionnaireReponse;
  success: boolean;
};

export type ResponseQuestionStatus = {
  data: QuestionStatus;
  success: boolean;
};

export type RetrieveTypeMap = {
  latest: QuestionnaireReponse;
  previous: QuestionnaireReponse;
  completion_status: ResponseQuestionStatus;
};

export type QuestionnaireResponse<T extends keyof RetrieveTypeMap | undefined> =
  T extends keyof RetrieveTypeMap ? RetrieveTypeMap[T] : QuestionnaireReponse;

export type RetrieveType = 'all' | 'latest' | 'previous' | 'completion_status';

export type SelectedAnswers = {
  question_id: string;
  answer_id?: string;
  choice_value: string | Choices;
  spanish_choice_value: string | Choices;
};

export type RequestAddQuestion = {
  data: SelectedAnswers[];
};

export type AnswerSetData = {
  answer_id: string;
  created_at: string;
  lastmodified_at: string;
  q_id: string;

  eng_choices: Choices | string;
  eng_question: string;
  spanish_choices: Choices | string;
  spanish_question: string;

  user_eng_choices: string | string[];
  user_spanish_choices: string | string[];
  skip_flag: boolean;
  question_sequence: number;
  meta_data: any;
  question_type: 'textbox' | 'dropdown';
  multi_select: boolean;
};

export type AnswerSet = {
  data: AnswerSetData[];
  success: boolean;
};

export type ResponseAnswerSet = {
  data: {
    answer_id: string;
    created_at: string;
    lastmodified_at: string;
    q_id: string;

    eng_choices: string;
    eng_question: string;
    spanish_choices: string;
    spanish_question: string;
    user_eng_choices: string;
    user_spanish_choices: string;
    skip_flag: boolean;
    question_sequence: number;
    meta_data: any;
    question_type: string;
    multi_select: boolean;
  }[];
  success: boolean;
};

export type RequestAnswers = {
  data: {
    answer_id: string;
    choice_value: string;
    created_at: string;
    lastmodified_at: string;
    q_id: string;
    question: string;
    spanish_choice_value: string;
  }[];
};

export type QuestionnairePostResponse = {
  created_at: string;
  lastmodified_at: string;
  answer_id: string;
  q_id: string;
  eng_question: string;
  spanish_question: string;
  user_eng_choices: string;
  user_spanish_choices: string;
  eng_choices: string;
  spanish_choices: string;
  skip_flag: boolean;
  question_sequence: number;
  meta_data: null;
  question_type: QuestionType;
  final_question?: boolean;
  multi_select: boolean;
};
