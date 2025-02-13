export type QuestionType = 'textbox' | 'dropdown' | 'label' | 'action';

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
  answer_id: string;
  q_id: string;
  eng_question: string;
  spanish_question: string;

  eng_choices: string;
  spanish_choices: string;
  skip_flag: boolean;
  question_sequence: number;
  meta_data: {
    section_first_question: boolean;
  };
  question_type: QuestionType;
  multi_select: boolean;

  section_number: number;
  section_sequence: number;
  section_name: string;
};

export type QuestionnaireGETReponse = BaseQuestion & {
  eng_choices: string;
  spanish_choices: string;
  user_eng_choices: string | null;
  user_spanish_choices: string | null;
};

export type Question = BaseQuestion & {
  eng_choices: Choices;
  spanish_choices: Choices;
  user_eng_choices: string | Choices | null;
  user_spanish_choices: string | Choices | null;
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
  data: QuestionnaireGETReponse;
  success: boolean;
};

export type ResponseQuestionStatus = {
  data: QuestionStatus;
  success: boolean;
};

export type SectionStats = {
  section_name: string;
  section_number: number;
  total_questions: number;
  total_answered: number;
  icon_url: string;
};

export type QuestionnaireSetting = {
  skip: boolean;
  single_question: boolean;
  overall_skip: boolean;
};

export type SectionConfigurations = {
  questionnaireSetting: QuestionnaireSetting;
  sectionStats: SectionStats[];
};

export type QuestionnaireResponse = {data: QuestionnaireGETReponse[]};

export type ModifiedQuestionnaireResponse = Question[];

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

export type QuestionnairePostResponse =
  | {data: QuestionnaireGETReponse[]}
  | {data: string};
