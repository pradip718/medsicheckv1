import {NavigationProp, useNavigation} from '@react-navigation/native';
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
import {MainStackParamList} from '../../../types/navigation';
import BasicContainer from '../../components/BasicContainer';
import FullScreenLoader from '../../components/FullScreenLoader';
import Navbar from '../../components/Navbar';
import RoundedButton from '../../components/RoundedButton';
import SafeAreaScrollView from '../../components/SafeAreaScrollView';
import CustomText from '../../components/Text';
import {useGetQuestionnaireSection} from '../../hooks/api/useGetQuestions';
import useGetUserAttributes from '../../hooks/api/useGetUserAttributes';
import useGetUserReading from '../../hooks/api/useGetUserReading';
import useBackButton from '../../hooks/useBackButton';
import customColor from '../../theme/customColor';
import AddProfileDetails from './Modal/AddProfileDetails';
import UserWithMultipleReport from './UserWithMultipleReport';
import ScanCard from './components/ScanCard';
import SingleReportCard from './components/SingleReportCard';
import SmartReports from './components/SmartReports';
import VoiceScanCard from './components/VoiceScanCard';
import VoiceScanMultipleReportCard from './components/VoiceScanMultipleReportCard';
import VoiceScanSingleReportCard from './components/VoiceScanSingleReportCard';
import WelcomeCard from './components/WelcomeCard';

const Homepage = () => {
  const {setSignoutModalVisibility} = useLoaderStore();
  const [isQuestionnaireFilled, setIsQuestionnaireFilled] = useState<
    boolean | null
  >(null);

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
  const {data: questions} = useGetQuestionnaireSection({
    cacheTime: 0,
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
      const isAnswersFilled = questions?.sectionStats?.every(
        section => section.total_answered === section.total_questions,
      );

      setIsQuestionnaireFilled(isAnswersFilled ?? null);
    };
    checkAnswersFilled();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions]);

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

  const renderFaceScanDetails = () => {
    switch (true) {
      case readingLength === 0:
        return <ScanCard />;

      case readingLength === 1:
        return <SingleReportCard />;

      case readingLength >= 2:
        return <UserWithMultipleReport />;

      default:
        return <></>;
    }
  };

  const renderVoiceScanDetails = () => {
    switch (true) {
      case readingLength === 0:
        return <VoiceScanCard />;

      case readingLength === 1:
        return <VoiceScanSingleReportCard />;

      case readingLength >= 2:
        return <VoiceScanMultipleReportCard />;

      default:
        return <></>;
    }
  };
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();

  return (
    <BasicContainer className="relative  flex-1">
      <SafeAreaScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }>
        <Navbar hasProfile={true} noBack hasDrawer />
        <RoundedButton
          text="Go to voice reort"
          onPress={() => {
            navigation.navigate('VoiceScanReport');
          }}
        />

        <WelcomeCard />
        {renderFaceScanDetails()}
        {renderVoiceScanDetails()}

        {readingLength >= 1 && (
          <View className="mt-4">
            <CustomText
              style={styles.lastScanTitle}
              className="text-sm font-isidoraSemiBold py-2">
              {languages?.smart_reports}
            </CustomText>
            <SmartReports />
          </View>
        )}
      </SafeAreaScrollView>

      <AnimatePresence>
        {isQuestionnaireFilled === false && (
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
  lastScanTitle: {
    color: 'rgba(0, 0, 0, 0.49)',
  },
});
