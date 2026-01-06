import {
  NavigationProp,
  // NavigationProp,
  RouteProp,
  useFocusEffect,
  useNavigation,
  // useNavigation,
  useRoute,
} from '@react-navigation/native';
import {useQueryClient} from '@tanstack/react-query';
import React, {useMemo, useState} from 'react';
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import useLanguageStore from '../../../store/languageStore';
import {SymptomCheckerDetail} from '../../../types/api_response';
import {MainStackParamList} from '../../../types/navigation';
import {errorToast} from '../../../utils/toast';
import DeleteModal from '../../components/AlertModal/DeleteModal';
import Icon from '../../components/Icon';
import Loader from '../../components/Loader';
import CustomText from '../../components/Text';
import {BOLD, REGULAR, SEMIBOLD} from '../../constants/Fonts';
import {SYMPTOM_CHECKER_REPORTS} from '../../constants/hooks';
import {
  useDeleteSymptomReports,
  useGetSymptomReportDetails,
} from '../../hooks/api/symptomchecker';
import useFullPageLoader from '../../hooks/useFullPageLoader';
import SymptomCheckerAccordion from './generate/components/details/Accordion';
import Findings from './generate/components/details/Findings';
import ImmediateRecommendations from './generate/components/details/RecommendationItem';
import SymptomCheckerDetailHeader from './generate/components/details/SymptomCheckerDetailHeader';
import SymptomRateApp from './generate/components/details/SymptomRateApp';

