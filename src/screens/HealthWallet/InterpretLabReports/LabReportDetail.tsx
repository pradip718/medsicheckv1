import {
  NavigationProp,
  RouteProp,
  StackActions,
  useNavigation,
} from '@react-navigation/native';
import {AxiosError} from 'axios';
import React, {useEffect, useState} from 'react';
import {View, useWindowDimensions} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {SceneMap, TabBar, TabView} from 'react-native-tab-view';
import {twMerge} from 'tailwind-merge';
import useLanguageStore from '../../../../store/languageStore';
import {MainStackParamList} from '../../../../types/navigation';
import {errorToast} from '../../../../utils/toast';
import {notifyApi} from '../../../api/user';
import Navbar from '../../../components/Navbar';
import CustomText from '../../../components/Text';
import {
  useGetLabReportDetails,
  useGetLabReportList,
} from '../../../hooks/api/report';
import customColor from '../../../theme/customColor';
import AIAnalysis from './AIAnalysis';
import Header from './Header';
import UserInput from './UserInput';

type LabReportDetailRouteProp = RouteProp<
  MainStackParamList,
  'LabReportDetail'
>;

interface LabReportDetailProps {
  route: LabReportDetailRouteProp;
}

const renderScene = SceneMap({
  ai_report: AIAnalysis,
  user_inputs: UserInput,
});

const LabReportDetail = ({route}: LabReportDetailProps) => {
  const {token, created_at} = route.params;
  const {languages} = useLanguageStore();
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();

  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    {key: 'ai_report', title: languages?.ai_report},
    {key: 'user_inputs', title: languages?.user_inputs},
  ]);

  const {refetch: getLabReportList} = useGetLabReportList({
    staleTime: Infinity,
  });

  const {
    data: labReportDetails,
    refetch: getAIReportDetails,
    isError,
    error,
  } = useGetLabReportDetails({
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
          await getLabReportList();
          errorToast(languages?.invalid_lab_token);
          navigation.dispatch(StackActions.replace('InterpretLabReport'));
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
        notifyApi('lr_report_view', {
          token,
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
      <View className="p-4">
        <Navbar />
      </View>
      <Header
        labReportDetails={labReportDetails || []}
        created_at={created_at}
      />
      <TabView
        navigationState={{index, routes}}
        renderScene={renderScene}
        onIndexChange={idx => {
          if (idx === 1) {
            notifyApi('lr_view_input_file');
          }
          setIndex(idx);
        }}
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

export default LabReportDetail;
