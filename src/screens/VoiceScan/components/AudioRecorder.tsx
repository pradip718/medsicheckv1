import {
  IWaveformRef,
  PermissionStatus,
  PlayerState,
  RecorderState,
  UpdateFrequency,
  useAudioPermission,
  useAudioPlayer,
  Waveform,
} from '@simform_solutions/react-native-audio-waveform';
import React, {Alert, Linking, StyleSheet, View} from 'react-native';
import RNFS from 'react-native-fs';
import {PERMISSIONS, request} from 'react-native-permissions';

import {useMutation} from '@tanstack/react-query';
import useLanguageStore from '../../../../store/languageStore';
import {initiateVoiceScanSession} from '../../../api/voicescan';
import RoundedButton from '../../../components/RoundedButton';
import {INITIATE_VOICE_SCAN} from '../../../constants/hooks';
import customColor from '../../../theme/customColor';
import {useAudio} from '../AudioRecordingContext';
import VoiceRecorderMic from './VoiceRecorderMic';
import {getRecordedAudios} from './audio';

interface AudioRecorderProps {
  recordingRef: React.RefObject<IWaveformRef | null>;
  currentPlayingRef?: React.RefObject<IWaveformRef | null>;
  recorderState: RecorderState;
  setRecorderState: React.Dispatch<React.SetStateAction<RecorderState>>;
  audioPath: string;
  setAudioPath: React.Dispatch<React.SetStateAction<string>>;
  onNext: () => void;
}

const AudioRecorder = ({
  recordingRef,
  currentPlayingRef,
  recorderState,
  setRecorderState,
  audioPath,
  setAudioPath,
  onNext,
}: AudioRecorderProps) => {
  const languages = useLanguageStore(store => store.languages);

  const {checkHasAudioRecorderPermission} = useAudioPermission();
  const {stopPlayersAndExtractors} = useAudioPlayer();
  const {recordedTime, imageData, onSetSession} = useAudio();

  const {mutateAsync: initiateSession} = useMutation({
    mutationKey: [INITIATE_VOICE_SCAN],
    mutationFn: initiateVoiceScanSession,
    onSuccess: sessionDetail => {
      startRecording();
      onSetSession(sessionDetail?.session_id);
    },
  });

  const startRecording = () => {
    recordingRef.current
      ?.startRecord({
        updateFrequency: UpdateFrequency.high,
      })
      .then(() => {
        setRecorderState(RecorderState.recording);
      })
      .catch(() => {});
  };

  const onRecord = async () => {
    if (recorderState === RecorderState.stopped || recordedTime < 40) {
      // Stopping other player before starting recording
      if (currentPlayingRef?.current?.currentState === PlayerState.playing) {
        currentPlayingRef?.current?.stopPlayer();
      }

      const hasPermission = await checkHasAudioRecorderPermission();

      if (hasPermission === PermissionStatus.granted) {
        currentPlayingRef = recordingRef;
        initiateSession({
          image_id: imageData?.image_id ?? '',
        });
      }
      // else if (hasPermission === PermissionStatus.undetermined) {
      //   const permissionStatus = await getAudioRecorderPermission();
      //   if (permissionStatus === PermissionStatus.granted) {
      //     currentPlayingRef = recordingRef;
      //     startRecording();
      //   }
      // }
      else {
        request(PERMISSIONS.ANDROID.RECORD_AUDIO).then(status => {
          if (status === 'blocked') {
            Alert.alert(
              'Permission Denied',
              'You have denied permission to record audio. Please enable it in the app settings.',
              [
                {
                  text: 'Cancel',
                  onPress: () => {},
                  style: 'cancel',
                },
                {
                  text: 'Go to Settings',
                  onPress: () => {
                    Linking.openSettings();
                  },
                },
              ],
            );
          }

          if (status === PermissionStatus.granted) {
            currentPlayingRef = recordingRef;
            initiateSession({
              image_id: imageData?.image_id ?? '',
            });
          }
        });
      }
    }
  };

  const onStopAndClearRecordings = async () => {
    try {
      const recordings = await getRecordedAudios();
      await stopPlayersAndExtractors();

      await currentPlayingRef?.current?.stopPlayer();

      await Promise.all(
        recordings.map(async recording => RNFS.unlink(recording)),
      )
        .then(() => {
          setAudioPath('');
        })
        .catch(error => {
          Alert.alert(
            'Error deleting recordings',
            'Below error happened while deleting recordings:\n' + error,
            [{text: 'Dismiss'}],
          );
        });
    } catch (error) {
      console.log('🚀 ~ onStopAndClearRecordings ~ error:', error);
    }
  };

  const onRetry = async () => {
    try {
      onStopAndClearRecordings();
    } catch (error) {
      console.log('🚀 ~ onRetry ~ error:', error);
    }
  };

  const onSubmit = () => {
    onStopAndClearRecordings();

    onNext();
  };

  if (audioPath) {
    return (
      <View style={styles.buttonContainer}>
        <RoundedButton text={languages?.submit} onPress={onSubmit} />
        <RoundedButton
          text={languages?.retry}
          onPress={onRetry}
          style={styles.retryButton}
          textStyle={{
            color: customColor.ultramarineBlue,
          }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Waveform
        mode="live"
        containerStyle={styles.waveFormContainer}
        // @ts-expect-error correctly mapped
        ref={recordingRef}
        candleSpace={2}
        candleWidth={2}
        candleHeightScale={6}
        waveColor="#fff"
        onRecorderStateChange={setRecorderState}
      />

      <VoiceRecorderMic
        isRecording={recorderState === RecorderState.recording}
        onPress={onRecord}
      />
    </View>
  );
};

export default AudioRecorder;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: 24,
    borderRadius: 8,
    alignItems: 'center',
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  waveFormContainer: {
    flex: 1,
    borderRadius: 24,
    paddingHorizontal: 10,
    height: 60,
    backgroundColor: '#A855F7',
    display: 'none',
  },
  recordAudioPressable: {
    height: 40,
    width: 40,
    padding: 8,
  },
  buttonContainer: {
    gap: 8,
    marginBottom: 10,
    paddingHorizontal: 40,
  },
  retryButton: {
    backgroundColor: '#BCC9FF',
  },
});
