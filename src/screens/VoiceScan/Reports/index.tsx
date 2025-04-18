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

const Reports = () => {
  const {reportDetail} = useVoiceScanStore();

  return (
    <BasicContainer className="bg-white">
      <SafeAreaView>
        <View className="p-4 bg-white">
          <Navbar hasClose />
        </View>
        <ScrollView
          contentContainerStyle={styles.scrollviewContentContainer}
          className="h-full">
          <View className="bg-white mt-[-30px] rounded-t-3xl flex-1 pt-4">
            <RenderDateAndTitle date={reportDetail?.report_generation_time} />

            <View>
              <FlatList
                data={reportDetail?.voice_scan_report}
                keyExtractor={item => item?.value?.toString()}
                renderItem={renderItem}
                scrollEnabled={false}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </BasicContainer>
  );
};

export default Reports;

const styles = StyleSheet.create({
  scrollviewContentContainer: {
    paddingBottom: 100,
  },
});
