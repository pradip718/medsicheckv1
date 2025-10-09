import messaging from '@react-native-firebase/messaging';
import {
  getStateFromPath,
  LinkingOptions,
  NavigationContainer,
} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useQueryClient} from '@tanstack/react-query';
import React, {useState} from 'react';
import {Linking} from 'react-native';
import BootSplash from 'react-native-bootsplash';
import {navigationRef} from '../RootNavigation';
import {DEEPLINKS} from '../src/api/DeepLinks';
import {getSessionToken} from '../src/api/auth';
import {syncScanSession} from '../src/api/report';
import {sendDeepLinkClickEvent} from '../src/api/settings';
import {DEEPLINK_CONFIG, PUBLIC_DEEPLINK_PATH} from '../src/constants';
import {
  GET_LAB_REPORT_QUESTIONNAIRE,
  GET_PREVENTIX_PERSONALISED_AI,
  MEDSI_QUESTIONNAIRE_ANSWERS,
} from '../src/constants/hooks';
import useAppInitialization from '../src/hooks/useAppInitialization';
import useAuthNavigation from '../src/hooks/useAuthNavigation';
import useUpdateLocale from '../src/hooks/useUpdateLocale';
import AboutApp from '../src/screens/AboutApp';
import FaceScan from '../src/screens/FaceScan';
import AnuraIntermediateLoader from '../src/screens/FaceScan/AnuraIntermediateLoader';
import FaceScannerCamera from '../src/screens/FaceScan/FaceScannerCamera';
import PrepareFacescan from '../src/screens/FaceScan/PrepareFacescan';
import QRFaceScan from '../src/screens/FaceScan/QRFaceScan';
import Feedbacks from '../src/screens/Feedbacks';
import HealthRisks from '../src/screens/HealthRisks';
import ViewRiskScore from '../src/screens/HealthRisks/ViewRiskScore';
import HealthRisksQuestionnaire from '../src/screens/HealthRisks/questionnaire';
import HealthWallet from '../src/screens/HealthWallet';
import AIHealthReport from '../src/screens/HealthWallet/AIHealthReport/AIHealthReport';
import AIHealthReportDetail from '../src/screens/HealthWallet/AIHealthReport/AIHealthReportDetail';
import AIQuestionnaireDetails from '../src/screens/HealthWallet/AIHealthReport/AIQuestionnaireDetails';
import AIScanDetails from '../src/screens/HealthWallet/AIHealthReport/AIScanDetails';
import InterpretLabReports from '../src/screens/HealthWallet/InterpretLabReports';
import LabQuestionnaireDetails from '../src/screens/HealthWallet/InterpretLabReports/LabQuestionnaireDetails';
import LabReportDetail from '../src/screens/HealthWallet/InterpretLabReports/LabReportDetail';
import LabScanDetails from '../src/screens/HealthWallet/InterpretLabReports/LabScanDetails';
import MiscellaneousFiles from '../src/screens/HealthWallet/MiscellanouseFiles';
import HelpDesk from '../src/screens/HelpDesk';
import IssueDetails from '../src/screens/HelpDesk/IssueDetails';
import RaiseIssue from '../src/screens/HelpDesk/RaiseIssue';
import PreviousReports from '../src/screens/Homepage/screens/PreviousReports';
import ReportList from '../src/screens/Homepage/screens/ReportList';
import LabReport from '../src/screens/LabReport';
import LabReportConclusion from '../src/screens/LabReport/Conclusion';
import Maintenance from '../src/screens/Maintenance';
import OfflineScreen from '../src/screens/OfflineScreen';
import PersonalisedAI from '../src/screens/PersonalisedAI';
import Conclusion from '../src/screens/PersonalisedAI/Conclusion';
import PrivacyPolicy from '../src/screens/PrivacyPolicy';
import FamilyInformation from '../src/screens/Profile/components/FamilyInformation';
import QRScanner from '../src/screens/QRScanner';
import ReportDetails from '../src/screens/Reports/ReportDetails';
import SessionReportDetail from '../src/screens/Reports/SessionReportDetail';
import CommunicationPreferences from '../src/screens/Settings/CommunicationPreferences';
import MobileVerification from '../src/screens/Settings/MobileVerification';
import TnC from '../src/screens/TnC';
import ViewReport from '../src/screens/ViewReport';
import VoiceScan from '../src/screens/VoiceScan';
import VoiceScanReport from '../src/screens/VoiceScan/Reports';
import VoiceScanReportDetail from '../src/screens/VoiceScan/Reports/ReportDetails';
import VoiceScanReportList from '../src/screens/VoiceScan/Reports/VoiceReportList';
import VoiceScanGeneratingReport from '../src/screens/VoiceScan/VoiceScanGeneratingReport';
import VoiceScanIntro from '../src/screens/VoiceScan/VoiceScanIntro';
import ForgotPassword from '../src/screens/auth/ForgotPassword';
import Login from '../src/screens/auth/Login';
import Register from '../src/screens/auth/Register';
import AdditionalInformation from '../src/screens/auth/Register/Additional_Information';
import AdditionalDetails from '../src/screens/auth/Register/Additional_Information/AdditionalDetails';
import QuestionnaireSection from '../src/screens/auth/Register/Additional_Information/QuestionnaireSection';
import ContactVerification from '../src/screens/auth/Register/ContactVerification';
import OTP from '../src/screens/auth/Register/OTP';
import UserInformation from '../src/screens/auth/Register/UserInformation';
import useAppStore from '../store/appStore';
import useAuthStore from '../store/authStore';
import useUserProfileStore from '../store/profileStore';
import {MainStackParamList} from '../types/navigation';
import {extractQueryParams} from '../utils/methods';
import HomePageDrawer from './HomePageDrawer';
import ReportStack from './ReportStack';
import UnverifiedUserTab from './UnverifiedUserTab';
import OTPRegister from '../src/screens/auth/Register/OTPRegister';

