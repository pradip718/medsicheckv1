import React from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import {
  NavigationProp,
  RouteProp,
  StackActions,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {ENGLISH_YES, SPANISH_YES} from '../../../constants/enums';
import {MainStackParamList} from '../../../../types/navigation';
import {isSpanishLocale} from '../../../../utils/methods';
// import useSymptomChecker from '../../../hooks/useSymptomChecker';
import {getSymptomQuestion} from '../../../api/symptomchecker';
import {errorToast} from '../../../../utils/toast';
import SymptomCheckerWrapper from './components/SymptomCheckerWrapper';
import SymptomCheckerQuestion from './components/SymptomCheckerQuestion';
import RoundedButton from '../../../components/RoundedButton';
import CustomText from '../../../components/Text';
import {SYMPTOM_CHECKER_SPACING} from '../../../constants/Styles';
import {units} from '../../../theme';
import {SymptomCodeScreenMapper} from '../../../../utils/symptom';
import useFullPageLoader from '../../../hooks/useFullPageLoader';

const checkIsYes = (value: string) => {
  return [ENGLISH_YES.toLowerCase(), SPANISH_YES.toLowerCase(), 'sí'].includes(
    value.toLowerCase(),
  );
};

const SymptomCheckerConfirmation = () => {
  const {params} =
    useRoute<RouteProp<MainStackParamList, 'SymptomConfirmation'>>();
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const {showLoader, hideLoader} = useFullPageLoader();

  const isSpanish = isSpanishLocale();
  const questionData = params;

  // const {symptomCheckerNavigation} = useSymptomChecker();

  const englishChoices = JSON.parse(questionData?.eng_choices || '');
  const spanishChoices = JSON.parse(questionData?.spanish_choices || '');

  const buttons = isSpanish ? spanishChoices : englishChoices;

  // const [isLoading, setIsLoading] = useState<string>('');

  const onSelect = async (choice: string) => {
    try {
      // setIsLoading(choice);
      showLoader();
      const response = await getSymptomQuestion({
        type: 'latest',
        restart_flag: checkIsYes(choice) ? 'true' : 'false',
      });

      // symptomCheckerNavigation(response);
      if (response?.screen === 'review') {
        const nextRoute = SymptomCodeScreenMapper.review;

        return navigation.dispatch(
          StackActions.replace(nextRoute, {
            ...response.data,
            isFromReportList: params?.isFromReportList,
          }),
        );
      }

      const questionItem = response?.data?.q_id ? response.data : null;
      if (questionItem?.code) {
        const nextRoute = SymptomCodeScreenMapper[questionItem.code];
        navigation.dispatch(
          StackActions.replace(nextRoute, {
            ...questionItem,
            isFromReportList: params?.isFromReportList,
          }),
        );
      }
    } catch (error) {
      errorToast();
    } finally {
      // setIsLoading('');
      hideLoader();
    }
  };

  return (
    <SymptomCheckerWrapper hideNext>
      <View style={styles.container}>
        <SymptomCheckerQuestion data={questionData} />

        <View className="gap-2 mt-12">
          {Array.isArray(buttons) && buttons?.length
            ? buttons.map(button => (
                <>
                  {checkIsYes(button) ? (
                    <TouchableOpacity
                      key={button}
                      className="border border-gray-300 min-w-[50%] min-h-12 justify-center items-center mt-4 px-4 py-2 mb-4"
                      onPress={() => onSelect(button)}
                      style={{borderRadius: units.scale(100)}}>
                      <CustomText className="font-isidoraSemiBold text-lg">
                        {button}
                      </CustomText>
                    </TouchableOpacity>
                  ) : (
                    <RoundedButton
                      // disabled={!!isLoading}
                      // loading={isLoading === button}
                      onPress={() => onSelect(button)}>
                      <CustomText className="text-lg text-white font-isidoraSemiBold">
                        {button}
                      </CustomText>
                    </RoundedButton>
                  )}
                </>
              ))
            : null}
          {/* <Button
            text={languages?.yes}
            onPress={() => onSelect('yes')}
            disabled={!!isLoading}
            isLoading={isLoading === 'yes'}
          />
          <Button
            text={languages?.no}
            variant="secondary"
            onPress={() => onSelect('no')}
            disabled={!!isLoading}
            isLoading={isLoading === 'no'}
          /> */}
        </View>
      </View>
    </SymptomCheckerWrapper>
  );
};
export default SymptomCheckerConfirmation;

const styles = StyleSheet.create({
  container: {
    gap: SYMPTOM_CHECKER_SPACING,
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: SYMPTOM_CHECKER_SPACING,
  },
});
