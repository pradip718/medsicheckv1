# Android Video Recording Implementation Guide

This document describes all the changes needed to implement video recording functionality in the Android SDK.

## Files to Modify

1. **SessionManager.kt** - Core video recording implementation
2. **BiosenseSignalReactNativeSDK.kt** - React Native bridge methods
3. **Session.ts** - TypeScript definitions (JavaScript interface)

---

## 1. SessionManager.kt

**Location:** `node_modules/biosensesignal-react-native-sdk/android/src/main/java/com/biosensesignal/react_native_sdk/SessionManager.kt`

### Step 1: Add Imports

Add these imports at the top of the file (after existing imports):

```kotlin
import android.graphics.Bitmap
import android.media.MediaCodec
import android.media.MediaCodecInfo
import android.media.MediaFormat
import android.media.MediaMuxer
import android.os.Build
import android.os.Handler
import android.os.HandlerThread
import java.nio.ByteBuffer
import java.io.File
```

### Step 2: Add Video Recording Properties

Add these properties inside the `SessionManager` object (after `var eventChannel: BiosenseSignalEventEmitter? = null`):

```kotlin
// Video recording properties
private var mediaCodec: MediaCodec? = null
private var mediaMuxer: MediaMuxer? = null
private var isRecordingVideo: Boolean = false
private var videoOutputPath: String? = null
private var frameCount: Int = 0
private var videoTrackIndex: Int = -1
private var videoWidth: Int = 0
private var videoHeight: Int = 0
private var videoFps: Int = 30
private var startTimeUs: Long = 0
private var isVideoInitialized: Boolean = false
private var selectedColorFormat: Int = -1
private var videoRecordingHandler: Handler? = null
private var videoRecordingThread: HandlerThread? = null
```

### Step 3: Update `onImage` Method

Modify the `onImage` method to record frames:

```kotlin
override fun onImage(imageData: ImageData) {
    eventChannel?.sendEvent(NativeBridgeEvents.imageData, imageData.toMap())
    _images.tryEmit(imageData)

    // Record frame to video if recording
    if (isRecordingVideo) {
        if (imageData.image is Bitmap) {
            videoRecordingHandler?.post {
                recordFrame(imageData.image as Bitmap)
            }
        } else {
            if (frameCount == 0 || frameCount % 30 == 0) {
                android.util.Log.w("SessionManager", "Video recording: Frame $frameCount - image is not Bitmap, type: ${imageData.image?.javaClass?.simpleName}")
            }
        }
    }
}
```

### Step 4: Add Video Recording Methods

Add these methods before the `resolveDeviceOrientation` method (around line 262):

