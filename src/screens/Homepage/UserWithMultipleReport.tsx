import {useIsFetching} from '@tanstack/react-query';
import React, {useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import useAppStore from '../../../store/appStore';
import useLanguageStore from '../../../store/languageStore';
import usePersistLocalStore from '../../../store/persistLocalStore';
import useWalkthroughStore from '../../../store/walkthroughStore';
import CustomText from '../../components/Text';
import useGetUserAttributes from '../../hooks/api/useGetUserAttributes';
import useGetUserReading from '../../hooks/api/useGetUserReading';
import MultipleReportCard from './components/MultipleReportCard';
import PreviousReportCard from './components/PreviousReportCard';
import SmartReports from './components/SmartReports';

const UserWithMultipleReport = () => {
  const {data: reportData} = useGetUserReading();
  const {data: userAttributes} = useGetUserAttributes();
  const isFetching = useIsFetching();
  const {screenName} = useAppStore();
  const {languages} = useLanguageStore();

  const {userVisitedWalkthrough} = usePersistLocalStore();
  const {
    startWalkthrough,
    setCurrentWalkthroughScreen,
    isAnyWalkthroughVisible,
  } = useWalkthroughStore();

  const recentReading = reportData?.data?.reading_data?.[0];

  const isAnyVisible = isAnyWalkthroughVisible();

  useEffect(() => {
    const fetchWalkthroughDetail = async () => {
      if (!userAttributes?.user_id || screenName?.current !== 'Homepage') {
        return;
      }
      const hasUserVisited = userVisitedWalkthrough?.[
        'multiple-report'
      ]?.includes(userAttributes?.user_id);
      if (isFetching || hasUserVisited) {
        return;
      }

      if (!hasUserVisited && !isAnyVisible) {
        setCurrentWalkthroughScreen('multiple-report');
        startWalkthrough('report_history');
      }
    };
    fetchWalkthroughDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userAttributes?.user_id, isFetching]);

  return (
    <View style={styles.container}>
      {/* <WelcomeCard /> */}
      <View className="mt-4">
        <MultipleReportCard />

        <CustomText
          style={styles.lastScanTitle}
          className="text-sm font-isidoraSemiBold mt-4">
          {languages?.last_scan_label}
        </CustomText>
        <View className="mt-2">
          <PreviousReportCard
            score={recentReading?.WELLNESS_INDEX || 0}
            timeframe={recentReading?.created_at}
            id={recentReading?.reading_id || ''}
          />
        </View>
        {/* <View className="mt-4">
          <CustomText
            style={styles.lastScanTitle}
            className="text-sm font-isidoraSemiBold py-2">
            {languages?.important_parameter}
          </CustomText>
          <UserPreferencesVital />
        </View> */}
        <View className="mt-4">
          {/* <CustomText
            style={styles.lastScanTitle}
            className="text-sm font-isidoraSemiBold py-2">
            {languages?.menu_smart_report}
          </CustomText> */}
          <SmartReports />
        </View>
      </View>
    </View>
  );
};

export default UserWithMultipleReport;

const styles = StyleSheet.create({
  container: {},
  lastScanTitle: {
    color: 'rgba(0, 0, 0, 0.49)',
  },
});
