import React, {PropsWithChildren} from 'react';
import {StyleSheet, View, ViewProps} from 'react-native';
import {Divider} from 'react-native-paper';
import useLanguageStore from '../../../store/languageStore';
import CustomText from '../../components/Text';
import useGetUserAttributes from '../../hooks/api/useGetUserAttributes';
import customColor from '../../theme/customColor';
import {GENERAL_INFORMATION} from '../Profile/data';

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
  const {languages} = useLanguageStore();
  const {data: userAttributes} = useGetUserAttributes();

  return (
    <View style={styles.container}>
      <View
        className="p-4 rounded-3xl"
        style={{backgroundColor: customColor.azureishWhite}}>
        <CustomText className="text-base font-isidoraMedium text-ultramarineBlue">
          {languages?.general_info_header}
        </CustomText>
        <Divider
          className="mb-4"
          style={{backgroundColor: customColor.cornflowerBlue}}
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
