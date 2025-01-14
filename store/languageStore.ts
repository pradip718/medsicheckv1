import {create} from 'zustand';
import defaultEnglishLanguage from '../src/constants/Json/en.json';
import defaultSpanishLanguage from '../src/constants/Json/es.json';
import {getDeviceLocaleInformation} from '../utils/methods';

export type Language = typeof defaultEnglishLanguage;

interface LanguageState {
  languages: Language;
  setLanguages: (language: Language) => void;
}

const useLanguageStore = create<LanguageState>()(set => ({
  languages: defaultEnglishLanguage,
  setLanguages: async language => {
    try {
      const locale = await getDeviceLocaleInformation();
      const newLanguages = {...defaultEnglishLanguage, ...language};
      if (locale.startsWith('es')) {
        set(() => ({languages: {...defaultSpanishLanguage, ...newLanguages}}));
      } else {
        set(() => ({languages: {...defaultEnglishLanguage, ...newLanguages}}));
      }
    } catch (error) {
      console.error('Failed to set default language:', error);
    }
  },
}));

export default useLanguageStore;
