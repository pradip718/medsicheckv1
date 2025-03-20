import {
  NavigationProp,
  RouteProp,
  StackActions,
  useNavigation,
} from '@react-navigation/native';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import moment from 'moment';
import React, {useEffect, useState} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {
  Image,
  ImageBackground,
  TextInput as RNTextInput,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import DropDownPicker from 'react-native-dropdown-picker';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Background, Personal_Details} from '../../../../assets';
import useLanguageStore from '../../../../store/languageStore';
import useLoaderStore from '../../../../store/loaderStore';
import useUserProfileStore from '../../../../store/profileStore';
import {MainStackParamList} from '../../../../types/navigation';
import {User} from '../../../../types/users/user';
import {errorToast} from '../../../../utils/toast';
import {
  notifyApi,
  postFamilyAttributes,
  postUserAttributes,
} from '../../../api/user';
import GenericModal from '../../../components/AlertModal/GenericModal';
import ErrorText from '../../../components/ErrorText';
import Icon from '../../../components/Icon';
import Navbar from '../../../components/Navbar';
import RoundedButton from '../../../components/RoundedButton';
import CustomText from '../../../components/Text';
import {SEMIBOLD} from '../../../constants/Fonts';
import useGetAccountStatus from '../../../hooks/api/useGetAccountStatus';
import useGetFamilyMembers from '../../../hooks/api/useGetFamilyMembers';
import useGetUserAttributes from '../../../hooks/api/useGetUserAttributes';
import usePostOnboardingSteps from '../../../hooks/api/usePostOnboardingSteps';
import useBackButton from '../../../hooks/useBackButton';
import {color} from '../../../theme';
import customColor from '../../../theme/customColor';
import {GENDER, HEIGHT, WEIGHT} from './data';

type UserInformationRouteProp = RouteProp<
  MainStackParamList,
  'UserInformation'
>;

interface UserInformationProps {
  readonly route: UserInformationRouteProp;
}

