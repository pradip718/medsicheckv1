# Surface-Based Video Encoder Patch (v5.11.4)

## 🎯 What Changed

The Android video recording implementation was **completely refactored** from manual YUV conversion to Surface-based MediaCodec encoding.

## 📦 Updated Files

### 1. `node_modules/biosensesignal-react-native-sdk/android/src/main/java/com/biosensesignal/react_native_sdk/SessionManager.kt`

**Removed (Old YUV-based approach):**
- ❌ `bitmapToYuv420()` - 40+ lines of manual RGB→YUV conversion
- ❌ `encodeFrame(yuvData: ByteArray)` - Manual buffer queuing
- ❌ `startTimeUs`, `selectedColorFormat`, `videoStride`, `videoSliceHeight` variables
- ❌ Color format selection logic (YUV420Flexible, SemiPlanar, Planar)

**Added (New Surface-based approach):**
- ✅ `encoderSurface: Surface?` - Input surface for MediaCodec
- ✅ `encoderOutputThread: Thread?` - Dedicated thread for draining encoder
- ✅ `isEncoderOutputRunning: Boolean` - Thread control flag
- ✅ `framePaint: Paint` - Hardware-accelerated rendering
- ✅ `startEncoderOutputThread()` - Continuous encoder output draining
- ✅ `recordFrame(bitmap: Bitmap)` - Draws directly to Surface using Canvas
- ✅ Surface-based `initializeVideoEncoder()` - Uses `COLOR_FormatSurface`

**Key Changes:**
```kotlin
// OLD (Broken):
val yuvData = bitmapToYuv420(processedBitmap, videoWidth, videoHeight)
encodeFrame(yuvData)

// NEW (Fixed):
val canvas = surface.lockCanvas(null)
canvas.drawBitmap(bitmap, srcRect, dstRect, framePaint)
surface.unlockCanvasAndPost(canvas)
```

### 2. `node_modules/biosensesignal-react-native-sdk/android/src/main/java/com/biosensesignal/react_native_sdk/BiosenseSignalReactNativeSDK.kt`

**No changes needed** - Bridge methods remain the same.

### 3. `node_modules/biosensesignal-react-native-sdk/src/session/Session.ts`

**No changes needed** - TypeScript API remains the same.

### 4. `ANDROID_VIDEO_RECORDING_CHANGES.md`

**Completely rewritten** to document the Surface-based approach.

---

## 🔧 Technical Details

### Color Format
```kotlin
// OLD: Manual YUV selection
var selectedColorFormat = -1
for (colorFormat in colorFormats) {
    if (colorFormat == MediaCodecInfo.CodecCapabilities.COLOR_FormatYUV420Flexible ||
        colorFormat == MediaCodecInfo.CodecCapabilities.COLOR_FormatYUV420Planar ||
        colorFormat == MediaCodecInfo.CodecCapabilities.COLOR_FormatYUV420SemiPlanar) {
        selectedColorFormat = colorFormat
        break
    }
}

// NEW: Always use Surface
format.setInteger(MediaFormat.KEY_COLOR_FORMAT, MediaCodecInfo.CodecCapabilities.COLOR_FormatSurface)
encoderSurface = mediaCodec?.createInputSurface()
```

### Frame Encoding
```kotlin
// OLD: Manual YUV conversion + buffer queuing
private fun bitmapToYuv420(bitmap: Bitmap, width: Int, height: Int): ByteArray {
    val ySize = width * height
    val uvSize = (width / 2) * (height / 2) * 2
    val yuv = ByteArray(ySize + uvSize)
    // ... 40+ lines of RGB→YUV math ...
    return yuv
}

private fun encodeFrame(yuvData: ByteArray) {
    val inputBufferIndex = codec.dequeueInputBuffer(10000)
    if (inputBufferIndex >= 0) {
        val inputBuffer = codec.getInputBuffer(inputBufferIndex)
        inputBuffer?.put(yuvData)
        codec.queueInputBuffer(inputBufferIndex, 0, yuvData.size, presentationTimeUs, 0)
    }
    // ... manual output buffer draining ...
}

// NEW: Direct Surface rendering
private fun recordFrame(bitmap: Bitmap) {
    val surface = encoderSurface ?: return
    val canvas = surface.lockCanvas(null)
    try {
        val srcRect = Rect(0, 0, bitmap.width, bitmap.height)
        val dstRect = Rect(0, 0, videoWidth, videoHeight)
        canvas.drawBitmap(bitmap, srcRect, dstRect, framePaint)
        frameCount++
    } finally {
        surface.unlockCanvasAndPost(canvas)
    }
}
```

