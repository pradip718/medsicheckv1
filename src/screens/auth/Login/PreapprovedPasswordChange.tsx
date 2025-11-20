import {
  NavigationProp,
  StackActions,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {useMutation, UseQueryResult} from '@tanstack/react-query';
import {AxiosError} from 'axios';
import {isEmpty} from 'lodash';
import React, {useState} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {ImageBackground, SafeAreaView, StyleSheet, View} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import LinearGradient from 'react-native-linear-gradient';
import {TextInput} from 'react-native-paper';
import {AuthBackground} from '../../../../assets';
import useLanguageStore from '../../../../store/languageStore';
import useUserProfileStore from '../../../../store/profileStore';
import {LoginSuccessResponse} from '../../../../types/api_response';
import {MainStackParamList} from '../../../../types/navigation';
import {encryptText, setUserRegistered} from '../../../../utils/methods';
import {errorToast, successToast} from '../../../../utils/toast';
import {changePassword} from '../../../api/auth';
import {notifyApi} from '../../../api/user';
import Navbar from '../../../components/Navbar';
import RoundedButton from '../../../components/RoundedButton';
import CustomText from '../../../components/Text';
import useGetAccountStatus from '../../../hooks/api/useGetAccountStatus';
import useGetFamilyMembers from '../../../hooks/api/useGetFamilyMembers';
import useGetOnboarding from '../../../hooks/api/useGetOnboarding';
import useGetOnboardingSteps from '../../../hooks/api/useGetOnboardingSteps';
import useGetUserAttributes from '../../../hooks/api/useGetUserAttributes';
import useGetUserReading from '../../../hooks/api/useGetUserReading';
import customColor from '../../../theme/customColor';
import {OnboardingResponse, OnboardingStepsResponse} from './type';

type PreapprovedPasswordChangeParams = {
  password: string;
  confirmPassword: string;
};

const PreapprovedPasswordChange = () => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const route = useRoute();
  const {username, session} = route.params as {
    username: string;
    session: string;
  };
  const {languages} = useLanguageStore();
  const translations = languages as unknown as Record<
    string,
    string | undefined
  >;
  const {setCurrentActiveProfileId, currentActiveProfileId} =
    useUserProfileStore();
  const getTranslation = (key: string, fallback: string): string =>
    translations?.[key] ?? fallback;

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);

  const {refetch: getAccountStatus} = useGetAccountStatus({
    enabled: false,
  });
  const {refetch: getFamilyMembers} = useGetFamilyMembers({enabled: false});
  const {refetch: getUserAttributes} = useGetUserAttributes({enabled: false});
  const {refetch: getUserReading} = useGetUserReading({enabled: false});

  const {refetch: getOnboardingStep, isError: isOnboardingStepsError} =
    useGetOnboardingSteps({
      enabled: false,
      gcTime: 0,
      staleTime: Infinity,
    });

  const {refetch: getOnboarding, isError: isOnboardingError} = useGetOnboarding(
    {
      enabled: false,
      gcTime: 0,
      staleTime: Infinity,
    },
  );

  const fetchAndSetProfile = async () => {
    const {data: members, isError: isMembersError} = await getFamilyMembers();
    if (!members || isEmpty(members)) {
      return;
    }
    const admin = members?.find(eachMember => eachMember?.relation === 'Admin');
    if (!isMembersError && !currentActiveProfileId) {
      setCurrentActiveProfileId(admin?.user_id ?? '');
    }
    await Promise.all([getUserAttributes(), getUserReading()]);
  };

  const navigateToHome = () => {
    navigation.dispatch(
      StackActions.replace('HomepageStackScreens', {
        screen: 'Home',
      }),
    );
  };

  const navigateBasedOnboardingStep = (onboardingStep: string) => {
    switch (onboardingStep) {
      case 'user-details-submitted':
        return navigation.navigate('UserInformation', {
          fromScreen: 'login',
        });
      case 'first-health-measurement':
        return navigation.navigate('FaceScan');
      case 'questionair':
        return navigation.dispatch(
          StackActions.replace('AdditionalInformation', {
            isNewUser: true,
          }),
        );
      case 'onboarded':
        return navigation.dispatch(
          StackActions.replace('HomepageStackScreens', {
            screen: 'Home',
          }),
        );
      default:
        navigation.navigate('TermsAndConditions');
    }
  };

  const checkForOnboardingStep = async () => {
    const [{data: onboarding}, {data: onboardingSteps}] = await Promise.all([
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
        return navigation?.navigate('UnverifiedUserTab', {
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

  const proceedLoginStep = async (loginResponse: LoginSuccessResponse) => {
    if (
      'user_id' in loginResponse &&
      (!loginResponse?.email_verification_flag ||
        !loginResponse?.phone_verification_flag)
    ) {
      errorToast(languages?.profile_not_verified);
      return navigation.navigate('ContactVerification', {
        email: loginResponse?.user_name,
        phoneNumber: loginResponse?.phone_number,
        user_id: loginResponse?.user_id,
        password: getValues('password'),
        loginParams: {
          isEmailVerified: loginResponse?.email_verification_flag,
          isPhoneVerified: loginResponse?.phone_verification_flag,
        },
      });
    }
    notifyApi('login');
    await fetchAndSetProfile();
    await checkForOnboardingStep();
  };

  const {mutateAsync: changeUserPassword, isPending: isChangingPassword} =
    useMutation({
      mutationFn: async ({password}: {password: string}) => {
        const encryptedPassword = await encryptText(password);
        return await changePassword({
          username,
          session,
          password: encryptedPassword,
        });
      },
      onSuccess: async loginResponse => {
        successToast(languages?.password_change_success);
        await setUserRegistered();
        await proceedLoginStep(loginResponse);
      },
      onError: error => {
        if (error instanceof AxiosError) {
          errorToast(
            error?.response?.data?.error || languages?.generic_error_message,
          );
        } else {
          errorToast(languages?.generic_error_message);
        }
      },
    });

  const validatePassword = ({
    password,
    confirmPassword,
  }: PreapprovedPasswordChangeParams): boolean => {
    if (password !== confirmPassword) {
      errorToast(languages?.password_does_not_match_error_message);
      return false;
    }
    return true;
  };

  const {
    handleSubmit,
    control,
    getValues,
    formState: {errors, isDirty, isValid},
  } = useForm<PreapprovedPasswordChangeParams>({
    mode: 'onBlur',
  });

  const handlePasswordChange = async ({
    confirmPassword,
    password,
  }: PreapprovedPasswordChangeParams) => {
    const isValidPassword = validatePassword({password, confirmPassword});
    if (!isValidPassword) {
      return;
    }

    try {
      await changeUserPassword({password});
    } catch (error) {
      if (error instanceof AxiosError) {
        errorToast(
          error?.response?.data?.error || languages?.generic_error_message,
        );
      } else {
        errorToast(languages?.generic_error_message);
      }
    }
  };

  return (
    <LinearGradient
      colors={['#6583FF', '#3E64FF']}
      style={styles.linearGradient}>
      <ImageBackground source={AuthBackground as any} className="flex-1">
        <SafeAreaView style={styles.container}>
          <View className="p-4">
            <Navbar />
          </View>
          <KeyboardAwareScrollView
            showsVerticalScrollIndicator={false}
            bounces={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}>
            <View style={styles.contentWrapper}>
              <CustomText style={styles.heading} className="font-isidoraBold">
                {getTranslation('change_password', 'Change Password')}
              </CustomText>
              <CustomText
                style={styles.subHeading}
                className="font-isidoraRegular">
                {getTranslation(
                  'preapproved_password_change_message',
                  'Please set a new password for your account',
                )}
              </CustomText>

              <View style={styles.formCard}>
                <View style={styles.inputWrapper}>
                  <Controller
                    control={control}
                    render={({field: {onChange, value, onBlur}}) => (
                      <>
                        <TextInput
                          label={
                            <CustomText
                              style={styles.inputLabel}
                              className="text-base font-isidoraSemiBold">
                              {languages?.new_password_txt}
                            </CustomText>
                          }
                          value={value}
                          className="bg-transparent w-full"
                          textColor="white"
                          activeUnderlineColor="rgba(255, 255, 255, 0.45)"
                          secureTextEntry={!showPassword}
                          editable={!isChangingPassword}
                          right={
                            <TextInput.Icon
                              icon={!showPassword ? 'eye' : 'eye-off'}
                              color={customColor.black}
                              disabled={isChangingPassword}
                              onPress={() => {
                                setShowPassword(prev => !prev);
                              }}
                            />
                          }
                          onChangeText={onChange}
                          onBlur={onBlur}
                        />
                        {!!errors?.password?.message && (
                          <CustomText style={styles.errorText}>
                            {errors?.password?.message}
                          </CustomText>
                        )}
                      </>
                    )}
                    name="password"
                    rules={{
                      required: languages?.password_is_required,
                      pattern: {
                        value:
                          /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
                        message:
                          languages?.password_requirements_message_with_length_and_requirements,
                      },
                    }}
                  />
                </View>
                <View style={styles.inputWrapper}>
                  <Controller
                    control={control}
                    render={({field: {onChange, value, onBlur}}) => (
                      <>
                        <TextInput
                          label={
                            <CustomText
                              style={styles.inputLabel}
                              className="text-base font-isidoraSemiBold">
                              {languages?.confirm_password}
                            </CustomText>
                          }
                          value={value}
                          className="bg-transparent w-full"
                          textColor="white"
                          activeUnderlineColor="rgba(255, 255, 255, 0.45)"
                          placeholderTextColor="rgba(255, 255, 255, 0.45)"
                          secureTextEntry={!showConfirmPassword}
                          editable={!isChangingPassword}
                          right={
                            <TextInput.Icon
                              icon={!showConfirmPassword ? 'eye' : 'eye-off'}
                              color={customColor.black}
                              disabled={isChangingPassword}
                              onPress={() => {
                                setShowConfirmPassword(prev => !prev);
                              }}
                            />
                          }
                          onChangeText={onChange}
                          onBlur={onBlur}
                        />
                        {!!errors?.confirmPassword?.message && (
                          <CustomText style={styles.errorText}>
                            {errors?.confirmPassword?.message}
                          </CustomText>
                        )}
                      </>
                    )}
                    name="confirmPassword"
                    rules={{
                      required: languages?.confirm_password_is_required,
                      pattern: {
                        value:
                          /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
                        message:
                          languages?.password_requirements_message_with_length_and_requirements,
                      },
                    }}
                  />
                </View>

                <RoundedButton
                  resetStyle
                  style={styles.submitButton}
                  onPress={handleSubmit(handlePasswordChange)}
                  disabled={isChangingPassword || !isDirty || !isValid}
                  loading={isChangingPassword}>
                  <CustomText className="text-lg text-white font-isidoraSemiBold">
                    {languages?.submit || 'Submit'}
                  </CustomText>
                </RoundedButton>
              </View>
            </View>
          </KeyboardAwareScrollView>
        </SafeAreaView>
      </ImageBackground>
    </LinearGradient>
  );
};

export default PreapprovedPasswordChange;

const styles = StyleSheet.create({
  linearGradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 32,
  },
  contentWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowOffset: {width: 0, height: 12},
    shadowRadius: 24,
  },
  heading: {
    fontSize: 26,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subHeading: {
    marginTop: 12,
    marginBottom: 24,
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
  },
  formCard: {
    marginTop: 12,
  },
  inputWrapper: {
    marginBottom: 18,
  },
  inputLabel: {
    color: 'rgba(255, 255, 255, 0.45)',
  },
  submitButton: {
    width: '100%',
    backgroundColor: '#222B45',
    marginTop: 10,
    paddingVertical: 12,
  },
  errorText: {
    marginTop: 6,
    fontSize: 13,
    color: '#FF9CA3',
  },
});
