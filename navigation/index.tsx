import messaging from '@react-native-firebase/messaging';
import {
  getStateFromPath,
  LinkingOptions,
  NavigationContainer,
} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {useQueryClient} from '@tanstack/react-query';
import React, {useEffect, useState} from 'react';
import {Linking} from 'react-native';
import BootSplash from 'react-native-bootsplash';
import {navigationRef} from '../RootNavigation';
import {getSessionToken} from '../src/api/auth';
import {syncScanSession} from '../src/api/report';
import {DEEPLINK_CONFIG} from '../src/constants';
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
import FaceScannerCamera from '../src/screens/FaceScan/FaceScannerCamera';
import QRFaceScan from '../src/screens/FaceScan/QRFaceScan';
import Feedbacks from '../src/screens/Feedbacks';
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
import ForgotPassword from '../src/screens/auth/ForgotPassword';
import Login from '../src/screens/auth/Login';
import Register from '../src/screens/auth/Register';
import AdditionalInformation from '../src/screens/auth/Register/Additional_Information';
import AdditionalDetails from '../src/screens/auth/Register/Additional_Information/AdditionalDetails';
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

const Stack = createNativeStackNavigator<MainStackParamList>();

const RootNavigator = () => {
  const queryClient = useQueryClient();
  useUpdateLocale();
  const {mutateAsync: initializeAppParameters, isPending} =
    useAppInitialization();
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

  useEffect(() => {
    return () => {
      setIsOpenedFromDeepLink(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      const path = url?.split('?')[0]?.split('/').pop();
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

  const linking: LinkingOptions<{}> = {
    prefixes: [
      'https://main.d1p9s5r42tah7c.amplifyapp.com',
      'https://dev.d1p9s5r42tah7c.amplifyapp.com',
      'https://stage.d1p9s5r42tah7c.amplifyapp.com',
      'medsicheck://',
    ],
    config: {
      screens: {
        Register: 'register',
        QRFaceScan: 'face_scan',
        HealthWallet: 'health-wallet',
        AdditionalDetail: 'additional_info',
        PersonalisedAI: 'initiate_ai_report',
        LabReport: 'initiate_lab_report',
        FaceScan: 'initiate_face_scan',
        LabReportDetail: 'lab_report',
        AIHealthReportDetail: 'ai_report',
        ReportStackScreens: {
          screens: {
            Report: 'scan_report',
          },
        },
      },
    },
    getStateFromPath: (path, options) => {
      const queryParams = extractQueryParams(path);
      const state = getStateFromPath(path, options);
      if (!state || !state.routes) {
        return {
          routes: [],
        };
      }

      const newState = {
        ...state,
        routes: state.routes.map(route => {
          if (route.name === 'LabReportDetail') {
            return {
              ...route,
              params: {
                ...route.params,
                ...queryParams, // Add the extracted query params here
              },
            };
          }
          return route;
        }),
      };
      return newState;
    },

    async getInitialURL() {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        if (!isPending) {
          await initializeAppParameters();
        }
        try {
          const url = await redirectFromDeeplink(initialUrl);
          const path = url?.split('?')[0]?.split('/').pop();
          await prefetchApiBasedOnNavigation(path || '');
          await BootSplash.hide({fade: true});
          return url;
        } catch (error) {
          await BootSplash.hide({fade: true});
        }
      }

      const remoteMessage = await messaging().getInitialNotification();
      if (remoteMessage) {
        console.log(
          'Notification caused app to open from quit state:',
          remoteMessage.notification,
        );

        const redirect_url = remoteMessage?.data?.redirect_url || null;
        if (typeof redirect_url === 'string') {
          const url = await redirectFromDeeplink(redirect_url);
          const path = url?.split('?')[0]?.split('/').pop();
          await prefetchApiBasedOnNavigation(path || '');
          await BootSplash.hide({fade: true});

          return url;
        }
      }
      return '';
    },
    subscribe(listener) {
      const onReceiveURL = async ({url}: {url: string}) => {
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
          await initializeAppParameters();
          navigateIfExistingUser();
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
          <Stack.Screen name="ReportDetails" component={ReportDetails} />
          <Stack.Screen name="FaceScan" component={FaceScan} />
          <Stack.Screen name="FaceScanCamera" component={FaceScannerCamera} />
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
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
