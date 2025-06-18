import {
  NavigationProp,
  RouteProp,
  StackActions,
  useNavigation,
} from '@react-navigation/native';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import {Image, View} from 'moti';
import React, {useEffect} from 'react';
import {Easing} from 'react-native-reanimated';
import Entypo from 'react-native-vector-icons/Entypo';
import useLanguageStore from '../../../store/languageStore';
import useVoiceScanStore from '../../../store/voiceScanStore';
import {
  isVoiceScanReport,
  isVoiceScanReportDetailError,
} from '../../../types/api_response';
import {MainStackParamList} from '../../../types/navigation';
import {notifyApi} from '../../api/user';
import {
  getVoiceScanReportDetail,
  processVoiceRecording,
} from '../../api/voicescan';
import RoundedButton from '../../components/RoundedButton';
import CustomText from '../../components/Text';
import {
  GET_VOICE_SCAN_REPORT_DETAIL,
  GET_VOICE_SCAN_REPORT_LIST,
  PROCESS_VOICE_RECORDING,
} from '../../constants/hooks';
import customColor from '../../theme/customColor';

type VoiceScanGeneratingRouteProp = RouteProp<
  MainStackParamList,
  'VoiceScanGeneratingReport'
>;

type VoiceScanGeneratingProps = {
  route: VoiceScanGeneratingRouteProp;
};

const VoiceScanGeneratingReport = ({route}: VoiceScanGeneratingProps) => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const queryClient = useQueryClient();
  const {session_id} = route?.params ?? {};
  const {languages} = useLanguageStore();
  const {setReportDetail} = useVoiceScanStore();

  useEffect(() => {
    notifyApi('voice_scan_report_generation_start', {session_id});
  }, [session_id]);

  const {
    isSuccess: isProcessSuccess,
    error: processError,
    data: voiceProcessData,
  } = useQuery({
    queryKey: [PROCESS_VOICE_RECORDING],
    queryFn: () => processVoiceRecording({session_id}),
    enabled: !!session_id,
  });

  const {data: voiceScanData, error: detailError} = useQuery({
    queryKey: [GET_VOICE_SCAN_REPORT_DETAIL],
    queryFn: () => getVoiceScanReportDetail({sessoin_id: session_id}),
    enabled: isProcessSuccess,
    gcTime: 0,
    staleTime: 0,
    refetchInterval: ({state}) => {
      if (!state?.data) {
        return 5000;
      }
      if (
        isVoiceScanReport(state?.data) ||
        isVoiceScanReportDetailError(state?.data)
      ) {
        return false;
      }
      return 5000;
    },
    retry: false,
  });

  useEffect(() => {
    notifyApi('voice_scan_report_process_success', {
      isProcessSuccess,
      voiceProcessData,
    });
  }, [isProcessSuccess, voiceProcessData]);

  useEffect(() => {
    if (processError || detailError) {
      notifyApi('voice_scan_report_generation_error', {
        session_id,
      });
    }
  }, [processError, detailError, session_id]);

  useEffect(() => {
    notifyApi('voice_scan_report_generation_progress', {voiceScanData});
    if (isVoiceScanReport(voiceScanData)) {
      queryClient.invalidateQueries({queryKey: [GET_VOICE_SCAN_REPORT_LIST]});
      setReportDetail(voiceScanData);
      notifyApi('voice_scan_report_generation_complete', {
        session_id: session_id,
      });
      navigation.navigate('VoiceScanReport', {
        isNavigatingFromVoiceScan: true,
        session_id,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceScanData]);

  const onPressHome = () => {
    navigation.dispatch(
      StackActions.replace('HomepageStackScreens', {
        screen: 'Home',
      }),
    );
  };

  const isError = isVoiceScanReportDetailError(voiceScanData) || processError;

  return (
    <View className="justify-center flex-1 bg-white">
      {!isError && (
        <View
          from={{scale: 0}}
          animate={{scale: 1}}
          transition={{duration: 1000, type: 'timing'} as any}
          className="justify-center items-center mt-10">
          <Image
            source={require('../../../assets/images/preventix_report_loader.png')}
            className="h-[154px] w-[223px] tablet:h-[300px] tablet:w-[400px]"
            resizeMode="cover"
          />
          <View className="absolute right-8 left-0 top-0 bottom-10 tablet:bottom-20 tablet:right-12 items-center  justify-center ">
            <Image
              source={require('../../../assets/images/loader.png')}
              resizeMode="contain"
              className=" h-[37px]"
              from={{
                rotate: '0deg',
              }}
              animate={{
                rotate: '180deg',
              }}
              transition={
                {
                  loop: true,
                  type: 'timing',
                  duration: 2000,
                  repeatReverse: false,
                  easing: Easing.linear,
                } as any
              }
            />
          </View>
        </View>
      )}
      <View
        className="px-6 mt-8 tablet:items-center"
        from={{translateY: 200}}
        animate={{translateY: 0}}
        transition={{duration: 1000, type: 'spring'} as any}>
        <CustomText className="font-isidoraBold text-base text-yankeesBlue">
          {isError
            ? languages?.voice_report_error_message
            : languages?.please_wait_processing_message}
        </CustomText>
        <CustomText className="font-isidoraMedium text-sm text-yankeesBlue mt-2">
          {isError
            ? languages?.voice_report_error_description
            : languages?.report_processing_message}
        </CustomText>
      </View>
      {isError && (
        <View className="my-10 px-5">
          <RoundedButton
            resetStyle
            className="py-2 min-w-[182px] bg-[#BCC9FF] rounded-2xl space-x-2"
            onPress={onPressHome}>
            <CustomText className="font-isidoraBold text-lg text-center text-black">
              {languages?.go_to_home}
            </CustomText>

            <Entypo name="home" size={18} color={customColor.black} />
          </RoundedButton>
        </View>
      )}
    </View>
  );
};

export default VoiceScanGeneratingReport;
