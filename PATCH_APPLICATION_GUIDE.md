# Patch Application Guide - Video Recording Implementation

This document explains how the `biosensesignal-react-native-sdk+5.11.4.patch` file automatically applies video recording changes to `node_modules` on every reinstall.

---

## 📋 Overview

The patch file (`patches/biosensesignal-react-native-sdk+5.11.4.patch`) automatically modifies the `biosensesignal-react-native-sdk` package in `node_modules` to add video recording functionality for both Android and iOS platforms.

**Key Points:**
- ✅ Patch applies **automatically** when `node_modules` are installed/reinstalled
- ✅ No manual intervention required
- ✅ Works via `postinstall` script in `package.json`
- ✅ All changes are applied from a single patch file

---

## 🔄 How It Works

### Automatic Application Process

1. **Installation Trigger:**
   ```bash
   yarn install
   # or
   npm install
   ```

2. **Postinstall Script:**
   - `package.json` contains a `postinstall` script that runs after installation
   - Script: `bash scripts/apply-patches.sh`

3. **Patch Application:**
   - `apply-patches.sh` detects the SDK version (5.11.4)
   - Applies `patches/biosensesignal-react-native-sdk+5.11.4.patch`
   - Uses standard `patch` command with `-p1` flag

4. **Result:**
   - All video recording code is automatically added to `node_modules`
   - No manual file editing required

---

## 📝 Files Modified by Patch

The patch file modifies **6 files** in `node_modules/biosensesignal-react-native-sdk/`:

### Android Files (2 files)

1. **`android/src/main/java/com/biosensesignal/react_native_sdk/SessionManager.kt`**
   - **What's Added:**
     - Video recording imports (MediaCodec, MediaMuxer, Surface, Canvas, etc.)
     - Video recording properties (encoderSurface, mediaCodec, mediaMuxer, etc.)
     - Surface-based video encoder implementation
     - `startVideoRecording()` method
     - `stopVideoRecording()` method
     - `recordFrame()` method (draws Bitmap to Surface)
     - `initializeVideoEncoder()` method
     - `startEncoderOutputThread()` method
     - `cleanupVideoRecording()` method
     - Updated `onImage()` to call `recordFrame()` when recording
     - Updated `terminateSession()` to cleanup video recording
   - **Lines Added:** ~400+ lines
   - **Key Feature:** Uses `COLOR_FormatSurface` for hardware-accelerated encoding (no manual YUV conversion)

2. **`android/src/main/java/com/biosensesignal/react_native_sdk/BiosenseSignalReactNativeSDK.kt`**
   - **What's Added:**
     - `@ReactMethod startVideoRecording()` - React Native bridge method
     - `@ReactMethod stopVideoRecording()` - React Native bridge method
   - **Lines Added:** ~30 lines
   - **Key Feature:** Exposes video recording to JavaScript/TypeScript

### iOS Files (3 files)

3. **`ios/SessionManager.swift`**
   - **What's Added:**
     - Video recording imports (AVFoundation, CoreVideo, UIKit)
     - Video recording properties (videoWriter, videoWriterInput, pixelBufferAdaptor, etc.)
     - `startVideoRecording()` method
     - `stopVideoRecording()` method
     - `initializeVideoEncoder()` method
     - `recordFrame()` method
     - `createPixelBuffer()` method
     - `cleanupVideoRecording()` method
     - Updated `onImage()` to record frames when recording
     - Updated `terminateSession()` to cleanup video recording
   - **Lines Added:** ~300+ lines
   - **Key Feature:** Uses `AVAssetWriter` for iOS video encoding

4. **`ios/BiosenseSignalReactNativeSDK.swift`**
   - **What's Added:**
     - `@objc startVideoRecording()` - React Native bridge method
     - `@objc stopVideoRecording()` - React Native bridge method
   - **Lines Added:** ~20 lines
   - **Key Feature:** Exposes video recording to JavaScript/TypeScript

5. **`ios/BiosenseSignalReactNativeSDK.m`**
   - **What's Added:**
     - `RCT_EXTERN_METHOD(startVideoRecording:...)` - Bridge method declaration
     - `RCT_EXTERN_METHOD(stopVideoRecording:...)` - Bridge method declaration
   - **Lines Added:** ~10 lines
   - **Key Feature:** Declares bridge methods for React Native

### TypeScript File (1 file)

6. **`src/session/Session.ts`**
   - **What's Added:**
     - `public async startVideoRecording()` - TypeScript API method
     - `public async stopVideoRecording()` - TypeScript API method
   - **Lines Added:** ~10 lines
   - **Key Feature:** Provides type-safe API for video recording

