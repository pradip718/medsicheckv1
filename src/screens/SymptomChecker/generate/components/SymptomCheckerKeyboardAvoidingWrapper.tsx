import React, {useState} from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

import {NavigationProp, useNavigation} from '@react-navigation/native';
import {MainStackParamList} from '../../../../../types/navigation';
import useLanguageStore from '../../../../../store/languageStore';
import useSymptomChecker from '../../../../hooks/useSymptomChecker';
import {getSymptomQuestion} from '../../../../api/symptomchecker';
import {errorToast} from '../../../../../utils/toast';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import Icon from '../../../../components/Icon';
import {
  QUESTIONNAIRE_SPACING,
  SCREEN_PADDING_TOP,
} from '../../../../constants/Styles';
import {SEMIBOLD} from '../../../../constants/Fonts';
import RoundedButton from '../../../../components/RoundedButton';
import CustomText from '../../../../components/Text';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
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
  scrollHeight?: number;
}

const SymptomCheckerKeyboardAvoidingWrapper = ({
  children,
  onNext,
  footer,
  disabled,
  isLoading,
  hideNext,
  isEdit,
  buttonText,
  // scrollHeight = 0,
  questionId,
}: SymptomCheckerWrapperProps) => {
  const {top} = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();

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
      <View style={[styles.container]}>
        <KeyboardAwareScrollView
          contentContainerStyle={[
            // styles.contentContainer,
            {paddingTop: top + SCREEN_PADDING_TOP, flexGrow: 1},
          ]}
          className="flex-grow h-full"
          keyboardShouldPersistTaps="handled"
          bounces={false}
          nestedScrollEnabled
          enableOnAndroid>
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
            <TouchableOpacity
              className="items-end"
              onPress={() => {
                navigation.goBack();
              }}>
              <Icon name="close" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.contentContainer}>{children}</View>

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
        </KeyboardAwareScrollView>
      </View>

      {/* <GoToHomeBottomSheet open={openHome} onClose={() => setOpenHome(false)} /> */}
    </>
  );
};
export default SymptomCheckerKeyboardAvoidingWrapper;

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
  scrollContent: {
    paddingHorizontal: 0,
  },
});
