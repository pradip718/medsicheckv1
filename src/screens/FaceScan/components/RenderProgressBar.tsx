import React from 'react';
import {StyleSheet, View} from 'react-native';
import {ProgressBar} from 'react-native-paper';

const RenderProgressBar = ({progress}: {progress: number}) => {
  return (
    <View>
      <ProgressBar
        animatedValue={progress}
        color={'rgba(69, 209, 154, 1)'}
        className="h-[26px] rounded-3xl bg-transparent border"
        style={styles.progressBar}
      />
    </View>
  );
};

export default RenderProgressBar;

const styles = StyleSheet.create({
  progressBar: {
    borderColor: 'rgba(63, 101, 255, 0.41)',
  },
});