```kotlin
// MARK: Video Recording

@Throws(HealthMonitorException::class)
fun startVideoRecording(outputPath: String, width: Int, height: Int, fps: Int) {
    android.util.Log.d("SessionManager", "Video recording: startVideoRecording called - outputPath: $outputPath, width: $width, height: $height, fps: $fps")

    if (isRecordingVideo) {
        android.util.Log.w("SessionManager", "Video recording: Already recording, throwing exception")
        throw HealthMonitorException("VIDEO_RECORDING", -1)
    }

    this.videoOutputPath = outputPath
    this.videoFps = fps
    this.frameCount = 0
    this.videoTrackIndex = -1
    this.startTimeUs = System.nanoTime() / 1000
    this.isVideoInitialized = false

    // Initialize background thread for video recording
    videoRecordingThread = HandlerThread("VideoRecordingThread").apply {
        start()
    }
    videoRecordingHandler = Handler(videoRecordingThread?.looper!!)

    if (width > 0 && height > 0) {
        this.videoWidth = width
        this.videoHeight = height
        android.util.Log.d("SessionManager", "Video recording: Using provided dimensions - width: $width, height: $height")
        initializeVideoEncoder()
    } else {
        this.videoWidth = 0
        this.videoHeight = 0
        android.util.Log.d("SessionManager", "Video recording: Auto-detection mode (width=0, height=0), will detect from first frame")
    }

    isRecordingVideo = true
    android.util.Log.d("SessionManager", "Video recording: Recording started successfully, isRecordingVideo: $isRecordingVideo")
}

private fun initializeVideoEncoder() {
    if (videoWidth <= 0 || videoHeight <= 0) {
        return
    }

    if (isVideoInitialized) {
        return
    }

    val outputPath = this.videoOutputPath ?: return

    val file = File(outputPath)
    if (file.exists()) {
        file.delete()
    }

    try {
        val format = MediaFormat.createVideoFormat(MediaFormat.MIMETYPE_VIDEO_AVC, videoWidth, videoHeight)

        val codec = MediaCodec.createEncoderByType(MediaFormat.MIMETYPE_VIDEO_AVC)
        val codecInfo = codec.codecInfo
        val capabilities = codecInfo.getCapabilitiesForType(MediaFormat.MIMETYPE_VIDEO_AVC)
        val colorFormats = capabilities.colorFormats

        var selectedColorFormat = -1
        for (colorFormat in colorFormats) {
            if (colorFormat == MediaCodecInfo.CodecCapabilities.COLOR_FormatYUV420Flexible ||
                colorFormat == MediaCodecInfo.CodecCapabilities.COLOR_FormatYUV420Planar ||
                colorFormat == MediaCodecInfo.CodecCapabilities.COLOR_FormatYUV420SemiPlanar) {
                selectedColorFormat = colorFormat
                break
            }
        }

        if (selectedColorFormat == -1 && colorFormats.isNotEmpty()) {
            selectedColorFormat = colorFormats[0]
        }

        codec.release()

        if (selectedColorFormat == -1) {
            throw Exception("No supported color format found")
        }

        this.selectedColorFormat = selectedColorFormat
        format.setInteger(MediaFormat.KEY_COLOR_FORMAT, selectedColorFormat)
        format.setInteger(MediaFormat.KEY_BIT_RATE, videoWidth * videoHeight * 4)
        format.setInteger(MediaFormat.KEY_FRAME_RATE, videoFps)
        format.setInteger(MediaFormat.KEY_I_FRAME_INTERVAL, videoFps)

        mediaCodec = MediaCodec.createEncoderByType(MediaFormat.MIMETYPE_VIDEO_AVC)
        mediaCodec?.configure(format, null, null, MediaCodec.CONFIGURE_FLAG_ENCODE)
        mediaCodec?.start()

        mediaMuxer = MediaMuxer(outputPath, MediaMuxer.OutputFormat.MUXER_OUTPUT_MPEG_4)

        val rotation = 0
        mediaMuxer?.setOrientationHint(rotation)
        android.util.Log.d("SessionManager", "Video recording: Encoder initialized - dimensions: ${videoWidth}x${videoHeight}, aspectRatio: ${String.format("%.2f", videoWidth.toFloat() / videoHeight.toFloat())}, colorFormat: $selectedColorFormat, rotation: $rotation degrees (portrait mode, no rotation needed)")

        isVideoInitialized = true
    } catch (e: Exception) {
        android.util.Log.e("SessionManager", "Error initializing video encoder: ${e.message}", e)
        cleanupVideoRecording()
        throw HealthMonitorException("VIDEO_RECORDING", -2)
    }
}

fun stopVideoRecording(): String? {
    android.util.Log.d("SessionManager", "Video recording: stopVideoRecording called - isRecordingVideo: $isRecordingVideo, frameCount: $frameCount")

    if (!isRecordingVideo) {
        android.util.Log.d("SessionManager", "Video recording: Not recording, returning null")
        return null
    }

    android.util.Log.d("SessionManager", "Video recording: Stopping recording, frameCount: $frameCount, videoPath: $videoOutputPath")
    isRecordingVideo = false

    val semaphore = java.util.concurrent.Semaphore(0)

    // Save values before cleanup (they get reset in cleanupVideoRecording)
    val finalVideoTrackIndex = videoTrackIndex
    val finalVideoOutputPath = videoOutputPath

    // Wait for all queued frames to be processed
    videoRecordingHandler?.post {
        try {
            // Send end-of-stream signal and drain remaining frames
            val codec = mediaCodec
            if (codec != null && frameCount > 0) {
                try {
                    val inputBufferIndex = codec.dequeueInputBuffer(10000)
                    if (inputBufferIndex >= 0) {
                        codec.queueInputBuffer(
                            inputBufferIndex,
                            0,
                            0,
                            0,
                            MediaCodec.BUFFER_FLAG_END_OF_STREAM
                        )
                    }

                    // Drain remaining output buffers
                    val bufferInfo = MediaCodec.BufferInfo()
                    var outputBufferIndex = codec.dequeueOutputBuffer(bufferInfo, 10000)
                    while (outputBufferIndex >= 0) {
                        if (videoTrackIndex >= 0 && (bufferInfo.flags and MediaCodec.BUFFER_FLAG_CODEC_CONFIG) == 0) {
                            val outputBuffer = codec.getOutputBuffer(outputBufferIndex)
                            if (outputBuffer != null && bufferInfo.size > 0) {
                                outputBuffer.position(bufferInfo.offset)
                                outputBuffer.limit(bufferInfo.offset + bufferInfo.size)
                                mediaMuxer?.writeSampleData(videoTrackIndex, outputBuffer, bufferInfo)
                            }
                        }

                        if ((bufferInfo.flags and MediaCodec.BUFFER_FLAG_END_OF_STREAM) != 0) {
                            break
                        }

                        codec.releaseOutputBuffer(outputBufferIndex, false)
                        outputBufferIndex = codec.dequeueOutputBuffer(bufferInfo, 10000)
                    }
                } catch (e: Exception) {
                    android.util.Log.e("SessionManager", "Error draining MediaCodec: ${e.message}")
                }
            }

            // Stop and release MediaCodec
            try {
                mediaCodec?.stop()
            } catch (e: Exception) {
                android.util.Log.e("SessionManager", "Error stopping MediaCodec: ${e.message}")
            }

            try {
                mediaCodec?.release()
            } catch (e: Exception) {
                android.util.Log.e("SessionManager", "Error releasing MediaCodec: ${e.message}")
            }
            mediaCodec = null

            // Stop MediaMuxer only if track was added
            try {
                if (videoTrackIndex >= 0 && mediaMuxer != null) {
                    mediaMuxer?.stop()
                    android.util.Log.d("SessionManager", "Video recording stopped successfully with $frameCount frames")
                } else {
                    android.util.Log.w("SessionManager", "No video track added, skipping MediaMuxer stop")
                }
            } catch (e: Exception) {
                android.util.Log.e("SessionManager", "Error stopping MediaMuxer: ${e.message}")
            }

            try {
                mediaMuxer?.release()
            } catch (e: Exception) {
                android.util.Log.e("SessionManager", "Error releasing MediaMuxer: ${e.message}")
            }
            mediaMuxer = null
        } finally {
            cleanupVideoRecording()
            semaphore.release()
        }
    }

    // Wait for processing to complete (max 5 seconds)
    try {
        if (!semaphore.tryAcquire(5, java.util.concurrent.TimeUnit.SECONDS)) {
            android.util.Log.w("SessionManager", "Video recording: Timeout waiting for frame processing")
        }
    } catch (e: InterruptedException) {
        android.util.Log.e("SessionManager", "Video recording: Interrupted while waiting for frame processing", e)
    }

    // Only return path if we actually created a valid video file
    // Use saved values since cleanupVideoRecording() resets them
    if (finalVideoTrackIndex >= 0 && finalVideoOutputPath != null) {
        val file = File(finalVideoOutputPath)
        if (file.exists() && file.length() > 0) {
            android.util.Log.d("SessionManager", "Video file created: ${finalVideoOutputPath}, size: ${file.length()} bytes")
            return finalVideoOutputPath
        } else {
            android.util.Log.w("SessionManager", "Video file is empty or doesn't exist at: ${finalVideoOutputPath}")
        }
    } else {
        android.util.Log.w("SessionManager", "No valid video track was created (frameCount: $frameCount, videoTrackIndex: $finalVideoTrackIndex, videoPath: $finalVideoOutputPath)")
    }

    return null
}

private fun cleanupVideoRecording() {
    try {
        mediaCodec?.stop()
        mediaCodec?.release()
    } catch (e: Exception) {
        // Ignore
    }
    mediaCodec = null

    try {
        mediaMuxer?.stop()
        mediaMuxer?.release()
    } catch (e: Exception) {
        // Ignore
    }
    mediaMuxer = null

    videoRecordingThread?.quitSafely()
    videoRecordingThread = null
    videoRecordingHandler = null

    isRecordingVideo = false
    isVideoInitialized = false
    videoTrackIndex = -1
    frameCount = 0
    videoWidth = 0
    videoHeight = 0
    selectedColorFormat = -1
}

private fun recordFrame(bitmap: Bitmap) {
    if (!isRecordingVideo) {
        return
    }

    try {
        if (!isVideoInitialized) {
            videoWidth = bitmap.width
            videoHeight = bitmap.height
            android.util.Log.d("SessionManager", "Video recording: Detected dimensions from first frame - width: $videoWidth, height: $videoHeight, aspectRatio: ${videoWidth.toFloat() / videoHeight.toFloat()}")
            initializeVideoEncoder()
            if (!isVideoInitialized) {
                return
            }
            android.util.Log.d("SessionManager", "Video recording: Encoder initialized with dimensions - width: $videoWidth, height: $videoHeight")
        }

        if (mediaCodec == null) {
            return
        }

        var processedBitmap = bitmap
        val needsScaling = bitmap.width != videoWidth || bitmap.height != videoHeight

        if (needsScaling) {
            val bitmapAspectRatio = bitmap.width.toFloat() / bitmap.height.toFloat()
            val videoAspectRatio = videoWidth.toFloat() / videoHeight.toFloat()
            android.util.Log.w("SessionManager", "Video recording: Bitmap dimensions mismatch - bitmap: ${bitmap.width}x${bitmap.height} (AR: ${String.format("%.2f", bitmapAspectRatio)}), video: ${videoWidth}x${videoHeight} (AR: ${String.format("%.2f", videoAspectRatio)}), scaling required")
            if (kotlin.math.abs(bitmapAspectRatio - videoAspectRatio) > 0.01f) {
                android.util.Log.e("SessionManager", "Video recording: ASPECT RATIO MISMATCH - This will cause stretching! Bitmap AR: ${String.format("%.2f", bitmapAspectRatio)}, Video AR: ${String.format("%.2f", videoAspectRatio)}")
            }
            processedBitmap = Bitmap.createScaledBitmap(bitmap, videoWidth, videoHeight, true)
        } else if (frameCount == 0 || frameCount % 30 == 0) {
            val bitmapAspectRatio = bitmap.width.toFloat() / bitmap.height.toFloat()
            android.util.Log.d("SessionManager", "Video recording: Frame $frameCount - bitmap: ${bitmap.width}x${bitmap.height} (AR: ${String.format("%.2f", bitmapAspectRatio)}), video: ${videoWidth}x${videoHeight}")
        }

        if (processedBitmap.config != Bitmap.Config.ARGB_8888) {
            val argbBitmap = processedBitmap.copy(Bitmap.Config.ARGB_8888, false)
            if (processedBitmap != bitmap) {
                processedBitmap.recycle()
            }
            processedBitmap = argbBitmap
        }

        val yuvData = bitmapToYuv420(processedBitmap, videoWidth, videoHeight)
        encodeFrame(yuvData)

        if (processedBitmap != bitmap) {
            processedBitmap.recycle()
        }

        frameCount++
    } catch (e: Exception) {
        android.util.Log.e("SessionManager", "Error recording frame: ${e.message}", e)
    }
}

private fun bitmapToYuv420(bitmap: Bitmap, width: Int, height: Int): ByteArray {
    val ySize = width * height
    val uvSize = (width / 2) * (height / 2) * 2
    val yuv = ByteArray(ySize + uvSize)
    val pixels = IntArray(width * height)

    bitmap.getPixels(pixels, 0, width, 0, 0, width, height)

    val isSemiPlanar = selectedColorFormat == MediaCodecInfo.CodecCapabilities.COLOR_FormatYUV420SemiPlanar ||
                      selectedColorFormat == MediaCodecInfo.CodecCapabilities.COLOR_FormatYUV420Flexible

    var yIndex = 0

    for (y in 0 until height) {
        for (x in 0 until width) {
            val pixel = pixels[y * width + x]
            val r = (pixel shr 16) and 0xFF
            val g = (pixel shr 8) and 0xFF
            val b = pixel and 0xFF

            val yVal = (0.299 * r + 0.587 * g + 0.114 * b).toInt().coerceIn(0, 255)
            yuv[yIndex++] = yVal.toByte()

            if (y % 2 == 0 && x % 2 == 0) {
                val uVal = (-0.169 * r - 0.331 * g + 0.5 * b + 128).toInt().coerceIn(0, 255)
                val vVal = (0.5 * r - 0.419 * g - 0.081 * b + 128).toInt().coerceIn(0, 255)

                if (isSemiPlanar) {
                    val uvPos = ((y / 2) * (width / 2) + (x / 2)) * 2
                    yuv[ySize + uvPos] = uVal.toByte()
                    yuv[ySize + uvPos + 1] = vVal.toByte()
                } else {
                    val uvOffset = (y / 2) * (width / 2) + (x / 2)
                    yuv[ySize + uvOffset] = uVal.toByte()
                    yuv[ySize + (width / 2) * (height / 2) + uvOffset] = vVal.toByte()
                }
            }
        }
    }

    return yuv
}

private fun encodeFrame(yuvData: ByteArray) {
    val codec = mediaCodec ?: return

    try {
        val inputBufferIndex = codec.dequeueInputBuffer(10000)
        if (inputBufferIndex >= 0) {
            val inputBuffer = codec.getInputBuffer(inputBufferIndex)
            if (inputBuffer != null) {
                val capacity = inputBuffer.capacity()
                if (yuvData.size > capacity) {
                    android.util.Log.w("SessionManager", "YUV data size (${yuvData.size}) exceeds buffer capacity ($capacity), truncating")
                    inputBuffer.put(yuvData, 0, capacity)
                } else {
                    inputBuffer.clear()
                    inputBuffer.put(yuvData)
                }

                val presentationTimeUs = (System.nanoTime() / 1000) - startTimeUs
                val dataSize = yuvData.size.coerceAtMost(capacity)
                codec.queueInputBuffer(
                    inputBufferIndex,
                    0,
                    dataSize,
                    presentationTimeUs,
                    0
                )
            }
        }

        // Process output
        val bufferInfo = MediaCodec.BufferInfo()
        var outputBufferIndex = codec.dequeueOutputBuffer(bufferInfo, 0)

        while (outputBufferIndex >= 0) {
            if (videoTrackIndex == -1) {
                val format = codec.outputFormat
                videoTrackIndex = mediaMuxer?.addTrack(format) ?: -1
                if (videoTrackIndex >= 0) {
                    mediaMuxer?.start()
                }
            }

            if (videoTrackIndex >= 0 && (bufferInfo.flags and MediaCodec.BUFFER_FLAG_CODEC_CONFIG) == 0) {
                val outputBuffer = codec.getOutputBuffer(outputBufferIndex)
                if (outputBuffer != null && bufferInfo.size > 0) {
                    outputBuffer.position(bufferInfo.offset)
                    outputBuffer.limit(bufferInfo.offset + bufferInfo.size)
                    mediaMuxer?.writeSampleData(videoTrackIndex, outputBuffer, bufferInfo)
                }
            }

            codec.releaseOutputBuffer(outputBufferIndex, false)
            outputBufferIndex = codec.dequeueOutputBuffer(bufferInfo, 0)
        }
    } catch (e: Exception) {
        android.util.Log.e("SessionManager", "Error encoding frame: ${e.message}", e)
    }
}
```

