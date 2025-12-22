import {Buffer} from 'buffer';
import moment from 'moment';
import RNFS from 'react-native-fs';
import * as ZipArchive from 'react-native-zip-archive';

/**
 * Gets the date-based directory path (YYYY-MM-DD) with reading ID
 * @param readingId - The unique reading ID
 * @returns The date directory path
 */
const getDateDirectory = (readingId: string | number[]): string => {
  const dateStr = moment().format('YYYY-MM-DD');
  return `${RNFS.DocumentDirectoryPath}/facescan/${dateStr}/${readingId}`;
};

/**
 * Ensures the date-based directory exists
 * @param readingId - The unique reading ID
 * @returns The date directory path
 */
const ensureDateDirectory = async (
  readingId: string | number[],
): Promise<string> => {
  const dateDir = getDateDirectory(readingId);
  const exists = await RNFS.exists(dateDir);

  if (!exists) {
    await RNFS.mkdir(dateDir);
  }

  return dateDir;
};

/**
 * Formats frame number as a 3-digit string (e.g., 001, 002, 003)
 * @param frameNumber - The frame number
 * @returns Formatted frame number string
 */
const formatFrameNumber = (frameNumber: number): string => {
  return `frame_${String(frameNumber).padStart(3, '0')}`;
};

/**
 * Saves a captured frame to a date-based directory with sequential numbering
 * @param readingId - The unique reading ID
 * @param base64Data - Base64 encoded image data
 * @param frameNumber - The sequential frame number (1, 2, 3, ...)
 * @returns The file path where the image was saved
 */
export const saveFaceScanFrame = async (
  readingId: string | number[],
  base64Data: string,
  frameNumber: number,
): Promise<string> => {
  try {
    const dateDir = await ensureDateDirectory(readingId);
    const frameName = formatFrameNumber(frameNumber);
    const fileName = `${frameName}.jpg`;
    const filePath = `${dateDir}/${fileName}`;

    // Remove data URI prefix if present (data:image/jpeg;base64,)
    const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');

    await RNFS.writeFile(filePath, cleanBase64, 'base64');

    console.log(`Frame saved: ${filePath}`);
    return filePath;
  } catch (error) {
    console.error('Error saving face scan frame:', error);
    throw error;
  }
};

/**
 * Lists all saved frames for a specific reading ID in the current date directory
 * @param readingId - The unique reading ID
 * @returns Array of file paths sorted by frame number
 */
export const listFaceScanFrames = async (
  readingId: string | number[],
): Promise<string[]> => {
  try {
    const dateDir = getDateDirectory(readingId);
    const exists = await RNFS.exists(dateDir);

    if (!exists) {
      console.log(`No frames found for date directory: ${dateDir}`);
      return [];
    }

    const files = await RNFS.readDir(dateDir);

    const faceScanFiles = files
      .filter(
        file => file.name.startsWith('frame_') && file.name.endsWith('.jpg'),
      )
      .sort((a, b) => {
        // Extract frame numbers and sort numerically
        const frameNumA = parseInt(a.name.match(/frame_(\d+)/)?.[1] || '0', 10);
        const frameNumB = parseInt(b.name.match(/frame_(\d+)/)?.[1] || '0', 10);
        return frameNumA - frameNumB;
      })
      .map(file => file.path);

    console.log(
      `Found ${faceScanFiles.length} frames for reading ${readingId}`,
    );

    return faceScanFiles;
  } catch (error) {
    console.error('Error listing face scan frames:', error);
    return [];
  }
};

/**
 * Deletes all saved frames for a specific reading ID
 * @param readingId - The unique reading ID
 * @returns Number of files deleted
 */
export const deleteFaceScanFrames = async (
  readingId: string | number[],
): Promise<number> => {
  try {
    const frames = await listFaceScanFrames(readingId);

    let deletedCount = 0;
    for (const filePath of frames) {
      try {
        const exists = await RNFS.exists(filePath);
        if (exists) {
          await RNFS.unlink(filePath);
          deletedCount++;
        }
      } catch (error) {
        console.error(`Error deleting file ${filePath}:`, error);
      }
    }

    // Try to remove the directory if it's empty
    try {
      const dateDir = getDateDirectory(readingId);
      const files = await RNFS.readDir(dateDir);
      if (files.length === 0) {
        await RNFS.unlink(dateDir);
      }
    } catch (error) {
      // Ignore errors when trying to remove directory
    }

    console.log(`Deleted ${deletedCount} frames for reading ${readingId}`);

    return deletedCount;
  } catch (error) {
    console.error('Error deleting face scan frames:', error);
    return 0;
  }
};

/**
 * Deletes a specific frame file
 * @param filePath - The full path to the file
 */
export const deleteFaceScanFrame = async (filePath: string): Promise<void> => {
  try {
    const exists = await RNFS.exists(filePath);
    if (exists) {
      await RNFS.unlink(filePath);
      console.log(`Deleted frame: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error deleting frame ${filePath}:`, error);
  }
};

/**
 * Zips all frames for a specific reading ID and returns the zip file path
 * @param readingId - The unique reading ID
 * @returns The path to the created zip file
 */
export const zipFaceScanFrames = async (
  readingId: string | number[],
): Promise<string> => {
  try {
    console.log('readingId', readingId);
    const frames = await listFaceScanFrames(readingId);

    if (frames.length === 0) {
      throw new Error('No frames found to zip');
    }

    const dateDir = getDateDirectory(readingId);
    // Put zip file in parent directory to avoid including it in the zip
    const dateStr = moment().format('YYYY-MM-DD');
    const parentDir = `${RNFS.DocumentDirectoryPath}/facescan/${dateStr}`;
    const zipFileName = `facescan-${readingId}-${Date.now()}.zip`;
    const zipFilePath = `${parentDir}/${zipFileName}`;

    // Ensure parent directory exists
    const parentExists = await RNFS.exists(parentDir);
    if (!parentExists) {
      await RNFS.mkdir(parentDir);
    }

    // Zip the directory containing all frames
    // react-native-zip-archive zip function: zip(sourcePath, targetPath)
    // For version 7.0.2, we zip the directory which includes all frame files
    if (!ZipArchive || !ZipArchive.zip) {
      throw new Error(
        'react-native-zip-archive module is not properly linked. Please ensure pods are installed and the app is rebuilt.',
      );
    }

    // Ensure the source directory exists before zipping
    const dirExists = await RNFS.exists(dateDir);
    if (!dirExists) {
      throw new Error(`Source directory does not exist: ${dateDir}`);
    }

    await ZipArchive.zip(dateDir, zipFilePath);

    console.log(`Zipped ${frames.length} frames to: ${zipFilePath}`);
    return zipFilePath;
  } catch (error) {
    console.error('Error zipping face scan frames:', error);
    throw error;
  }
};

/**
 * Reads a zip file as binary data
 * @param zipFilePath - The path to the zip file
 * @returns Binary data as Buffer
 */
export const readZipFileAsBinary = async (
  zipFilePath: string,
): Promise<Buffer> => {
  try {
    const base64Data = await RNFS.readFile(zipFilePath, 'base64');
    return Buffer.from(base64Data, 'base64');
  } catch (error) {
    console.error('Error reading zip file as binary:', error);
    throw error;
  }
};
