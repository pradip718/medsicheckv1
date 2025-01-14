import useLanguageStore from '../../../store/languageStore';

export const chartConfigs = [
  {
    backgroundColor: '#000000',
    backgroundGradientFrom: '#1E2923',
    backgroundGradientTo: '#08130D',
    color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
    style: {
      borderRadius: 16,
    },
  },
  {
    backgroundColor: '#022173',
    backgroundGradientFrom: '#022173',
    backgroundGradientTo: '#1b3fa0',
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForBackgroundLines: {
      strokeDasharray: '', // solid background lines with no dashes
    },
  },
  {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  },
  {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  },
  {
    backgroundColor: '#26872a',
    backgroundGradientFrom: '#43a047',
    backgroundGradientTo: '#66bb6a',
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16,
    },
  },
  {
    backgroundColor: '#000000',
    backgroundGradientFrom: '#000000',
    backgroundGradientTo: '#000000',
    color: (opacity = 1) => `rgba(${255}, ${255}, ${255}, ${opacity})`,
  },
  {
    backgroundColor: '#0091EA',
    backgroundGradientFrom: '#0091EA',
    backgroundGradientTo: '#0091EA',
    color: (opacity = 1) => `rgba(${255}, ${255}, ${255}, ${opacity})`,
  },
  {
    backgroundColor: '#e26a00',
    backgroundGradientFrom: '#fb8c00',
    backgroundGradientTo: '#ffa726',
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16,
    },
  },
  {
    backgroundColor: '#b90602',
    backgroundGradientFrom: '#e53935',
    backgroundGradientTo: '#ef5350',
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16,
    },
  },
  {
    backgroundColor: '#ff3e03',
    backgroundGradientFrom: '#ff3e03',
    backgroundGradientTo: '#ff3e03',
    color: (opacity = 1) => `rgba(${0}, ${0}, ${0}, ${opacity})`,
  },
];

export type WellnessScoreKey = '1_2' | '3_4' | '5_6' | '7_8' | '9_10';

const languages = useLanguageStore.getState()?.languages;

export const Wellness_Score_Content: {
  [key in WellnessScoreKey]: {
    title: string;
    subTitle: string;
    content: string;
  };
} = {
  '1_2': {
    title: languages?.wellness_score_heading,
    subTitle: languages?.wellness_score_subheading_for_1_2,
    content: languages?.wellness_score_msg_for_1_2,
  },
  '3_4': {
    title: languages?.wellness_score_heading,
    subTitle: languages?.wellness_score_subheading_for_3_4,
    content: languages?.wellness_score_msg_for_3_4,
  },
  '5_6': {
    title: languages?.wellness_score_heading,
    subTitle: languages?.wellness_score_subheading_for_5_6,
    content: languages?.wellness_score_msg_for_5_6,
  },
  '7_8': {
    title: languages?.wellness_score_heading,
    subTitle: languages?.wellness_score_subheading_for_7_8,
    content: languages?.wellness_score_msg_for_7_8,
  },
  '9_10': {
    title: languages?.wellness_score_heading,
    subTitle: languages?.wellness_score_subheading_for_9_10,
    content: languages?.wellness_score_msg_for_9_10,
  },
};
