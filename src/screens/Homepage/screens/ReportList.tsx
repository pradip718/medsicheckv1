import {RouteProp} from '@react-navigation/native';
import React, {Suspense} from 'react';
import {ActivityIndicator, SafeAreaView, StyleSheet, View} from 'react-native';
import {HomepageParamList} from '../../../../types/navigation';
import {onShare} from '../../../../utils/methods';
import BasicContainer from '../../../components/BasicContainer';
import Navbar from '../../../components/Navbar';
import {useGetUserReadingDetail} from '../../../hooks/api/readings';

const Report = React.lazy(() => import('../../../components/Report'));

type ReportListRouteProp = RouteProp<HomepageParamList, 'ReportList'>;

interface ReportListProps {
  route: ReportListRouteProp;
}

const ReportList = ({route}: ReportListProps) => {
  const {reportId} = route.params;
  const {data: reportData, isFetching: isReportDetailFetching} =
    useGetUserReadingDetail({
      // staleTime: Infinity,
      staleTime: 0,
      reading_id: reportId,
      refetchOnWindowFocus: true,
      enabled: !!reportId,
    });

  return (
    <BasicContainer className="h-full bg-white">
      <SafeAreaView>
        <View className="px-6 py-4">
          <Navbar
            hasShare
            handleShare={() =>
              onShare(reportData?.readings?.reading_data || {})
            }
          />
        </View>

        <View style={styles.contentContainer}>
          <Suspense
            fallback={<ActivityIndicator size="large" color="#0000ff" />}>
            <Report
              reading={reportData?.readings}
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
