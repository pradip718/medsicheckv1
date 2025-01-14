import {Dimensions, Platform} from 'react-native';

export const isAndroid = Platform.OS === 'android';
export const screenWidth = Dimensions.get('window').width;
export const screenHeight = isAndroid
  ? Dimensions.get('screen').height
  : Dimensions.get('window').height;

const Metrics = {
  isAndroid,
  screenHeight,
  screenWidth,
};

export default Metrics;
