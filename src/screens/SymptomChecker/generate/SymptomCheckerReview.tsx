import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  // ActivityIndicator,
  Image,
  ImageBackground,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useQueryClient} from '@tanstack/react-query';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {
  NavigationProp,
  StackActions,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import {MainStackParamList} from '../../../../types/navigation';
import useLanguageStore from '../../../../store/languageStore';
import {
  useGetSymptomQuestion,
  usePostSymptomQuestion,
} from '../../../hooks/api/symptomchecker';
import {SYMPTOM_CHECKER_REPORTS} from '../../../constants/hooks';
import {errorToast} from '../../../../utils/toast';
import SymptomCheckerWrapper from './components/SymptomCheckerWrapper';
import Icon from '../../../components/Icon';
import {SymptomQuestion} from '../../../../types/api_response';
import {
  extractLabelAndComment,
  isSpanishLocale,
} from '../../../../utils/methods';
import {getSymptomQuestion} from '../../../api/symptomchecker';
import {SymptomCodeScreenMapper} from '../../../../utils/symptom';
import {SYMPTOM_CHECKER_SPACING} from '../../../constants/Styles';
import {BOLD, REGULAR, SEMIBOLD} from '../../../constants/Fonts';
import useFullPageLoader from '../../../hooks/useFullPageLoader';

const SymptomCheckerReview = () => {
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();
  const queryClient = useQueryClient();
  const {showLoader, hideLoader} = useFullPageLoader();

  const languages = useLanguageStore(store => store.languages);

  const [sendEmail, setSendEmail] = useState('true');
  const [reviewData, setReviewData] = useState<SymptomQuestion[]>([]);

  const {refetch: getQuestion, isFetching} = useGetSymptomQuestion({
    params: {type: 'latest', restart_flag: 'false'},
    enabled: false,
  });

  // useEffect(() => {
  //   (async () => {
  //     const {data} = await getQuestion();
  //     setReviewData(data ? data.data : []);
  //   })();
  // }, []);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          const {data} = await getQuestion();
          setReviewData(data ? data.data : []);
        } catch (error) {
          setReviewData([]);
        }
      };

      fetchData();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const {mutate: postQuestion, isPending} = usePostSymptomQuestion({
    onSuccess: data => {
      queryClient.invalidateQueries({queryKey: [SYMPTOM_CHECKER_REPORTS]});
      navigation.dispatch(StackActions.replace('SymptomGenerating', data.data));
    },
    onError: () => {
      errorToast();
    },
  });

  const onSendChange = () => {
    setSendEmail(prev => (prev === 'true' ? 'false' : 'true'));
  };

  const onNext = () => {
    postQuestion({
      type: 'review',
      email_flag: sendEmail,
    });
  };

  useEffect(() => {
    if (isFetching) {
      showLoader();
    } else {
      hideLoader();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFetching]);

  if (isFetching) {
    return null;
  }

  return (
    <SymptomCheckerWrapper
      onNext={onNext}
      buttonText={languages.generate_report}
      isLoading={isPending}
      disabled={isPending}>
      <View style={styles.container}>
        <Text style={styles.title}>
          {languages?.symptom_checker_review_title}
        </Text>
        <View style={{gap: 24}}>
          {reviewData && Array.isArray(reviewData)
            ? reviewData?.map(item => (
                <View key={item.q_id} style={{gap: 8}}>
                  <SymptomCheckerQuestion data={item} />
                  <SymptomCheckerAnswer data={item} />
                </View>
              ))
            : null}
        </View>

        <View className="bg-[#F3F4F6] px-4 py-2 justify-between rounded-[20px] flex-row items-center">
          <View className="flex-row items-center flex-1" style={{gap: 16}}>
            <View className="items-center justify-center w-10 h-10 bg-white rounded-xl">
              <Icon name="bell" size={22} color="#4B5363" />
            </View>
            <Text style={styles.question}>
              {languages?.symptom_checker_send_email}
            </Text>
          </View>

          <Switch
            value={sendEmail === 'true'}
            onValueChange={onSendChange}
            trackColor={{true: '#1A80D9', false: '#E2E8F0'}}
            thumbColor={'#fff'}
          />
        </View>

        <View style={styles.privacyContainer}>
          <ImageBackground
            source={require('../../../../assets/images/privacy_background.png')}
            style={styles.privacyBackgroundImage}>
            <View style={styles.privacyContentContainer}>
              <Text style={styles.privacyTitleText}>
                {languages?.your_privacy_is_our_priority}
              </Text>
              <View style={styles.privacyContent}>
                <View style={styles.privacyImageContainer}>
                  <Image
                    source={require('../../../../assets/images/lock.png')}
                    style={styles.privacyImage}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.privacyInfoText}>
                  {languages?.report_privacy_info}
                </Text>
              </View>
            </View>
          </ImageBackground>
        </View>
      </View>
    </SymptomCheckerWrapper>
  );
};

export default SymptomCheckerReview;

function SymptomCheckerQuestion({data}: {data: SymptomQuestion}) {
  if (!data) {
    return null;
  }
  const isSpanish = isSpanishLocale();

  const {label} = extractLabelAndComment(
    data?.[isSpanish ? 'spanish_question' : 'eng_question'] ?? '',
  );

  return (
    <View>
      <Text style={styles.question}>{label}</Text>
    </View>
  );
}

