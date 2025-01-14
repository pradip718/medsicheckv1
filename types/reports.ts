import {ImageSourcePropType} from 'react-native';
import {ConfidenceLevels} from '../src/constants/enums';

export type SubParameter = {
  vital_key: string;
};

export type Parameter = {
  vital_key: string;
  subParameters: SubParameter[];
  display: string;
};

export type VitalsAndBiomarkersDisplay = {
  [category: string]: Parameter[];
};

export type ConfidenceLevelKeys = keyof typeof ConfidenceLevels;

export type VitalsWithImg = {
  [key: string]: ImageSourcePropType;
};