export default function UserInformation({
  route,
}: Readonly<UserInformationProps>) {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const queryClient = useQueryClient();
  const {languages} = useLanguageStore();
  const {setCurrentActiveProfileId} = useUserProfileStore();
  const {fromScreen} = route?.params || {};
  const {data: users} = useGetUserAttributes();

  const {data: familyMembers, refetch: getFamilyMembers} =
    useGetFamilyMembers();
  const {refetch: getAccountStatus} = useGetAccountStatus({
    enabled: false,
  });

  const [openGenderDropdown, setOpenGenderDropdown] = useState<boolean>(false);
  const [openHeightDropdown, setOpenHeightDropdown] = useState<boolean>(false);
  const [openWeightDropdown, setOpenWeightDropdown] = useState<boolean>(false);

  const [isGenericModalVisible, setIsGenericModalVisible] =
    useState<boolean>(false);

  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);

  const {setSignoutModalVisibility} = useLoaderStore();

  const showSignoutModal = () => {
    if (fromScreen === 'profile') {
      navigation.dispatch(
        StackActions.replace('HomepageStackScreens', {
          screen: 'Home',
        }),
      );
    } else {
      setSignoutModalVisibility(true);
    }
    return true;
  };
  useBackButton(showSignoutModal);

  const {
    control,
    handleSubmit,
    formState: {isDirty, isValid, errors},
    reset,
    getValues,
    setValue,
  } = useForm<User>({
    defaultValues: {
      given_name: '',
      family_name: '',
      gender: GENDER[0].value,
      birthdate: moment(new Date()).format('DD/MM/YYYY'),
      height: '',
      weight: '',
      height_unit: 'cm',
      weight_unit: 'kg',
      middle_name: '',
    },
    mode: 'onBlur',
  });

  useEffect(() => {
    if (users?.user_id) {
      reset({
        given_name: users?.given_name || '',
        family_name: users?.family_name || '',
        gender: users?.gender ?? GENDER[0].value,
        birthdate: users?.birthdate || moment(new Date()).format('DD/MM/YYYY'),
        height: users?.height || '',
        weight: users?.weight || '',
        height_unit: users?.height_unit || 'cm',
        weight_unit: users?.weight_unit || 'kg',
        middle_name: users?.middle_name ?? '',
      });
    }
  }, [users, reset]);

  const setNewUserProfileId = async () => {
    const {data: familyData} = await getFamilyMembers();
    const admin = familyData?.find(
      eachMember => eachMember.relation === 'Admin',
    );
    setCurrentActiveProfileId(admin?.profile_id ?? '');
  };

  const handlePostAdmin = async (payload: User) => {
    let admin = familyMembers?.find(
      eachMember => eachMember.relation === 'Admin',
    );

    const userId = admin?.user_id;
    if (userId) {
      await postUserAttributes({
        user_id: userId,
        ...payload,
      });
      await notifyApi('update_admin_detail');
    } else {
      await postUserAttributes(payload);
      await setNewUserProfileId();
    }
  };
  const handlePostFamilyMembers = async (payload: User) => {
    const profileId = users?.profile_id;
    if (profileId) {
      await postFamilyAttributes({
        profile_id: profileId,
        ...payload,
      });
      await notifyApi('update_profile_detail');
    } else {
      await postFamilyAttributes(payload);
    }
  };

  const {mutateAsync: postOnboardingStep, isPending: isPostOnboardingPending} =
    usePostOnboardingSteps();

  const handleMutationFn = async (payload: User) => {
    const isAdmin = users?.relation === 'Admin';
    const isUsersEmpty = users && Object.keys(users).length === 0;

    if (isAdmin || isUsersEmpty) {
      await handlePostAdmin(payload);
    } else {
      await handlePostFamilyMembers(payload);
    }
  };

  const handleOnSuccess = async () => {
    try {
      const {data: accountStatus} = await getAccountStatus();
      if (accountStatus?.approved) {
        navigateBasedOnPrevRoute();
      } else {
        navigation?.navigate('UnverifiedUserTab', {
          screen: 'UnverifiedHome',
        });
      }

      await queryClient.invalidateQueries({queryKey: ['user-attributes']});
      if (!users?.user_id) {
        await postOnboardingStep({milestone: 'user-details-submitted'});
      }
      reset();
    } catch (error) {
      console.error('Error handling onSuccess:', error);
    }
  };

  const handleOnError = () => {
    errorToast(languages?.user_update_failure);
  };

  const {mutateAsync: updateUserDetails, isPending: isUpdatingProfile} =
    useMutation({
      mutationFn: handleMutationFn,
      onSuccess: handleOnSuccess,
      onError: handleOnError,
    });

  const showDatePicker = () => {
    setIsDatePickerVisible(true);
  };

  const hideDatePicker = () => {
    setIsDatePickerVisible(false);
  };

  const showGenericModal = () => {
    setIsGenericModalVisible(true);
  };
  const hideGenericModal = () => {
    setIsGenericModalVisible(false);
  };
  const navigateBasedOnPrevRoute = () => {
    if (fromScreen === 'profile') {
      navigation.goBack();
    } else {
      navigation.navigate('AdditionalInformation', {
        isNewUser: true,
      });
    }
  };

  const handleDateValidation = async (data: User) => {
    const thirteenYearsAge = moment().subtract(13, 'years').toDate();
    const selectedDate = moment(data?.birthdate, 'DD/MM/YYYY', true);

    if (selectedDate.isAfter(thirteenYearsAge)) {
      return showGenericModal();
    } else {
      handleSaveAndContinue(data);
    }
  };

  const handleSaveAndContinue = async (data: User) => {
    try {
      await updateUserDetails(data);
    } catch (error) {
      errorToast('Failed to Update User Information');
    }
  };

  return (
    <ImageBackground source={Background as any}>
      <SafeAreaView className="h-full">
        <KeyboardAwareScrollView className="px-6 my-6">
          <Navbar
            noBack={fromScreen !== 'profile'}
            onBackClick={navigateBasedOnPrevRoute}
            hasLogout
          />
          <View className="items-center mt-4">
            <Image
              source={Personal_Details as any}
              style={styles.personalDetailsImg}
            />
          </View>
          <View className="items-center">
            <CustomText className="text-base font-isidoraSemiBold">
              {languages?.basic_details_heading}
            </CustomText>
          </View>
          <View className="justify-between  flex-1">
            <View className="mt-4">
              <CustomText
                className="text-sm font-isidoraSemiBold"
                style={[styles.highlightedColor]}>
                {languages?.firstname}
              </CustomText>
              <Controller
                control={control}
                render={({field: {onChange, value, onBlur}}) => (
                  <>
                    <RNTextInput
                      value={value}
                      className="w-full h-10 text-base bg-transparent px-2 text-black"
                      onChangeText={text => onChange(text)}
                      onBlur={onBlur}
                      style={styles.borderHighlightedColor}
                    />
                    <ErrorText message={errors?.given_name?.message} />
                  </>
                )}
                name="given_name"
                rules={{required: true}}
              />
            </View>
            <View className="mt-4">
              <Controller
                control={control}
                render={({field: {onChange, value, onBlur}}) => (
                  <>
                    <CustomText
                      className="text-sm font-isidoraSemiBold"
                      style={[styles.highlightedColor]}>
                      {languages?.lastname}
                    </CustomText>
                    <RNTextInput
                      value={value}
                      className="w-full h-10 text-base bg-transparent px-2 text-black"
                      onChangeText={text => onChange(text)}
                      onBlur={onBlur}
                      style={styles.borderHighlightedColor}
                    />
                    <ErrorText message={errors?.family_name?.message} />
                  </>
                )}
                name="family_name"
                rules={{required: true}}
              />
            </View>
            <View className="mt-4">
              <CustomText
                className="mb-2 text-sm font-isidoraSemiBold"
                style={[styles.highlightedColor]}>
                {languages?.dob}
              </CustomText>

              <Controller
                control={control}
                render={({field: {onChange, value}}) => (
                  <>
                    <View
                      className="flex-row pl-2 justify-between items-center overflow-hidden"
                      style={styles.borderHighlightedColor}>
                      <CustomText className="font-isidoraSemiBold text-base">
                        {value}
                      </CustomText>
                      <TouchableOpacity
                        onPress={showDatePicker}
                        className="h-10 px-4 items-center justify-center"
                        style={{
                          backgroundColor: customColor.blueBerry,
                        }}>
                        <Icon
                          name="Calendar"
                          size={20}
                          color={customColor.white}
                        />
                      </TouchableOpacity>
                    </View>
                    <DatePicker
                      modal
                      open={isDatePickerVisible}
                      date={
                        value
                          ? moment(value, 'DD/MM/YYYY').toDate()
                          : new Date()
                      }
                      onConfirm={date => {
                        onChange(moment(date).format('DD/MM/YYYY'));
                        hideDatePicker();
                      }}
                      mode="date"
                      onCancel={hideDatePicker}
                      maximumDate={new Date()}
                      minimumDate={new Date('1900-01-01')}
                    />
                    <ErrorText message={errors?.birthdate?.message} />
                  </>
                )}
                name="birthdate"
                rules={{required: true}}
              />
            </View>
            <View className="mt-4">
              <CustomText
                className="mb-2 text-sm font-isidoraSemiBold"
                style={[styles.highlightedColor]}>
                {languages?.gender}
              </CustomText>
              <View>
                <Controller
                  control={control}
                  render={({field: {onChange, value}}) => (
                    <>
                      <DropDownPicker
                        listMode="MODAL"
                        open={openGenderDropdown}
                        value={value}
                        items={GENDER}
                        setOpen={setOpenGenderDropdown}
                        onChangeValue={onChange}
                        setValue={onChange}
                        zIndex={100}
                        textStyle={styles.genderDropdownText}
                        placeholder="Select Gender"
                        style={styles.borderHighlightedColor}
                      />
                      <ErrorText message={errors?.gender?.message} />
                    </>
                  )}
                  name="gender"
                  rules={{required: true}}
                />
              </View>
            </View>
            <View className="mt-4 flex-row">
              <View className="flex-1">
                <CustomText
                  style={styles.highlightedColor}
                  className="text-sm font-isidoraSemiBold">
                  {languages?.height}
                </CustomText>
                <View
                  className="flex-row items-center justify-between h-12 mt-1"
                  style={styles.borderHighlightedColor}>
                  <Controller
                    control={control}
                    render={({field: {onChange, value, onBlur}}) => (
                      <RNTextInput
                        value={value}
                        onBlur={onBlur}
                        style={styles.borderWidthZero}
                        contextMenuHidden={true}
                        onChangeText={text => {
                          const unit = getValues().height_unit;
                          if (unit === 'cm') {
                            const integerOnly = text.replace(/[^0-9]/g, '');
                            onChange(integerOnly);
                          } else {
                            onChange(text);
                          }
                        }}
                        keyboardType={
                          getValues()?.height_unit === 'cm'
                            ? 'number-pad'
                            : 'decimal-pad'
                        }
                        className="flex-1 h-10 text-base bg-transparent px-2 font-isidoraSemiBold text-black"
                      />
                    )}
                    name="height"
                    rules={{
                      required: languages?.height_required,
                      validate: value => {
                        const unit = getValues().height_unit;
                        const minHeight = unit === 'cm' ? 50 : 1.5;
                        const maxHeight = unit === 'cm' ? 300 : 9;
                        const heightValue = parseFloat(value);

                        if (isNaN(heightValue)) {
                          return 'Please enter a valid height.';
                        }

                        if (heightValue < minHeight) {
                          return unit === 'cm'
                            ? languages?.min_height_cm_error
                            : languages?.min_height_ft_error;
                        }

                        if (heightValue > maxHeight) {
                          return unit === 'cm'
                            ? languages?.max_height_cm_error
                            : languages?.max_height_ft_error;
                        }

                        return true;
                      },
                    }}
                  />

                  <View style={[styles.heightAndWeightDropdownContainer]}>
                    <Controller
                      control={control}
                      render={({field: {onChange, value}}) => (
                        <DropDownPicker
                          listMode="MODAL"
                          open={openHeightDropdown}
                          value={value}
                          items={HEIGHT}
                          setOpen={setOpenHeightDropdown}
                          onChangeValue={onChange}
                          setValue={val => {
                            onChange(val);
                            setValue('height', '');
                          }}
                          zIndex={50}
                          style={styles.heightAndWeightDropdown}
                          labelStyle={styles.heightAndWeightDropdownLabel}
                          arrowIconStyle={styles.dropdownArrowIcon as any}
                        />
                      )}
                      name="height_unit"
                      rules={{required: true}}
                    />
                  </View>
                </View>
                <ErrorText message={errors?.height?.message} />
              </View>

              <View className="flex-1 ml-4">
                <CustomText
                  style={styles.highlightedColor}
                  className="text-sm font-isidoraSemiBold">
                  {languages?.weight}
                </CustomText>
                <View
                  className="flex-row items-center justify-between h-12 mt-1"
                  style={styles.borderHighlightedColor}>
                  <Controller
                    control={control}
                    render={({field: {onChange, value, onBlur}}) => (
                      <RNTextInput
                        value={value}
                        onBlur={onBlur}
                        style={styles.borderWidthZero}
                        onChangeText={text => {
                          const validText = text.replace(/[^0-9.]/g, '');
                          const decimalCount = validText.split('.').length - 1;
                          if (decimalCount <= 1) {
                            onChange(validText);
                          }
                        }}
                        keyboardType="numeric"
                        className="flex-1 h-10 text-base bg-transparent px-2 font-isidoraSemiBold text-black"
                      />
                    )}
                    name="weight"
                    rules={{
                      required: 'Weight is required',
                      validate: value => {
                        const unit = getValues().weight_unit;
                        const minWeight = unit === 'kg' ? 20 : 44;
                        const maxWeight = unit === 'kg' ? 250 : 551;

                        const weightValue = parseFloat(value);

                        if (isNaN(weightValue)) {
                          return 'Please enter a valid weight.';
                        }

                        if (weightValue < minWeight) {
                          return unit === 'kg'
                            ? languages?.min_weight_kgs_error
                            : languages?.min_weight_lbs_error;
                        }

                        if (weightValue > maxWeight) {
                          return unit === 'kg'
                            ? languages?.max_weight_kgs_error
                            : languages?.max_weight_lbs_error;
                        }

                        return true;
                      },
                    }}
                  />

                  <View style={[styles.heightAndWeightDropdownContainer]}>
                    <Controller
                      control={control}
                      render={({field: {onChange, value}}) => (
                        <DropDownPicker
                          open={openWeightDropdown}
                          value={value}
                          items={WEIGHT}
                          setOpen={setOpenWeightDropdown}
                          onChangeValue={onChange}
                          setValue={onChange}
                          dropDownDirection="BOTTOM"
                          style={styles.heightAndWeightDropdown}
                          labelStyle={styles.heightAndWeightDropdownLabel}
                          arrowIconStyle={styles.dropdownArrowIcon as any}
                          listMode="MODAL"
                        />
                      )}
                      name="weight_unit"
                      rules={{required: true}}
                    />
                  </View>
                </View>
                <ErrorText message={errors?.weight?.message} />
              </View>
            </View>

            <RoundedButton
              className="mt-8"
              onPress={handleSubmit(handleDateValidation)}
              loading={isUpdatingProfile || isPostOnboardingPending}
              disabled={
                !isDirty ||
                !isValid ||
                isUpdatingProfile ||
                isPostOnboardingPending
              }>
              <CustomText className="text-white text-lg font-isidoraSemiBold">
                {languages?.save_btn_txt}
              </CustomText>
            </RoundedButton>
          </View>
        </KeyboardAwareScrollView>
      </SafeAreaView>
      <GenericModal
        visible={isGenericModalVisible}
        hideAlert={hideGenericModal}
        message={{
          title: languages?.dob_validation_header,
          content: languages?.dob_validation_subheader,
        }}
        allowText={languages?.update}
        handleOk={() => {
          hideGenericModal();
          showDatePicker();
        }}
        handleCancel={() => {
          hideGenericModal();
          handleSaveAndContinue(getValues());
        }}
        cancelText={languages?.continue}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  link: {
    color: color.ultramarineBlue,
  },
  termsAndConditionDescription: {
    color: 'grey',
    fontSize: 16,
  },
  personalDetailsImg: {
    aspectRatio: '1/1',
    resizeMode: 'contain',
    height: 218,
  },
  highlightedColor: {
    color: '#6583FF',
  },
  borderHighlightedColor: {
    borderWidth: 2,
    borderColor: '#6583FF',
    borderRadius: 6,
    fontFamily: SEMIBOLD,
  },
  borderWidthZero: {
    borderWidth: 0,
  },
  heightAndWeightDropdownContainer: {
    backgroundColor: customColor.blueBerry,
    maxHeight: '100%',
  },
  heightAndWeightDropdown: {
    width: 80,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  heightAndWeightDropdownLabel: {
    color: customColor.white,
    fontSize: 16,
    fontWeight: '600',
  },
  dropdownArrowIcon: {
    tintColor: customColor.white,
  },
  genderDropdownText: {
    fontFamily: SEMIBOLD,
    fontSize: 16,
  },
});