---

## 🔍 Detailed Changes Per File

### Android SessionManager.kt

**Imports Added:**
```kotlin
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Rect
import android.media.MediaCodec
import android.media.MediaCodecInfo
import android.media.MediaFormat
import android.media.MediaMuxer
import android.os.Handler
import android.os.HandlerThread
import android.view.Surface
import java.io.File
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit
```

**Properties Added:**
```kotlin
private var mediaCodec: MediaCodec? = null
private var mediaMuxer: MediaMuxer? = null
private var encoderSurface: Surface? = null
private var isRecordingVideo: Boolean = false
private var videoOutputPath: String? = null
private var frameCount: Int = 0
private var videoTrackIndex: Int = -1
private var videoWidth: Int = 0
private var videoHeight: Int = 0
private var videoFps: Int = 30
private var isVideoInitialized: Boolean = false
private var videoRecordingHandler: Handler? = null
private var videoRecordingThread: HandlerThread? = null
private var encoderOutputThread: Thread? = null
@Volatile private var isEncoderOutputRunning: Boolean = false
@Volatile private var isEncodingFrame: Boolean = false
private val framePaint = Paint(Paint.FILTER_BITMAP_FLAG)
```

**Methods Added:**
- `fun startVideoRecording(outputPath: String, width: Int, height: Int, fps: Int)`
- `fun stopVideoRecording(): String?`
- `private fun initializeVideoEncoder()`
- `private fun startEncoderOutputThread()`
- `private fun recordFrame(bitmap: Bitmap)`
- `private fun cleanupVideoRecording()`

**Methods Modified:**
- `override fun onImage(imageData: ImageData)` - Added frame recording logic
- `fun terminateSession()` - Added video cleanup

### iOS SessionManager.swift

**Imports Added:**
```swift
import AVFoundation
import CoreVideo
import UIKit
```

**Properties Added:**
```swift
private var videoWriter: AVAssetWriter?
private var videoWriterInput: AVAssetWriterInput?
private var pixelBufferAdaptor: AVAssetWriterInputPixelBufferAdaptor?
private var isRecordingVideo: Bool = false
private var videoOutputPath: String?
private var frameStartTime: CMTime = .zero
private var frameCount: Int = 0
private var videoWidth: Int = 0
private var videoHeight: Int = 0
private var videoFps: Int = 30
private var isVideoInitialized: Bool = false
private let videoRecordingQueue = DispatchQueue(label: "com.biosensesignal.video.recording", qos: .userInitiated)
```

**Methods Added:**
- `func startVideoRecording(outputPath: String, width: Int, height: Int, fps: Int) throws`
- `func stopVideoRecording() -> String?`
- `private func initializeVideoEncoder() throws`
- `private func recordFrame(image: UIImage)`
- `private func createPixelBuffer(from image: UIImage, width: Int, height: Int) -> CVPixelBuffer?`
- `private func cleanupVideoRecording()`

**Methods Modified:**
- `func onImage(imageData: ImageData)` - Added frame recording logic
- `func terminateSession()` - Added video cleanup

---

## ✅ Verification Steps

After reinstalling `node_modules`, verify the patch was applied:

### 1. Check Patch Application Logs

```bash
yarn install
# Look for: "✅ Patch applied (or already applied)"
```

### 2. Verify Android Changes

```bash
# Check Surface-based encoder
grep -c "COLOR_FormatSurface" node_modules/biosensesignal-react-native-sdk/android/src/main/java/com/biosensesignal/react_native_sdk/SessionManager.kt
# Should return: 2 or more

# Check recordFrame in onImage
grep -A 3 "recordFrame(bitmap)" node_modules/biosensesignal-react-native-sdk/android/src/main/java/com/biosensesignal/react_native_sdk/SessionManager.kt
# Should show: recordFrame(bitmap) call

# Check bridge methods
grep -c "startVideoRecording" node_modules/biosensesignal-react-native-sdk/android/src/main/java/com/biosensesignal/react_native_sdk/BiosenseSignalReactNativeSDK.kt
# Should return: 5 or more
```

### 3. Verify iOS Changes

```bash
# Check imports
grep -c "import AVFoundation\|import CoreVideo\|import UIKit" node_modules/biosensesignal-react-native-sdk/ios/SessionManager.swift
# Should return: 3

# Check video properties
grep -c "videoWriter\|videoWriterInput" node_modules/biosensesignal-react-native-sdk/ios/SessionManager.swift
# Should return: 10 or more

# Check bridge methods
grep -c "startVideoRecording" node_modules/biosensesignal-react-native-sdk/ios/BiosenseSignalReactNativeSDK.swift
# Should return: 2 or more

# Check bridge declarations
grep -c "startVideoRecording" node_modules/biosensesignal-react-native-sdk/ios/BiosenseSignalReactNativeSDK.m
# Should return: 1 or more
```

