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
import {saveFaceScanFrame} from '../../../../utils/faceScanStorage';
import {errorToast} from '../../../../utils/toast';
import {useUploadFacescanImage} from '../../../hooks/api/report';
import FaceDetection from './FaceDetection';
interface RenderCameraProps {
  didFinishedMeasuring: boolean;
  progress: number;
  readingId: string | number[];
  imageValidity: string | undefined;
  fakeRecording: boolean;
}

const RenderCamera = ({
  progress,
  readingId,
  imageValidity,
  fakeRecording,
}: RenderCameraProps) => {
  const ref: RefObject<ViewShot> = useRef(null);
  const {languages} = useLanguageStore();
  const lastCaptureTimeRef = useRef<number>(0);
  const savedFramesRef = useRef<string[]>([]);
  const frameNumberRef = useRef<number>(0);

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

  // Every-second capture for local storage - runs independently in parallel
  useEffect(() => {
    if (!fakeRecording) {
      // Reset when not recording
      lastCaptureTimeRef.current = 0;
      frameNumberRef.current = 0;
      return;
    }

    const captureFrameLocally = () => {
      const now = Date.now();
      const elapsed = now - lastCaptureTimeRef.current;

      // Capture every ~33ms (30 frames per second)
      if (elapsed >= 33 || lastCaptureTimeRef.current === 0) {
        // Update timestamp IMMEDIATELY before any async work
        // This ensures the interval timer continues smoothly regardless of what happens next
        lastCaptureTimeRef.current = now;

        // Check ref validity before deferring
        if (!ref?.current || !ref?.current?.capture) {
          return;
        }

        // Increment frame number immediately (before any async work)
        const currentFrameNumber = frameNumberRef.current + 1;
        frameNumberRef.current = currentFrameNumber;

        // Defer ALL async work to next event loop tick
        // This ensures the interval timer callback returns immediately
        // Critical on iOS where capture() and file I/O can block
        setTimeout(() => {
          // Fire and forget - run completely in parallel, never block interval
          (async () => {
            try {
              // Double-check ref is still valid (may have changed during defer)
              if (!ref?.current || !ref?.current?.capture) {
                return;
              }

              // Capture frame (may take time on iOS, but won't block interval)
              const base64: string = await ref.current.capture();

              // Defer file I/O to another tick to ensure it never blocks
              // This is especially important on iOS where RNFS.writeFile can be slow
              setTimeout(() => {
                saveFaceScanFrame(readingId, base64, currentFrameNumber)
                  .then(filePath => {
                    savedFramesRef.current.push(filePath);
                  })
                  .catch(error => {
                    // Log error but don't throw - frame storage failure shouldn't affect scan
                    console.error(
                      'Error saving frame locally (non-blocking):',
                      error,
                    );
                  });
              }, 0);
            } catch (error) {
              // Log error but don't throw - capture failure shouldn't affect scan
              console.error('Error capturing frame (non-blocking):', error);
            }
          })();
        }, 0);
      }
    };

    const intervalId = setInterval(captureFrameLocally, 100); // Check every 100ms

    return () => {
      clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fakeRecording, readingId]);

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
