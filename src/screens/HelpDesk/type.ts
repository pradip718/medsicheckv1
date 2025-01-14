import useLanguageStore from '../../../store/languageStore';

const issue_priorities =
  useLanguageStore?.getState()?.languages?.issue_priorities.priorities;

export type ChatHistory = {
  name: string;
  isUser: boolean;
  issue_description?: string;
  response?: string;
};

export type IssuePriorityType = keyof typeof issue_priorities;
export type Priority = {
  default: keyof typeof issue_priorities;
  priorities: IssuePriorityType;
};
