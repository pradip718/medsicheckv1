import {RouteProp} from '@react-navigation/native';
import {SafeAreaView} from 'moti';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import {MainStackParamList} from '../../../../types/navigation';
import Navbar from '../../../components/Navbar';
import Report from '../../../components/Report';
import {useGetUserReadingDetail} from '../../../hooks/api/readings';
import useGetUserReading from '../../../hooks/api/useGetUserReading';

type LabScanDetailRouteProp = RouteProp<MainStackParamList, 'LabScanDetails'>;

interface LabScanDetailProps {
  route: LabScanDetailRouteProp;
}

const LabScanDetails = ({route}: LabScanDetailProps) => {
  const {report: readingId} = route?.params || {};

  const {data: reading} = useGetUserReading();
  const {data: reportData} = useGetUserReadingDetail({
    staleTime: Infinity,
    reading_id: readingId ?? '',
  });

  const filteredReading = reading?.data?.reading_data?.find(
    eachReading => eachReading.reading_id === readingId,
  );

  const reportDetail = reportData?.readings;

  if (!readingId || !reportData || !reading) {
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
      <View style={styles.contentContainer}>
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