function SymptomCheckerAnswer({data}: {data: SymptomQuestion}) {
  console.log('🚀 ~ SymptomCheckerAnswer ~ data:', data);
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();

  // const [isLoading, setIsLoading] = useState<boolean>(false);
  const {showLoader, hideLoader} = useFullPageLoader();

  const isSpanish = isSpanishLocale();
  const metaData = data?.meta_data?.type;
  const isFileUpload = metaData === 'image_upload';
  const answer =
    data?.[isSpanish ? 'user_spanish_choices' : 'user_eng_choices'];
  console.log('🚀 ~ SymptomCheckerAnswer ~ answer:', answer);

  const parsedAnswer = useMemo(() => {
    if (!answer) {
      return '';
    }

    let parsedAns = answer;
    try {
      const parsed = JSON.parse(answer);
      if (Array.isArray(parsed)) {
        const formattedAnswer: string[] = [];
        parsed.forEach((item: any) => {
          if (typeof item === 'string') {
            formattedAnswer.push(item);
          } else {
            const entry = Object.entries(item);
            if (entry?.length) {
              formattedAnswer.push(`${entry[0][0]}: ${entry[0][1]}`);
            }
          }
        });
        parsedAns = formattedAnswer;
      } else {
        const entry = Object.entries(parsed);
        if (entry?.length) {
          parsedAns = `${entry[0][0]}: ${entry[0][1]}`;
        }
      }
    } catch (error) {
      const {label, comment} = extractLabelAndComment(answer);
      parsedAns = `${label}${comment ? ` -${comment}` : ''}`;
    }

    return parsedAns;
  }, [answer]);

  if (!data) {
    return null;
  }

  const onEdit = async () => {
    try {
      // if (typeof parsedAnswer !== 'string') {
      //   setIsLoading(true);
      // }
      showLoader();
      const res = await getSymptomQuestion({
        type: 'single_question',
        q_id: data.q_id,
      });
      const nextRoute = SymptomCodeScreenMapper[res.data.code];
      navigation.navigate(nextRoute, {
        ...res.data,
        code: res.data.code,
        isEdit: true,
      });
    } catch (error) {
      errorToast();
    } finally {
      // setIsLoading(false);
      hideLoader();
    }
  };

  if (isFileUpload) {
    return (
      <View className="bg-[#F3F4F6] p-4 rounded-[20px] flex-row items-center">
        <View className="flex-row flex-wrap flex-1" style={{gap: 16}}>
          {answer.map((image: {id: string; url: string}) => (
            <View style={styles.imageContainer} key={image.id}>
              <View className="w-full h-full overflow-hidden rounded-[20px] border-2 border-[#1671C0]">
                <Image
                  source={{uri: image.url}}
                  resizeMode="cover"
                  className="w-full h-full"
                />
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity activeOpacity={0.8} onPress={onEdit}>
          {/* {isLoading ? (
            <ActivityIndicator size="small" color="#1671C0" />
          ) : ( */}
          <FontAwesome name="pencil" size={24} color="#7FC1F3" />
          {/* )} */}
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="bg-[#F3F4F6] p-4 rounded-[20px] flex-row items-center flex-1">
      <View className="flex-1">
        {Array.isArray(parsedAnswer) ? (
          <View
            className="flex-row flex-wrap items-center flex-1"
            style={{gap: 8}}>
            {parsedAnswer.map((item, index) => (
              <Text key={index} style={styles.answerOption}>
                {item}
              </Text>
            ))}
          </View>
        ) : (
          <Text style={styles.answerText}>{parsedAnswer}</Text>
        )}
      </View>
      <TouchableOpacity activeOpacity={0.8} onPress={onEdit}>
        {/* {isLoading ? (
          <ActivityIndicator size="small" color="#1671C0" />
        ) : ( */}
        <FontAwesome name="pencil" size={24} color="#7FC1F3" />
        {/* )} */}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: SYMPTOM_CHECKER_SPACING,
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: SYMPTOM_CHECKER_SPACING,
    paddingBottom: 16,
  },
  title: {
    color: '#222A3D',
    fontFamily: BOLD,
    fontSize: 20,
    lineHeight: 28,
  },
  question: {
    fontSize: 16,
    fontFamily: BOLD,
    lineHeight: 22,
    color: '#373F51',
  },
  answerOption: {
    color: '#4B5363',
    fontSize: 14,
    lineHeight: 20,
    fontFamily: SEMIBOLD,
    borderWidth: 1,
    borderColor: '#9CA3AF',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
    minHeight: 20,
  },
  answerText: {
    color: '#222A3D',
    fontSize: 16,
    lineHeight: 22,
    fontFamily: SEMIBOLD,
  },
  imageContainer: {
    height: 72,
    width: 60,
  },
  privacyContainer: {
    borderRadius: 32,
    overflow: 'hidden',
  },
  privacyBackgroundImage: {
    width: '100%',
    // height: 150,
  },
  privacyContentContainer: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  privacyTitleText: {
    fontFamily: BOLD,
    fontSize: 16,
    color: '#fff',
    marginBottom: 8,
  },
  privacyContent: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
    alignItems: 'center',
  },
  privacyImageContainer: {
    backgroundColor: '#02061752',
    height: 80,
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  privacyImage: {
    width: 60,
    height: 60,
  },
  privacyInfoText: {
    fontFamily: REGULAR,
    fontSize: 14,
    lineHeight: 20,
    color: '#fff',
    flexWrap: 'wrap',
    width: '75%',
  },
});
