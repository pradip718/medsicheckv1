import {NavigationProp, useNavigation} from '@react-navigation/native';
import {
  IWaveformRef,
  RecorderState,
  useAudioPlayer,
} from '@simform_solutions/react-native-audio-waveform';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import React, {useEffect, useRef, useState} from 'react';
import {Alert, SafeAreaView, ScrollView, StyleSheet, View} from 'react-native';
import RNFS from 'react-native-fs';
import useLanguageStore from '../../../store/languageStore';
import {MainStackParamList} from '../../../types/navigation';
import {notifyApi} from '../../api/user';
import {getVoiceScanImage, uploadVoiceRecording} from '../../api/voicescan';
import BackgroundImage from '../../components/BackgroundImage';
import EtchedGlass from '../../components/EtchedGlass';
import Navbar from '../../components/Navbar';
import CustomText from '../../components/Text';
import {
  GET_VOICE_SCAN_IMAGE,
  UPLOAD_VOICE_RECORDING,
} from '../../constants/hooks';
import useFullPageLoader from '../../hooks/useFullPageLoader';
import useTimer from '../../hooks/useTimer';
import {AudioProvider} from './AudioRecordingContext';
import AudioPlayer from './components/AudioPlayer';
import AudioRecorder from './components/AudioRecorder';
import ChangeRecorderImageBottomSheet from './components/ChangeRecorderImageSheet';
import RecorderImageViewer from './components/RecorderImageViewer';
import {getRecordedAudios} from './components/audio';

let currentPlayingRef: React.RefObject<IWaveformRef | null> | undefined;

const VoiceScan = () => {
  const queryClient = useQueryClient();
  const {languages} = useLanguageStore();
  const {stopPlayersAndExtractors} = useAudioPlayer();
  const {showLoader, hideLoader} = useFullPageLoader();
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();

  const [audioPath, setAudioPath] = useState('');
  const [recorderState, setRecorderState] = useState(RecorderState.stopped);
  const [changeImage, setChangeImage] = useState<boolean>(false);
  const [session, setSession] = useState<string>();

  const {startTimer, pauseTimer, resetTimer, recordedTime} = useTimer();

  const recordingRef = useRef<IWaveformRef>(null);

  const {data: voiceScanImageData} = useQuery({
    queryKey: [GET_VOICE_SCAN_IMAGE],
    queryFn: getVoiceScanImage,
  });

  const {mutateAsync: uploadRecording} = useMutation({
    mutationKey: [UPLOAD_VOICE_RECORDING],
    mutationFn: uploadVoiceRecording,
    onMutate: () => {
      showLoader();
      notifyApi('voice_scan_upload_start', {session_id: session ?? ''});
    },
    onSettled: hideLoader,
    onSuccess: data => {
      console.log('data', data);
      notifyApi('voice_scan_upload_complete', {session_id: session ?? ''});
    },
    onError: error => {
      console.log('error', error);
      notifyApi('voice_scan_upload_error', {
        error: error?.message || 'Unknown error',
        session_id: session ?? '',
      });
    },
  });

  console.log('voiceScanImageData', voiceScanImageData);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recordedTime]);

  useEffect(() => {
    notifyApi('voice_scan_start');
  }, []);

  const onSave = async () => {
    try {
      notifyApi('voice_scan_recording_stop', {session_id: session ?? ''});
      const audioPath = await recordingRef.current?.stopRecord();
      if (audioPath) {
        setAudioPath(audioPath);
        const audioData = await getRecordedAudios();
        if (audioData && audioData.length > 0) {
          const lastAudio = audioData[audioData.length - 1];
          await uploadRecording({
            audio_file: lastAudio,
            session_id: session ?? '',
            duration: recordedTime,
            format: 'm4a',
          });
        }
      }
    } catch (error: any) {
      console.log('error', error);
    }
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

  const onImageChange = async () => {
    try {
      showLoader();
      if (recorderState === RecorderState.stopped) {
        queryClient.invalidateQueries({queryKey: [GET_VOICE_SCAN_IMAGE]});
        setChangeImage(false);
        return;
      }
      const recordings = await getRecordedAudios();
      await stopPlayersAndExtractors();

      await recordingRef?.current?.stopRecord();

      await Promise.all(
        recordings.map(async recording => RNFS.unlink(recording)),
      )
        .then(() => {
          queryClient.invalidateQueries({queryKey: [GET_VOICE_SCAN_IMAGE]});
          setChangeImage(false);
        })
        .catch(error => {
          Alert.alert(
            'Error deleting recordings',
            'Below error happened while deleting recordings:\n' + error,
            [{text: 'Dismiss'}],
          );
        });
    } catch (error) {
      console.log('🚀 ~ onImageChange ~ error:', error);
    } finally {
      hideLoader();
    }
  };

  const onCloseImageSheet = async () => {
    if (recorderState === RecorderState.paused) {
      await recordingRef?.current?.resumeRecord();
    }
    setChangeImage(false);
  };

  const onSetSession = (sessionId: string) => {
    setSession(sessionId);
  };

  return (
    <AudioProvider
      value={{
        recordedTime,
        onSave,
        imageData: voiceScanImageData,
        onSetSession,
      }}>
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
                recordedTime={recordedTime}
                recorderState={recorderState}
              />
            )}
          </ScrollView>

          <AudioRecorder
            currentPlayingRef={currentPlayingRef}
            recorderState={recorderState}
            setRecorderState={setRecorderState}
            recordingRef={recordingRef}
            audioPath={audioPath}
            setAudioPath={setAudioPath}
            // onNext={onNext}
            onNext={() => {
              navigation.navigate('VoiceScanGeneratingReport', {
                session_id: session ?? '',
              });
            }}
          />

          <ChangeRecorderImageBottomSheet
            open={changeImage}
            onClose={onCloseImageSheet}
            onImageChange={onImageChange}
          />
        </SafeAreaView>
      </BackgroundImage>
    </AudioProvider>
  );
};

export default VoiceScan;

const styles = StyleSheet.create({
  scrollViewContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
});
