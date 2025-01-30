import {create} from 'zustand';
import {QuestionnaireItem} from '../types/personalisedai';

interface AIReportState {
  currentQuestionAnswers: QuestionnaireItem | null;
  setCurrentQuestionAnswers(question: QuestionnaireItem): void;
}

export const useAIReportStore = create<AIReportState>(set => ({
  currentQuestionAnswers: null,
  setCurrentQuestionAnswers: qa => set({currentQuestionAnswers: qa}),
}));
