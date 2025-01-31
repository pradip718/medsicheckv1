import {toLower} from 'lodash';
import useLanguageStore from '../../../../store/languageStore';

const languages = useLanguageStore?.getState()?.languages;

export const GENDER = [
  {label: languages?.male, value: toLower(languages?.male)},
  {label: languages?.female, value: toLower(languages?.female)},
];

export const HEIGHT = [
  {label: 'cm', value: 'cm'},
  {label: 'ft', value: 'feet'},
];
export const WEIGHT = [
  {label: 'kg', value: 'kg'},
  {label: 'lbs', value: 'lbs'},
];
