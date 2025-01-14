import {useIsFetching, useMutation} from '@tanstack/react-query';
import {AnimatePresence} from 'moti';
import React, {useEffect, useState} from 'react';
import {Image, RefreshControl, StyleSheet, View} from 'react-native';
import {Dialog, Portal} from 'react-native-paper';
import useAppStore from '../../../store/appStore';
import useLanguageStore from '../../../store/languageStore';
import useLoaderStore from '../../../store/loaderStore';
import usePersistLocalStore from '../../../store/persistLocalStore';
import useWalkthroughStore from '../../../store/walkthroughStore';
import BasicContainer from '../../components/BasicContainer';
import FullScreenLoader from '../../components/FullScreenLoader';
import Navbar from '../../components/Navbar';
import RoundedButton from '../../components/RoundedButton';
import SafeAreaScrollView from '../../components/SafeAreaScrollView';
import CustomText from '../../components/Text';
import {useCheckQuestinnaireStatus} from '../../hooks/api/useGetQuestions';
import useGetUserAttributes from '../../hooks/api/useGetUserAttributes';
import useGetUserReading from '../../hooks/api/useGetUserReading';
import useBackButton from '../../hooks/useBackButton';
import customColor from '../../theme/customColor';
import AddProfileDetails from './Modal/AddProfileDetails';
import NewUser from './NewUser';
import UserWithMultipleReport from './UserWithMultipleReport';
import UserWithOneReport from './UserWithOneReport';

const Homepage = () => {
  const {setSignoutModalVisibility} = useLoaderStore();
  const [isQuestionnaireFilled, setIsQuestionnaireFilled] = useState(true);

  const {languages} = useLanguageStore();
  const {screenName} = useAppStore();
  const isFetching = useIsFetching();
  const {userVisitedWalkthrough} = usePersistLocalStore();

  //Preload vital images used in reports
  useEffect(() => {
    if (languages?.vitals_with_image) {
      const imageUrls = Object.values(languages.vitals_with_image);
      Promise.all(imageUrls.map(url => Image.prefetch(url)))
        .then(() => console.log('All images prefetched successfully'))
        .catch(error => console.error('Error prefetching images:', error));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    data: reportData,
    isLoading: isUserReadingLoading,
    refetch: getUserReading,
  } = useGetUserReading();

  const {data: userAttributes, refetch: getUserAttributes} =
    useGetUserAttributes();
  const {data: status} = useCheckQuestinnaireStatus({
    questionSequence: null,
    retrieve_type: 'completion_status',
  });

  const {mutate: onRefresh, isPending: isRefreshing} = useMutation({
    mutationFn: async () => {
      await Promise.all([getUserReading(), getUserAttributes()]);
    },
  });

  const {
    startWalkthrough,
    setIsWalkthroughVisible,
    isWalkthroughVisible,
    currentWalkthroughScreen,
    isAnyWalkthroughVisible,
  } = useWalkthroughStore();

  const showSignoutModal = () => {
    setSignoutModalVisibility(true);
    return true;
  };
  useBackButton(showSignoutModal);

  useEffect(() => {
    const checkAnswersFilled = () => {
      if (!status) {
        return null;
      }
      setIsQuestionnaireFilled(status?.startFlag);
    };
    checkAnswersFilled();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const readingLength = reportData?.data?.reading_data?.length || 0;

  const onLaterPress = () => {
    setIsQuestionnaireFilled(true);
  };

  useEffect(() => {
    const isAnyVisible = isAnyWalkthroughVisible();
    const fetchWalkthroughDetail = async () => {
      if (
        !userAttributes?.user_id ||
        isWalkthroughVisible ||
        isFetching ||
        screenName?.current !== 'Homepage'
      ) {
        return;
      }
      const hasUserVisited = userVisitedWalkthrough?.[
        currentWalkthroughScreen
      ]?.includes(userAttributes?.user_id);

      if (hasUserVisited || isAnyVisible) {
        setIsWalkthroughVisible(false);
        return;
      }

      if (!hasUserVisited) {
        setIsWalkthroughVisible(true);
      }
    };
    fetchWalkthroughDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userAttributes?.user_id, isFetching]);

  const onStartWalkthrough = () => {
    setIsWalkthroughVisible(false);
    startWalkthrough('menu_button');
  };

  const renderUserDetails = () => {
    switch (true) {
      case readingLength === 0:
        return <NewUser />;

      case readingLength === 1:
        return <UserWithOneReport />;

      case readingLength >= 2:
        return <UserWithMultipleReport />;

      default:
        return <></>;
    }
  };

  return (
    <BasicContainer className="relative  flex-1">
      <SafeAreaScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }>
        <Navbar hasProfile={true} noBack hasDrawer />
        {renderUserDetails()}
      </SafeAreaScrollView>
      <AnimatePresence>
        {!isQuestionnaireFilled && (
          <View className="absolute bottom-0 inset-x-0">
            <AddProfileDetails onLaterPress={onLaterPress} />
          </View>
        )}
      </AnimatePresence>
      {isUserReadingLoading && (
        <FullScreenLoader visible={isUserReadingLoading} />
      )}
      <Portal>
        <Dialog
          visible={isWalkthroughVisible}
          dismissable={false}
          style={{
            backgroundColor: customColor.white,
          }}>
          <CustomText className="text-xl font-isidoraSemiBold text-black text-center px-4">
            {languages?.initial_description}
          </CustomText>

          <Dialog.Actions className="items-center justify-center">
            <RoundedButton
              onPress={onStartWalkthrough}
              className="mt-8 bg-ultramarineBlue self-center px-20 py-2"
              resetStyle>
              <CustomText className="text-base font-isidoraBold text-white text-center">
                {languages?.allow_txt}
              </CustomText>
            </RoundedButton>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </BasicContainer>
  );
};

export default Homepage;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 200,
    paddingTop: 16,
  },
});
