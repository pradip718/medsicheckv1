import {RouteProp} from '@react-navigation/native';
import {SafeAreaView} from 'moti';
import React, {useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import useLanguageStore from '../../../../store/languageStore';
import {MainStackParamList} from '../../../../types/navigation';
import {errorToast} from '../../../../utils/toast';
import Navbar from '../../../components/Navbar';
import Report from '../../../components/Report';
import {useGetUserReadingDetail} from '../../../hooks/api/readings';
import {useGetReportReadingById} from '../../../hooks/api/report';
import useGetUserReading from '../../../hooks/api/useGetUserReading';

type LabScanDetailRouteProp = RouteProp<MainStackParamList, 'LabScanDetails'>;

interface LabScanDetailProps {
  route: LabScanDetailRouteProp;
}

const LabScanDetails = ({route}: LabScanDetailProps) => {
  const {report: readingId} = route?.params || {};
  const {languages} = useLanguageStore();

  const {data: reading} = useGetUserReading();
  const {data: reportData} = useGetUserReadingDetail({
    staleTime: Infinity,
    reading_id: readingId ?? '',
  });
  const {data: reports, isError: isReadingError} = useGetReportReadingById({
    readingId: readingId ?? '',
  });

  const filteredReading = reading?.data?.reading_data?.find(
    eachReading => eachReading.reading_id === readingId,
  );

  useEffect(() => {
    if (isReadingError) {
      errorToast(languages?.generic_error_message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReadingError]);

  const reportDetail = reports?.data?.readings;
  if (!readingId || !reportData || !reportDetail) {
    return (
      <SafeAreaView>
        <Navbar />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View className="p-4">
        <Navbar />
      </View>
      <View className="px-4" style={styles.contentContainer}>
        <Report
          reading={reportDetail}
          reportData={reportData}
          selectedReading={filteredReading}
        />
      </View>
    </SafeAreaView>
  );
};

export default LabScanDetails;

const styles = StyleSheet.create({
  container: {},
  contentContainer: {paddingBottom: 150},
});
