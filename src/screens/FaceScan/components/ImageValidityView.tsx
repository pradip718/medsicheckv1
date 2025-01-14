import {
  ImageValidity,
  SessionState,
  useImages,
  useSessionState,
} from 'biosensesignal-react-native-sdk';
import * as React from 'react';
import {StyleSheet, View} from 'react-native';
import useBinahConfigStore from '../../../../store/binahConfigStore';
import useLanguageStore from '../../../../store/languageStore';
import CustomText from '../../../components/Text';
import RenderProgressBar from './RenderProgressBar';

export const ImageValidityView = ({
  handleValidityJSON,
  progress,
  imageValidity,
  handleImageValidity,
}: {
  handleValidityJSON: (validity: any) => void;
  progress: number | undefined;
  handleImageValidity: (validity: string | undefined) => void;
  imageValidity?: string | undefined;
}) => {
  const sessionState = useSessionState();
  const {languages} = useLanguageStore();
  const {binahConfig} = useBinahConfigStore();
  // const [imageValidity, handleImageValidity] = React.useState<string>();
  const [imageValiditySubText, setImageValiditySubText] =
    React.useState<string>();
  const [countdown, setCountdown] = React.useState<number>(0);
  const imageData = useImages();

  React.useEffect(() => {
    if (progress !== undefined && binahConfig?.scan_duration) {
      const timeLeft = Math.max(
        0,
        Math.round(+binahConfig.scan_duration * (1 - progress)),
      );
      setCountdown(timeLeft);
    }
  }, [progress, binahConfig?.scan_duration]);

  React.useEffect(() => {
    if (sessionState !== SessionState.PROCESSING) {
      handleImageValidity(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionState]);

  React.useEffect(() => {
    if (!imageData || imageData.imageValidity === ImageValidity.VALID) {
      handleImageValidity(undefined);
    } else {
      switch (imageData.imageValidity) {
        case ImageValidity.INVALID_DEVICE_ORIENTATION:
          handleImageValidity(languages?.invalid_orientation);
          setImageValiditySubText(languages?.invalid_orientation_sub_header);
          break;
        case ImageValidity.INVALID_ROI:
          handleImageValidity(languages?.face_not_detected);
          setImageValiditySubText(languages?.face_not_detected_sub_header);
          break;
        case ImageValidity.TILTED_HEAD:
          handleImageValidity(languages?.titled_head);
          setImageValiditySubText(languages?.titled_head_sub_header);
          break;
        case ImageValidity.FACE_TOO_FAR:
          handleImageValidity(languages?.you_are_too_far);
          setImageValiditySubText(languages?.you_are_too_far_sub_header);
          break;
        case ImageValidity.UNEVEN_LIGHT:
          handleImageValidity(languages?.uneven_lighting);
          setImageValiditySubText(languages?.uneven_lighting_sub_header);
          break;
      }
      handleValidityJSON(ImageValidity[imageData.imageValidity]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageData, languages]);

  return (
    <View style={styles.container}>
      {imageValidity ? (
        <View style={styles.centerRow}>
          <CustomText style={styles.title} className="text-red-400">
            {imageValidity}
          </CustomText>
        </View>
      ) : countdown <= 60 ? (
        <CustomText style={styles.title}>
          {countdown} {languages?.seconds}
        </CustomText>
      ) : (
        <CustomText style={styles.title}>
          {languages?.scanning_face_header}
        </CustomText>
      )}
      <View style={styles.progressBarContainer} className="w-full">
        <RenderProgressBar progress={progress || 0} />
      </View>
      {imageValiditySubText ? (
        <CustomText style={styles.text}>{imageValiditySubText}</CustomText>
      ) : (
        <CustomText style={styles.text}>
          {languages?.scanning_face_content}
        </CustomText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minHeight: 70,
    maxHeight: 150,
    width: '100%',
    padding: 5,
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
  },
  centerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 5,
  },
  text: {
    fontSize: 16,
    color: 'black',
    textAlign: 'center',
  },
  progressBarContainer: {
    marginVertical: 10,
  },
});
