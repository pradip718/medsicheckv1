import {create} from 'zustand';
import {ModifiedQuestionnaireResponse} from '../src/screens/auth/Register/Additional_Information/type';
import {ViewRiskScoreData} from '../types/api_response';

export type EngineName = 'hypertension_risk' | 'diabetes_risk';

interface QuestionnaireState {
  currentQuestion: ModifiedQuestionnaireResponse | null;
  setCurrentQuestion(config: ModifiedQuestionnaireResponse): void;
  engine_name: EngineName | null;
  setEngineName(name: EngineName): void;
  viewRiskDetails: ViewRiskScoreData | null;
  setViewRiskDetails(details: ViewRiskScoreData): void;

  actionData: {fromScreen: string; action: () => Promise<void>} | null;
  setActionData: (data: {
    fromScreen: string;
    action: () => Promise<void>;
  }) => void;
  executeAction: () => Promise<void>;
}

const useHealthRiskStore = create<QuestionnaireState>((set, get) => ({
  currentQuestion: null,
  setCurrentQuestion: question => set({currentQuestion: question}),
  engine_name: null,
  setEngineName: name => set({engine_name: name}),
  viewRiskDetails: null,
  setViewRiskDetails: details => set({viewRiskDetails: details}),

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
}));

export default useHealthRiskStore;
