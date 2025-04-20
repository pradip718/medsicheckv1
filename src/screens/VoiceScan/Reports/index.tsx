import {NavigationProp, useNavigation} from '@react-navigation/native';
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
import useLanguageStore from '../../../../store/languageStore';
import useVoiceScanStore from '../../../../store/voiceScanStore';
import {VoiceScanReport as VoiceScanReportType} from '../../../../types/api_response';
import {MainStackParamList} from '../../../../types/navigation';
import BasicContainer from '../../../components/BasicContainer';
import Icon from '../../../components/Icon';
import Navbar from '../../../components/Navbar';
import RenderReport from '../../../components/RenderReport';
import ReportCard from '../../../components/ReportCard';
import CustomText from '../../../components/Text';
import customColor from '../../../theme/customColor';
import WellnessScore from './components/WellnessScore';

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

const VoiceScanReport = () => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const {reportDetail} = useVoiceScanStore();
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

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
      console.log('config', config);
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
    [reportDetail],
  );

  const renderItem = useCallback(
    ({item: [category, keys]}: {item: [string, string[]]}) => {
      if (isEmpty(keys) || !reportDetail?.voice_scan_report) {
        return null;
      }

      const isExpanded = expandedSections.includes(category);
      const categoryReports = reportDetail.voice_scan_report.filter(report =>
        keys.includes(report.key),
      );

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
    return null;
  }

  return (
    <BasicContainer className="bg-white pb-4">
      <SafeAreaView>
        <View className="p-4 bg-white">
          <Navbar hasClose />
        </View>
        <ScrollView
          contentContainerStyle={styles.scrollviewContentContainer}
          className="h-full">
          <View>
            <WellnessScore score={reportDetail.wellness_score} />
          </View>
          <View className="bg-white mt-[-30px] rounded-t-3xl flex-1 pt-4">
            <RenderDateAndTitle date={reportDetail.report_generation_time} />

            <View>
              {isObject(reportDetail.sub_categorization) && (
                <FlatList
                  data={entries(reportDetail.sub_categorization)}
                  keyExtractor={item => item[0]}
                  renderItem={renderItem}
                  scrollEnabled={false}
                />
              )}
            </View>
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
