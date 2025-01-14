import {QuestionSet} from './type';

export const QUESTION_SET: QuestionSet = {
  '1': {
    question:
      'Do you have any known allergies? Food, seasonal, environmental or drug allergies.',
    type: 'input',
  },
  '2': {
    question:
      'Have you ever been diagnosed with any of the following medical conditions?',
    type: 'dropdown',
    items: [
      {
        label: 'Type 1 Diabetes',
        value: 'Type 1 Diabetes',
      },
      {label: 'Type 2 Diabetes', value: 'Type 2 Diabetes'},
      {label: 'Prediabetes', value: 'Prediabetes'},
      {label: 'High cholesterol', value: 'High cholesterol'},
      {label: 'Anemia', value: 'Anemia'},
      {
        label: 'Autoimmune diseases (Arthritis, Lupus, Psoriasis, etc)',
        value: 'Autoimmune diseases',
      },
      {label: 'Cancer', value: 'Cancer'},
      {
        label: 'Digestive ailments (acid reflux, gallbladder stones, IBS, etc)',
        value: 'Digestive ailments',
      },
      {label: 'Eating disorders', value: 'Eating disorders'},
      {label: 'Cardiovascular disease', value: 'Cardiovascular disease'},
      {label: 'Hypertension', value: 'Hypertension'},
      {label: 'None of the above', value: 'None of the above'},
      {label: 'Other', value: 'Other'},
    ],
  },
  '3': {
    question: 'What medications and/or supplements are you currently taking?',
    type: 'input',
  },
  '4': {
    question:
      'Do any of the following medical conditions exist in your immediate family?',
    type: 'dropdown',
    items: [
      {label: 'Type 1 Diabetes', value: 'Type 1 Diabetes'},
      {label: 'Hypertension', value: 'Hypertension'},
      {label: 'Dementia', value: 'Dementia'},
      {label: 'Stroke', value: 'Stroke'},
      {label: 'Brain Embolism', value: 'Brain Embolism'},
      {label: 'Parkinsons Disease', value: 'Parkinsons Disease'},
      {label: 'Psychiatric Conditions', value: 'Psychiatric Conditions'},
      {label: 'Obesity', value: 'Obesity'},
      {
        label: 'High Cholesterol / Triglycerides',
        value: 'High Cholesterol / Triglycerides',
      },
      {label: 'Cancer', value: 'Cancer'},
      {label: 'None of the above', value: 'None of the above'},
      {label: 'Other', value: 'Other'},
    ],
  },
  '5': {
    question: 'How would you describe your general dietary habits',
    type: 'dropdown',
    items: [
      {
        label: 'I eat most cooked meals at home',
        value: 'I eat most cooked meals at home',
      },
      {
        label: 'I eat fast food or processed meals over 3 times a week',
        value: 'I eat fast food or processed meals over 3 times a week',
      },
      {label: 'Generally balanced diet', value: 'Generally balanced diet'},
      {label: 'I often skip meals', value: 'I often skip meals'},
      {
        label: 'I eat fruits and vegetables daily',
        value: 'I eat fruits and vegetables daily',
      },
      {
        label:
          'I follow a specific diet plan for health or personal reasons (e.g., Vegan / Vegetarian, Keto, High protein diet, Low carb diet, etc)',
        value:
          'I follow a specific diet plan for health or personal reasons (e.g., Vegan / Vegetarian, Keto, High protein diet, Low carb diet, etc)',
      },
      {
        label: 'I frequently consume sugary drinks and snacks',
        value: 'I frequently consume sugary drinks and snacks',
      },
      {
        label: 'I am not sure / I don’t pay attention to my diet',
        value: 'I am not sure / I don’t pay attention to my diet',
      },
      {label: 'Other:  please elaborate', value: 'Other'},
    ],
  },
  '6': {
    question: 'How many hours do you sleep daily on average?',
    type: 'input',
  },
  '7': {
    question: 'How would you describe the quality of your sleep?',
    type: 'dropdown',
    items: [
      {label: 'Very poor', value: 'Very poor'},
      {label: 'Poor', value: 'Poor'},
      {label: 'Average', value: 'Average'},
      {label: 'Good', value: 'Good'},
      {label: 'Excellent', value: 'Excellent'},
    ],
  },
  '8': {
    question: 'Select your typical level of physical activity',
    type: 'dropdown',
    items: [
      {
        label: 'Sedentary – desk job, very little walking',
        value: 'Sedentary – desk job, very little walking',
      },
      {
        label: 'Slightly active – 1,500 to 3,000 steps per day',
        value: 'Slightly active – 1,500 to 3,000 steps per day',
      },
      {
        label:
          'Moderately active – Occasional exercise, 3,000 to 10,000 steps a day',
        value:
          'Moderately active – Occasional exercise, 3,000 to 10,000 steps a day',
      },
      {
        label: 'Very active – Intense exercise most days, physical labor',
        value: 'Very active – Intense exercise most days, physical labor',
      },
    ],
  },
  '10': {
    question: 'Do you smoke or vape?',
    type: 'dropdown',
    items: [
      {label: 'Never', value: 'Never'},
      {
        label: 'I smoked in the past, but have quit over 5 years ago',
        value: 'I smoked in the past, but have quit over 5 years ago',
      },
      {
        label: 'Passive smoker – someone is often smoking around me',
        value: 'Passive smoker – someone is often smoking around me',
      },
      {label: 'Yes, I smoke regularly.', value: 'Yes, I smoke regularly.'},
    ],
  },
  '11': {
    question: 'How frequently do you drink alcohol?',
    type: 'dropdown',
    items: [
      {label: 'Never', value: 'Never'},
      {label: 'Occasionally', value: 'Occasionally'},
      {label: 'On the weekend', value: 'On the weekend'},
      {label: '4 or more days per week', value: '4 or more days per week'},
    ],
  },
  '12': {
    question:
      'Please list any surgeries that you’ve had. Indicate the type of surgery and year ',
    type: 'input',
  },
  '13': {
    question:
      'Over the past three months, have you had any of the following symptoms? (Select all that apply)',
    type: 'dropdown',
    items: [
      {label: 'Headache', value: 'Headache'},
      {label: 'Diarrhea', value: 'Diarrhea'},
      {label: 'Sneezing / runny nose', value: 'Sneezing / runny nose'},
      {label: 'Persistent cough', value: 'Persistent cough'},
      {label: 'Fatigue', value: 'Fatigue'},
      {label: 'Frequent constipation', value: 'Frequent constipation'},
      {label: 'Out of breath', value: 'Out of breath'},
      {label: 'Loose stool', value: 'Loose stool'},
      {label: 'Anxiety', value: 'Anxiety'},
      {label: 'Weakness', value: 'Weakness'},
      {label: 'None of the above', value: 'None of the above'},
    ],
  },
  '14': {
    question:
      'Symptoms: Describe any pain or discomfort, or any change in your body or in your general health that you may have recently noticed.',
    type: 'input',
  },
  '15': {
    question:
      'Do you currently have any medical condition or health concern that you would like us to focus on in particular? Is there anything else regarding your health that we should know?',
    type: 'input',
  },
};