const Stack = createNativeStackNavigator<MainStackParamList>();

const RootNavigator = () => {
  const queryClient = useQueryClient();
  useUpdateLocale();
  const {mutateAsync: initializeAppParameters} = useAppInitialization();
  const {
    setScreenName,
    screenName,
    // isFaceScanDeeplink,
    setIsFaceScanDeeplink,
  } = useAppStore();
  const {setDeeplinkAuth} = useAuthStore();
  const {setCurrentActiveProfileId} = useUserProfileStore();
  const {mutateAsync: navigateIfExistingUser} = useAuthNavigation();

  const [isOpenedFromDeepLink, setIsOpenedFromDeepLink] = useState(false);

  const prefetchApiBasedOnNavigation = async (path: string) => {
    switch (path) {
      case 'additional_info':
        return await Promise.allSettled([
          queryClient.invalidateQueries({
            queryKey: [MEDSI_QUESTIONNAIRE_ANSWERS],
          }),
        ]);
      case 'initiate_ai_report':
        return await Promise.allSettled([
          queryClient.invalidateQueries({
            queryKey: [GET_PREVENTIX_PERSONALISED_AI],
          }),
        ]);
      case 'initiate_lab_report':
        return await Promise.allSettled([
          queryClient.invalidateQueries({
            queryKey: [GET_LAB_REPORT_QUESTIONNAIRE],
          }),
        ]);
      case 'initiate_face_scan':
        return;
      default:
        null;
    }
  };

  const redirectFromDeeplink = async (url: string) => {
    if (url) {
      const path = url?.split('?')[0]?.replace(/\/$/, '')?.split('/').pop();
      const {session_id, profile_id} = extractQueryParams(url);
      if (session_id && profile_id) {
        setIsOpenedFromDeepLink(true);
        const {token} = await getSessionToken({session_id, profile_id});
        if (!token) {
          return '';
        }
        if (path === 'face_scan') {
          setDeeplinkAuth({
            session_id: session_id || '',
            token: token || '',
          });
          setIsFaceScanDeeplink(true);
          setCurrentActiveProfileId(profile_id || '');
          syncScanSession('deeplink_opened');
          return 'medsicheck://face_scan';
        }
      }

      if (path && DEEPLINK_CONFIG[path]) {
        setIsOpenedFromDeepLink(true);
        return url;
      }
      console.warn(`Unknown path: ${path}`);
      return '';
    }
    return '';
  };

  let initialURLPromise: Promise<string | null> | null = null;

  async function fetchInitialURL() {
    const processDeepLink = async (url: string | null) => {
      if (!url) {
        return '';
      }
      const path = url?.split('?')[0]?.replace(/\/$/, '')?.split('/').pop();
      if (!path || !(path in DEEPLINK_CONFIG)) {
        console.warn(`Deep link path not found in config: ${path}`);
        return '';
      }

      setIsOpenedFromDeepLink(true);

      if (!PUBLIC_DEEPLINK_PATH.includes(path)) {
        const {isAuthenticated} = await initializeAppParameters();

        if (!isAuthenticated) {
          await BootSplash.hide({fade: true});
          return '';
        }
      }

      try {
        const finalUrl = await redirectFromDeeplink(url);
        await prefetchApiBasedOnNavigation(path || '');
        return finalUrl;
      } catch (error) {
        console.error('Error processing deep link:', error);
        return '';
      } finally {
        await BootSplash.hide({fade: true});
      }
    };

    const initialUrl = await Linking.getInitialURL();
    if (initialUrl) {
      return processDeepLink(initialUrl);
    }

    const remoteMessage = await messaging().getInitialNotification();
    if (remoteMessage?.data?.redirect_url) {
      return processDeepLink(remoteMessage?.data?.redirect_url as string);
    }

    return '';
  }

  const linking: LinkingOptions<{}> = {
    prefixes: DEEPLINKS,
    config: {
      screens: {
        Register: 'register',
        QRFaceScan: 'face_scan',
        HealthWallet: 'health-wallet',
        AdditionalDetail: 'additional_info',
        QuestionnaireSection: 'questionniare_section',
        PersonalisedAI: 'initiate_ai_report',
        LabReport: 'initiate_lab_report',
        FaceScan: 'initiate_face_scan',
        LabReportDetail: 'lab_report',
        AIHealthReportDetail: 'ai_report',
        HealthRisks: 'health_risks',
        VoiceScanScreen: 'voice_scan',
        VoiceScanReport: 'voice_scan_report_detail',
        ReportStackScreens: {
          screens: {
            Report: 'scan_report',
          },
        },
      },
    },
    getInitialURL: () => {
      if (!initialURLPromise) {
        initialURLPromise = fetchInitialURL();
      }
      return initialURLPromise;
    },
    getStateFromPath: (path, options) => {
      const queryParams = extractQueryParams(path);
      const state = getStateFromPath(path, options);
      if (!state || !state.routes) {
        return {routes: []};
      }

      if (queryParams?.comm_id) {
        sendDeepLinkClickEvent(queryParams?.comm_id);
      }

      return {
        ...state,
        routes: state.routes.map(route => {
          if (route.name === 'LabReportDetail') {
            return {
              ...route,
              params: {
                ...route.params,
                ...queryParams,
              },
            };
          }
          return route;
        }),
      };
    },
    subscribe(listener) {
      const onReceiveURL = async ({url}: {url: string}) => {
        console.log('Received deep link:', url);
        const updatedUrl = await redirectFromDeeplink(url);
        const path = updatedUrl?.split('?')[0]?.split('/').pop();
        await prefetchApiBasedOnNavigation(path || '');
        listener(updatedUrl);
      };
      const linkingListener = Linking.addEventListener('url', onReceiveURL);

      return () => {
        linkingListener.remove();
      };
    },
  };

  const handleNavigationStateChange = () => {
    let currentRouteName = '';
    let previousRouteName = screenName.current ?? '';

    if (navigationRef?.current?.getCurrentRoute) {
      currentRouteName = navigationRef?.current?.getCurrentRoute()?.name ?? '';
    }
    setScreenName({
      current: currentRouteName,
      previous: previousRouteName,
    });
  };

  return (
    <NavigationContainer
      ref={navigationRef}
      linking={linking}
      onStateChange={handleNavigationStateChange}
      onReady={async () => {
        if (!isOpenedFromDeepLink) {
          await new Promise(resolve => setTimeout(resolve, 200)); // Small delay to ensure linking is processed
          const {isAuthenticated} = await initializeAppParameters();
          if (isAuthenticated) {
            return navigateIfExistingUser();
          }
          BootSplash.hide({fade: true});
        }
      }}>
      <Stack.Navigator
        // initialRouteName={'ContactVerification'}
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}>
        <Stack.Group>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Register" component={Register} />
          <Stack.Screen name="OTPRegister" component={OTPRegister} />
          <Stack.Screen
            name="ContactVerification"
            component={ContactVerification}
          />

          <Stack.Screen name="QRFaceScan" component={QRFaceScan} />
          <Stack.Screen
            name="SessionReportDetail"
            component={SessionReportDetail}
          />

          <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
          <Stack.Screen name="OTP" component={OTP} />
          <Stack.Screen name="TermsAndConditions" component={TnC} />
          <Stack.Screen name="UserInformation" component={UserInformation} />

          <Stack.Screen
            name="HomepageStackScreens"
            component={HomePageDrawer}
          />
          <Stack.Group>
            <Stack.Screen name="HealthRisks" component={HealthRisks} />
            <Stack.Screen
              name="HealthRisksQuestionnaire"
              component={HealthRisksQuestionnaire}
              options={{
                animation: 'fade',
              }}
            />
            <Stack.Screen
              name="ViewRiskScore"
              component={ViewRiskScore}
              options={{
                animation: 'fade',
              }}
            />
          </Stack.Group>
          <Stack.Screen name="ReportDetails" component={ReportDetails} />
          <Stack.Screen name="FaceScan" component={FaceScan} />
          <Stack.Screen name="FaceScanCamera" component={FaceScannerCamera} />
          <Stack.Screen name="PrepareFacescan" component={PrepareFacescan} />
          <Stack.Screen
            name="AnuraIntermediateLoader"
            component={AnuraIntermediateLoader}
          />
          <Stack.Screen name="PreviousReports" component={PreviousReports} />
          <Stack.Screen name="ReportList" component={ReportList} />

          <Stack.Screen
            name="UnverifiedUserTab"
            component={UnverifiedUserTab}
          />
        </Stack.Group>
        {/* {!!userAuth?.idToken && ( */}
        <Stack.Group>
          <Stack.Screen
            name="FamilyInformation"
            component={FamilyInformation}
          />
          <Stack.Screen name="ViewReport" component={ViewReport} />
          <Stack.Screen name="Feedbacks" component={Feedbacks} />
          <Stack.Screen name="AboutApp" component={AboutApp} />
          <Stack.Screen name="HealthWallet" component={HealthWallet} />
          <Stack.Screen name="AIHealthReport" component={AIHealthReport} />
          <Stack.Screen
            name="AIQuestionnaireDetails"
            component={AIQuestionnaireDetails}
          />

          <Stack.Screen name="ReportStackScreens" component={ReportStack} />

          <Stack.Screen name="AIScanDetails" component={AIScanDetails} />
          <Stack.Screen
            name="AIHealthReportDetail"
            component={AIHealthReportDetail}
          />
          <Stack.Screen
            name="InterpretLabReport"
            component={InterpretLabReports}
          />

          <Stack.Screen name="LabReport" component={LabReport} />
          <Stack.Screen
            name="LabQuestionnaireDetails"
            component={LabQuestionnaireDetails}
          />
          <Stack.Screen name="LabScanDetails" component={LabScanDetails} />
          <Stack.Screen name="LabReportDetail" component={LabReportDetail} />

          <Stack.Screen
            name="MiscellaneousFiles"
            component={MiscellaneousFiles}
          />

          <Stack.Screen name="PersonalisedAI" component={PersonalisedAI} />
          <Stack.Screen name="Conclusion" component={Conclusion} />
          <Stack.Screen
            name="LabReportConclusion"
            component={LabReportConclusion}
          />

          <Stack.Screen name="HelpDesk" component={HelpDesk} />
          <Stack.Screen name="RaiseIssue" component={RaiseIssue} />
          <Stack.Screen name="IssueDetails" component={IssueDetails} />
          <Stack.Screen
            name="CommunicationPreferences"
            component={CommunicationPreferences}
          />
          <Stack.Screen
            name="MobileVerification"
            component={MobileVerification}
          />
          <Stack.Screen
            name="AdditionalInformation"
            component={AdditionalInformation}
          />
          <Stack.Screen name="AdditionalDetail" component={AdditionalDetails} />
          <Stack.Screen
            name="QuestionnaireSection"
            component={QuestionnaireSection}
          />
        </Stack.Group>
        {/* )} */}

        <Stack.Group>
          <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
          <Stack.Screen
            name="OfflineScreen"
            component={OfflineScreen}
            options={{
              animation: 'fade_from_bottom',
            }}
          />
          <Stack.Screen
            name="QRScanner"
            component={QRScanner}
            options={{
              animation: 'fade_from_bottom',
            }}
          />
          <Stack.Screen
            name="MaintenanceScreen"
            component={Maintenance}
            options={{
              animation: 'fade_from_bottom',
            }}
          />
        </Stack.Group>

        <Stack.Group>
          <Stack.Screen name="VoiceScanScreen" component={VoiceScan} />
          <Stack.Screen
            name="VoiceScanIntroScreen"
            component={VoiceScanIntro}
          />
          <Stack.Screen
            name="VoiceScanGeneratingReport"
            component={VoiceScanGeneratingReport}
          />
          <Stack.Screen name="VoiceScanReport" component={VoiceScanReport} />
          <Stack.Screen
            name="VoiceScanReportDetail"
            component={VoiceScanReportDetail}
          />
          <Stack.Screen
            name="VoiceScanReportList"
            component={VoiceScanReportList}
          />
        </Stack.Group>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
