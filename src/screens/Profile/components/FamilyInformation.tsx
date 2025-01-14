import CheckBox from '@react-native-community/checkbox';
import {
  NavigationProp,
  RouteProp,
  useNavigation,
} from '@react-navigation/native';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import _, {isEmpty} from 'lodash';
import moment from 'moment';
import React, {useEffect, useState} from 'react';
import {Controller, useForm} from 'react-hook-form';
import {
  ActivityIndicator,
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
import {twMerge} from 'tailwind-merge';
import {Background, Personal_Details} from '../../../../assets';
import useLanguageStore from '../../../../store/languageStore';
import useUserProfileStore from '../../../../store/profileStore';
import {MainStackParamList} from '../../../../types/navigation';
import {Family} from '../../../../types/users/user';
import {getKeyByValue, isSpanishLocale} from '../../../../utils/methods';
import {errorToast} from '../../../../utils/toast';
import {
  getFamilyAttributes,
  notifyApi,
  postFamilyAttributes,
} from '../../../api/user';
import GenericModal from '../../../components/AlertModal/GenericModal';
import ErrorText from '../../../components/ErrorText';
import Icon from '../../../components/Icon';
import Navbar from '../../../components/Navbar';
import RoundedButton from '../../../components/RoundedButton';
import CustomText from '../../../components/Text';
import {SEMIBOLD} from '../../../constants/Fonts';
import useGetFamilyMembers from '../../../hooks/api/useGetFamilyMembers';
import useBackButton from '../../../hooks/useBackButton';
import {color} from '../../../theme';
import customColor from '../../../theme/customColor';
import {GENDER, HEIGHT, RELATIONSHIPS, WEIGHT} from '../data';
import FamilyPhoneInput from './FamilyPhoneInput';

type FamilyInformationRouteProp = RouteProp<
  MainStackParamList,
  'FamilyInformation'
>;

interface FamilyInformationProps {
  route: FamilyInformationRouteProp;
}

export default function FamilyInformation({route}: FamilyInformationProps) {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const queryClient = useQueryClient();
  const {languages} = useLanguageStore();
  const {profileId} = route?.params || {};
  const {setCurrentActiveProfileId} = useUserProfileStore();

  const [openRelationDropdown, setOpenRelationDropdown] =
    useState<boolean>(false);
  const [openGenderDropdown, setOpenGenderDropdown] = useState<boolean>(false);
  const [openHeightDropdown, setOpenHeightDropdown] = useState<boolean>(false);
  const [openWeightDropdown, setOpenWeightDropdown] = useState<boolean>(false);

  const [isEmailAsPrimary, setIsEmailAsPrimary] = useState<boolean>(false);
  const [isPhoneAsPrimary, setIsPhoneAsPrimary] = useState<boolean>(false);

  const [isGenericModalVisible, setIsGenericModalVisible] =
    useState<boolean>(false);

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const showSignoutModal = () => {
    navigation.goBack();
    return true;
  };
  useBackButton(showSignoutModal);

  const {refetch: getAllFamilyMembers} = useGetFamilyMembers({enabled: false});

  const {data: users, isLoading} = useQuery({
    queryKey: ['get-admin-details'],
    queryFn: async () => {
      const {data: familyMembers} = await getAllFamilyMembers();
      const adminProfileId = familyMembers?.find(
        profile => profile?.relation === 'Admin',
      );
      return await getFamilyAttributes(adminProfileId?.user_id || '');
    },
  });

  const {
    control,
    handleSubmit,
    formState: {isDirty, isValid, errors},
    reset,
    getValues,
    setValue,
    setError,
    trigger,
  } = useForm<Family>({
    defaultValues: {
      given_name: '',
      family_name: '',
      gender: 'male',
      email: '',
      phone_number: '',
      birthdate: moment(new Date()).format('DD/MM/YYYY'),
      height: '',
      weight: '',
      height_unit: 'cm',
      weight_unit: 'kg',
      middle_name: '',
      relation: '',
      other_relation: '',
    },
    mode: 'onChange',
  });

  const {refetch: getFamilyDetails} = useQuery<Family>({
    queryKey: ['Family-Attributes'],
    queryFn: async () => await getFamilyAttributes(profileId || ''),
    enabled: false,
  });

  useEffect(() => {
    const fetchDetails = async () => {
      const {data: details, isSuccess} = await getFamilyDetails();
      if (isSuccess) {
        reset({
          given_name: details?.given_name,
          family_name: details?.family_name,
          gender: details?.gender,
          email: details?.email,
          relation: details?.email,
          phone_number: details?.phone_number,
          birthdate: details?.birthdate,
          height: details?.height,
          weight: details?.weight,
          height_unit: details?.height_unit,
          weight_unit: details?.weight_unit,
          middle_name: details?.middle_name,
        });
      }
    };
    if (profileId) {
      fetchDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId]);

  const {mutateAsync: updateUserDetails, isPending: isUpdatingProfile} =
    useMutation({
      mutationFn: async (payload: Family) => {
        if (profileId) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const {email, phone_number, ...restPayload} = payload;
          return await postFamilyAttributes({
            profile_id: profileId,
            email,
            ...restPayload,
          });
        } else {
          return await postFamilyAttributes(payload);
        }
      },
      onSuccess: async user => {
        if ('profile_id' in user) {
          await notifyApi('adding_profile');
          setCurrentActiveProfileId(user?.profile_id);
          await queryClient.resetQueries();
          reset();
          navigation.navigate('Profile');
        }
      },
      onError: err => {
        if ('email_duplication' in err && err?.email_duplication) {
          setError('email', {
            type: 'validate',
            message: languages?.duplicate_email_content,
          });
        }
        if ('phone_duplication' in err && err?.phone_duplication) {
          setError('phone_number', {
            type: 'validate',
            message: languages?.duplicate_phone_content,
          });
        }
        errorToast(languages?.sub_profile_failure);
      },
    });

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const showGenericModal = () => {
    setIsGenericModalVisible(true);
  };
  const hideGenericModal = () => {
    setIsGenericModalVisible(false);
  };

  const handleEmailAsPrimary = (isPrimary: boolean) => {
    if (isPrimary) {
      setValue('email', users?.email ?? '');
    } else {
      setValue('email', '');
    }
    setIsEmailAsPrimary(isPrimary);
  };

  const handlePhoneAsPrimary = (isPrimary: boolean) => {
    if (isPrimary) {
      setValue('phone_number', users?.phone_number ?? '');
    } else {
      setValue('phone_number', '');
    }
    setIsPhoneAsPrimary(isPrimary);
  };

  const getRelationKeyByValue = (value: string): string | undefined => {
    if (!languages?.relation_list) {
      return undefined;
    }

    return (
      Object.keys(languages.relation_list) as Array<
        keyof typeof languages.relation_list
      >
    ).find(key => key === value);
  };

  const handleSaveAndContinue = async (data: Family) => {
    try {
      const modifiedPayload = _.cloneDeep(data);
      const relationKey = getRelationKeyByValue(data.relation);
      if (relationKey === 'other') {
        _.set(
          modifiedPayload,
          'relation',
          JSON.stringify({
            [data.relation]: data.other_relation,
          }),
        );
        _.unset(modifiedPayload, 'other_relation');
      }

      await updateUserDetails(modifiedPayload);
    } catch (error) {
      errorToast('Failed to Update User Information');
    }
  };

  return (
    <ImageBackground source={Background as any}>
      <SafeAreaView className="h-full">
        <KeyboardAwareScrollView className="px-6 my-6">
          <Navbar />
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
              <View className="flex-row space-x-2 items-center">
                {isLoading ? (
                  <ActivityIndicator size="small" color="#3E64FF" />
                ) : (
                  <CheckBox
                    value={isEmailAsPrimary}
                    tintColors={{true: '#3E64FF', false: '#3E64FF'}}
                    boxType="square"
                    onValueChange={newValue => {
                      handleEmailAsPrimary(newValue);
                      trigger('email');
                    }}
                  />
                )}
                <CustomText className="text-sm font-isidoraMedium">
                  {languages?.email_same_as_primary_account_content}
                </CustomText>
              </View>
              <Controller
                control={control}
                render={({field: {onChange, onBlur, value}}) => (
                  <>
                    <CustomText
                      className="text-sm font-isidoraSemiBold"
                      style={[styles.highlightedColor]}>
                      {languages?.username}
                    </CustomText>
                    <RNTextInput
                      value={value}
                      className={twMerge(
                        'w-full h-10 text-base bg-transparent px-2 text-black',
                        isEmailAsPrimary && 'text-slate-500',
                      )}
                      style={styles.borderHighlightedColor}
                      onChangeText={text => onChange(text)}
                      editable={!isEmailAsPrimary}
                      onBlur={onBlur}
                      autoCapitalize="none"
                      inputMode="email"
                    />
                    <CustomText className="text-base font-isidoraMedium text-red-500">
                      {errors?.email?.message}
                    </CustomText>
                  </>
                )}
                name="email"
                rules={{
                  // required: 'Email is Required',
                  pattern: {
                    value: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                    message: languages?.email_validation_error_msg,
                  },
                }}
              />
            </View>

            <View className="flex-row space-x-2 items-center">
              {isLoading ? (
                <ActivityIndicator size="small" color="#3E64FF" />
              ) : (
                <CheckBox
                  value={isPhoneAsPrimary}
                  tintColors={{true: '#3E64FF', false: '#3E64FF'}}
                  boxType="square"
                  onValueChange={newValue => {
                    handlePhoneAsPrimary(newValue);
                    trigger('phone_number');
                  }}
                />
              )}
              <CustomText className="text-sm font-isidoraMedium">
                {languages?.phone_same_as_primary_account_content}
              </CustomText>
            </View>
            <View
              className="mt-4 h-16 overflow-hidden items-center justify-center"
              style={styles.borderHighlightedColor}>
              <FamilyPhoneInput
                control={control}
                disabled={!!profileId || isPhoneAsPrimary}
                key={`${isPhoneAsPrimary}`}
              />
            </View>
            {!!errors?.phone_number?.message && (
              <CustomText className="text-base font-isidoraMedium text-red-500">
                {errors?.phone_number?.message}
              </CustomText>
            )}

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
                      cancelText={languages?.cancel}
                      confirmText={languages?.confirm}
                      title={languages?.select_date}
                      locale={isSpanishLocale() ? 'es' : 'en'}
                      open={isDatePickerVisible}
                      date={
                        value
                          ? moment(value, 'DD/MM/YYYY').toDate()
                          : new Date()
                      }
                      onConfirm={date => {
                        const thirteenYearsAge = moment()
                          .subtract(13, 'years')
                          .toDate();
                        onChange(moment(date).format('DD/MM/YYYY'));
                        hideDatePicker();

                        if (date > thirteenYearsAge) {
                          showGenericModal();
                        }
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

            <View className="mt-4">
              <CustomText
                className="mb-2 text-sm font-isidoraSemiBold"
                style={[styles.highlightedColor]}>
                {languages?.relation}
              </CustomText>
              <View className="space-y-2">
                <Controller
                  control={control}
                  render={({field: {onChange, value}}) => (
                    <>
                      <DropDownPicker
                        listMode="MODAL"
                        open={openRelationDropdown}
                        value={value}
                        items={RELATIONSHIPS}
                        setOpen={setOpenRelationDropdown}
                        onChangeValue={onChange}
                        setValue={onChange}
                        zIndex={100}
                        textStyle={styles.genderDropdownText}
                        placeholder={languages?.select_relation_placeholder}
                        style={styles.borderHighlightedColor}
                      />
                      {value ===
                        getKeyByValue(
                          languages?.relation_list?.other,
                          languages?.relation_list,
                        ) && (
                        <Controller
                          control={control}
                          render={({
                            field: {
                              onChange: onChangeRelationInput,
                              value: relationValue,
                              onBlur: relationOnBlur,
                            },
                          }) => (
                            <>
                              <RNTextInput
                                placeholder={languages?.relation_placeholder}
                                value={relationValue}
                                className="mt-4 w-full h-10 text-base bg-transparent px-2 text-black"
                                onChangeText={onChangeRelationInput}
                                onBlur={relationOnBlur}
                                style={styles.borderHighlightedColor}
                              />
                              <ErrorText
                                message={errors?.given_name?.message}
                              />
                            </>
                          )}
                          name="other_relation"
                          rules={{required: true}}
                        />
                      )}
                      <ErrorText message={errors?.relation?.message} />
                    </>
                  )}
                  name="relation"
                  rules={{required: true}}
                />
              </View>
            </View>

            <View className="mt-4 flex-row">
              <View className="flex-grow">
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
                      <>
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
                        <ErrorText message={errors?.height?.message} />
                      </>
                    )}
                    name="height"
                    rules={{required: true}}
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
              </View>

              <View className="flex-grow ml-4">
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
                      <>
                        <RNTextInput
                          value={value}
                          onBlur={onBlur}
                          style={styles.borderWidthZero}
                          onChangeText={onChange}
                          keyboardType="numeric"
                          className="flex-1 h-10 text-base bg-transparent px-2 font-isidoraSemiBold text-black"
                        />
                        <ErrorText message={errors?.weight?.message} />
                      </>
                    )}
                    name="weight"
                    rules={{required: true}}
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
              </View>
            </View>

            <RoundedButton
              className="mt-8"
              onPress={handleSubmit(handleSaveAndContinue)}
              loading={isUpdatingProfile}
              disabled={
                !isDirty || !isValid || isUpdatingProfile || !isEmpty(errors)
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
        handleOk={hideGenericModal}
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
