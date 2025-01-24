import {NavigationProp, useNavigation} from '@react-navigation/native';
import moment from 'moment';
import React from 'react';
import {ImageBackground, StyleSheet, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {SingleReportBackground} from '../../../../assets';
import useLanguageStore from '../../../../store/languageStore';
import {HomepageParamList} from '../../../../types/navigation';
import ToolTipWalkthrough from '../../../components/CustomCopilot/ToolTipWalkthrough';
import TrendGraph from '../../../components/Graphs/TrendGraph';
import RoundedButton from '../../../components/RoundedButton';
import CustomText from '../../../components/Text';
import useGetUserAttributes from '../../../hooks/api/useGetUserAttributes';
import useGetUserReading from '../../../hooks/api/useGetUserReading';

const MultipleReportCard = () => {
  const navigation = useNavigation<NavigationProp<HomepageParamList>>();
  const {languages} = useLanguageStore();
  const {data: reportData} = useGetUserReading();
  const {data: userAttributes} = useGetUserAttributes();

  const trendData = reportData?.data?.reading_data?.map(eachReading => ({
    value: eachReading?.WELLNESS_INDEX,
    label: moment(eachReading.created_at).format('MMM DD'),
  }));

  const getSubHeadingAndColor = () => {
    const currentWellnessIdx =
      reportData?.data?.reading_data?.[0]?.WELLNESS_INDEX;
    const previousWellnessIdx =
      reportData?.data?.reading_data?.[1]?.WELLNESS_INDEX;
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
  let subHeadingColor = getSubHeadingAndColor()?.subHeadingColor;

  return (
    <LinearGradient
      colors={['rgba(34, 43, 69, 1)', 'rgba(20, 32, 68, 1)']}
      style={styles.container}
      className="rounded-3xl pb-10">
      <ImageBackground
        source={SingleReportBackground as any}
        style={styles.reportBg}
        className="mt-6 px-4">
        <CustomText className="text-base font-isidoraSemiBold text-white">
          {/* {languages?.multiple_scorecard_tile_header} */}
          {userAttributes?.gender === 'female'
            ? languages?.welcome_female
            : languages?.welcome}{' '}
          {userAttributes?.given_name ??
            (userAttributes?.gender === 'female'
              ? languages?.user_txt_female
              : languages?.user_txt)}
        </CustomText>
        <CustomText className={`text-sm ${subHeadingColor}`}>
          {subHeading}
        </CustomText>

        <View className="mt-6">
          <TrendGraph
            data={trendData || []}
            stats={reportData?.data?.stats || {max: 100, min: 0, count: 8}}
          />
        </View>

        <ToolTipWalkthrough
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
        </ToolTipWalkthrough>
      </ImageBackground>
    </LinearGradient>
  );
};

export default MultipleReportCard;

const styles = StyleSheet.create({
  container: {},
  reportBg: {
    // minHeight: 310,
    maxWidth: '100%',
    // aspectRatio: '113/104',
  },
});
