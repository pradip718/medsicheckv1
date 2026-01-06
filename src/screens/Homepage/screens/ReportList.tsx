import {RouteProp} from '@react-navigation/native';
import React, {Suspense} from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import useLanguageStore from '../../../../store/languageStore';
import {HomepageParamList} from '../../../../types/navigation';
import {onShare} from '../../../../utils/methods';
import BasicContainer from '../../../components/BasicContainer';
import Navbar from '../../../components/Navbar';
import CustomText from '../../../components/Text';
import {useGetUserReadingDetail} from '../../../hooks/api/readings';
import useGetUserReading from '../../../hooks/api/useGetUserReading';

const Report = React.lazy(() => import('../../../components/Report'));

type ReportListRouteProp = RouteProp<HomepageParamList, 'ReportList'>;

interface ReportListProps {
  route: ReportListRouteProp;
}

const ReportList = ({route}: ReportListProps) => {
  const {reportId} = route.params;
  const {languages} = useLanguageStore();
  const {data: reading} = useGetUserReading({
    enabled: false,
  });
  const {
    data: reportData,
    isFetching: isReportDetailFetching,
    isError,
  } = useGetUserReadingDetail({
    // staleTime: Infinity,
    staleTime: 0,
    reading_id: reportId,
    refetchOnWindowFocus: true,
    enabled: !!reportId,
    gcTime: 0,
    initialData: undefined,
    retry: 2,
    retryDelay: 500,
  });

  const selectedReading = reading?.data?.reading_data?.find(
    eachReading => eachReading?.reading_id === reportId,
  );

  return (
    <BasicContainer className="h-full bg-white">
      <SafeAreaView className="grow">
        <View className="px-6 py-4">
          <Navbar
            hasShare
            handleShare={() =>
              onShare(reportData?.readings?.reading_data || {})
            }
          />
        </View>

        {isError ? (
          <View className="grow justify-center items-center ">
            <CustomText className="font-isidoraSemiBold text-lg text-center">
              {languages?.report_load_error}
            </CustomText>
          </View>
        ) : (
          <View style={styles.contentContainer}>
            <Suspense
              fallback={<ActivityIndicator size="large" color="#0000ff" />}>
              <Report
                selectedReading={selectedReading}
                reading={reportData?.readings}
                reportData={reportData}
                isLoading={isReportDetailFetching}
              />
            </Suspense>
          </View>
        )}
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
