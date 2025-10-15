import {ImageSourcePropType} from 'react-native';

export type HealthWalletCategory = {
  name: string;
  identifier:
    | 'vital_scan_report'
    | 'voice_scan_report'
    | 'ai_health_report'
    | 'interpret_lab_report'
    | 'symptom_checker'
    | 'miscellaneous_files';
  count_title: string;
  count: number;
  button_title: string;
  image: ImageSourcePropType;
};
