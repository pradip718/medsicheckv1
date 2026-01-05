import {Session} from 'biosensesignal-react-native-sdk';
import RNFS from 'react-native-fs';

/**
 * Start video recording using SDK's internal video recording
 */
export async function startSDKVideoRecording(
  session: Session,
  readingId: string | number[],
  width: number = 0,
  height: number = 0,
  fps: number = 30,
): Promise<string> {
  const videoFileName = `facescan-${
    Array.isArray(readingId) ? readingId.join('-') : readingId
  }-${Date.now()}.mp4`;
  const videoOutputPath = `${RNFS.DocumentDirectoryPath}/${videoFileName}`;

  await session.startVideoRecording(videoOutputPath, width, height, fps);
  return videoOutputPath;
}

/**
 * Stop video recording and return the video file path
 */
export async function stopSDKVideoRecording(
  session: Session,
): Promise<string | null> {
  return await session.stopVideoRecording();
}
