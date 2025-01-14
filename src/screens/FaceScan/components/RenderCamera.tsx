import {CameraPreviewView} from 'biosensesignal-react-native-sdk';
import {Buffer} from 'buffer';
import React, {RefObject, useEffect, useRef, useState} from 'react';
import {
  // Image,
  LayoutChangeEvent,
  LayoutRectangle,
  StyleSheet,
  View,
} from 'react-native';
import ViewShot from 'react-native-view-shot';
// import {CameraHeadPosition} from '../../../../assets';
import {twMerge} from 'tailwind-merge';
import useLanguageStore from '../../../../store/languageStore';
import {errorToast} from '../../../../utils/toast';
import {useUploadFacescanImage} from '../../../hooks/api/report';
import FaceDetection from './FaceDetection';
interface RenderCameraProps {
  didFinishedMeasuring: boolean;
  progress: number;
  readingId: string | number[];
  imageValidity: string | undefined;
}

const RenderCamera = ({
  progress,
  readingId,
  imageValidity,
}: RenderCameraProps) => {
  const ref: RefObject<ViewShot> = useRef(null);
  const {languages} = useLanguageStore();

  const {mutateAsync: uploadImage} = useUploadFacescanImage();

  const convertToBinaryAndSend = async (base64Data: string) => {
    try {
      const binaryData = Buffer.from(base64Data, 'base64');

      return uploadImage({reading_id: readingId, data: binaryData});
    } catch (error) {
      console.log('error', error);

      errorToast(languages?.generic_error_message);
    }
  };

  useEffect(() => {
    const captureUserImage = () => {
      if (languages?.shouldCaptureImage !== 'true') {
        return;
      }
      if (
        languages?.capture_image_interval?.some(
          p => Math.abs(p - progress) <= languages?.tolerance,
        )
      ) {
        if (!ref?.current || !ref?.current?.capture) {
          return;
        }
        ref?.current?.capture().then((base64: string) => {
          convertToBinaryAndSend(base64);
        });
      }
    };
    captureUserImage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress]);

  const [previewSize, setPreviewSize] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  } as LayoutRectangle);
  const onLayout = (event: LayoutChangeEvent) => {
    setPreviewSize(event.nativeEvent.layout);
  };

  return (
    <View
      onLayout={onLayout}
      style={styles.container}
      className={twMerge(
        'rounded-xl overflow-hidden',
        !!imageValidity && 'border-2 border-red-400',
      )}>
      <ViewShot
        ref={ref}
        options={{
          fileName: `facescan-reading_id-${readingId}`,
          format: 'jpg',
          quality: 0.4,
          result: 'base64',
        }}>
        <CameraPreviewView style={styles.preview} />
      </ViewShot>
      {/* <Image
        source={CameraHeadPosition as any}
        style={styles.cameraImgOverlay}
      /> */}

      <FaceDetection previewSize={previewSize} />
    </View>
  );
};

export default RenderCamera;

const styles = StyleSheet.create({
  cameraImgOverlay: {
    resizeMode: 'stretch',
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  container: {
    height: '100%',
    // width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  preview: {
    height: '100%',
    aspectRatio: '7/9',
  },
  image: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
  },
});