---

## 2. BiosenseSignalReactNativeSDK.kt

**Location:** `node_modules/biosensesignal-react-native-sdk/android/src/main/java/com/biosensesignal/react_native_sdk/BiosenseSignalReactNativeSDK.kt`

### Add Bridge Methods

Add these methods after the `getState` method (around line 127):

```kotlin
@ReactMethod
fun startVideoRecording(outputPath: String, width: Int, height: Int, fps: Int, promise: Promise) {
    android.util.Log.d("BiosenseSignalReactNativeSDK", "Video recording: Bridge startVideoRecording called - outputPath: $outputPath, width: $width, height: $height, fps: $fps")
    try {
        SessionManager.startVideoRecording(outputPath, width, height, fps)
        android.util.Log.d("BiosenseSignalReactNativeSDK", "Video recording: Bridge startVideoRecording succeeded")
        promise.resolve(null)
    } catch (e: HealthMonitorException) {
        android.util.Log.e("BiosenseSignalReactNativeSDK", "Video recording: Bridge startVideoRecording failed - ${e.domain}: ${e.errorCode}")
        promise.reject(e.errorCode.toString(), e.domain, e)
    }
}

@ReactMethod
fun stopVideoRecording(promise: Promise) {
    android.util.Log.d("BiosenseSignalReactNativeSDK", "Video recording: Bridge stopVideoRecording called")
    try {
        val outputPath = SessionManager.stopVideoRecording()
        android.util.Log.d("BiosenseSignalReactNativeSDK", "Video recording: Bridge stopVideoRecording succeeded - outputPath: $outputPath")
        // Resolve with null if no video was recorded (graceful failure)
        promise.resolve(outputPath)
    } catch (e: Exception) {
        android.util.Log.e("BiosenseSignalReactNativeSDK", "Video recording: Bridge stopVideoRecording failed - ${e.message}", e)
        // Only reject if there's an actual exception
        promise.reject("VIDEO_RECORDING_ERROR", "Error stopping video recording: ${e.message}", e)
    }
}
```

