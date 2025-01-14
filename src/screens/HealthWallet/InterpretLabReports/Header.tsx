import moment from 'moment';
import {Image} from 'moti';
import React from 'react';
import {ImageBackground, StyleSheet, View} from 'react-native';
import useLanguageStore from '../../../../store/languageStore';
import {LabReportDetailResponse} from '../../../../types/api_response';
import {downloadFile, onShareFile} from '../../../../utils/methods';
import Icon from '../../../components/Icon';
import RoundedButton from '../../../components/RoundedButton';
import CustomText from '../../../components/Text';
import customColor from '../../../theme/customColor';

type HeaderProps = {
  labReportDetails: LabReportDetailResponse[];
  created_at: string;
};

const Header = ({created_at, labReportDetails}: HeaderProps) => {
  const {languages} = useLanguageStore();
  const details = labReportDetails[0];

  return (
    <ImageBackground
      source={require('../../../../assets/images/ai_details_header.png')}
      className="w-full relative"
      resizeMode="cover"
      style={styles.container}>
      <View className="pl-4 py-6">
        <CustomText className="text-2xl font-isidoraBold text-white">
          {languages?.lab_report_analysis}
        </CustomText>
        <CustomText className="text-white text-base font-isidoraSemiBold">
          {moment(created_at).format('YYYY-MM-DD HH:mm:ss')}
        </CustomText>
        <View className="flex-row my-4 space-x-4">
          <RoundedButton
            resetStyle
            className="border border-white px-4 py-2 space-x-2 items-center justify-center"
            onPress={() =>
              details?.report_link ? downloadFile(details?.report_link) : ''
            }>
            <Icon name="download" color={customColor.white} />
            <CustomText className="text-white text-sm font-isidoraSemiBold">
              {languages?.download}
            </CustomText>
          </RoundedButton>
          <RoundedButton
            resetStyle
            className="border border-white px-4 py-2 space-x-2 items-center justify-center"
            onPress={() => onShareFile(details?.report_link)}>
            <Icon name="share" color={customColor.white} />
            <CustomText className="text-white text-sm font-isidoraSemiBold">
              {languages?.share}
            </CustomText>
          </RoundedButton>
          <Image
            source={require('../../../../assets/images/personalised_ai.png')}
            className="h-[73px] absolute right-0 bottom-0 "
            resizeMode="contain"
            from={{opacity: 1, scale: 0}}
            animate={{opacity: 1, scale: 1}}
          />
        </View>
      </View>
    </ImageBackground>
  );
};

export default Header;

const styles = StyleSheet.create({
  container: {},
});
