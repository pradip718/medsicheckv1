import {NavigationProp, useNavigation} from '@react-navigation/native';
import moment from 'moment';
import React from 'react';
import {
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {SingleReportBackground} from '../../../../assets';
import useLanguageStore from '../../../../store/languageStore';
import {MainStackParamList} from '../../../../types/navigation';
import TrendGraph from '../../../components/Graphs/TrendGraph';
import CustomText from '../../../components/Text';
import {useGetUserVoiceReportList} from '../../../hooks/api/voiceScan';

const VoiceScanMultipleReportCard = () => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const {languages} = useLanguageStore();
  const {data: reportData} = useGetUserVoiceReportList();

  const trendData = reportData?.data?.reading_data?.map(eachReading => ({
    value: Math.round(eachReading?.wellness_score),
    label: moment(eachReading.timestamp).format('MMM DD'),
  }));

  const getSubHeadingAndColor = () => {
    const currentWellnessIdx =
      reportData?.data?.reading_data?.[0]?.wellness_score;
    const previousWellnessIdx =
      reportData?.data?.reading_data?.[1]?.wellness_score;
    let subHeading = languages?.multiple_scorecard_tile_subheader_general;
    let subHeadingColor = 'text-pantoneGreen';

    if (!currentWellnessIdx) {
      subHeading = languages?.multiple_scorecard_tile_subheader_general;
    } else if (currentWellnessIdx > 7) {
      if (!previousWellnessIdx) {
        subHeading = languages?.multiple_scorecard_tile_subheader_good;
      } else if (currentWellnessIdx > previousWellnessIdx) {
        subHeading = languages?.multiple_scorecard_tile_subheader_good;
      } else {
        subHeading = languages?.multiple_scorecard_tile_subheader_general;
      }
    } else if (currentWellnessIdx >= 4 && currentWellnessIdx <= 7) {
      if (!previousWellnessIdx) {
        subHeading = languages?.multiple_scorecard_tile_subheader_general;
      } else if (currentWellnessIdx > previousWellnessIdx) {
        subHeading = languages?.multiple_scorecard_tile_subheader_good;
      } else if (currentWellnessIdx < previousWellnessIdx) {
        subHeading = languages?.multiple_scorecard_tile_subheader_bad;
      } else {
        subHeading = languages?.multiple_scorecard_tile_subheader_general;
      }
    } else {
      subHeading = languages?.multiple_scorecard_tile_subheader_bad;
      subHeadingColor = 'text-red-400';
    }
    return {subHeading, subHeadingColor};
  };

  let subHeading = getSubHeadingAndColor()?.subHeading;
  // let subHeadingColor = getSubHeadingAndColor()?.subHeadingColor;

  return (
    <LinearGradient
      colors={['#0A60B7', '#148CBF']}
      start={{x: 0, y: 0}}
      end={{x: 1, y: 1}}
      style={styles.container}
      className="rounded-3xl pb-10 mt-3">
      <ImageBackground
        source={SingleReportBackground as any}
        style={styles.reportBg}
        className="mt-6 px-4">
        {/* <CustomText className="text-base font-isidoraSemiBold text-white">
          {userAttributes?.gender === 'female'
            ? languages?.welcome_female
            : languages?.welcome}{' '}
          {userAttributes?.given_name ??
            (userAttributes?.gender === 'female'
              ? languages?.user_txt_female
              : languages?.user_txt)}
        </CustomText> */}
        <View className="flex-row items-center justify-between">
          <CustomText className="text-white text-base font-isidoraSemiBold">
            {languages?.voice_scan_trend_title}
          </CustomText>
          <TouchableOpacity
            className="p-2"
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
            onPress={() => {
              navigation.navigate('VoiceScanReportList');
            }}>
            <CustomText className="text-white text-sm font-isidoraMedium underline">
              {languages?.view_all}
            </CustomText>
          </TouchableOpacity>
        </View>
        <CustomText className={'text-sm text-white'}>{subHeading}</CustomText>

        <View className="mt-6">
          <TrendGraph
            data={trendData || []}
            stats={reportData?.data?.stats || {max: 100, min: 0, count: 8}}
          />
        </View>

        {/* <ToolTipWalkthrough
          walkthroughName={'report_history'}
          placement="bottom">
          <View className="mt-10 items-center">
            <RoundedButton
              resetStyle
              className="bg-white py-2 text-black min-w-[80%] px-4"
              onPress={() => {
                navigation.navigate('PreviousReports');
              }}>
              <CustomText className="text-base font-isidoraSemiBold">
                {languages?.check_prev_score_btn_txt}
              </CustomText>
            </RoundedButton>
          </View>
        </ToolTipWalkthrough> */}
      </ImageBackground>
    </LinearGradient>
  );
};

export default VoiceScanMultipleReportCard;

const styles = StyleSheet.create({
  container: {},
  reportBg: {
    // minHeight: 310,
    maxWidth: '100%',
    // aspectRatio: '113/104',
  },
});
