import {
  NavigationProp,
  RouteProp,
  useNavigation,
} from '@react-navigation/native';
import {entries, isEmpty, isObject} from 'lodash';
import moment from 'moment';
import {View} from 'moti';
import React, {useCallback, useEffect, useState} from 'react';
import {
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {twMerge} from 'tailwind-merge';
import useLanguageStore from '../../../../store/languageStore';
import useVoiceScanStore from '../../../../store/voiceScanStore';
import {
  isVoiceScanReport,
  VoiceScanReport as VoiceScanReportType,
} from '../../../../types/api_response';
import {MainStackParamList} from '../../../../types/navigation';
import {onShareVoiceScanReport} from '../../../../utils/methods';
import {notifyApi} from '../../../api/user';
import BasicContainer from '../../../components/BasicContainer';
import Icon from '../../../components/Icon';
import Navbar from '../../../components/Navbar';
import ReportCard from '../../../components/ReportCard';
import CustomText from '../../../components/Text';
import {useVoiceReportDetailMutation} from '../../../hooks/api/voiceScan';
import useFullPageLoader from '../../../hooks/useFullPageLoader';
import customColor from '../../../theme/customColor';
import VitalSignCard from '../../Homepage/components/ReportVitalSignCard';
import ReportWellnessScore from '../../Homepage/components/ReportWellnessScore';
import WellnessScore from './components/WellnessScore';

type ReportListRouteProp = RouteProp<MainStackParamList, 'VoiceScanReport'>;

interface ReportListProps {
  route: ReportListRouteProp;
}

const RenderDateAndTitle = ({date}: any) => {
  const {languages} = useLanguageStore();
  return (
    <View className="items-center mb-4">
      <CustomText className="text-base font-isidoraSemiBold">
        {languages?.my_vital_signs}
      </CustomText>
      <CustomText className="text-sm font-isidoraMedium">
        {languages?.report_generated_on} :{' '}
        {moment(date).format('DD-MMM-YYYY, h:mm a')}
      </CustomText>
    </View>
  );
};

const VoiceScanReport = ({route}: ReportListProps) => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const {languages} = useLanguageStore();
  const {showLoader, hideLoader} = useFullPageLoader();
  const {isNavigatingFromVoiceScan, session_id} = route?.params || {};
  const {reportDetail, setReportDetail, resetReportDetail} =
    useVoiceScanStore();
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const {mutateAsync: getVoiceReportDetail} = useVoiceReportDetailMutation({
    onMutate: showLoader,
    onSettled: hideLoader,
    onSuccess: data => {
      if (isVoiceScanReport(data)) {
        setReportDetail(data);
      }
    },
  });

  useEffect(() => {
    if (session_id && !reportDetail) {
      getVoiceReportDetail({sessoin_id: session_id});
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session_id]);

  useEffect(() => {
    return () => {
      resetReportDetail();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    notifyApi('voice_scan_report_view', {
      session_id: session_id,
    });
  }, [session_id]);

  useEffect(() => {
    if (reportDetail?.sub_categorization) {
      setExpandedSections(Object.keys(reportDetail.sub_categorization));
    }
  }, [reportDetail]);

  const toggleSection = useCallback((key: string) => {
    setExpandedSections(prevState =>
      prevState.includes(key)
        ? prevState.filter(section => section !== key)
        : [...prevState, key],
    );
  }, []);

  const renderReportItem = useCallback(
    (reportItem: VoiceScanReportType['voice_scan_report'][0]) => {
      const config = reportDetail?.scale_config?.[reportItem.key];
      if (!config) return null;

      const scaleCriteria = {
        scale: config?.scale || [],
        measuredValue: reportItem?.value ?? 0,
      };

      return (
        <View className="p-4">
          <ReportCard
            readingId={''}
            scaleType={config?.scale_type ?? 1}
            //@ts-ignore
            colorRange={config?.color_range ?? []}
            // colorRange={[]}
            healthMetricsTitle={config?.display}
            healthMetricsValue={reportItem?.value || 0}
            healthMetricsIndex={config?.unit ?? ''}
            iconName={reportItem?.key}
            description={config?.short_intro ?? ''}
            score={Number(reportItem?.value) || 0}
            category={reportItem?.category ?? ''}
            color_value={null}
            color={reportItem?.color ?? 'gray'}
            scaleCriteria={scaleCriteria}
            confidenceLevel={null}
            subParameters={[]}
            onDetailsPress={() => {
              navigation.navigate('VoiceScanReportDetail', {
                vitalKey: reportItem?.key ?? '',
              });
            }}
          />
        </View>
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [reportDetail],
  );

  const renderItem = useCallback(
    ({item: [category, keys]}: {item: [string, string[]]}) => {
      if (isEmpty(keys) || !reportDetail?.voice_scan_report) {
        return null;
      }

      const isExpanded = expandedSections.includes(category);
      const categoryReports = reportDetail.voice_scan_report
        .filter(report => keys.includes(report.key))
        .sort((a, b) => {
          const indexA = keys.indexOf(a.key);
          const indexB = keys.indexOf(b.key);
          return indexA - indexB;
        });

      if (categoryReports.length === 0) return null;

      return (
        <View>
          <TouchableOpacity
            className="border-b py-4 border-[#868686] px-2 flex-row justify-between items-center"
            onPress={() => toggleSection(category)}>
            <CustomText className="text-midnight text-base font-isidoraSemiBold">
              {category}
            </CustomText>
            <Icon
              name={isExpanded ? 'remove' : 'add'}
              size={isExpanded ? 8 : 20}
              color={customColor.black}
              className="px-4 self-center"
            />
          </TouchableOpacity>
          {isExpanded && categoryReports.map(renderReportItem)}
        </View>
      );
    },
    [
      expandedSections,
      toggleSection,
      renderReportItem,
      reportDetail?.voice_scan_report,
    ],
  );

  if (!reportDetail) {
    return (
      <View className="flex-1 bg-white p-4">
        <Navbar hasClose />
        <View className="flex-1 items-center justify-center">
          <CustomText className="text-center text-lg font-isidoraSemiBold">
            {languages?.no_report_available}
          </CustomText>
        </View>
      </View>
    );
  }

  const renderReportDetailHeader = () => {
    if (!reportDetail) {
      return;
    }
    return (
      <>
        <ReportWellnessScore score={reportDetail?.wellness_score ?? 0} />
        <VitalSignCard timeframe={reportDetail?.report_generation_time ?? ''} />
      </>
    );
  };

  return (
    <BasicContainer className="bg-white pb-8">
      <SafeAreaView>
        <View className="p-4 bg-white">
          <Navbar
            hasClose={isNavigatingFromVoiceScan}
            hasShare={!isNavigatingFromVoiceScan}
            handleShare={() => onShareVoiceScanReport(reportDetail || {})}
          />
        </View>
        <ScrollView
          contentContainerStyle={styles.scrollviewContentContainer}
          className="h-full">
          {isNavigatingFromVoiceScan ? (
            <WellnessScore score={reportDetail.wellness_score} />
          ) : (
            renderReportDetailHeader()
          )}
          <View
            className={twMerge(
              'flex-1 pt-2',
              isNavigatingFromVoiceScan &&
                'bg-white mt-[-30px] rounded-t-3xl pt-4',
            )}>
            {isNavigatingFromVoiceScan && (
              <RenderDateAndTitle date={reportDetail.report_generation_time} />
            )}

            {isObject(reportDetail.sub_categorization) && (
              <FlatList
                data={entries(reportDetail.sub_categorization)}
                keyExtractor={item => item[0]}
                renderItem={renderItem}
                scrollEnabled={false}
              />
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </BasicContainer>
  );
};

export default VoiceScanReport;

const styles = StyleSheet.create({
  scrollviewContentContainer: {
    paddingBottom: 100,
  },
});
