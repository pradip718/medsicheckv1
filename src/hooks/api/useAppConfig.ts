import {useWindowDimensions} from 'react-native';

type ScaleType = 'moderate' | 'vertical' | 'scale' | 'moderateVerticalScale';
const guidelineBaseWidth = 390;
const guidelineBaseHeight = 844;

const useAppConfig = () => {
  const {height, width} = useWindowDimensions();

  const scale = (size: number) => (width / guidelineBaseWidth) * size;
  const verticalScale = (size: number) => (height / guidelineBaseHeight) * size;
  const moderateScale = (size: number, factor = 0.5) =>
    size + (scale(size) - size) * factor;
  const moderateVerticalScale = (size: number, factor = 0.5) =>
    size + (verticalScale(size) - size) * factor;

  const evaluateSize = (
    scaleType: ScaleType = 'vertical',
    scaleFactor: number,
  ) => {
    const getScaleFunction = () => {
      switch (scaleType) {
        case 'vertical':
          return verticalScale;
        case 'scale':
          return scale;
        case 'moderateVerticalScale':
          return moderateVerticalScale;
        default:
          return moderateScale;
      }
    };

    const scaleFunction = getScaleFunction();

    return scaleFunction(scaleFactor);
  };

  return {evaluateSize};
};

export default useAppConfig;
