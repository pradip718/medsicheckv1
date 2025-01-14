import {useIsFetching} from '@tanstack/react-query';
import React, {useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import useAppStore from '../../../store/appStore';
import usePersistLocalStore from '../../../store/persistLocalStore';
import useWalkthroughStore from '../../../store/walkthroughStore';
import useGetUserAttributes from '../../hooks/api/useGetUserAttributes';
import SingleReportCard from './components/SingleReportCard';
import WelcomeCard from './components/WelcomeCard';

const UserWithOneReport = () => {
  const {data: userAttributes} = useGetUserAttributes();
  const isFetching = useIsFetching();
  const {userVisitedWalkthrough} = usePersistLocalStore();
  const {screenName} = useAppStore();
  const {startWalkthrough, setCurrentWalkthroughScreen} = useWalkthroughStore();

  useEffect(() => {
    const fetchWalkthroughDetail = async () => {
      if (!userAttributes?.user_id || screenName?.current !== 'Homepage') {
        return;
      }
      const hasUserVisited = userVisitedWalkthrough?.[
        'single-report'
      ]?.includes(userAttributes?.user_id);
      if (isFetching || hasUserVisited) {
        return;
      }

      if (!hasUserVisited) {
        setCurrentWalkthroughScreen('single-report');
        startWalkthrough('view_report');
      }
    };
    fetchWalkthroughDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userAttributes?.user_id, isFetching]);

  return (
    <View style={styles.container}>
      <WelcomeCard />
      <View className="mt-4">
        <SingleReportCard />
      </View>
    </View>
  );
};

export default UserWithOneReport;

const styles = StyleSheet.create({
  container: {},
});
