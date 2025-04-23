// import {HealthData} from './jsons';

import {Question} from '../src/screens/auth/Register/Additional_Information/type';
import {QuestionnaireItem} from './personalisedai';
import {ProfileType} from './users/user';

export type MainStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ContactVerification: {
    email: string;
    password?: string;
    phoneNumber: string;
    user_id: string;
    loginParams?: {
      isEmailVerified: boolean;
      isPhoneVerified: boolean;
    };
  };
  OTP: {
    username: string;
    password: string;
  };
  UserInformation: {
    fromScreen: 'profile' | 'tnc' | 'login';
  };
  FamilyInformation?: {
    profileId: string;
  };
  TermsAndConditions: undefined;
  FaceScan: undefined;
  FaceScanCamera?: {
    fromScreen?: 'PersonalisedAI';
    action?: () => void;
  };
  PrepareFacescan: undefined;
  AnuraIntermediateLoader: undefined;
  QRFaceScan: undefined;
  PreviousReports: undefined;
  ReportList: {
    reportId: string;
  };
  Profile?: {
    tab?: {name: ProfileType};
  };
  Settings: undefined;
  SmartReport: undefined;
  HealthRisks: undefined;
  HealthRisksQuestionnaire: undefined;
  ViewRiskScore: undefined;
  InterpretLabReport: undefined;
  CommunicationPreferences: undefined;
  MobileVerification: undefined;
  AIHealthReport: undefined;
  AIQuestionnaireDetails: {
    questionnaire: Question[];
  };
  AIScanDetails: {
    report: string | undefined;
  };
  AIHealthReportDetail: {
    token: string;
    created_at: string;
  };

  LabReport: undefined;
  LabReportConclusion: {
    content: QuestionnaireItem;
  };
  LabQuestionnaireDetails: {
    questionnaire: Question[];
  };
  LabScanDetails: {
    report: string | undefined;
  };
  LabReportDetail: {
    token: string;
    created_at: string;
  };

  MiscellaneousFiles: undefined;

  HealthWallet: undefined;
  AboutApp: undefined;
  WIP: undefined;
  PersonalisedAI: undefined;
  Feedbacks: undefined;
  Conclusion: {
    content: QuestionnaireItem;
  };
  AdditionalInformation?: {
    isNewUser: boolean;
  };
  QuestionnaireSection?: {
    isNewUser: boolean;
  };
  AdditionalDetail?: {
    isNewUser: boolean;
  };
  PreventixInformationStackScreens: {
    screen: keyof PreventixInformationParamList;
  };
  HomepageStackScreens: {
    screen: keyof HomepageParamList;
  };
  UnverifiedUserTab: {
    screen: keyof UnverifiedList;
  };
  ReportStackScreens: {
    screen: keyof ReportParamList;
    params: ReportParamList[keyof ReportParamList];
  };
  ReportDetails: {
    // vitalKey: keyof HealthData;
    vitalKey: string;
    reportId: string;
  };
  PrivacyPolicy: {
    uri: string;
  };
  ViewReport: {
    uri: string;
  };

  HelpDesk: undefined;
  IssueDetails: {
    ticket_id: string;
  };
  RaiseIssue: undefined;
  QRScanner: undefined;
  SessionReportDetail: SessionReportParamList;
  OfflineScreen: undefined;
  MaintenanceScreen: undefined;

  VoiceScanScreen: undefined;
  VoiceScanIntroScreen: undefined;
  VoiceScanGeneratingReport: {
    session_id: string;
  };
  VoiceScanReport?: {
    isNavigatingFromVoiceScan?: boolean;
    session_id?: string;
  };
  VoiceScanReportDetail: {
    vitalKey: string;
  };
  VoiceScanReportList: undefined;
};

export type PreventixInformationParamList = {
  Welcome: undefined;
  Questions: undefined;
  Conclusion: undefined;
};

export type HomepageParamList = {
  Home: undefined;
  PreviousReports: undefined;
  ReportList: {
    reportId: string;
  };
};

export type ReportParamList = {
  Report: {
    reading_id: string;
  };
};
export type SessionReportParamList = {
  reading_id: string;
};

export type DashboardParamList = {
  Report: undefined;
};

export type HomepageDrawerList = {
  HomepageTab: undefined;
  WIP: undefined;
  Settings: undefined;
  SmartReport: undefined;
};

export type UnverifiedList = {
  UnverifiedHome: undefined;
  UnverifiedProfile: undefined;
};
