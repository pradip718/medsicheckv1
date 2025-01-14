import CheckBox from '@react-native-community/checkbox';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import useLanguageStore from '../../../store/languageStore';
import {MainStackParamList} from '../../../types/navigation';
import EtchedGlass from '../../components/EtchedGlass';
import CustomText from '../../components/Text';
import customColor from '../../theme/customColor';

interface DescriptionProps {
  checked: boolean;
  onChangeChecked: (value: boolean) => void;
  tncData: any;
}

const Description = ({checked, onChangeChecked, tncData}: DescriptionProps) => {
  const {languages} = useLanguageStore();
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();

  return (
    <EtchedGlass>
      <CustomText className="text-center text-base text-[#222B45] shadow-none font-isidoraSemiBold mb-4">
        {languages?.terms_and_conditions}
      </CustomText>
      <View>
        <CustomText className=" font-isidoraRegular text-base text-[#222B45]">
          {tncData?.data?.data?.map((eachTnc: any) => eachTnc.content)}
        </CustomText>
        <View className="flex-row mt-10 items-center">
          <CheckBox
            value={checked}
            tintColors={{true: '#3E64FF', false: '#3E64FF'}}
            boxType="square"
            onValueChange={newValue => onChangeChecked(newValue)}
          />
          <CustomText className="ml-4 text-sm font-isidoraRegular text-[#222B45]">
            {languages?.consent_msg}
            <CustomText
              className=" font-isidoraBold"
              style={styles.link}
              onPress={() => {
                navigation?.navigate('PrivacyPolicy', {
                  uri: languages?.tnc_link,
                });
              }}>
              {' '}
              {languages?.tnc}{' '}
            </CustomText>
            {languages?.and}

            <CustomText
              className="font-isidoraBold"
              style={styles.link}
              onPress={() => {
                navigation?.navigate('PrivacyPolicy', {
                  uri: languages?.pp_link,
                });
              }}>
              {' '}
              {languages?.pp}
            </CustomText>
          </CustomText>
        </View>
      </View>
    </EtchedGlass>
  );
};

export default Description;

const styles = StyleSheet.create({
  blurView: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  link: {
    color: customColor.ultramarineBlue,
  },
});
