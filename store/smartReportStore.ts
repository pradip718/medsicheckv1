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

interface AIReportFacescanState {
  actionData: {fromScreen: string; action: () => Promise<void>} | null;
  setActionData: (data: {
    fromScreen: string;
    action: () => Promise<void>;
  }) => void;
  executeAction: () => Promise<void>;
}

export const useAIReportStore = create<AIReportState>(set => ({
  currentQuestionAnswers: null,
  setCurrentQuestionAnswers: qa => set({currentQuestionAnswers: qa}),
}));

export const useLabReportStore = create<LabReportState>(set => ({
  currentQuestionAnswers: null,
  setCurrentQuestionAnswers: qa => set({currentQuestionAnswers: qa}),
}));

export const useAIReportFacescanStore = create<AIReportFacescanState>(
  (set, get) => ({
    actionData: null,
    setActionData: data => set({actionData: data}),
    executeAction: async () => {
      const {actionData} = get();
      if (actionData?.action) {
        try {
          await actionData.action();
        } catch (error) {
          console.error(
            `Error executing action from ${actionData.fromScreen}:`,
            error,
          );
        } finally {
          set({actionData: null});
        }
      }
    },
  }),
);
