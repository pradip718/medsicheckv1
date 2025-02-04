import {NavigationProp, useNavigation} from '@react-navigation/native';
import React from 'react';
import {Alert, ImageBackground, Share, StyleSheet, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {SingleReportBackground} from '../../../../assets';
import useLanguageStore from '../../../../store/languageStore';
import {MainStackParamList} from '../../../../types/navigation';
import ToolTipWalkthrough from '../../../components/CustomCopilot/ToolTipWalkthrough';
import DonutChart from '../../../components/Graphs/DonutChart';
import Icon from '../../../components/Icon';
import RoundedButton from '../../../components/RoundedButton';
import CustomText from '../../../components/Text';
import {useGetUserReadingDetail} from '../../../hooks/api/readings';
import useGetUserReading from '../../../hooks/api/useGetUserReading';
import customColor from '../../../theme/customColor';

const SingleReportCard = () => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const {languages} = useLanguageStore();
  const {data: reportData} = useGetUserReading();
  const readingId = reportData?.data?.reading_data?.[0]?.reading_id;
  const {data: reportDetails} = useGetUserReadingDetail({
    reading_id: readingId ?? '',
    enabled: !!readingId,
  });

  const onShare = async () => {
    try {
      if (!reportDetails) {
        return;
      }
      const readingData = reportDetails?.readings?.reading_data;
      let message = '';
      Object.entries(readingData).forEach(([key, value]) => {
        if (
          typeof value === 'object' &&
          'value' in value &&
          'category' in value
        ) {
          message += `${key}: ${value.value} (${value.category})\n`;
        }
      });
      const result = await Share.share({
        message,
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error: any) {
      Alert.alert(error.message);
    }
  };

  return (
    <LinearGradient
      colors={['rgba(34, 43, 69, 1)', 'rgba(20, 32, 68, 1)']}
      style={styles.container}
      className="min-h-[492px] rounded-3xl">
      <ImageBackground
        source={SingleReportBackground as any}
        style={styles.reportBg}
        className="mt-6 px-4">
        <CustomText className="text-base font-isidoraSemiBold text-white">
          {languages?.single_scorecard_tile_header}
        </CustomText>
        <CustomText className="text-sm text-pantoneGreen">
          {languages?.single_scorecard_tile_subheader}
        </CustomText>
        <View className="mt-10 flex-row">
          <View className="flex-shrink">
            <CustomText className="text-white text-sm font-isidoraMedium">
              {languages?.single_scorecard_tile_msg}
            </CustomText>
          </View>
          <View className="w-[40%] items-center justify-center h-28">
            <DonutChart
              score={reportData?.data?.reading_data?.[0]?.WELLNESS_INDEX || 0}
              textClassName="text-4xl"
            />
            <CustomText className="text-white text-sm font-isidoraSemiBold absolute -bottom-6">
              {languages?.single_report_scores_title}
            </CustomText>
          </View>
        </View>

        <View className="mt-10">
          <RoundedButton
            resetStyle
            className="max-w-[60%]"
            onPress={() => {
              navigation.navigate('ReportStackScreens', {
                screen: 'Report',
                params: {
                  reading_id:
                    reportData?.data?.reading_data?.[0]?.reading_id || '',
                },
              });
            }}>
            <ToolTipWalkthrough
              walkthroughName="view_report"
              parentWrapperStyle={styles.tooltip}>
              <View className="bg-white items-center rounded-full py-2 w-full">
                <CustomText className="text-base font-isidoraSemiBold">
                  {languages?.see_detailed_report_btn_txt}
                </CustomText>
              </View>
            </ToolTipWalkthrough>
          </RoundedButton>

          <RoundedButton
            className="max-w-[60%] mt-4 overflow-hidden"
            resetStyle
            onPress={onShare}>
            <ToolTipWalkthrough
              walkthroughName="share_report"
              parentWrapperStyle={styles.tooltip}>
              <View className="flex-row items-center bg-congoPink w-full justify-center rounded-full">
                <Icon name="share" size={20} color={customColor.white} />
                <CustomText className="ml-2 text-base font-isidoraMedium py-2 text-white">
                  {languages?.share_report_btn_txt}
                </CustomText>
              </View>
            </ToolTipWalkthrough>
          </RoundedButton>
        </View>
      </ImageBackground>
    </LinearGradient>
  );
};

export default SingleReportCard;

const styles = StyleSheet.create({
  container: {},
  reportBg: {
    minHeight: 492,
    maxWidth: '100%',
    aspectRatio: '113/104',
  },
  tooltip: {
    flexGrow: 1,
  },
});
