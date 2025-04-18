import {RouteProp} from '@react-navigation/native';
import {entries, isEmpty, isObject} from 'lodash';
import moment from 'moment';
import {View} from 'moti';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import useLanguageStore from '../../../../store/languageStore';
import useVoiceScanStore from '../../../../store/voiceScanStore';
import BasicContainer from '../../../components/BasicContainer';
import Navbar from '../../../components/Navbar';
import RenderReport from '../../../components/RenderReport';
import CustomText from '../../../components/Text';

import Icon from '../../../components/Icon';
import customColor from '../../../theme/customColor';
import VoiceScanReportConfidence from './components/ReportConfidence';
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

// const RenderReportInformation = ({
//   readingId,
// }: {
//   // reportData: ReportJsonResponse;
//   readingId: string;
// }) => {
//   const [expandedSections, setExpandedSections] = useState<string[]>([]);
//   const [isLoading, setIsLoading] = useState(true);

//   const {data: reportData} = useGetUserReadingDetail({
//     reading_id: readingId,
//     // staleTime: Infinity,
//     gcTime: 0,
//   });

//   const latestReading = useMemo(() => {
//     return reportData?.readings;
//   }, [reportData?.readings]);

//   useEffect(() => {
//     setExpandedSections(Object.keys(reportData?.sub_categorisation || {}));
//     const timer = setTimeout(() => setIsLoading(false), 500); // Simulate loading delay
//     return () => clearTimeout(timer);
//   }, [reportData]);

//   const {reading_data} = latestReading || {};

//   const toggleSection = useCallback((key: string) => {
//     setExpandedSections(prevState =>
//       prevState.includes(key)
//         ? prevState.filter(section => section !== key)
//         : [...prevState, key],
//     );
//   }, []);

//   const readingsConfidence = useMemo(() => {
//     return reading_data
//       ? Object.entries(reading_data).filter(
//           ([_key, value]) => value.confidence_level,
//         )
//       : undefined;
//   }, [reading_data]);

//   const renderCardItem = useCallback(
//     (param: Parameter) => (
//       <View key={param.vital_key}>
//         {reading_data?.[param.vital_key] &&
//           (param.vital_key === 'BLOOD_PRESSURE' ? (
//             <RenderMultiReport
//               readingObj={reading_data.BLOOD_PRESSURE}
//               readingKey="BLOOD_PRESSURE"
//               reading={latestReading}
//             />
//           ) : (
//             <RenderReport
//               reading={latestReading}
//               readingKey={param.vital_key}
//               subParameters={param.subParameters}
//               name={param.display}
//             />
//           ))}
//       </View>
//     ),
//     [reading_data, latestReading],
//   );

//   if (isLoading) {
//     return (
//       <View className="p-6">
//         <ReportSkeleton />
//       </View>
//     );
//   }

//   return (
//     <View>
//       <ReportConfidence
//         classNameValue="mt-8 mx-4"
//         readingId={readingId}
//         readingsConfidence={readingsConfidence}
//         overallConfidence={reportData?.readings?.confidence_level ?? ''}
//       />
//       {isObject(reportData?.sub_categorisation) && (
//         <FlatList
//           data={entries(reportData?.sub_categorisation)}
//           keyExtractor={item => item[0]}
//           renderItem={renderItem}
//           scrollEnabled={false}
//         />
//       )}
//     </View>
//   );
// };

const VoiceScanReport = () => {
  const {reportDetail} = useVoiceScanStore();
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  useEffect(() => {
    setExpandedSections(Object.keys(reportDetail?.sub_categorization || {}));
  }, [reportDetail]);

  const toggleSection = useCallback((key: string) => {
    setExpandedSections(prevState =>
      prevState.includes(key)
        ? prevState.filter(section => section !== key)
        : [...prevState, key],
    );
  }, []);

  const renderItem = useCallback(
    ({item: [vitalKey, params]}: {item: [string, string[]]}) => {
      console.log('item', vitalKey, params);
      if (
        isEmpty(params) ||
        !params.some(param =>
          reportDetail?.voice_scan_report?.some(
            eachReport => eachReport?.key === param,
          ),
        )
      ) {
        return null;
      }
      const isExpanded = expandedSections.includes(vitalKey);
      return (
        <View>
          <TouchableOpacity
            className="border-b py-4 border-[#868686] px-2 flex-row justify-between items-center"
            onPress={() => toggleSection(vitalKey)}>
            <CustomText className="text-midnight text-base font-isidoraSemiBold">
              {vitalKey}
            </CustomText>

            <Icon
              name={isExpanded ? 'remove' : 'add'}
              size={isExpanded ? 8 : 20}
              color={customColor.black}
              className="px-4 self-center"
            />
          </TouchableOpacity>
          {isExpanded &&
            params.map(param => (
              <View key={param}>
                {reading_data?.[param.vital_key] && (
                  <RenderReport
                    reading={latestReading}
                    readingKey={param.vital_key}
                    subParameters={param.subParameters}
                    name={param.display}
                  />
                )}
              </View>
            ))}
        </View>
      );
    },
    // [expandedSections, toggleSection, renderCardItem, reading_data, reportData],
    [],
  );

  return (
    <BasicContainer className="bg-white">
      <SafeAreaView>
        <View className="p-4 bg-white">
          <Navbar hasClose />
        </View>
        <ScrollView
          contentContainerStyle={styles.scrollviewContentContainer}
          className="h-full">
          <View>
            <WellnessScore score={reportDetail?.wellness_score ?? 0} />
          </View>
          <View className="bg-white mt-[-30px] rounded-t-3xl flex-1 pt-4">
            <RenderDateAndTitle date={reportDetail?.report_generation_time} />

            <View>
              {isObject(reportDetail?.sub_categorization) && (
                <FlatList
                  data={entries(reportDetail?.sub_categorization)}
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
