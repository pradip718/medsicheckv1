import React from 'react';
import {Image, StyleSheet, TouchableOpacity} from 'react-native';
import {VoiceScanTabbarIcon} from '../../../assets';

type VoiceScanButtonProps = {
  onPressScanButton: () => void;
  copilot?: any;
};

const VoiceScanButton = ({onPressScanButton}: VoiceScanButtonProps) => {
  return (
    <TouchableOpacity onPress={onPressScanButton}>
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