### 4. Verify TypeScript API

```bash
# Check Session.ts methods
grep -c "startVideoRecording\|stopVideoRecording" node_modules/biosensesignal-react-native-sdk/src/session/Session.ts
# Should return: 4
```

---

## 🔧 Manual Patch Application (If Needed)

If the automatic patch doesn't apply, you can manually apply it:

```bash
cd node_modules/biosensesignal-react-native-sdk
patch -p1 < ../../patches/biosensesignal-react-native-sdk+5.11.4.patch
```

---

## 📊 Patch File Statistics

- **File:** `patches/biosensesignal-react-native-sdk+5.11.4.patch`
- **Size:** ~1012 lines
- **Files Modified:** 6 files
- **Total Lines Added:** ~800+ lines
- **Platforms:** Android + iOS
- **Format:** Standard unified diff format

---

## 🎯 Key Features Added

### Android
- ✅ Surface-based video encoding (hardware-accelerated)
- ✅ No manual YUV conversion (MediaCodec handles it)
- ✅ Works on all Android devices (Qualcomm, MediaTek, Exynos)
- ✅ Frame dropping logic (prevents Surface lock conflicts)
- ✅ Proper encoder lifecycle management
- ✅ Thread-safe implementation

### iOS
- ✅ AVAssetWriter-based video encoding
- ✅ Automatic dimension detection from first frame
- ✅ CGImage and CIImage support
- ✅ Asynchronous frame processing
- ✅ Proper resource cleanup
- ✅ Directory auto-creation

### Both Platforms
- ✅ React Native bridge methods
- ✅ TypeScript API
- ✅ Error handling
- ✅ Automatic cleanup on session termination

---

## 🐛 Troubleshooting

### Issue: Patch Not Applying

**Symptoms:**
- Video recording methods not available
- Errors about missing methods

**Solutions:**

1. **Check patch file exists:**
   ```bash
   ls -la patches/biosensesignal-react-native-sdk+5.11.4.patch
   ```

2. **Check postinstall script:**
   ```bash
   cat package.json | grep postinstall
   ```

3. **Manually run patch script:**
   ```bash
   bash scripts/apply-patches.sh
   ```

4. **Check SDK version matches:**
   - Patch is for version `5.11.4`
   - Verify package version in `package.json`

### Issue: Patch Applies But Changes Missing

**Symptoms:**
- Patch says "applied" but code not present

**Solutions:**

1. **Verify patch actually applied:**
   ```bash
   cd node_modules/biosensesignal-react-native-sdk
   git diff  # If git initialized, shows changes
   ```

2. **Check for patch conflicts:**
   - Look for `.rej` files (rejected patches)
   - Check patch application logs

3. **Reapply patch:**
   ```bash
   cd node_modules/biosensesignal-react-native-sdk
   patch -p1 < ../../patches/biosensesignal-react-native-sdk+5.11.4.patch
   ```

---

## 📚 Related Documentation

- **`ANDROID_VIDEO_RECORDING_CHANGES.md`** - Detailed Android implementation guide
- **`IOS_VIDEO_RECORDING_CHANGES.md`** - Detailed iOS implementation guide
- **`SURFACE_ENCODER_PATCH_NOTES.md`** - Android Surface-based encoder notes

---

## 🔄 Update Process

If you need to update the patch:

1. **Make changes to `node_modules/biosensesignal-react-native-sdk/`**
2. **Generate new patch:**
   ```bash
   cd node_modules/biosensesignal-react-native-sdk
   git init
   git add -A
   git commit -m "original"
   # Make your changes
   git add -A
   git diff HEAD > ../../patches/biosensesignal-react-native-sdk+5.11.4.patch
   ```
3. **Test the patch:**
   ```bash
   rm -rf node_modules/biosensesignal-react-native-sdk
   yarn install
   # Verify changes are present
   ```

---

## ✅ Summary

The patch system automatically applies video recording functionality to the SDK on every `yarn install` or `npm install`. All changes are:

- ✅ **Automatic** - No manual intervention needed
- ✅ **Tested** - Verified to work on clean installs
- ✅ **Complete** - Includes Android, iOS, and TypeScript changes
- ✅ **Documented** - This guide explains everything

**The patch file is the single source of truth for all video recording changes.**

---

**Last Updated:** 2026-01-11  
**Patch Version:** 5.11.4  
**Status:** ✅ Production Ready
