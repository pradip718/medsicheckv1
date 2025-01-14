import {VitalSignTypes} from 'biosensesignal-react-native-sdk';
import Config from 'react-native-config';
import {
  BatteryStatus,
  CorrectPosition,
  FreepikDevice,
  PersonAtTable,
} from '../../../assets';
import useLanguageStore from '../../../store/languageStore';
import {isAndroid} from '../../../utils';

const languages = useLanguageStore?.getState()?.languages;

export const ENTRIES1 = [
  {
    title: '',
    subtitle: languages?.first_carousal_text,
    illustration: FreepikDevice,
  },
  {
    title: '',
    subtitle: languages?.second_carousal_text,
    illustration: PersonAtTable,
  },
  {
    title: '',
    subtitle: languages?.third_carousal_text,
    illustration: CorrectPosition,
  },
  {
    title: '',
    subtitle: languages?.fourth_carousal_text,
    illustration: BatteryStatus,
  },
];

// export const MeasurementParameter = [
//   {
//     name: 'Heart Rate',
//     value: 80,
//     unit: 'bpm',
//   },
//   {
//     name: 'Oxygen Sat.',
//     value: '--%',
//     unit: 'SpO2',
//   },
//   {
//     name: 'Respiration',
//     value: '--',
//     unit: 'brpm',
//   },

//   {
//     name: 'HRV',
//     value: '--',
//     unit: 'ms',
//   },
//   {
//     name: 'Stress Level',
//     value: '---',
//     unit: '',
//   },
//   {
//     name: 'Blood Pressure',
//     value: '--/--',
//     unit: 'mmHg',
//   },
// ];

export const MeasurementParameter =
  isAndroid || Config.Environment !== 'production'
    ? [
        {
          name: languages?.pulse_rate,
          value: '--',
          unit: 'bpm',
          vitalType: VitalSignTypes.PULSE_RATE,
          iconName: 'PULSE_RATE',
        },
        {
          name: languages?.respiration_rate,
          value: '--',
          unit: 'brpm',
          vitalType: VitalSignTypes.RESPIRATION_RATE,
          iconName: 'RESPIRATION_RATE',
        },
        {
          name: languages?.oxygen_saturation,
          value: '--',
          unit: '%',
          vitalType: VitalSignTypes.OXYGEN_SATURATION,
          iconName: 'OXYGEN_SATURATION',
        },
      ]
    : [
        {
          name: languages?.pulse_rate,
          value: '--',
          unit: 'bpm',
          vitalType: VitalSignTypes.PULSE_RATE,
          iconName: 'PULSE_RATE',
        },
      ];
