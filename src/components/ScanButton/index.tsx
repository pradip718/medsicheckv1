import React from 'react';
import {Image, StyleSheet, TouchableOpacity} from 'react-native';
import {ScanTabbarIcon} from '../../../assets';

type ScanButtonProps = {
  onPressScanButton: () => void;
  copilot?: any;
};

const ScanButton = ({onPressScanButton}: ScanButtonProps) => {
  return (
    <TouchableOpacity onPress={onPressScanButton}>
      <Image source={ScanTabbarIcon as any} style={styles.scanTabbarIcon} />
    </TouchableOpacity>
  );
};

export default ScanButton;

const styles = StyleSheet.create({
  scanTabbarIcon: {
    aspectRatio: '1/1',
    height: 60,
  },
});
