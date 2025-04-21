import useLanguageStore from '../../../store/languageStore';
import {HealthWalletCategory} from './type';

export const HEALTH_WALLET_CATEGORY_LIST: HealthWalletCategory[] = [
  {
    name: useLanguageStore.getState().languages.vital_scan_reports_title,
    identifier: 'vital_scan_report',
    count_title: useLanguageStore.getState().languages.total_scans,
    count: 32,
    button_title: useLanguageStore.getState().languages.new_face_scan,
    image: require('../../../assets/images/vital_scan.png'),
  },
  {
    name: useLanguageStore.getState().languages.voice_scan_reports_title,
    identifier: 'voice_scan_report',
    count_title: useLanguageStore.getState().languages.total_scans,
    count: 32,
    button_title: useLanguageStore.getState().languages.new_voice_scan,
    image: require('../../../assets/images/health_wallet_voice_scan.png'),
  },
  {
    name: useLanguageStore.getState().languages.ai_health_reports_title,
    identifier: 'ai_health_report',
    count_title: useLanguageStore.getState().languages.total_scans,
    count: 8,
    button_title:
      useLanguageStore.getState().languages.generate_new_ai_report_title,
    image: require('../../../assets/images/health_report.png'),
  },
  {
    name: useLanguageStore.getState().languages.interpret_lab_reports,
    identifier: 'interpret_lab_report',
    count_title: useLanguageStore.getState().languages.total_files_title,
    count: 12,
    button_title: useLanguageStore.getState().languages.upload_lab_report_title,
    image: require('../../../assets/images/lab_report.png'),
  },
  {
    name: useLanguageStore.getState().languages.miscellaneous_files_title,
    identifier: 'miscellaneous_files',
    count_title: useLanguageStore.getState().languages.total_files_title,
    count: 3,
    // button_title: useLanguageStore.getState().languages.upload_new_file_title,
    button_title: '',
    image: require('../../../assets/images/miscellaneous_files.png'),
  },
];

export const Interpret_Report_List = [
  {
    name: 'Report Heading',
    date: '17-Oct-2023 | 4:32 pm ',
  },
  {
    name: 'Report Heading',
    date: '17-Oct-2023 | 4:32 pm ',
  },
  {
    name: 'Report Heading',
    date: '17-Oct-2023 | 4:32 pm ',
  },
  {
    name: 'Report Heading',
    date: '17-Oct-2023 | 4:32 pm ',
  },
  {
    name: 'Report Heading',
    date: '17-Oct-2023 | 4:32 pm ',
  },
  {
    name: 'Report Heading',
    date: '17-Oct-2023 | 4:32 pm ',
  },
];
