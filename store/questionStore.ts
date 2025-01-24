import {create} from 'zustand';
import {
  QuestionnaireSetting,
  SectionStats,
} from '../src/screens/auth/Register/Additional_Information/type';

interface QuestionnaireState {
  currentSection: SectionStats | null;
  currentConfiguration: QuestionnaireSetting | null;
  setCurrentSection(screen: SectionStats): void;
  setCurrentConfiguration(config: QuestionnaireSetting): void;
}

const useQuestionStore = create<QuestionnaireState>(set => ({
  currentSection: null,
  currentConfiguration: null,
  setCurrentSection: section => set({currentSection: section}),
  setCurrentConfiguration: config => set({currentConfiguration: config}),
}));

export default useQuestionStore;
