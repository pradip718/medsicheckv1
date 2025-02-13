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
}

const useHealthRiskStore = create<QuestionnaireState>(set => ({
  currentQuestion: null,
  setCurrentQuestion: question => set({currentQuestion: question}),
  engine_name: null,
  setEngineName: name => set({engine_name: name}),
  viewRiskDetails: null,
  setViewRiskDetails: details => set({viewRiskDetails: details}),
}));

export default useHealthRiskStore;
