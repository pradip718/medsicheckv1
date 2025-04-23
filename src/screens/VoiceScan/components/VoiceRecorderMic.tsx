import {useIsFetching} from '@tanstack/react-query';
import {useEffect} from 'react';
import React, {StyleSheet, View} from 'react-native';
import {
  Easing,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import {twMerge} from 'tailwind-merge';
import useLanguageStore from '../../../../store/languageStore';
import RoundedButton from '../../../components/RoundedButton';
import CustomText from '../../../components/Text';
import {GET_VOICE_SCAN_IMAGE} from '../../../constants/hooks';
import customColor from '../../../theme/customColor';
import {useAudio} from '../AudioRecordingContext';

const BUTTON_SIZE = 80;
const WAVE_COUNT = 3;
const BASE_COLOR = '#C084FC';

interface VoiceRecorderMicProps {
  isRecording: boolean;
  onPress: () => void;
}

export default function VoiceRecorderMic({
  isRecording,
  onPress,
}: VoiceRecorderMicProps) {
  const {languages} = useLanguageStore();
  const {recordedTime, onSave} = useAudio();
  const waves = Array(WAVE_COUNT).fill(0);

  const isFetchingImage = useIsFetching({queryKey: [GET_VOICE_SCAN_IMAGE]}) > 0;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const waveAnimations = waves.map(() => useSharedValue(0));

  const startAnimation = () => {
    waveAnimations.forEach((wave, index) => {
      wave.value = withDelay(
        index * 400,
        withRepeat(
          withSequence(
            withTiming(1, {
              duration: 2000,
              easing: Easing.bezier(0.25, 0.1, 0.25, 1),
            }),
            withTiming(0, {
              duration: 0,
            }),
          ),
          -1,
          true,
        ),
      );
    });
  };

  const stopAnimation = () => {
    waveAnimations.forEach(wave => {
      wave.value = withTiming(0, {duration: 300});
    });
  };

  useEffect(() => {
    if (isRecording) {
      startAnimation();
    } else {
      stopAnimation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording]);

  return (
    <View>
      <RoundedButton
        onPress={isRecording && recordedTime > 40 ? onSave : onPress}
        disabled={(isRecording && recordedTime < 40) || isFetchingImage}
        hasDisabledStyle={false}
        style={isRecording && recordedTime < 40 ? styles.button : {}}>
        {isRecording ? (
          <CustomText
            className={twMerge(
              'text-xl text-white font-isidoraSemiBold',
              recordedTime < 40 && 'text-ultramarineBlue',
            )}>
            {recordedTime < 40
              ? `${40 - recordedTime} secs remaining`
              : languages?.stop_recording}
          </CustomText>
        ) : (
          <CustomText className="text-xl text-white font-isidoraSemiBold">
            {languages?.start_button_text}
          </CustomText>
        )}
      </RoundedButton>
    </View>
  );
}

const styles = StyleSheet.create({
  // button: {
  //   width: BUTTON_SIZE,
  //   height: BUTTON_SIZE,
  //   borderRadius: BUTTON_SIZE / 2,
  //   backgroundColor: '#A855F7',
  //   justifyContent: 'center',
  //   alignItems: 'center',
  // },
  button: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: customColor.ultramarineBlue,
  },
  wave: {
    position: 'absolute',
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: BASE_COLOR,
  },
});
