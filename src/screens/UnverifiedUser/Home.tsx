import {
  CommonActions,
  NavigationProp,
  useNavigation,
} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {RefreshControl, StyleSheet, View} from 'react-native';
import {MainStackParamList} from '../../../types/navigation';
import Navbar from '../../components/Navbar';
import SafeAreaScrollView from '../../components/SafeAreaScrollView';
import useGetAccountStatus from '../../hooks/api/useGetAccountStatus';
import useFullPageLoader from '../../hooks/useFullPageLoader';
import InformationCard from './components/InformationCard';
import WelcomeCard from './components/WelcomeCard';

const Home = () => {
  const {dispatch} = useNavigation<NavigationProp<MainStackParamList>>();
  const {
    data: accountStatus,
    isLoading,
    refetch: getAccountStatus,
  } = useGetAccountStatus({
    enabled: false,
    staleTime: Infinity,
  });
  const {showLoader, hideLoader} = useFullPageLoader();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isLoading) {
      showLoader();
    } else {
      hideLoader();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  const onRefresh = async () => {
    setRefreshing(true);
    const {data: status} = await getAccountStatus();
    if (status?.approved) {
      dispatch(
        CommonActions.reset({
          index: 1,
          routes: [
            {
              name: 'HomepageStackScreens',
            },
          ],
        }),
      );
    }
    setRefreshing(false);
  };

  return (
    <View className="relative  flex-1">
      <SafeAreaScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        <Navbar noBack />
        <WelcomeCard
          progressStatus={accountStatus?.content?.progress_msg || ''}
        />
        <InformationCard
          header={accountStatus?.content?.header || ''}
          subHeader={accountStatus?.content?.sub_header || ''}
        />
      </SafeAreaScrollView>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 100,
    paddingTop: 16,
  },
});