### Output Draining
```kotlin
// OLD: Inline in encodeFrame() - blocking
val bufferInfo = MediaCodec.BufferInfo()
var outputBufferIndex = codec.dequeueOutputBuffer(bufferInfo, 0)
while (outputBufferIndex >= 0) {
    // ... process output buffers ...
}

// NEW: Dedicated background thread
private fun startEncoderOutputThread() {
    isEncoderOutputRunning = true
    encoderOutputThread = Thread {
        val bufferInfo = MediaCodec.BufferInfo()
        while (isEncoderOutputRunning) {
            val outputBufferIndex = codec.dequeueOutputBuffer(bufferInfo, 10000)
            when {
                outputBufferIndex == MediaCodec.INFO_OUTPUT_FORMAT_CHANGED -> {
                    videoTrackIndex = muxer.addTrack(codec.outputFormat)
                    muxer.start()
                }
                outputBufferIndex >= 0 -> {
                    // Write to muxer
                }
            }
        }
    }
    encoderOutputThread?.start()
}
```

---

## 🎉 Benefits

1. **Vendor Agnostic**: No OEM-specific code (works on Qualcomm, MediaTek, Exynos, etc.)
2. **No Manual Conversion**: MediaCodec handles all RGB→YUV conversion
3. **GPU Accelerated**: Canvas uses hardware rendering
4. **No Stride Issues**: Surface handles buffer alignment automatically
5. **Industry Standard**: Same approach as Android Camera2 API
6. **Production Ready**: No workarounds or device-specific hacks

---

## 📱 Tested On

| Device | Chipset | Before | After |
|--------|---------|--------|-------|
| Vivo T4x 5G | MediaTek | ❌ Green noise | ✅ Clean |
| Samsung M315F | Exynos | ⚠️ Stripes | ✅ Clean |
| Google Pixel | Qualcomm | ✅ Works | ✅ Works |
| Xiaomi | MediaTek | ⚠️ Purple | ✅ Clean |

---

## 🚀 How to Apply

### Option 1: Automatic (patch-package)
```bash
yarn install
# Patches are applied automatically via postinstall script
```

### Option 2: Manual
If patches don't apply automatically, follow the steps in `ANDROID_VIDEO_RECORDING_CHANGES.md`.

---

## 📝 Maintenance Notes

**When upgrading the SDK:**
1. Check if `patches/biosensesignal-react-native-sdk+5.11.4.patch` applies cleanly
2. If not, manually re-apply changes from `ANDROID_VIDEO_RECORDING_CHANGES.md`
3. Regenerate patch: `npx patch-package biosensesignal-react-native-sdk`

**Key Files to Watch:**
- `SessionManager.kt` - Core video recording
- `BiosenseSignalReactNativeSDK.kt` - React Native bridge
- `Session.ts` - TypeScript wrapper

---

## ⚠️ Breaking Changes

**None** - The public API remains the same:
```typescript
await session.startVideoRecording(outputPath, width, height, fps);
const videoPath = await session.stopVideoRecording();
```

Only the internal implementation changed from YUV to Surface-based encoding.

---

## 🐛 Troubleshooting

**If video recording fails:**
1. Check logs for "Video recording: Surface-based encoder initialized"
2. Verify `COLOR_FormatSurface` is supported (should be on all devices API 18+)
3. Ensure sufficient storage space for video file
4. Check for Camera permission

**If video is corrupted:**
- This should **not happen** with Surface-based encoding
- If it does, check device manufacturer and report as a bug
- Fallback: Check if `createInputSurface()` is actually supported

---

Last Updated: January 8, 2026
Version: 5.11.4 (Surface-Based Encoder)
