import useLanguageStore from '../../../../store/languageStore';

const languages = useLanguageStore?.getState()?.languages;

export const GENDER = [
  {label: languages?.male, value: 'male'},
  {label: languages?.female, value: 'female'},
];

export const HEIGHT = [
  {label: 'cm', value: 'cm'},
  {label: 'ft', value: 'feet'},
];
export const WEIGHT = [
  {label: 'kg', value: 'kg'},
  {label: 'lbs', value: 'lbs'},
];
