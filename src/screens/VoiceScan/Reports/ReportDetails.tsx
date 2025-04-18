import {RouteProp} from '@react-navigation/native';
import moment from 'moment';
import React from 'react';
import {Image, Linking, StyleSheet, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import useLanguageStore from '../../../../store/languageStore';
import useVoiceScanStore from '../../../../store/voiceScanStore';
import {MainStackParamList} from '../../../../types/navigation';
import {getColorForValue} from '../../../../utils/methods';
import Icon from '../../../components/Icon';
import Navbar from '../../../components/Navbar';
import ReportBlockScale from '../../../components/ReportScale/ReportBlockScale';
import SafeAreaScrollView from '../../../components/SafeAreaScrollView';
import CustomText from '../../../components/Text';
import customColor from '../../../theme/customColor';
import BorderGradient from '../../FaceScan/BorderGradient';

type ReportDetailsRouteProp = RouteProp<
  MainStackParamList,
  'VoiceScanReportDetail'
>;

interface ReportDetailsProps {
  route: ReportDetailsRouteProp;
}

const ReportDetails = ({route}: ReportDetailsProps) => {
  const {languages} = useLanguageStore();
  const {reportDetail} = useVoiceScanStore();
  const {vitalKey} = route?.params ?? {};

  const {scale_config} = reportDetail ?? {};

  const color_value = {};
  const config = scale_config?.[vitalKey];

  const readingData = reportDetail?.voice_scan_report?.find(
    report => report.key === vitalKey,
  );

  if (!readingData) {
    return <></>;
  }

  const category = readingData?.category ?? '';

  const selectedColor = getColorForValue(
    readingData?.value,
    config?.color_range ?? [],
  );

  const parseAndRenderLinks = (text: string) => {
    const parts = [];
    let lastIndex = 0;
    const boldRegex = /<b>(.*?)<\/b>/g;
    const linkRegex = /<link>(.*?)<\/link>/g;

    const handleMatch = (match: string, content: string, index: number) => {
      parts.push(
        <CustomText key={parts.length}>
          {text.substring(lastIndex, index)}
        </CustomText>,
      );
      parts.push(
        <CustomText
          key={parts.length}
          style={match.startsWith('<b>') ? {fontWeight: 'bold'} : {}}>
          {content}
        </CustomText>,
      );
      lastIndex = index + match.length;
    };

    text.replace(
      boldRegex,
      (match: string, content: string, index: number): string => {
        handleMatch(match, content, index);
        return '';
      },
    );

    text.replace(
      linkRegex,
      (match: string, url: string, index: number): string => {
        parts.push(
          <CustomText key={parts.length}>
            {text.substring(lastIndex, index)}
          </CustomText>,
        );
        parts.push(
          <CustomText
            key={parts.length}
            className="text-ultramarineBlue underline"
            onPress={() => Linking.openURL(url)}>
            {url}
          </CustomText>,
        );
        lastIndex = index + match.length;
        return '';
      },
    );

    parts.push(
      <CustomText key={parts.length}>{text.substring(lastIndex)}</CustomText>,
    );

    return parts;
  };

  const imageUrl =
    languages.vitals_with_image?.[
      vitalKey as keyof typeof languages.vitals_with_image
    ];

  return (
    <SafeAreaScrollView>
      <View className="px-4 pt-4">
        <Navbar />
      </View>
      <View className="mt-6 flex-row py-4 px-4 bg-darkCornflowerBlue justify-between items-center">
        <CustomText className="text-white font-isidoraSemiBold">
          {languages?.my_vital_signs}
        </CustomText>
        <CustomText className="text-white text-sm font-isidoraMedium">
          {moment(reportDetail?.report_generation_time).format(
            'DD-MMM-YYYY, h:mm a',
          )}{' '}
        </CustomText>
      </View>

      <LinearGradient
        className="px-6 py-4 flex-row justify-between items-center"
        colors={
          color_value
            ? [
                selectedColor ||
                  color_value?.Default?.[vitalKey]?.[category] ||
                  'gray',

                selectedColor ||
                  color_value?.Default?.[vitalKey]?.[category] ||
                  'gray',
              ]
            : ['gray', 'gray']
        }>
        <View className="flex-row items-center gap-x-4">
          {imageUrl ? (
            <Image source={{uri: imageUrl}} className="h-8 w-8" />
          ) : (
            <Icon name={vitalKey} size={30} color={customColor.white} />
          )}
          <View>
            <CustomText className="text-sm font-isidoraSemiBold">
              {config?.display ?? ''}
            </CustomText>
            <CustomText className="text-2xl font-isidoraSemiBold">
              {readingData?.value ?? ''}{' '}
              <CustomText className="text-base  font-isidoraSemiBold">
                {config?.unit ?? ''}
              </CustomText>
            </CustomText>
          </View>
        </View>
        <View>
          <CustomText className="text-xs font-isidoraSemiBold">
            {languages?.parameter_status}
          </CustomText>
          <CustomText className="text-base font-isidoraSemiBold text-right">
            {category}
          </CustomText>
        </View>
      </LinearGradient>

      <View className="p-4">
        {config?.scale_type === 11 && (
          <ReportBlockScale
            min={90}
            max={120}
            value={readingData?.value || 0}
            total={200}
            scaleCriteria={{
              scale: config?.scale || [],
              measuredValue: readingData?.value ?? 0,
            }}
            colorRange={config?.color_range ?? []}
            pointerAdjustment={8}
            readingKey={vitalKey}
          />
        )}
      </View>

      <View className="px-4 py-4 rounded-2xl mx-4 mt-4">
        <BorderGradient
          colors={
            color_value
              ? [
                  selectedColor ||
                    color_value?.Default?.[vitalKey]?.[category] ||
                    'gray',
                  selectedColor ||
                    color_value?.Default?.[vitalKey]?.[category] ||
                    'gray',
                ]
              : ['gray', 'gray']
          }
          innerContainerStyle={styles.borderInnerContainer}
          style={styles.borderOuterContainer}>
          <View className="px-2">
            <CustomText className="text-center text-sm font-isidoraMedium">
              {config?.short_intro ?? ''}
            </CustomText>
          </View>
        </BorderGradient>
      </View>

      <View className="px-8 mt-6">
        <CustomText className="text-sm font-isidoraMedium">
          {parseAndRenderLinks(config?.long_intro ?? '')}
        </CustomText>
      </View>
    </SafeAreaScrollView>
  );
};

export default ReportDetails;

const styles = StyleSheet.create({
  borderInnerContainer: {
    margin: 2,
    width: 'auto',
    borderRadius: 20,
    paddingVertical: 10,
  },
  borderOuterContainer: {
    borderRadius: 20,
  },
});
