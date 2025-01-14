import {Dimensions} from 'react-native';

const containerWidth = Dimensions.get('window').width;
const containerHeight = Dimensions.get('window').height;
const initialScale = Math.min(containerWidth, containerHeight) / 375;

export const units = {
  scale: (multi: any) => (multi ? initialScale * multi : initialScale),
  spacing: (multi: any) =>
    multi ? initialScale * 8 * multi : initialScale * 8,
  fontSize: (multi: any) =>
    multi ? initialScale * 16 * multi : initialScale * 16,
  windowHeight: (multi: any) =>
    multi ? containerHeight + multi : containerHeight,
  windowWidth: (multi: any) =>
    multi ? containerWidth + multi : containerWidth,
  screenHeader: () => initialScale * 48,
};