const SymptomCheckerReport = () => {
  const {params} =
    useRoute<RouteProp<MainStackParamList, 'SymptomCheckerReport'>>();
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const queryClient = useQueryClient();

  const {showLoader, hideLoader} = useFullPageLoader();

  const languages = useLanguageStore(store => store.languages);

  const {data, isFetching} = useGetSymptomReportDetails({
    token_id: params?.token_id,
    enabled: !!params?.token_id,
  });

  const [showDelete, setShowDelete] = useState(false);

  const symptomData = data?.[0];
  const reportData: SymptomCheckerDetail = useMemo(() => {
    let parsed: SymptomCheckerDetail = {} as SymptomCheckerDetail;
    try {
      parsed = JSON.parse(symptomData?.ai_response || '{}');
    } catch (error) {
      console.log(error);
    }
    return parsed;
  }, [symptomData]);
  console.log('🚀 ~ SymptomCheckerReport ~ reportData:', reportData);

  const {mutate: deleteReport} = useDeleteSymptomReports({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [SYMPTOM_CHECKER_REPORTS],
      });
      setShowDelete(false);
      navigation.goBack();
    },
    onError: error => {
      errorToast(error.message);
    },
    onMutate: () => {
      setShowDelete(false);
      showLoader();
    },
    onSettled: hideLoader,
  });

  const onDelete = () => {
    deleteReport([params.token_id]);
  };

  const onShowDelete = () => setShowDelete(true);

  useFocusEffect(() => {
    StatusBar.setBarStyle('light-content');
  });

  if (isFetching) {
    return <Loader hasNavbar message={languages?.symptom_report_loading} />;
  }

  const hideDeleteModal = () => {
    setShowDelete(false);
  };

  return (
    <>
      <View className="flex-1 bg-white">
        <SymptomCheckerDetailHeader
          createdAt={symptomData?.created_at || ''}
          title={languages?.symptom_checker_report}
          reportLink={data?.[0]?.report_link || ''}
          onDelete={onShowDelete}
        />

        <ScrollView
          contentContainerStyle={{
            padding: 16,
            gap: 16,
            backgroundColor: '#fff',
          }}>
          <View style={styles.card}>
            <Text style={styles.text}>{reportData?.initial_text}</Text>
          </View>

          {reportData?.location_of_lesion ? (
            <SymptomCheckerAccordion title={languages?.image_analysis} isOpen>
              <View className="pt-4 pb-1" style={{gap: 12}}>
                <Text style={styles.text}>
                  {reportData?.location_of_lesion}
                </Text>

                {reportData?.medical_images?.length ? (
                  <View className="flex-row flex-wrap bg-white rounded-[20px] p-4">
                    {reportData?.medical_images?.map(image => (
                      <Image
                        key={image}
                        source={{uri: image}}
                        style={styles.image}
                      />
                    ))}
                  </View>
                ) : null}

                <Text style={styles.text}>
                  {reportData?.lesion_specifications}
                </Text>
              </View>
            </SymptomCheckerAccordion>
          ) : null}

          <SymptomCheckerAccordion title={languages?.findings} isOpen>
            <View className="pt-4 pb-1" style={{gap: 16}}>
              <CustomText style={styles.text}>
                {languages?.findings_description}
              </CustomText>

              <Findings data={reportData} />
            </View>
          </SymptomCheckerAccordion>

          <SymptomCheckerAccordion
            title={languages?.immediate_recommendations}
            isOpen>
            <View className="pt-4 pb-1" style={{gap: 16}}>
              <ImmediateRecommendations
                data={reportData?.immediately_recommendations}
              />
            </View>
          </SymptomCheckerAccordion>

          <SymptomCheckerAccordion
            title={languages?.medical_consultations}
            isOpen>
            <View className="pt-4 pb-1" style={{gap: 16}}>
              {reportData?.medical_consultations?.length
                ? reportData?.medical_consultations?.map(consultation => (
                    <View
                      key={consultation?.specialty_name}
                      className="p-4 bg-white rounded-[20px]"
                      style={{gap: 8}}>
                      <View className="flex-row items-center" style={{gap: 8}}>
                        <Icon name="hospital" size={26} color="#4B5363" />
                        <Text
                          style={[
                            styles.text,
                            styles.title,
                            {fontFamily: BOLD},
                          ]}>
                          {consultation?.specialty_name}
                        </Text>
                      </View>
                      <Text style={styles.text}>{consultation?.reason}</Text>
                      <View className="border rounded-[10px] py-1.5 border-[#1A80D9] px-3 self-start mt-1">
                        <Text style={[styles.text, styles.urgencyLevel]}>
                          {languages?.urgency_level}:{' '}
                          {consultation?.urgency_level}
                        </Text>
                      </View>
                    </View>
                  ))
                : null}
            </View>
          </SymptomCheckerAccordion>

          {reportData?.additional_exams?.length ? (
            <SymptomCheckerAccordion title={languages?.additional_exams} isOpen>
              <View className="pt-4 pb-1" style={{gap: 16}}>
                {reportData?.additional_exams?.map(exam => (
                  <View key={exam?.exam_name} style={{gap: 12}}>
                    <View
                      className="p-4 bg-white rounded-[20px]"
                      style={{gap: 4}}>
                      <Text style={[styles.text, styles.title]}>
                        {exam?.exam_name}
                      </Text>
                      <Text style={styles.text}>{exam?.reason}</Text>
                    </View>
                    <Text style={styles.text}>{exam.preparation}</Text>
                  </View>
                ))}
              </View>
            </SymptomCheckerAccordion>
          ) : null}

          {reportData?.symptom_monitoring?.length ? (
            <SymptomCheckerAccordion
              title={languages?.symptom_monitoring}
              isOpen>
              <View className="pt-4 pb-1" style={{gap: 16}}>
                {reportData?.symptom_monitoring?.map(monitor => (
                  <View key={monitor.method} style={{gap: 12}}>
                    <View className="p-4 bg-white rounded-3xl" style={{gap: 4}}>
                      <Text style={[styles.text, styles.title]}>
                        {monitor.frequency}
                      </Text>
                      <Text style={styles.text}>
                        {monitor.methods && Array.isArray(monitor.methods)
                          ? monitor.methods.join('. ')
                          : monitor.method}
                      </Text>
                      <View className="flex-row mt-3 justify-evenly">
                        {[...new Array(7)].map((_, index) => (
                          <Icon
                            name="MOOD_MAPPED_OVERALL"
                            key={index.toString()}
                            color="#1A80D9"
                            size={30}
                          />
                        ))}
                      </View>
                    </View>
                    <Text style={styles.text}>{monitor.reason}</Text>
                  </View>
                ))}
              </View>
            </SymptomCheckerAccordion>
          ) : null}

          <SymptomRateApp />

          <Text style={styles.text}>
            {languages?.symptom_report_disclaimer}
          </Text>

          <View className="pb-6 bg-white">
            <Image
              source={require('../../../assets/images/SymptomChecker/dr_antonio_sign.png')}
              className="w-40 h-40"
              resizeMode="cover"
            />
            <View style={{gap: 4}}>
              <Text style={[styles.text, styles.doctorName]}>
                {languages?.symptom_report_doctor}
              </Text>
              <Text style={[styles.text, styles.subTitle]}>
                {languages?.symptom_report_doctor_position}
              </Text>
              <Text style={styles.text}>
                {languages?.symptom_report_doctor_certificate}
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>

      <DeleteModal
        visible={showDelete}
        hideAlert={hideDeleteModal}
        message={{
          title: languages?.delete_header,
          content: languages?.delete_subheader,
        }}
        handleOk={onDelete}
        handleCancel={hideDeleteModal}
      />
    </>
  );
};

export default SymptomCheckerReport;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    padding: 14,
  },
  text: {
    fontFamily: REGULAR,
    color: '#4B5363',
    fontSize: 15,
    lineHeight: 22,
  },
  title: {
    fontFamily: BOLD,
    fontSize: 17,
    lineHeight: 23,
  },
  doctorName: {
    fontFamily: BOLD,
  },
  subTitle: {
    fontFamily: SEMIBOLD,
  },
  urgencyLevel: {
    color: '#1A80D9',
    fontFamily: SEMIBOLD,
    lineHeight: 20,
  },
  image: {width: '47%', height: 80},
});
