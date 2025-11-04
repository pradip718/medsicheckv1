import {CameraPreviewView} from 'biosensesignal-react-native-sdk';
import {Buffer} from 'buffer';
import React, {RefObject, useEffect, useRef, useState} from 'react';
import {
  // Image,
  LayoutChangeEvent,
  LayoutRectangle,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import RNFS from 'react-native-fs';
import ViewShot from 'react-native-view-shot';
// import {CameraHeadPosition} from '../../../../assets';
import {twMerge} from 'tailwind-merge';
import useLanguageStore from '../../../../store/languageStore';
import {errorToast, successToast} from '../../../../utils/toast';
import {useUploadFacescanImage} from '../../../hooks/api/report';
import FaceDetection from './FaceDetection';
interface RenderCameraProps {
  didFinishedMeasuring: boolean;
  progress: number;
  readingId: string | number[];
  imageValidity: string | undefined;
  isRecording: boolean; // New prop to control recording
}

const RenderCamera = ({
  progress,
  readingId,
  imageValidity,
  isRecording,
}: RenderCameraProps) => {
  console.log('🎥 RenderCamera component rendering...');

  // Verify critical modules are loaded
  if (!RNFS) {
    console.error('❌ RNFS module not loaded!');
  }
  if (!ViewShot) {
    console.error('❌ ViewShot module not loaded!');
  }
  if (!StyleSheet) {
    console.error('❌ StyleSheet not loaded!');
  }

  const ref: RefObject<ViewShot> = useRef(null);
  const {languages} = useLanguageStore();
  const [isScreenRecording, setIsScreenRecording] = useState<boolean>(false);
  const [capturedFrames, setCapturedFrames] = useState<string[]>([]);
  const [isViewShotReady, setIsViewShotReady] = useState<boolean>(false);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const frameCountRef = useRef<number>(0);
  const recordingDirRef = useRef<string>('');

  const {mutateAsync: uploadImage} = useUploadFacescanImage();

  // Check if ViewShot is ready
  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 50; // 5 seconds max wait

    const checkViewShotReady = () => {
      if (ref?.current?.capture) {
        setIsViewShotReady(true);
        console.log('✅ ViewShot is ready for capture');
      } else {
        retryCount++;
        if (retryCount < maxRetries) {
          console.log(
            `⏳ Waiting for ViewShot to mount... (attempt ${retryCount}/${maxRetries})`,
          );
          setTimeout(checkViewShotReady, 100);
        } else {
          console.error('❌ ViewShot failed to mount after 5 seconds');
          errorToast('Camera initialization failed');
        }
      }
    };

    // Small delay to ensure component is mounted
    setTimeout(checkViewShotReady, 300);
  }, []);

  const convertToBinaryAndSend = async (base64Data: string) => {
    try {
      const binaryData = Buffer.from(base64Data, 'base64');

      return uploadImage({reading_id: readingId, data: binaryData});
    } catch (error) {
      console.log('error', error);

      errorToast(languages?.generic_error_message);
    }
  };

  // Capture and immediately save a single frame
  const captureAndSaveFrame = async (frameNumber: number) => {
    // Multiple safety checks
    if (!ref) {
      console.log('ViewShot ref is null');
      return null;
    }

    if (!ref.current) {
      console.log('ViewShot ref.current is null - component not mounted yet');
      return null;
    }

    if (typeof ref.current.capture !== 'function') {
      console.log('ViewShot capture method not available');
      return null;
    }

    try {
      // Capture frame as base64
      const base64Data = await ref.current.capture();

      if (!base64Data) {
        console.log('Capture returned empty data');
        return null;
      }

      // Convert base64 to file and save to permanent storage
      const framePath = `${recordingDirRef.current}/frame_${String(
        frameNumber,
      ).padStart(5, '0')}.jpg`;

      // Remove base64 header if present
      const base64Image = base64Data.replace(/^data:image\/\w+;base64,/, '');

      // Verify RNFS.writeFile is available
      if (!RNFS || !RNFS.writeFile) {
        console.error('❌ RNFS.writeFile not available');
        return null;
      }

      // Write directly to permanent storage
      await RNFS.writeFile(framePath, base64Image, 'base64');

      return framePath;
    } catch (error) {
      console.log('Frame capture/save error:', error);
      return null;
    }
  };

  // Start recording camera view only (not entire screen)
  const startScreenRecording = async () => {
    if (isScreenRecording) {
      console.log('Already recording');
      return;
    }

    // Check for readingId
    if (!readingId) {
      console.log('⚠️ No reading ID yet, cannot start recording');
      return;
    }

    // Wait for ViewShot to be fully mounted and ready
    if (!isViewShotReady || !ref?.current) {
      console.log('⚠️ ViewShot not ready yet, waiting 500ms...');
      setTimeout(startScreenRecording, 500);
      return;
    }

    console.log('📹 Starting camera view recording...');
    console.log('🎥 Recording ONLY the camera preview area');
    console.log('✅ ViewShot is ready and mounted');
    console.log(`📋 Reading ID: ${readingId}`);

    // Create recording directory first
    const recordingDir = `${
      Platform.OS === 'ios'
        ? RNFS.DocumentDirectoryPath
        : RNFS.ExternalDirectoryPath
    }/FacescanRecordings/${readingId}`;

    recordingDirRef.current = recordingDir;

    // Verify RNFS is available
    if (!RNFS || !RNFS.mkdir) {
      console.error(
        '❌ RNFS not available - cannot create recording directory',
      );
      errorToast('File system not available');
      return;
    }

    try {
      await RNFS.mkdir(recordingDir);
      console.log(`📁 Created directory: ${recordingDir}`);
    } catch (error: any) {
      // Directory might already exist, which is OK
      if (error.code !== 'EEXIST') {
        console.error('Directory creation error:', error);
        errorToast('Failed to create recording directory');
        return;
      }
      console.log('📁 Directory already exists, using existing');
    }

    setIsScreenRecording(true);
    setCapturedFrames([]);
    frameCountRef.current = 0;

    // Capture and save frames at 10 FPS (every 100ms) for smooth video
    recordingIntervalRef.current = setInterval(async () => {
      try {
        const framePath = await captureAndSaveFrame(frameCountRef.current);
        if (framePath) {
          frameCountRef.current += 1;
          setCapturedFrames(prev => [...prev, framePath]);

          // Log every 10 frames
          if (frameCountRef.current % 10 === 0) {
            console.log(`💾 Saved ${frameCountRef.current} frames...`);
          }
        } else {
          console.log(
            `⚠️ Frame ${frameCountRef.current} capture failed, skipping...`,
          );
        }
      } catch (error) {
        console.error('Interval capture error:', error);
      }
    }, 100); // 10 FPS
  };

  // Create video from frames using FFmpeg
  // const createVideoFromFrames = async (frameCount: number) => {
  //   try {
  //     // Dynamically import FFmpeg
  //     const FFmpegModule = require('ffmpeg-kit-react-native');
  //     const {FFmpegKit, ReturnCode} = FFmpegModule;

  //     const recordingDir = recordingDirRef.current;
  //     const videoPath = `${recordingDir}/facescan-video.mp4`;

  //     console.log('');
  //     console.log('🎬 Converting frames to video...');
  //     console.log(`   Processing ${frameCount} frames`);
  //     console.log('   Output: facescan-video.mp4');

  //     // FFmpeg command to create video from image sequence
  //     // -framerate 10: 10 FPS
  //     // -start_number 0: Start from frame_00000.jpg
  //     // -i frame_%05d.jpg: Input pattern (5 digit padding)
  //     // -c:v libx264: H.264 codec
  //     // -pix_fmt yuv420p: Pixel format compatible with most players
  //     // -y: Overwrite output file if exists
  //     const command = `-framerate 10 -start_number 0 -i ${recordingDir}/frame_%05d.jpg -c:v libx264 -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" -y ${videoPath}`;

  //     console.log(`   FFmpeg command: ${command}`);

  //     const session = await FFmpegKit.execute(command);
  //     const returnCode = await session.getReturnCode();

  //     if (ReturnCode.isSuccess(returnCode)) {
  //       console.log('');
  //       console.log('✅ Video created successfully!');
  //       console.log(`🎥 Video path: ${videoPath}`);

  //       // Get video file size
  //       const videoInfo = await RNFS.stat(videoPath);
  //       console.log(
  //         `📊 Video size: ${(videoInfo.size / 1024 / 1024).toFixed(2)} MB`,
  //       );

  //       return videoPath;
  //     } else {
  //       console.error('');
  //       console.error('❌ FFmpeg failed with return code:', returnCode);
  //       const output = await session.getOutput();
  //       console.error('FFmpeg output:', output);
  //       return null;
  //     }
  //   } catch (error: any) {
  //     if (error.message?.includes('Cannot find module')) {
  //       console.log('');
  //       console.log('ℹ️  FFmpeg not installed - video creation skipped');
  //       console.log('   Frames are saved and ready to use!');
  //       console.log('');
  //     } else {
  //       console.error('');
  //       console.error('❌ Video creation error:', error);
  //     }
  //     return null;
  //   }
  // };

  // Create manifest file for the recording
  const createManifest = async (frames: string[], videoPath: string | null) => {
    try {
      const recordingDir = recordingDirRef.current;

      // Create manifest file with recording metadata
      const manifest = {
        readingId: readingId,
        fps: 10,
        frameCount: frames.length,
        duration: frames.length * 0.1,
        recordedAt: new Date().toISOString(),
        platform: Platform.OS,
        frames: frames,
        videoPath: videoPath || null,
      };

      const manifestPath = `${recordingDir}/manifest.json`;
      await RNFS.writeFile(manifestPath, JSON.stringify(manifest, null, 2));

      console.log('✅ Manifest saved successfully!');
      console.log(`📁 Location: ${recordingDir}`);
      console.log(`📄 Manifest: ${manifestPath}`);
      console.log(`🎞️  Total frames: ${frames.length}`);
      if (videoPath) {
        console.log(`🎥 Video: ${videoPath}`);
      }

      return {recordingDir, manifestPath, videoPath};
    } catch (error) {
      console.error('❌ Failed to create manifest:', error);
      throw error;
    }
  };

  // Stop recording and create manifest
  const stopScreenRecording = async () => {
    if (!isScreenRecording) {
      return;
    }

    console.log('⏹️ Stopping camera view recording...');

    // Clear the interval
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }

    setIsScreenRecording(false);

    // Calculate recording info
    const duration = frameCountRef.current * 0.1; // 10 FPS = 0.1s per frame
    console.log(
      `✅ Recording complete: ${capturedFrames.length} frames captured and saved`,
    );
    console.log(`⏱️  Duration: ~${duration.toFixed(1)}s`);
    console.log('🎬 FPS: 10');

    // Calculate total size
    try {
      let totalSize = 0;
      for (const frame of capturedFrames) {
        const fileInfo = await RNFS.stat(frame);
        totalSize += fileInfo.size;
      }
      console.log(`💾 Total size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
    } catch (error) {
      console.log('Size calculation error:', error);
    }

    // Create manifest file (video creation disabled for now)
    try {
      console.log('');
      console.log('📝 Step 2: Creating manifest file...');
      const videoPath = null; // Video creation disabled
      const result = await createManifest(capturedFrames, videoPath);

      successToast(`Recording saved! ${capturedFrames.length} frames`);

      console.log('');
      console.log('🎉 ========================================');
      console.log('✅ RECORDING SAVED SUCCESSFULLY!');
      console.log('🎉 ========================================');
      console.log('');
      console.log('📊 Summary:');
      console.log(`   • Frames: ${capturedFrames.length}`);
      console.log(
        `   • Duration: ~${(capturedFrames.length * 0.1).toFixed(1)}s`,
      );
      console.log('   • FPS: 10');
      console.log('');
      console.log('📁 Storage Location:');
      console.log(`   → ${result.recordingDir}`);
      console.log('');
      console.log('📄 Files Created:');
      console.log(
        `   • ${capturedFrames.length} frame files (frame_00000.jpg, ...)`,
      );
      console.log('   • 1 manifest file (manifest.json)');
      console.log('');
      console.log('✨ Status:');
      console.log('   ✓ Frames ready for upload to server');
      console.log('   ✓ Frames ready for analysis');
      console.log(
        '   ✓ Can be converted to video later (server-side or manual)',
      );
      console.log('');
      console.log('💡 Tip: Use these frames to create video on your server');
      console.log('   Or convert locally using FFmpeg CLI after recording');
      console.log('');
    } catch (error) {
      console.error('❌ Failed to create manifest:', error);
      errorToast('Failed to save recording');
    }
  };

  // Control recording based on isRecording prop
  useEffect(() => {
    if (isRecording && !isScreenRecording) {
      // Start recording when scan begins
      startScreenRecording();
    } else if (!isRecording && isScreenRecording) {
      // Stop recording when scan ends
      stopScreenRecording();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, []);

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
        // Safety checks
        if (!ref || !ref.current) {
          console.log('ViewShot not ready for image capture');
          return;
        }

        if (typeof ref.current.capture !== 'function') {
          console.log('ViewShot capture method not available');
          return;
        }

        ref.current
          .capture()
          .then((base64: string) => {
            convertToBinaryAndSend(base64);
          })
          .catch((error: Error) => {
            console.log('Image capture error:', error);
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
      {/* Single ViewShot for both image capture and video recording */}
      <ViewShot
        ref={ref}
        options={{
          fileName: `facescan-reading_id-${readingId}`,
          format: 'jpg',
          quality: 0.8, // Higher quality for video frames
          result: 'base64',
        }}>
        <CameraPreviewView style={styles.preview} />
      </ViewShot>

      {/* <Image
        source={CameraHeadPosition as any}
        style={styles.cameraImgOverlay}
      /> */}

      <FaceDetection previewSize={previewSize} />

      {/* Camera view recording indicator */}
      {isScreenRecording && (
        <View style={styles.recordingIndicator}>
          <View style={styles.recordingDot} />
        </View>
      )}
    </View>
  );
};

export default RenderCamera;

const styles = (() => {
  try {
    if (!StyleSheet || typeof StyleSheet.create !== 'function') {
      console.error('❌ StyleSheet.create is not available!');
      console.error('StyleSheet object:', StyleSheet);
      return {
        cameraImgOverlay: {},
        container: {},
        preview: {},
        image: {},
        recordingIndicator: {},
        recordingDot: {},
      };
    }

    return StyleSheet.create({
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
      recordingIndicator: {
        position: 'absolute',
        top: 10,
        right: 10,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 0, 0, 0.8)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
      },
      recordingDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#fff',
      },
    });
  } catch (error) {
    console.error('❌ Error creating styles:', error);
    return {
      cameraImgOverlay: {},
      container: {},
      preview: {},
      image: {},
      recordingIndicator: {},
      recordingDot: {},
    };
  }
})();
