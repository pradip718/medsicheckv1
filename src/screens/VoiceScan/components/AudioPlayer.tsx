import {
  FinishMode,
  IWaveformRef,
  PlayerState,
  RecorderState,
  Waveform,
} from '@simform_solutions/react-native-audio-waveform';
import React, {memo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import customColor from '../../../theme/customColor';

function formatMilliseconds(ms: number) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;
}

interface AudioPlayerProps {
  audioPath: string;
  currentPlayingRef?: React.RefObject<IWaveformRef | null>;
}

const AudioPlayer = memo(({audioPath, currentPlayingRef}: AudioPlayerProps) => {
  const ref = useRef<IWaveformRef>(null);
  const [playerState, setPlayerState] = useState(PlayerState.stopped);
  const [isLoading, setIsLoading] = useState(true);
  const [duration, setDuration] = useState(0);
  const [currentDuration, setCurrentDuration] = useState(0);

  const handlePlayPauseAction = async () => {
    // If we are recording do nothing
    if (currentPlayingRef?.current?.currentState === RecorderState.recording) {
      return;
    }

    const startNewPlayer = async () => {
      currentPlayingRef = ref;
      if (ref.current?.currentState === PlayerState.paused) {
        await ref.current?.resumePlayer();
      } else {
        await ref.current?.startPlayer({
          finishMode: FinishMode.stop,
        });

        // If the player took too much time to initialize and another player started instead we pause the former one!
        if (currentPlayingRef?.current?.playerKey !== ref?.current?.playerKey) {
          await ref?.current?.pausePlayer();
        }
      }
    };

    // If no player or if current player is stopped just start the new player!
    if (
      currentPlayingRef == null ||
      [PlayerState.stopped, PlayerState.paused].includes(
        currentPlayingRef?.current?.currentState as PlayerState,
      )
    ) {
      await startNewPlayer();
    } else {
      // Pause current player if it was playing
      if (currentPlayingRef?.current?.currentState === PlayerState.playing) {
        await currentPlayingRef?.current?.pausePlayer();
      }

      // Start player when it is a different one!
      if (currentPlayingRef?.current?.playerKey !== ref?.current?.playerKey) {
        await startNewPlayer();
      }
    }
  };

  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.title}>Recording Complete</Text>
        <Text style={styles.infoText}>
          You can listen to your recording and submit it for voice analysis.
        </Text>
      </View>

      <View style={styles.playerWrapper}>
        <View style={styles.playerContainer}>
          <Pressable
            disabled={isLoading}
            onPress={handlePlayPauseAction}
            style={styles.playBackControlPressable}>
            {isLoading ? (
              <ActivityIndicator color={'#FFFFFF'} />
            ) : (
              <Text>
                {playerState !== PlayerState.playing ? (
                  <Feather name="play" size={24} color="#fff" />
                ) : (
                  <Feather name="pause" size={24} color="#fff" />
                )}
              </Text>
            )}
          </Pressable>

          <View style={styles.waveContainer}>
            <View style={styles.durationContainer}>
              <AntDesign name="clockcircle" size={18} color="#E9D5FF" />
              <Text style={styles.duration}>
                {formatMilliseconds(currentDuration)} /{' '}
                {formatMilliseconds(duration)}
              </Text>
            </View>
            <Waveform
              containerStyle={styles.staticWaveformView}
              mode="static"
              key={audioPath}
              playbackSpeed={1.0}
              ref={ref}
              path={audioPath}
              candleSpace={2}
              candleWidth={2}
              scrubColor="#ffffff"
              waveColor="#ffffff80"
              candleHeightScale={8}
              onPlayerStateChange={setPlayerState}
              onError={error => {
                console.log('Error in static player:', error);
              }}
              onCurrentProgressChange={(currentProgress, songDuration) => {
                // console.log(
                //   `currentProgress ${_currentProgress}, songDuration ${_songDuration}`,
                // );
                setDuration(songDuration);
                setCurrentDuration(currentProgress);
              }}
              onChangeWaveformLoadState={state => {
                setIsLoading(state);
              }}
            />
          </View>
        </View>
      </View>
    </View>
  );
});

export default AudioPlayer;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
  },
  playerWrapper: {
    paddingHorizontal: 4,
    marginTop: 40,
  },
  playerContainer: {
    marginTop: 20,
    flexDirection: 'row',
    borderRadius: 120,
    alignItems: 'center',
    overflow: 'hidden',
    paddingHorizontal: 14,
    backgroundColor: customColor.ultramarineBlue,
    gap: 10,
    boxShadow: '0px 0px 0px 3.23px #9333EA40',
  },
  playBackControlPressable: {
    height: 50,
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF29',
    borderRadius: 30,
  },
  staticWaveformView: {
    flex: 1,
    height: 90,
    paddingTop: 28,
    paddingBottom: 4,
  },
  duration: {
    fontSize: 12,
    color: '#E9D5FF',
    lineHeight: 16,
  },
  durationContainer: {
    position: 'absolute',
    left: 0,
    zIndex: 999,
    top: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  waveContainer: {
    flex: 1,
    position: 'relative',
  },
  title: {
    fontSize: 20,
    color: '#222A3D',
  },
  infoText: {
    fontSize: 16,
    color: '#4B5363',
    marginBottom: 20,
    lineHeight: 24,
    marginTop: 8,
  },
});
