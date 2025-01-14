import useLanguageStore from '../../../../store/languageStore';
import {AIUserDetails} from '../../../../types/api_response';

const languages = useLanguageStore.getState().languages;

type PatientInfo = {
  title: string;
  apiKey: (keyof AIUserDetails)[];
};

export const PATIENT_INFORMATION: PatientInfo[] = [
  {
    title: languages?.name,
    apiKey: ['first_name', 'last_name'],
  },
  {
    title: languages?.dob,
    apiKey: ['birthday'],
  },
  {
    title: languages?.gender,
    apiKey: ['gender'],
  },
];
