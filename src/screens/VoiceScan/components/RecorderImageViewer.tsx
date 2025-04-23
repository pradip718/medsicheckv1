import React, {useState} from 'react';
import {Image, Pressable, StyleSheet, Text, View} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

import {RecorderState} from '@simform_solutions/react-native-audio-waveform';
import useLanguageStore from '../../../../store/languageStore';
import {useAudio} from '../AudioRecordingContext';

interface RecorderImageViewerProps {
  onChangeImage: () => void;
  recordedTime: number;
  recorderState: RecorderState;
}

const RecorderImageViewer = ({
  onChangeImage,
  recordedTime,
  recorderState,
}: RecorderImageViewerProps) => {
  const [fullView, setFullView] = useState<boolean>(false);
  const {languages} = useLanguageStore();

  const {imageData} = useAudio();

  return (
    <View style={styles.container}>
      <View>
        {!fullView && (
          <View>
            <Text style={styles.title}>
              {languages?.image_description_prompt}
            </Text>
            <Text style={styles.infoText}>
              {languages?.voice_recording_duration_prompt}
            </Text>
          </View>
        )}

        <View
          style={[
            {
              width: '100%',
              height: fullView ? 345 : 280,
              paddingHorizontal: fullView ? 0 : 20,
              alignItems: 'center',
            },
          ]}>
          <View
            style={{
              position: 'relative',
              height: '100%',
              width: fullView ? '100%' : '92%',
              borderRadius: 24,
              overflow: 'hidden',
              borderCurve: 'continuous',
            }}>
            <Image
              source={{uri: imageData?.image_url}}
              style={styles.image}
              resizeMode="contain"
            />
            <View style={styles.minMaxContainer}>
              <Pressable
                style={styles.actionButton}
                onPress={() => setFullView(prev => !prev)}>
                {fullView ? (
                  <Feather name="minimize-2" size={16} color="#fff" />
                ) : (
                  <Feather name="maximize-2" size={16} color="#fff" />
                )}
              </Pressable>
            </View>
            {recorderState === RecorderState.stopped && (
              <View style={styles.changeImageContainer}>
                <Pressable style={styles.actionButton} onPress={onChangeImage}>
                  <Text style={styles.changeImageText}>
                    {languages?.change_image_prompt}
                  </Text>
                  <Feather name="repeat" size={14} color="#fff" />
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </View>

      {recorderState === RecorderState.recording ? (
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>
            {recordedTime < 40
              ? ''
              : `${languages?.automatic_stop_message} ${60 - recordedTime} ${
                  languages?.seconds
                }`}
          </Text>
        </View>
      ) : null}
    </View>
  );
};
export default RecorderImageViewer;

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    flex: 1,
  },
  title: {
    fontSize: 20,
    color: '#222A3D',
    textAlign: 'center',
  },
  infoText: {
    fontSize: 16,
    color: '#4B5363',
    marginBottom: 20,
    lineHeight: 24,
    marginTop: 6,
    textAlign: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  minMaxContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 50,
  },
  changeImageContainer: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    zIndex: 50,
  },
  actionButton: {
    backgroundColor: '#0206177A',
    flexDirection: 'row',
    gap: 4,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  changeImageText: {
    fontSize: 12,
    color: '#fff',
    lineHeight: 16,
  },
  timerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    color: '#4B5363',
    fontSize: 15,
  },
});
