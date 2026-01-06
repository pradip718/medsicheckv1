import {RouteProp} from '@react-navigation/native';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {MainStackParamList} from '../../../../types/navigation';
import BasicContainer from '../../../components/BasicContainer';
import Navbar from '../../../components/Navbar';
import Report from '../../../components/Report';
import {useGetUserReadingDetail} from '../../../hooks/api/readings';
import useGetUserReading from '../../../hooks/api/useGetUserReading';

type AIScanDetailRouteProp = RouteProp<MainStackParamList, 'AIScanDetails'>;

interface AIScanDetailProps {
  route: AIScanDetailRouteProp;
}

const AIScanDetails = ({route}: AIScanDetailProps) => {
  const {report: readingId} = route?.params || {};
  const {data: reading} = useGetUserReading();

  const {data: reportData} = useGetUserReadingDetail({
    staleTime: Infinity,
    reading_id: readingId ?? '',
  });

  const reportDetail = reportData?.readings;

  const selectedReading = reading?.data?.reading_data?.find(
    eachReading => eachReading?.reading_id === readingId,
  );

  if (!readingId || !reportData || !reading) {
    return (
      <SafeAreaView>
        <Navbar />
      </SafeAreaView>
    );
  }

  return (
    <BasicContainer>
      <SafeAreaView style={styles.container} className="bg-white">
        <View className="p-4">
          <Navbar />
        </View>
        <View style={styles.contentContainer}>
          <Report
            reading={reportDetail}
            reportData={reportData}
            selectedReading={selectedReading}
          />
        </View>
      </SafeAreaView>
    </BasicContainer>
  );
};

export default AIScanDetails;

const styles = StyleSheet.create({
  container: {},
  contentContainer: {paddingBottom: 150},
});
