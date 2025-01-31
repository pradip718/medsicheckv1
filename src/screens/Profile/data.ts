import {isObject, toLower} from 'lodash';
import useLanguageStore from '../../../store/languageStore';
import {User} from '../../../types/users/user';

const languages = useLanguageStore.getState()?.languages;

export const GENERAL_INFORMATION: {
  title: string;
  value: string;
  apiKey: (keyof User)[];
}[] = [
  {
    title: languages?.name,
    value: 'John Doe',
    apiKey: ['given_name', 'family_name'],
  },
  {
    title: languages?.dob,
    value: '31 / 05 / 1995',
    apiKey: ['birthdate'],
  },
  {
    title: languages?.gender,
    value: 'Male',
    apiKey: ['gender'],
  },
];

export const BODY_MASS_INDEX_INFORMATION: {
  title: string;
  value: string;
  apiKey: (keyof User)[];
}[] = [
  {
    title: languages?.bmi_score,
    value: '',
    apiKey: ['bmi'],
  },
  {
    title: languages?.bmi_status,
    value: '',
    apiKey: ['bmi_category'],
  },
  {
    title: languages?.height,
    value: '173 cm',
    apiKey: ['height', 'height_unit'],
  },
  {
    title: languages?.weight,
    value: '82 kg',
    apiKey: ['weight', 'weight_unit'],
  },
];

export const GENDER = [
  {label: languages?.male, value: toLower(languages?.male)},
  {label: languages?.female, value: toLower(languages?.female)},
];

export const RELATIONSHIPS = isObject(languages?.relation_list)
  ? Object.entries(languages?.relation_list)?.map(
      ([relationKey, relationValue]) => ({
        label: relationValue,
        value: relationKey,
      }),
    )
  : [];

export const HEIGHT = [
  {label: 'cm', value: 'cm'},
  {label: 'ft', value: 'feet'},
];
export const WEIGHT = [
  {label: 'kg', value: 'kg'},
  {label: 'lbs', value: 'lbs'},
];
