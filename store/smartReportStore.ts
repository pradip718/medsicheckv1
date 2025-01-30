import {create} from 'zustand';
import {QuestionnaireItem} from '../types/personalisedai';

interface AIReportState {
  currentQuestionAnswers: QuestionnaireItem | null;
  setCurrentQuestionAnswers(question: QuestionnaireItem): void;
}

interface LabReportState {
  currentQuestionAnswers: QuestionnaireItem | null;
  setCurrentQuestionAnswers(question: QuestionnaireItem): void;
}

export const useAIReportStore = create<AIReportState>(set => ({
  currentQuestionAnswers: null,
  setCurrentQuestionAnswers: qa => set({currentQuestionAnswers: qa}),
}));

export const useLabReportStore = create<LabReportState>(set => ({
  currentQuestionAnswers: null,
  setCurrentQuestionAnswers: qa => set({currentQuestionAnswers: qa}),
}));
