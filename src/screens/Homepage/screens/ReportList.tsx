import {RouteProp} from '@react-navigation/native';
import {isEmpty} from 'lodash';
import React, {Suspense} from 'react';
import {ActivityIndicator, SafeAreaView, StyleSheet, View} from 'react-native';
import {HomepageParamList} from '../../../../types/navigation';
import {onShare} from '../../../../utils/methods';
import BasicContainer from '../../../components/BasicContainer';
import Navbar from '../../../components/Navbar';
import {useGetUserReadingDetail} from '../../../hooks/api/readings';
import useGetUserReading from '../../../hooks/api/useGetUserReading';

const Report = React.lazy(() => import('../../../components/Report'));

type ReportListRouteProp = RouteProp<HomepageParamList, 'ReportList'>;

interface ReportListProps {
  route: ReportListRouteProp;
}

const ReportList = ({route}: ReportListProps) => {
  const {reportId} = route.params;
  const {data: reading} = useGetUserReading();
  const {data: reportData, isFetching: isReportDetailFetching} =
    useGetUserReadingDetail({
      // staleTime: Infinity,
      reading_id: reportId,
      refetchOnWindowFocus: true,
    });

  const filteredReading = reading?.data?.reading_data?.find(
    eachReading => eachReading.reading_id === reportId,
  );

  const reportDetail = reportData?.data?.readings?.find(
    eachReading => eachReading.reading_id === reportId,
  );

  return (
    <BasicContainer className="h-full">
      <SafeAreaView>
        <View className="px-6 py-4">
          <Navbar
            hasShare
            handleShare={() => onShare(reportDetail?.reading_data || {})}
          />
        </View>

        <View style={styles.contentContainer}>
          <Suspense
            fallback={<ActivityIndicator size="large" color="#0000ff" />}>
            <Report
              filteredReading={
                isEmpty(filteredReading) ? null : filteredReading
              }
              reading={reportDetail}
              reportData={reportData}
              isLoading={isReportDetailFetching}
            />
          </Suspense>
        </View>
      </SafeAreaView>
    </BasicContainer>
  );
};

export default ReportList;

const styles = StyleSheet.create({
  container: {},
  contentContainer: {
    // paddingBottom: 130,
  },
});
