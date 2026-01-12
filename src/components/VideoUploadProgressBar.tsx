import React from 'react';
import {StyleSheet, View} from 'react-native';
import {LinearGradient} from 'react-native-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import useVideoUploadStore from '../../store/videoUploadStore';

function VideoUploadProgressBar() {
  const {isUploading, progress} = useVideoUploadStore();
  const insets = useSafeAreaInsets();
  const animatedWidth = useSharedValue(0);

  // Static test values
  // const isUploading = true;
  // const progress = 50; // Static 50% for testing

  React.useEffect(() => {
    if (isUploading) {
      animatedWidth.value = withTiming(progress, {duration: 200});
    } else {
      animatedWidth.value = withTiming(0, {duration: 200});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isUploading, progress]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: `${animatedWidth.value}%`,
    };
  });

  if (!isUploading) {
    return null;
  }

  return (
    <View style={[styles.container, {top: insets.top}]}>
      <View style={styles.track}>
        <Animated.View style={[styles.progressContainer, animatedStyle]}>
          <LinearGradient
            colors={['#3E64FF', '#3552CC', '#1B62D9']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.progress}
          />
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 9999,
    backgroundColor: 'transparent',
  },
  track: {
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    width: '100%',
    overflow: 'hidden',
  },
  progressContainer: {
    height: '100%',
    borderRadius: 2,
    overflow: 'hidden',
    shadowColor: '#3E64FF',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  progress: {
    height: '100%',
    width: '100%',
    borderRadius: 2,
  },
});

export default VideoUploadProgressBar;
