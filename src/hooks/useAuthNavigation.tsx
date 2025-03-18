import {useAsyncStorage} from '@react-native-async-storage/async-storage';
import {StackActions} from '@react-navigation/native';
import {useMutation, UseQueryResult} from '@tanstack/react-query';
import BootSplash from 'react-native-bootsplash';
import EncryptedStorage from 'react-native-encrypted-storage';
import {navigationRef} from '../../RootNavigation';
import useAppStore from '../../store/appStore';
import useLanguageStore from '../../store/languageStore';
import {errorToast} from '../../utils/toast';
import {REMEMBERED_USER_SESSION} from '../constants/AsyncStorageKeys';
import {
  OnboardingResponse,
  OnboardingStepsResponse,
} from '../screens/auth/Login/type';
import useGetAccountStatus from './api/useGetAccountStatus';
import useGetOnboarding from './api/useGetOnboarding';
import useGetOnboardingSteps from './api/useGetOnboardingSteps';
import useFullPageLoader from './useFullPageLoader';

type AuthNavigationProp = {
  hasLoader?: boolean;
  shouldCheckOnboarding?: boolean;
};

const useAuthNavigation = ({
  hasLoader = true,
  shouldCheckOnboarding = false,
}: AuthNavigationProp = {}) => {
  const {showLoader, hideLoader} = useFullPageLoader();
  const {languages} = useLanguageStore();
  const {stayLoggedIn} = useAppStore();

  const {refetch: getAccountStatus} = useGetAccountStatus({
    enabled: false,
  });

  const {refetch: getOnboardingStep} = useGetOnboardingSteps({
    enabled: false,
    gcTime: 0,
    staleTime: Infinity,
  });

  const {refetch: getOnboarding} = useGetOnboarding({
    enabled: false,
    gcTime: 0,
    staleTime: Infinity,
  });

  const navigateBasedOnboardingStep = (onboardingStep: string) => {
    switch (onboardingStep) {
      case 'user-details-submitted':
        return navigationRef.navigate('UserInformation', {
          fromScreen: 'login',
        });
      case 'first-health-measurement':
        return navigationRef.navigate('FaceScan');
      case 'questionair':
        return navigationRef.dispatch(
          StackActions.replace('AdditionalInformation', {
            isNewUser: true,
          }),
        );
      case 'onboarded':
        return navigationRef.dispatch(
          StackActions.replace('HomepageStackScreens', {
            screen: 'Home',
          }),
        );
      default:
        navigationRef.navigate('TermsAndConditions');
    }
  };

  const navigateToHome = () => {
    navigationRef.dispatch(
      StackActions.replace('HomepageStackScreens', {
        screen: 'Home',
      }),
    );
  };

  const checkForOnboardingStep = async () => {
    const [
      {data: onboarding, isError: isOnboardingError},
      {data: onboardingSteps, isError: isOnboardingStepsError},
    ] = await Promise.all([
      getOnboarding() as Promise<UseQueryResult<OnboardingResponse>>,
      getOnboardingStep() as Promise<UseQueryResult<OnboardingStepsResponse>>,
    ]);
    if (isOnboardingError || isOnboardingStepsError) {
      return errorToast(languages?.onboarding_api_failure);
    }

    const nextMilestoneIndex = onboardingSteps?.data?.findIndex(step => {
      return !onboarding?.data?.some(
        onboardingStep => onboardingStep.milestone_tag === step.milestone_tag,
      );
    });

    const hasBasicDetails = onboarding?.data?.some(
      onboardingStep =>
        onboardingStep.milestone_tag === 'user-details-submitted',
    );

    if (hasBasicDetails) {
      const {data: accountStatus} = await getAccountStatus();
      if (!accountStatus?.approved) {
        return navigationRef?.navigate('UnverifiedUserTab', {
          screen: 'UnverifiedHome',
        });
      }
    }

    if (
      onboardingSteps?.data &&
      nextMilestoneIndex !== undefined &&
      nextMilestoneIndex !== null &&
      nextMilestoneIndex !== -1
    ) {
      navigateBasedOnboardingStep(
        onboardingSteps?.data?.[nextMilestoneIndex]?.milestone_tag,
      );
    } else {
      navigateToHome();
    }
  };

  const checkExistingUserAndNavigate = async () => {
    if (!navigationRef.isReady()) {
      return;
    }
    const session = await EncryptedStorage.getItem(REMEMBERED_USER_SESSION);
    if (shouldCheckOnboarding) {
      return await checkForOnboardingStep();
    }
    if (!stayLoggedIn || !session) {
      // const isRegistered = await checkUserRegistered();
      return navigationRef.navigate('Login');
    }
    // await fetchAndSetProfile();
    await checkForOnboardingStep();
  };

  return useMutation({
    onMutate: hasLoader ? showLoader : () => {},
    mutationFn: checkExistingUserAndNavigate,
    onSettled: async () => {
      if (hasLoader) {
        hideLoader();
        await BootSplash.hide({fade: true});
      }
    },
  });
};

export default useAuthNavigation;
