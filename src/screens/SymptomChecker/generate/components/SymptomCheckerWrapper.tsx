import React, {useState} from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';

import {
  NavigationProp,
  // RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {MainStackParamList} from '../../../../../types/navigation';
import useLanguageStore from '../../../../../store/languageStore';
import useSymptomChecker from '../../../../hooks/useSymptomChecker';
import {getSymptomQuestion} from '../../../../api/symptomchecker';
import {errorToast} from '../../../../../utils/toast';
import {
  QUESTIONNAIRE_SPACING,
  SCREEN_PADDING_TOP,
} from '../../../../constants/Styles';
import Icon from '../../../../components/Icon';
import RoundedButton from '../../../../components/RoundedButton';
import CustomText from '../../../../components/Text';
import {SEMIBOLD} from '../../../../constants/Fonts';
import colors from '../../../../../colors';

interface SymptomCheckerWrapperProps {
  children: React.ReactNode;
  onNext?: () => void;
  footer?: React.ReactNode;
  disabled?: boolean;
  isLoading?: boolean;
  hideNext?: boolean;
  isEdit?: boolean;
  buttonText?: string;
  questionId?: string;
}

const SymptomCheckerWrapper = ({
  children,
  onNext,
  footer,
  disabled,
  isLoading,
  hideNext,
  isEdit,
  buttonText,
  questionId,
}: SymptomCheckerWrapperProps) => {
  const {top, bottom} = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const {params} = useRoute<any>();
  console.log('🚀 ~ SymptomCheckerWrapper ~ params:', params);

  const languages = useLanguageStore(store => store.languages);

  const {symptomCheckerNavigation} = useSymptomChecker();

  const [isNavigating, setIsNavigating] = useState<boolean>(false);

  const onBack = async () => {
    if (!questionId || isEdit) {
      return navigation.goBack();
    }

    setIsNavigating(true);
    try {
      const response = await getSymptomQuestion({
        type: 'previous',
        q_id: questionId,
      });
      if (!response?.data || !response?.data?.q_id) {
        return navigation.goBack();
      }

      symptomCheckerNavigation(response);
    } catch (error) {
      errorToast();
    } finally {
      setIsNavigating(false);
    }
  };

  return (
    <>
      <View style={styles.container}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[
            styles.scrollViewContentContainer,
            {paddingTop: top + SCREEN_PADDING_TOP},
            Platform.OS === 'ios' && {paddingBottom: bottom},
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <View style={styles.headerContainer}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onBack}
              style={styles.backButton}>
              {isNavigating ? (
                <ActivityIndicator color="#1671C0" />
              ) : (
                <Feather name="chevron-left" size={30} color="#1F2937" />
              )}
            </TouchableOpacity>
            {/* <TouchableOpacity
              activeOpacity={0.8}
              style={styles.backButton}
              onPress={goToHome}>
              <Icon name="home" color="#222A3D" size={26} />
            </TouchableOpacity> */}
            {isEdit ? null : (
              <TouchableOpacity
                className="items-end"
                onPress={() => {
                  if (params?.isFromReportList) {
                    navigation.navigate('SymptomChecker');
                  } else if (isEdit) {
                    navigation.goBack();
                  } else {
                    navigation.navigate('SmartReport');
                  }
                }}>
                <Icon name="close" size={24} color={colors.primary} />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.contentContainer}>{children}</View>
        </ScrollView>

        {!hideNext && (
          <View className="gap-2 p-4">
            {/* <Button
              text={
                buttonText
                  ? buttonText
                  : isEdit
                  ? languages?.update
                  : languages?.next
              }
              onPress={onNext}
              rightIcon={
                buttonText ? (
                  <Feather
                    name="check"
                    size={20}
                    color={disabled ? '#D1D5DB' : '#fff'}
                  />
                ) : !isEdit ? (
                  <Icon
                    name="chevron-right"
                    size={20}
                    color={disabled ? '#D1D5DB' : '#fff'}
                  />
                ) : null
              }
              disabled={disabled || isLoading}
              isLoading={isLoading}
            /> */}
            <RoundedButton
              // className="px-4 py-2 bg-accentBlue"
              onPress={onNext}
              disabled={disabled || isLoading}
              loading={isLoading}>
              <CustomText className="text-lg text-white font-isidoraSemiBold">
                {buttonText
                  ? buttonText
                  : isEdit
                  ? languages?.update
                  : languages?.next}
              </CustomText>
            </RoundedButton>
            {footer}
          </View>
        )}
      </View>

      {/* <GoToHomeBottomSheet open={openHome} onClose={() => setOpenHome(false)} /> */}
    </>
  );
};
export default SymptomCheckerWrapper;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
  },
  flex: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollViewContentContainer: {
    flexGrow: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contentContainer: {
    gap: QUESTIONNAIRE_SPACING,
    flex: 1,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    backgroundColor: '#F3F4F6',
    height: 10,
    width: '60%',
    position: 'relative',
    borderRadius: 8,
  },
  progressValue: {
    backgroundColor: '#2563EB',
    height: 10,
    position: 'absolute',
    left: 0,
    borderRadius: 8,
  },
  backButton: {
    alignSelf: 'flex-start',
    borderRadius: 14,
    borderCurve: 'continuous',
    height: 48,
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  skipText: {
    fontFamily: SEMIBOLD,
    fontSize: 16,
    color: '#4B5363',
    lineHeight: 22,
  },
});
