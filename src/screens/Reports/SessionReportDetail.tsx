import {
  NavigationProp,
  RouteProp,
  StackActions,
  useNavigation,
} from '@react-navigation/native';
import {useMutation} from '@tanstack/react-query';
import {entries, isEmpty, isObject} from 'lodash';
import moment from 'moment';
import {View} from 'moti';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {FlatList, ScrollView, StyleSheet, TouchableOpacity} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import useAppStore from '../../../store/appStore';
import useAuthStore from '../../../store/authStore';
import useLanguageStore from '../../../store/languageStore';
import useUserProfileStore from '../../../store/profileStore';
import {MainStackParamList} from '../../../types/navigation';
import {Parameter} from '../../../types/reports';
import BasicContainer from '../../components/BasicContainer';
import Icon from '../../components/Icon';
import Navbar from '../../components/Navbar';
import RenderMultiReport from '../../components/RenderMultiReport';
import RenderReport from '../../components/RenderReport';
import ReportConfidence from '../../components/ReportConfidence';
import {ReportSkeleton} from '../../components/Skeleton';
import CustomText from '../../components/Text';
import {useSetupUserProfile} from '../../hooks/api/auth';
import {useGetUserReadingDetail} from '../../hooks/api/readings';
import useAuthNavigation from '../../hooks/useAuthNavigation';
import useFullPageLoader from '../../hooks/useFullPageLoader';
import customColor from '../../theme/customColor';
import WellnessScore from './WellnessScore';

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

const RenderReportInformation = ({
  readingId,
}: {
  // reportData: ReportJsonResponse;
  readingId: string;
}) => {
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const {data: reportData} = useGetUserReadingDetail({
    reading_id: readingId,
    // staleTime: Infinity,
    gcTime: 0,
  });

  const latestReading = useMemo(() => {
    return reportData?.readings;
  }, [reportData?.readings]);

  useEffect(() => {
    setExpandedSections(Object.keys(reportData?.sub_categorisation || {}));
    const timer = setTimeout(() => setIsLoading(false), 500); // Simulate loading delay
    return () => clearTimeout(timer);
  }, [reportData]);

  const {reading_data} = latestReading || {};

  const toggleSection = useCallback((key: string) => {
    setExpandedSections(prevState =>
      prevState.includes(key)
        ? prevState.filter(section => section !== key)
        : [...prevState, key],
    );
  }, []);

  const readingsConfidence = useMemo(() => {
    return reading_data
      ? Object.entries(reading_data).filter(
          ([_key, value]) => value.confidence_level,
        )
      : undefined;
  }, [reading_data]);

  const renderCardItem = useCallback(
    (param: Parameter) => (
      <View key={param.vital_key}>
        {reading_data?.[param.vital_key] &&
          (param.vital_key === 'BLOOD_PRESSURE' ? (
            <RenderMultiReport
              readingObj={reading_data.BLOOD_PRESSURE}
              readingKey="BLOOD_PRESSURE"
              reading={latestReading}
            />
          ) : (
            <RenderReport
              reading={latestReading}
              readingKey={param.vital_key}
              subParameters={param.subParameters}
              name={param.display}
            />
          ))}
      </View>
    ),
    [reading_data, latestReading],
  );

  const renderItem = useCallback(
    ({item: [vitalKey, vitalItem]}: {item: [string, Parameter[]]}) => {
      if (
        isEmpty(vitalItem) ||
        !vitalItem.some(param => reading_data?.[param.vital_key])
      ) {
        return null;
      }
      const isExpanded = expandedSections.includes(vitalKey);
      return (
        <View>
          <TouchableOpacity
            className="border-b py-4 border-[#868686] px-2 flex-row justify-between"
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
          {isExpanded && vitalItem.map(param => renderCardItem(param))}
        </View>
      );
    },
    [expandedSections, toggleSection, renderCardItem, reading_data],
  );

  if (isLoading) {
    return (
      <View className="p-6">
        <ReportSkeleton />
      </View>
    );
  }

  return (
    <View>
      <ReportConfidence
        classNameValue="mt-8 mx-4"
        readingId={readingId}
        readingsConfidence={readingsConfidence}
        overallConfidence={reportData?.readings?.confidence_level ?? ''}
      />
      {isObject(reportData?.sub_categorisation) && (
        <FlatList
          data={entries(reportData?.sub_categorisation)}
          keyExtractor={item => item[0]}
          renderItem={renderItem}
          scrollEnabled={false}
        />
      )}
    </View>
  );
};

type SessionReportDetailScreenRouteProp = RouteProp<
  MainStackParamList,
  'SessionReportDetail'
>;

type SessionReportDetailProps = {
  route: SessionReportDetailScreenRouteProp;
};

const SessionReportDetail = ({route}: SessionReportDetailProps) => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const {reading_id} = route.params || {reading_id: ''};
  const {data: reportData} = useGetUserReadingDetail({
    // staleTime: Infinity,
    gcTime: 0,
    reading_id: reading_id,
  });

  const {setIsFaceScanDeeplink} = useAppStore();
  const {setDeeplinkAuth} = useAuthStore();
  const {setCurrentActiveProfileId} = useUserProfileStore();

  const {showLoader, hideLoader} = useFullPageLoader();

  const {mutateAsync: setupProfile} = useSetupUserProfile();

  const {mutateAsync: redirectToExistingUser} = useAuthNavigation();

  const {mutateAsync: prepareForRegisteredUser} = useMutation({
    onMutate: showLoader,
    mutationFn: async () => {
      setDeeplinkAuth(null);
      setCurrentActiveProfileId('');
      setIsFaceScanDeeplink(false);
      const {isAuthenticated} = await setupProfile();
      if (isAuthenticated) {
        await redirectToExistingUser();
      } else {
        navigation.dispatch(StackActions.replace('Login'));
      }
    },
    onSettled: hideLoader,
  });

  return (
    <BasicContainer className="bg-white">
      <SafeAreaView>
        <View className="p-4 bg-white">
          <Navbar hasClose handleClose={prepareForRegisteredUser} />
        </View>
        <ScrollView
          contentContainerStyle={styles.scrollviewContentContainer}
          className="h-full">
          <View>
            <WellnessScore score={reportData?.readings?.WELLNESS_INDEX ?? 0} />
          </View>

          <View className="bg-white mt-[-30px] rounded-t-3xl flex-1 pt-4">
            <RenderDateAndTitle date={reportData?.readings?.created_at} />

            {reportData && (
              <RenderReportInformation
                // reportData={reportData}
                readingId={reportData?.readings?.reading_id}
              />
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </BasicContainer>
  );
};

export default SessionReportDetail;

const styles = StyleSheet.create({
  scrollviewContentContainer: {
    paddingBottom: 100,
  },
});
