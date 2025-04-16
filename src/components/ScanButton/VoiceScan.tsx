import React from 'react';
import {Image, StyleSheet, TouchableOpacity} from 'react-native';
import {VoiceScanTabbarIcon} from '../../../assets';

type VoiceScanButtonProps = {
  onPressVoiceScanButton: () => void;
  copilot?: any;
};

const VoiceScanButton = ({onPressVoiceScanButton}: VoiceScanButtonProps) => {
  return (
    <TouchableOpacity onPress={onPressVoiceScanButton} activeOpacity={0.8}>
      <Image
        source={VoiceScanTabbarIcon as any}
        style={styles.scanTabbarIcon}
      />
    </TouchableOpacity>
  );
};

export default VoiceScanButton;

const styles = StyleSheet.create({
  scanTabbarIcon: {
    aspectRatio: '1/1',
    height: 60,
  },
});
