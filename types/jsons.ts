import {ConfidenceLevels} from '../src/constants/enums';
import {VitalsAndBiomarkersDisplay} from './reports';

export interface Vitals {
  data: HealthData;
  timestamp: string;
}

export interface HealthData {
  'Heart Rate': number;
  'Breathing Rate': number;
  PRQ: number;
  'O2 Saturation': number;
  Diastolic: number;
  Systolic: number;
  'Stress level': number;
  'Baevsky Stress index': number;
  'HRV SDNN': number;
  'Mean RRi': number;
  RMSSD: number;
  SD1: number;
  SD2: number;
  'LF/HF': number;
  'PNS Zone': number;
  'PNS Index': number;
  'SNS Zone': number;
  'SNS Index': number;
  Heamoglobin: number;
  'Heamoglobin A1C': number;
  'Total Cholesterol': number;
}

export interface VitalSignConfig {
  'Heart Rate': {
    unit: string;
    scale: {
      min: number;
      max: number;
    };
    scale_type: number;
    short_intro: string;
    long_intro: string;
  };
  'Breathing Rate': {
    unit: string;
    scale: {
      min: number;
      max: number;
    };
    scale_type: number;
    short_intro: string;
    long_intro: string;
  };
  PRQ: {
    scale: {
      min: number;
      max: number;
    };
    scale_type: number;
    short_intro: string;
    long_intro: string;
  };
  Blood: {
    'O2 Saturation': {
      unit: string;
      scale: {
        min: number;
      };
      scale_type: number;
      short_intro: string;
      long_intro: string;
    };
    'Blood Pressure': {
      short_intro: string;
      long_intro: string;
      sub_measurement: {
        Diastolic: {
          unit: string;
          scale: {
            min: number;
            max: number;
          };
          scale_type: number;
        };
        Systolic: {
          unit: string;
          scale: {
            min: number;
            max: number;
          };
          scale_type: number;
        };
      };
    };
  };
  'Stress & Heart Rate Variability': {
    Stress: {
      'Stress level': {
        scale: string[];
        scale_type: number;
      };
      'Baevsky Stress index': {
        scale: {
          min: number;
          max: number;
        };
        scale_type: number;
        short_intro: string;
        long_intro: string;
      };
    };
    'Heart Rate Variability': {
      'HRV SDNN': {
        unit: string;
        scale: {
          min: number;
        };
        scale_type: number;
        short_intro: string;
        long_intro: string;
      };
      'Mean RRi': {
        unit: string;
        scale: {
          min: number;
          max: number;
        };
        scale_type: number;
        short_intro: string;
        long_intro: string;
      };
      RMSSD: {
        unit: string;
        scale: {
          min: number;
          max: number;
        };
        scale_type: number;
        short_intro: string;
        long_intro: string;
      };
      SD1: {
        unit: string;
        short_intro: string;
        long_intro: string;
      };
      SD2: {
        unit: string;
        short_intro: string;
        long_intro: string;
      };
      'LF/HF': {
        short_intro: string;
        long_intro: string;
      };
    };
    Energy: {
      'PNS Zone': {
        scale: string[];
        scale_type: number;
      };
      'PNS Index': {
        scale: {
          min: number;
          max: number;
        };
        scale_type: number;
        short_intro: string;
        long_intro: string;
      };
      'SNS Zone': {
        scale: string[];
        scale_type: number;
      };
      'SNS Index': {
        scale: {
          min: number;
          max: number;
        };
        scale_type: number;
        short_intro: string;
        long_intro: string;
      };
    };
  };
  'Bloodless - Blood Tests': {
    Heamoglobin: {
      unit: string;
      scale: {
        male: number[];
        female: number[];
      };
      scale_type: number;
      short_intro: string;
      long_intro: string;
    };
    'Heamoglobin A1C': {
      unit: string;
      scale: {
        Low: string;
        Normal: number[];
        Prediabetic: number[];
        Diabetic: string;
      };
      scale_type: number;
      short_intro: string;
      long_intro: string;
    };
    'Total Cholesterol': {
      unit: string;
      scale: {
        Normal: string;
        'Borderline High': number[];
        High: string;
      };
      scale_type: number;
      short_intro: string;
      long_intro: string;
    };
  };
}

export interface ReportConfigData {
  confg: {
    'Vital Signs': VitalSignConfig;
  };
}

export interface VitalSignData {
  value: number;
  category: string;
  score: string;
  confidence_level?: 'Low' | 'Medium' | 'High';
}

export type ReadingData = {
  [key: string]: VitalSignData;
  // | {
  //     diastolic: {
  //       value: number;
  //       category: string;
  //       score: string;
  //     };
  //     systolic: {
  //       value: number;
  //       category: string;
  //       score: string;
  //     };
  //   };
};

type ConfigScale = {
  max: number;
  min: number;
  range: [number, number];
};

type ConfigHeamoglobinScale = {
  male: ConfigScale;
  female: ConfigScale;
};

export type ReportScaleRange = [number, number] | [string];

export type ColorRangeItem = {
  range: ReportScaleRange;
  color: string;
  text?: string;
};

export type Config = {
  [key: string]: {
    unit?: string;
    scale?: ConfigScale | ConfigHeamoglobinScale;
    scale_type?: number;
    long_intro?: string;
    short_intro?: string;
    display: string;
    color_range?: ColorRangeItem[];
  };
};

export type ColVal = {
  Default: Record<string, Record<string, string>>;
};

export type Reading = {
  reading_id: string;
  created_at: string;
  reading_data: ReadingData;
  'Wellness Level': string;
  WELLNESS_INDEX: number;
  confidence_level: keyof typeof ConfidenceLevels;
};

export type ReportJson = {
  readings: Reading[];
  config: Config;
  col_val: ColVal;
  sub_categorisation: VitalsAndBiomarkersDisplay;
  scale_value_mapping: {
    [key: string]: number;
  };
};

export type ReportJsonResponse = {
  data: ReportJson;
  statusCode: number;
  success: boolean;
};

export interface ReportPaginationReadingData {
  reading_id: string;
  WELLNESS_INDEX: number;
  created_at: string;
  reading_source: string;
}

export interface ReportPagination {
  reading_data: ReportPaginationReadingData[];
  count: number;
}

export interface ReportJsonPaginationResponse {
  statusCode: number;
  success: boolean;
  data: ReportPagination;
}

export type LabReportFileUploadJsonResponse = {
  token_id: string;
};
