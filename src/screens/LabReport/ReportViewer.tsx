import {NavigationProp, useNavigation} from '@react-navigation/native';
import {Image, View} from 'moti';
import React, {useEffect} from 'react';
import {ScrollView, StyleSheet, TouchableOpacity} from 'react-native';
import KeepAwake from 'react-native-keep-awake';
import {Easing} from 'react-native-reanimated';
import WebView from 'react-native-webview';
import useAlertStore from '../../../store/alertStore';
import useLanguageStore from '../../../store/languageStore';
import {MainStackParamList} from '../../../types/navigation';
import {downloadFile, onShareFile} from '../../../utils/methods';
import Icon from '../../components/Icon';
import RoundedButton from '../../components/RoundedButton';
import CustomText from '../../components/Text';
import {useGetLabReportDetails} from '../../hooks/api/report';
import customColor from '../../theme/customColor';

const RenderLoader = ({onOptionSelection}: {onOptionSelection: () => void}) => {
  const {languages} = useLanguageStore();

  return (
    <ScrollView>
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
      <View
        className="px-6 mt-8 tablet:items-center"
        from={{translateY: 200}}
        animate={{translateY: 0}}
        transition={{duration: 1000, type: 'spring'} as any}>
        <CustomText className="font-isidoraBold text-base text-yankeesBlue">
          {languages?.please_wait_processing_message}
        </CustomText>
        <CustomText className="font-isidoraMedium text-sm text-yankeesBlue mt-2">
          {languages?.generating_lab_report}
        </CustomText>
        <CustomText className="font-isidoraBold text-sm text-yankeesBlue mt-10">
          {languages?.report_delivery}
        </CustomText>
        <CustomText className="font-isidoraMedium text-sm text-yankeesBlue">
          {languages?.lab_report_email_convenience}
        </CustomText>
      </View>
      <View className="items-center my-10">
        <RoundedButton
          resetStyle
          style={styles.btnStyle}
          className="py-2 min-w-[182px] bg-[#D8E0FF]"
          onPress={() => onOptionSelection()}>
          <CustomText className="font-isidoraBold text-lg text-center text-black">
            {languages?.proceed}
          </CustomText>
        </RoundedButton>
      </View>
    </ScrollView>
  );
};

const RenderPdf = ({
  reportLink,
  onOptionSelection,
}: {
  reportLink: string;
  onOptionSelection: () => void;
}) => {
  const {languages} = useLanguageStore();

  return (
    <>
      <WebView
        source={{
          html: reportLink,
        }}
        className="flex-1"
      />

      <RoundedButton
        resetStyle
        style={styles.btnStyle}
        className="py-2 min-w-[182px] bg-[#D8E0FF] self-center mt-2 mb-6"
        onPress={() => onOptionSelection()}>
        <CustomText className="font-isidoraBold text-lg text-center text-black">
          {languages?.proceed}
        </CustomText>
      </RoundedButton>
    </>
  );
};

const ReportViewer = ({
  token_id,
  retry,
  retryDelay,
}: {
  token_id: string;
  retry: number;
  retryDelay: number;
}) => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const {languages} = useLanguageStore();
  const {showAlert} = useAlertStore();
  const {data: labReportDetails, isError} = useGetLabReportDetails({
    gcTime: 0,
    staleTime: 0,
    token: token_id,
    retry,
    retryDelay,
  });

  useEffect(() => {
    if (isError) {
      showAlert({
        title: languages?.error,
        content: languages?.lab_report_pdf_fetch_failed,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isError]);

  const navigateToHome = () => {
    navigation.navigate('HomepageStackScreens', {
      screen: 'Home',
    });
  };

  const details = labReportDetails?.[0];

  return (
    <>
      {details?.ai_response ? (
        <View
          className="mt-4 h-full"
          from={{opacity: 0, scale: 0.5}}
          animate={{opacity: 1, scale: 1}}
          transition={{type: 'timing', duration: 1000} as any}>
          <View className="flex-row items-center justify-center px-4">
            <CustomText className="text-base font-isidoraSemiBold text-ultramarineBlue text-center py-4 w-[170px]">
              {languages?.lab_report_analysis}
            </CustomText>
            <View className="absolute w-full flex-row justify-end space-x-4">
              <TouchableOpacity
                onPress={() =>
                  downloadFile(details?.report_link, 'lab_report')
                }>
                <Icon
                  name="download"
                  size={20}
                  color={customColor.ultramarineBlue}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onShareFile(details?.report_link, 'lab_report')}>
                <Icon
                  name="share"
                  size={20}
                  color={customColor.ultramarineBlue}
                />
              </TouchableOpacity>
            </View>
          </View>
          <RenderPdf
            reportLink={details?.ai_response}
            onOptionSelection={navigateToHome}
          />
        </View>
      ) : (
        <RenderLoader onOptionSelection={navigateToHome} />
      )}
      <KeepAwake />
    </>
  );
};

export default ReportViewer;

const styles = StyleSheet.create({
  container: {},
  btnStyle: {},
});