---

## 3. Session.ts

**Location:** `node_modules/biosensesignal-react-native-sdk/src/session/Session.ts`

### Add TypeScript Methods

Add these methods after the `getSessionState` method (around line 32):

```typescript
public async startVideoRecording(outputPath: string, width: number = 0, height: number = 0, fps: number = 30): Promise<void> {
    try {
        await BiosenseSignalReactNativeSDK.startVideoRecording(outputPath, width, height, fps);
    } catch (error: any) {
        throw new HealthMonitorException(error.message, parseInt(error.code))
    }
}

public async stopVideoRecording(): Promise<string | null> {
    try {
        return await BiosenseSignalReactNativeSDK.stopVideoRecording();
    } catch (error: any) {
        throw new HealthMonitorException(error.message, parseInt(error.code))
    }
}
```

---

## Key Features

1. **Dimension Auto-Detection**: If `width=0` and `height=0`, dimensions are detected from the first frame
2. **Full Resolution**: No scaling unless dimensions don't match (preserves original camera resolution)
3. **Portrait Mode**: Rotation hint set to 0 degrees (facescans are always in portrait)
4. **Asynchronous Processing**: Frames are processed on a background thread to avoid blocking the SDK
5. **Proper Cleanup**: All resources are properly released after recording stops
6. **Error Handling**: Graceful failure - returns `null` if no video was recorded instead of crashing

---

## Testing

After applying these changes:

1. Rebuild the Android app: `yarn run android:development`
2. Check logs for "Video recording:" messages
3. Verify video file is created and uploaded to S3



