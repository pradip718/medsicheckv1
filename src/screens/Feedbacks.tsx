import {useMutation} from '@tanstack/react-query';
import React, {useEffect, useState} from 'react';
import {Keyboard, TextInput, View} from 'react-native';
import StarRating from 'react-native-star-rating-widget';
import useLanguageStore from '../../store/languageStore';
import {FeedbackPayload} from '../../types/users/user';
import {errorToast, successToast} from '../../utils/toast';
import {postUsersFeedback} from '../api/user';
import Navbar from '../components/Navbar';
import RoundedButton from '../components/RoundedButton';
import SafeAreaScrollView from '../components/SafeAreaScrollView';
import CustomText from '../components/Text';
import {POST_FEEDBACK} from '../constants/hooks';

const Feedbacks = () => {
  const {languages} = useLanguageStore();
  const [feedbacksTitle, setFeedbacksTitle] = useState('');
  const [feedbacksContent, setFeedbacksContent] = useState('');

  const [startCount, setStartCount] = useState<number>();

  const {mutateAsync: postFeedback, isPending: isFeedbackSubmitting} =
    useMutation({
      mutationKey: [POST_FEEDBACK],
      mutationFn: async (payload: FeedbackPayload) => {
        await postUsersFeedback(payload);
      },
      onSuccess: () => {
        successToast(languages?.feedback_success);
        setFeedbacksTitle('');
        setFeedbacksContent('');
        setStartCount(undefined);
        Keyboard.dismiss();
      },
      onError: () => {
        errorToast(languages?.generic_error_message);
      },
    });

  useEffect(() => {
    const changeTitleBasedOnRatings = () => {
      if (startCount === 1) {
        setFeedbacksTitle(languages?.very_bad);
      } else if (startCount === 2) {
        setFeedbacksTitle(languages?.bad);
      } else if (startCount === 3) {
        setFeedbacksTitle(languages?.average);
      } else if (startCount === 4) {
        setFeedbacksTitle(languages?.good);
      } else if (startCount === 5) {
        setFeedbacksTitle(languages?.excellent);
      } else {
        setFeedbacksTitle('');
      }
    };

    changeTitleBasedOnRatings();
  }, [startCount, languages]);

  const onChangeFeedbacksTitle = (txt: string) => {
    setFeedbacksTitle(txt);
  };
  const onChangeFeedbacksContent = (txt: string) => {
    setFeedbacksContent(txt);
  };

  const onSend = async () => {
    await postFeedback({
      rating: startCount || 0,
      feedback_title: feedbacksTitle,
      feedback_content: feedbacksContent,
    });
  };

  const onStarRatingPress = (rating: number) => {
    setStartCount(rating);
  };

  return (
    <SafeAreaScrollView
      className="p-4 bg-white h-full"
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag">
      <Navbar />
      <View className="flex-1">
        <CustomText className="font-isidoraSemiBold text-lg text-center mt-4">
          {languages?.feedback_form}
        </CustomText>
        <View className="mt-4  items-center">
          <CustomText className="font-isidoraMedium text-base">
            {languages?.feedback_form_heading}
          </CustomText>
          <View className="mt-4">
            <StarRating
              rating={startCount ?? 0}
              onChange={onStarRatingPress}
              maxStars={5}
            />
          </View>
        </View>
        <View className="mt-8 space-y-2">
          <CustomText className="font-isidoraMedium text-sm">
            {languages?.feedback_title}
          </CustomText>
          <TextInput
            multiline
            placeholder={languages?.feedback_title_example}
            placeholderTextColor="#a0a0a0"
            textAlignVertical="top"
            className="bg-slate-200 items-center justify-center h-10 text-black font-isidoraSemiBold p-2 text-sm rounded-lg"
            value={feedbacksTitle}
            onChangeText={onChangeFeedbacksTitle}
          />
        </View>
        <View className="mt-4 space-y-2">
          <CustomText className="font-isidoraMedium text-sm">
            {languages?.feedback_text_label}
          </CustomText>
          <TextInput
            multiline
            textAlignVertical="top"
            placeholderTextColor="#a0a0a0"
            placeholder={languages?.feedback_text_example}
            className="bg-slate-200  h-40 text-black font-isidoraSemiBold p-2 text-sm rounded-lg"
            value={feedbacksContent}
            onChangeText={onChangeFeedbacksContent}
          />
        </View>
        <RoundedButton
          className="my-10 self-center px-20 py-2 bg-ultramarineBlue"
          resetStyle
          disabled={isFeedbackSubmitting || !startCount}
          loading={isFeedbackSubmitting}
          onPress={onSend}>
          <CustomText className="text-white font-isidoraSemiBold text-lg">
            {languages?.submit}
          </CustomText>
        </RoundedButton>
      </View>
    </SafeAreaScrollView>
  );
};

export default Feedbacks;
