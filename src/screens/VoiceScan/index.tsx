import {
  IWaveformRef,
  RecorderState,
  useAudioPlayer,
} from '@simform_solutions/react-native-audio-waveform';
import React, {useEffect, useRef, useState} from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import useLanguageStore from '../../../store/languageStore';
import BackgroundImage from '../../components/BackgroundImage';
import EtchedGlass from '../../components/EtchedGlass';
import Navbar from '../../components/Navbar';
import CustomText from '../../components/Text';
import useTimer from '../../hooks/useTimer';
import {AudioProvider} from './AudioRecordingContext';
import AudioPlayer from './components/AudioPlayer';
import AudioRecorder from './components/AudioRecorder';
import RecorderImageViewer from './components/RecorderImageViewer';

let currentPlayingRef: React.RefObject<IWaveformRef | null> | undefined;
const IMAGE_LENGTH = 3;

const VoiceScan = () => {
  const {languages} = useLanguageStore();
  const {stopPlayersAndExtractors} = useAudioPlayer();

  const [audioPath, setAudioPath] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [recorderState, setRecorderState] = useState(RecorderState.stopped);
  const [changeImage, setChangeImage] = useState<boolean>(false);

  const {startTimer, pauseTimer, resetTimer, recordedTime} = useTimer();

  const recordingRef = useRef<IWaveformRef>(null);

  useEffect(() => {
    if (recorderState === RecorderState.recording) {
      startTimer();
    }
    if (recorderState === RecorderState.stopped) {
      resetTimer();
    }
    if (recorderState === RecorderState.paused) {
      pauseTimer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recorderState]);

  useEffect(() => {
    resetTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (recordedTime >= 60) {
      onSave();
    }
  }, [recordedTime]);

  const onSave = () => {
    recordingRef.current?.stopRecord().then(path => {
      setAudioPath(path);
    });
    currentPlayingRef = undefined;
  };

  const onOpenImageSheet = async () => {
    try {
      if (recorderState === RecorderState.recording) {
        await recordingRef?.current?.pauseRecord();
      }
      setChangeImage(true);
    } catch (error) {
      console.log('🚀 ~ onOpenImageSheet ~ error:', error);
    }
  };

  // const onImageChange = async () => {
  //   console.log('hello', recordingRef?.current);

  //   try {
  //     const recordings = await getRecordedAudios();
  //     await stopPlayersAndExtractors();

  //     await recordingRef?.current?.stopRecord();

  //     await Promise.all(
  //       recordings.map(async recording => RNFS.unlink(recording)),
  //     )
  //       .then(() => {
  //         const newIndex =
  //           currentImageIndex !== IMAGE_LENGTH - 1 ? currentImageIndex + 1 : 0;
  //         setCurrentImageIndex(newIndex);
  //         setChangeImage(false);
  //       })
  //       .catch(error => {
  //         Alert.alert(
  //           'Error deleting recordings',
  //           'Below error happened while deleting recordings:\n' + error,
  //           [{text: 'Dismiss'}],
  //         );
  //       });
  //   } catch (error) {
  //     console.log('🚀 ~ onImageChange ~ error:', error);
  //   }
  // };

  const onCloseImageSheet = async () => {
    if (recorderState === RecorderState.paused) {
      await recordingRef?.current?.resumeRecord();
    }
    setChangeImage(false);
  };

  console.log('recorderState', recorderState);

  return (
    <BackgroundImage>
      <SafeAreaView className="flex-1">
        <View className="px-4">
          <Navbar />
        </View>
        <EtchedGlass
          className="rounded-none mt-4"
          cardContentContainerClassName="h-[52px] p-0 items-center justify-center">
          <CustomText className="font-isidoraSemiBold text-lg text-black">
            {languages?.voice_analysis}
          </CustomText>
        </EtchedGlass>
        <ScrollView contentContainerStyle={styles.scrollViewContainer}>
          {audioPath ? (
            <AudioPlayer
              audioPath={audioPath}
              currentPlayingRef={currentPlayingRef}
            />
          ) : (
            <RecorderImageViewer
              onChangeImage={onOpenImageSheet}
              currentImageIndex={currentImageIndex}
              recordedTime={recordedTime}
              recorderState={recorderState}
            />
          )}
        </ScrollView>
        <AudioProvider
          value={{
            recordedTime,
            onSave,
          }}>
          <AudioRecorder
            currentPlayingRef={currentPlayingRef}
            recorderState={recorderState}
            setRecorderState={setRecorderState}
            recordingRef={recordingRef}
            audioPath={audioPath}
            setAudioPath={setAudioPath}
            // onNext={onNext}
            onNext={() => {}}
          />
        </AudioProvider>
      </SafeAreaView>
    </BackgroundImage>
  );
};

export default VoiceScan;

const styles = StyleSheet.create({
  scrollViewContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
});
