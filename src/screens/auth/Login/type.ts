export type OnboardingMilestone = {
  name: string;
  slug: string;
  milestone_tag: string;
};

export type OnboardingResponse = {
  statusCode?: number;
  success?: boolean;
  data: OnboardingMilestone[];
};

export type OnboardingStepsMilestone = {
  order_id: number;
  parent_id: number | null;
  name: string;
  milestone_tag: string;
  slug: string;
};

export type OnboardingStepsResponse = {
  statusCode?: number;
  success?: boolean;
  data: OnboardingStepsMilestone[];
};

export type LoginParam = {
  email: string;
  password: string;
  formattedPhonenumber?: string;
};

export type LoginType = 'Password' | 'OTP';
