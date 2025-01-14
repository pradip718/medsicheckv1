import {useImages} from 'biosensesignal-react-native-sdk';
import React from 'react';
import {Image, LayoutRectangle, PixelRatio, StyleSheet} from 'react-native';
import {FaceOval} from '../../../../assets';

const FaceDetection = (props: {previewSize: LayoutRectangle}) => {
  const imageData = useImages();
  if (!imageData) {
    return null;
  }

  if (!imageData.roi) {
    return null;
  }

  const devicePixelRatio = PixelRatio.get();
  const widthFactor =
    props.previewSize.width / (imageData.imageWidth / devicePixelRatio);
  const heightFactor =
    props.previewSize.height / (imageData.imageHeight / devicePixelRatio);
  const left = (imageData.roi.left * widthFactor) / devicePixelRatio;
  const top = (imageData.roi.top * heightFactor) / devicePixelRatio;
  const width = (imageData.roi.width * widthFactor) / devicePixelRatio;
  const height = (imageData.roi.height * heightFactor) / devicePixelRatio;

  return (
    <Image
      source={FaceOval as any}
      style={{
        ...styles.faceDetection,
        ...{
          width: width,
          height: height,
          left: left,
          top: top,
          position: 'absolute',
        },
      }}
      resizeMode="stretch"
    />
  );
};

export default FaceDetection;

const styles = StyleSheet.create({
  faceDetection: {
    position: 'absolute',
  },
});
