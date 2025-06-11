import {
  NavigationProp,
  RouteProp,
  StackActions,
  useNavigation,
} from '@react-navigation/native';
import {AxiosError} from 'axios';
import {View} from 'moti';
import React, {useEffect} from 'react';
import {Animated, SafeAreaView, useWindowDimensions} from 'react-native';
import {SceneMap, TabBar, TabView} from 'react-native-tab-view';
import {twMerge} from 'tailwind-merge';
import useLanguageStore from '../../../../store/languageStore';
import {MainStackParamList} from '../../../../types/navigation';
import {errorToast} from '../../../../utils/toast';
import {notifyApi} from '../../../api/user';
import Navbar from '../../../components/Navbar';
import CustomText from '../../../components/Text';
import {useGetAIReport, useGetAIReportDetails} from '../../../hooks/api/report';
import customColor from '../../../theme/customColor';
import AIAnalysis from './AIAnalysis';
import Header from './Header';
import UserInput from './UserInput';

type AIHealthReportDetailRouteProp = RouteProp<
  MainStackParamList,
  'AIHealthReportDetail'
>;

interface AIHealthReportDetailProps {
  route: AIHealthReportDetailRouteProp;
}

const renderScene = SceneMap({
  ai_report: AIAnalysis,
  user_inputs: UserInput,
});

// const HEADER_MAX_HEIGHT = 240;
// const HEADER_MIN_HEIGHT = 68;
// const SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

const AIHealthReportDetail = ({route}: AIHealthReportDetailProps) => {
  const {token, created_at} = route.params;
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const {languages} = useLanguageStore();

  const layout = useWindowDimensions();

  const [index, setIndex] = React.useState(0);

  const [routes] = React.useState([
    {key: 'ai_report', title: languages?.ai_report},
    {key: 'user_inputs', title: languages?.user_inputs},
  ]);

  const {refetch: getAIReportList} = useGetAIReport({
    staleTime: Infinity,
  });

  // const scrollY = new Animated.Value(0);
  // const animatedHeaderHeight = scrollY.interpolate({
  //   inputRange: [0, SCROLL_DISTANCE],
  //   outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
  //   extrapolate: 'clamp',
  // });

  const {
    data: aiReportDetails,
    refetch: getAIReportDetails,
    isError,
    error,
  } = useGetAIReportDetails({
    token,
    gcTime: 0,
    enabled: false,
    retry: 2,
  });

  useEffect(() => {
    if (isError) {
      if (
        error instanceof AxiosError &&
        !error?.response?.data?.token_valid &&
        error?.response?.data?.error === 'Invalid Token'
      ) {
        const navigateToList = async () => {
          await getAIReportList();
          errorToast(languages?.invalid_ai_token);
          navigation.dispatch(StackActions.replace('AIHealthReport'));
        };
        navigateToList();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isError]);

  useEffect(() => {
    const fetchReportDetails = async () => {
      if (token) {
        getAIReportDetails();
        notifyApi('pr_report_view', {
          token_id: token,
        });
      }
    };
    fetchReportDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const renderLabel = (props: any) => {
    return (
      <View className="px-4 w-[200] items-center">
        <CustomText
          numberOfLines={2}
          ellipsizeMode="middle"
          className={twMerge(
            'font-isidoraMedium text-base ',
            props?.focused && 'font-isidoraBold',
          )}>
          {props?.route?.title}
        </CustomText>
      </View>
    );
  };

  return (
    <SafeAreaView className="h-full">
      <Animated.View
      //  style={[{height: animatedHeaderHeight}]}
      >
        <View className="p-4">
          <Navbar />
        </View>

        <Header
          aiReportDetails={aiReportDetails || []}
          created_at={created_at}
        />
      </Animated.View>

      <TabView
        navigationState={{index, routes}}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{width: layout.width}}
        renderTabBar={props => (
          <TabBar
            {...props}
            style={{
              backgroundColor: customColor.white,
            }}
            labelStyle={{
              color: customColor.black,
            }}
            renderLabel={renderLabel}
            indicatorStyle={{
              backgroundColor: customColor.ultramarineBlue,
            }}
          />
        )}
      />
    </SafeAreaView>
  );
};

export default AIHealthReportDetail;
