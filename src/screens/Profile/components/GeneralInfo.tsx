import {NavigationProp, useNavigation} from '@react-navigation/native';
import {Text} from 'moti';
import React, {PropsWithChildren} from 'react';
import {StyleSheet, View, ViewProps} from 'react-native';
import {Divider} from 'react-native-paper';
import useLanguageStore from '../../../../store/languageStore';
import {MainStackParamList} from '../../../../types/navigation';
import Icon from '../../../components/Icon';
import RoundedButton from '../../../components/RoundedButton';
import CustomText from '../../../components/Text';
import {useGetQuestionnaireSection} from '../../../hooks/api/useGetQuestions';
import useGetUserAttributes from '../../../hooks/api/useGetUserAttributes';
import customColor from '../../../theme/customColor';
import {BODY_MASS_INDEX_INFORMATION, GENERAL_INFORMATION} from '../data';

interface ColProp extends ViewProps {}
interface RowProp extends ViewProps {}

const Col = ({children, ...restProps}: PropsWithChildren<ColProp>) => {
  return (
    <View className=" flex-[2]" {...restProps}>
      {children}
    </View>
  );
};

const Row = ({children, ...restProps}: PropsWithChildren<RowProp>) => (
  <View className="flex-row" {...restProps}>
    {children}
  </View>
);

const GeneralInfo = () => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const {languages} = useLanguageStore();
  const {data: userAttributes} = useGetUserAttributes();
  const {data: questions} = useGetQuestionnaireSection({
    staleTime: Infinity,
  });

  const isAnswersFilled = questions?.sectionStats?.every(
    section => section.total_answered === section.total_questions,
  );

  return (
    <View style={styles.container}>
      <View
        className="min-h-[357px] p-4 rounded-3xl"
        style={{backgroundColor: customColor.azureishWhite}}>
        <CustomText className="text-base font-isidoraMedium text-ultramarineBlue">
          {languages?.general_info_header}
        </CustomText>
        <Divider
          className="mb-4 mt-1 -mx-2 h-[1px] "
          style={{backgroundColor: customColor.ultramarineBlue}}
        />
        {GENERAL_INFORMATION?.map((info, index) => (
          <Row key={`${info.title}-${index}`} className="mb-3">
            <Col>
              <CustomText className="text-black text-base font-isidoraMedium">
                {info.title}
              </CustomText>
            </Col>
            <Col>
              <CustomText className="text-right text-black text-base font-isidoraMedium">
                {info.apiKey?.map(
                  eachKey => `${userAttributes?.[eachKey] || ''} `,
                )}
              </CustomText>
            </Col>
          </Row>
        ))}

        <View className="mt-4">
          <CustomText className="text-base font-isidoraMedium text-ultramarineBlue">
            {languages?.body_mass_index_info}
          </CustomText>
          <Divider
            className="mb-4 mt-1 -mx-2 h-[1px]"
            style={{backgroundColor: customColor.ultramarineBlue}}
          />
          {BODY_MASS_INDEX_INFORMATION?.map((info, index) => (
            <Row key={`${info.title}-${index}`} className="mb-3">
              <Col>
                <CustomText className="text-black text-base font-isidoraMedium">
                  {info.title}
                </CustomText>
              </Col>
              <Col>
                <CustomText className="text-right text-black text-base font-isidoraMedium">
                  {info.apiKey?.map(
                    eachKey => `${userAttributes?.[eachKey] || ''} `,
                  )}
                </CustomText>
              </Col>
            </Row>
          ))}
        </View>

        <View className="items-start">
          <CustomText className="text-base font-isidoraMedium text-ultramarineBlue mt-4">
            {languages?.additional_info_header}
          </CustomText>
          <Divider
            className="mb-4 mt-1 -mx-2 h-[1px] w-full"
            style={{backgroundColor: customColor.ultramarineBlue}}
          />

          <Text
            className="text-sm text-slate-500 italic pb-4"
            numberOfLines={2}>
            {isAnswersFilled
              ? languages?.questionnaire_disclaimer_general_info_completed
              : languages?.questionnaire_disclaimer_general_info_empty}
          </Text>

          <RoundedButton
            resetStyle
            className="py-2 px-4 self-center"
            style={{backgroundColor: customColor.cornflowerBlue}}
            onPress={() => {
              navigation.navigate('QuestionnaireSection');
            }}>
            <CustomText
              className="text-sm font-isidoraMedium text-[#222B45]"
              numberOfLines={2}>
              {isAnswersFilled
                ? languages?.edit_additional_info_btn_txt
                : languages?.add_additional_info_btn_txt}
            </CustomText>
          </RoundedButton>
        </View>
      </View>
    </View>
  );
};

export default GeneralInfo;

const styles = StyleSheet.create({
  container: {},
  row: {
    flexDirection: 'row',
  },
  '2col': {
    flex: 2,
  },
});
