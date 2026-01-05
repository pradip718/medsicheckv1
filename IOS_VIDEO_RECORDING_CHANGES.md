# iOS Video Recording Implementation Guide

This document describes all the changes needed to implement video recording functionality in the iOS SDK.

## Files to Modify

1. **SessionManager.swift** - Core video recording implementation
2. **BiosenseSignalReactNativeSDK.swift** - React Native bridge methods
3. **BiosenseSignalReactNativeSDK.m** - Bridge method declarations (already has them)
4. **Session.ts** - TypeScript definitions (JavaScript interface)

---

## 1. SessionManager.swift

**Location:** `node_modules/biosensesignal-react-native-sdk/ios/SessionManager.swift`

### Step 1: Add Imports

Add these imports at the top of the file (after existing imports):

```swift
import AVFoundation
import CoreVideo
import UIKit
```

### Step 2: Add Video Recording Properties

Add these properties inside the `SessionManager` class (after `let images = PassthroughSubject<ImageData, Never>()`):

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

### Step 3: Update `onImage` Method

Modify the `onImage` method to record frames:

```swift
func onImage(imageData: ImageData) {
    images.send(imageData)
    eventEmitter?.sendEvent(withName: NativeBridgeEvents.imageInfo, body: imageData.toMap())

    if isRecordingVideo, let image = imageData.image as? UIImage {
        videoRecordingQueue.async { [weak self] in
            self?.recordFrame(image: image)
        }
    }
}
```

### Step 4: Update `terminateSession` Method

Modify the `terminateSession` method to clean up video recording:

```swift
func terminateSession() {
    session?.terminate()
    // Clean up video recording if active
    if isRecordingVideo {
        _ = stopVideoRecording()
    }
}
```

### Step 5: Add Video Recording Methods

Add these methods before the `resolveDeviceOrientation` method (around line 217):

```swift
func startVideoRecording(outputPath: String, width: Int, height: Int, fps: Int) throws {
    if isRecordingVideo {
        // Stop and clean up any existing recording synchronously
        _ = stopVideoRecording()
    }

    // Ensure the directory exists
    let outputURL = URL(fileURLWithPath: outputPath)
    let directoryURL = outputURL.deletingLastPathComponent()
    let fileManager = FileManager.default

    if !fileManager.fileExists(atPath: directoryURL.path) {
        do {
            try fileManager.createDirectory(at: directoryURL, withIntermediateDirectories: true, attributes: nil)
        } catch {
            throw NSError(domain: "VIDEO_RECORDING", code: -3, userInfo: [NSLocalizedDescriptionKey: "Failed to create directory: \(error.localizedDescription)"])
        }
    }

    self.videoOutputPath = outputPath
    self.videoFps = fps
    self.frameCount = 0
    self.frameStartTime = .zero
    self.isVideoInitialized = false

    if width > 0 && height > 0 {
        self.videoWidth = width
        self.videoHeight = height
        try initializeVideoEncoder()
    } else {
        self.videoWidth = 0
        self.videoHeight = 0
    }

    isRecordingVideo = true
}

private func initializeVideoEncoder() throws {
    guard let outputPath = videoOutputPath else {
        throw NSError(domain: "VIDEO_RECORDING", code: -2, userInfo: [NSLocalizedDescriptionKey: "No output path"])
    }

    if videoWidth <= 0 || videoHeight <= 0 {
        return
    }

    if isVideoInitialized {
        return
    }

    let outputURL = URL(fileURLWithPath: outputPath)
    let fileManager = FileManager.default
    if fileManager.fileExists(atPath: outputPath) {
        try? fileManager.removeItem(at: outputURL)
    }

    do {
        videoWriter = try AVAssetWriter(outputURL: outputURL, fileType: .mp4)
    } catch {
        throw NSError(domain: "VIDEO_RECORDING", code: -4, userInfo: [NSLocalizedDescriptionKey: "Failed to create AVAssetWriter: \(error.localizedDescription)"])
    }

    let videoSettings: [String: Any] = [
        AVVideoCodecKey: AVVideoCodecType.h264,
        AVVideoWidthKey: videoWidth,
        AVVideoHeightKey: videoHeight,
        AVVideoCompressionPropertiesKey: [
            AVVideoAverageBitRateKey: videoWidth * videoHeight * 4,
            AVVideoMaxKeyFrameIntervalKey: videoFps
        ]
    ]

    videoWriterInput = AVAssetWriterInput(mediaType: .video, outputSettings: videoSettings)
    videoWriterInput?.expectsMediaDataInRealTime = true

    let sourcePixelBufferAttributes: [String: Any] = [
        kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32ARGB,
        kCVPixelBufferWidthKey as String: videoWidth,
        kCVPixelBufferHeightKey as String: videoHeight
    ]

    pixelBufferAdaptor = AVAssetWriterInputPixelBufferAdaptor(
        assetWriterInput: videoWriterInput!,
        sourcePixelBufferAttributes: sourcePixelBufferAttributes
    )

    guard let videoWriter = videoWriter, let videoWriterInput = videoWriterInput else {
        throw NSError(domain: "VIDEO_RECORDING", code: -2, userInfo: [NSLocalizedDescriptionKey: "Failed to create video writer"])
    }

    videoWriter.add(videoWriterInput)

    guard videoWriter.startWriting() else {
        throw NSError(domain: "VIDEO_RECORDING", code: -2, userInfo: [NSLocalizedDescriptionKey: videoWriter.error?.localizedDescription ?? "Failed to start writing"])
    }

    isVideoInitialized = true
}

func stopVideoRecording() -> String? {
    guard isRecordingVideo else {
        return nil
    }

    isRecordingVideo = false

    guard let videoWriter = videoWriter, let videoWriterInput = videoWriterInput, frameCount > 0 else {
        cleanupVideoRecording()
        return nil
    }

    videoWriterInput.markAsFinished()

    let semaphore = DispatchSemaphore(value: 0)
    var success = false

    videoWriter.finishWriting { [weak self] in
        if self?.videoWriter?.status == .completed {
            success = true
        }
        semaphore.signal()
    }

    _ = semaphore.wait(timeout: .now() + 10)

    let outputPath = self.videoOutputPath
    cleanupVideoRecording()

    if success, let path = outputPath, FileManager.default.fileExists(atPath: path) {
        return path
    }

    return nil
}

private func cleanupVideoRecording() {
    videoWriter = nil
    videoWriterInput = nil
    pixelBufferAdaptor = nil
    isVideoInitialized = false
    isRecordingVideo = false
    videoOutputPath = nil
    frameCount = 0
    videoWidth = 0
    videoHeight = 0
    frameStartTime = .zero
}

private func recordFrame(image: UIImage) {
    guard isRecordingVideo else { return }

    if !isVideoInitialized {
        if let cgImage = image.cgImage {
            videoWidth = cgImage.width
            videoHeight = cgImage.height
        } else if let ciImage = image.ciImage {
            videoWidth = Int(ciImage.extent.width)
            videoHeight = Int(ciImage.extent.height)
        } else {
            return
        }

        do {
            try initializeVideoEncoder()
        } catch {
            return
        }
    }

    guard let videoWriter = videoWriter,
          let videoWriterInput = videoWriterInput,
          let pixelBufferAdaptor = pixelBufferAdaptor,
          videoWriter.status == .writing else {
        return
    }

    if frameCount == 0 {
        frameStartTime = CMTime.zero
        videoWriter.startSession(atSourceTime: frameStartTime)
    }

    guard let pixelBuffer = createPixelBuffer(from: image, width: videoWidth, height: videoHeight) else {
        return
    }

    let presentationTime = CMTime(value: Int64(frameCount), timescale: Int32(videoFps))

    if videoWriterInput.isReadyForMoreMediaData {
        if pixelBufferAdaptor.append(pixelBuffer, withPresentationTime: presentationTime) {
            frameCount += 1
        }
    }
}

private func createPixelBuffer(from image: UIImage, width: Int, height: Int) -> CVPixelBuffer? {
    var pixelBuffer: CVPixelBuffer?
    let status = CVPixelBufferCreate(
        kCFAllocatorDefault,
        width,
        height,
        kCVPixelFormatType_32ARGB,
        [
            kCVPixelBufferCGImageCompatibilityKey: true,
            kCVPixelBufferCGBitmapContextCompatibilityKey: true
        ] as CFDictionary,
        &pixelBuffer
    )

    guard status == kCVReturnSuccess, let buffer = pixelBuffer else {
        return nil
    }

    CVPixelBufferLockBaseAddress(buffer, [])
    defer { CVPixelBufferUnlockBaseAddress(buffer, []) }

    guard let context = CGContext(
        data: CVPixelBufferGetBaseAddress(buffer),
        width: width,
        height: height,
        bitsPerComponent: 8,
        bytesPerRow: CVPixelBufferGetBytesPerRow(buffer),
        space: CGColorSpaceCreateDeviceRGB(),
        bitmapInfo: CGImageAlphaInfo.noneSkipFirst.rawValue
    ) else {
        return nil
    }

    var cgImage: CGImage?
    if let imageCGImage = image.cgImage {
        cgImage = imageCGImage
    } else if let ciImage = image.ciImage {
        let ciContext = CIContext()
        cgImage = ciContext.createCGImage(ciImage, from: ciImage.extent)
    }

    guard let finalCGImage = cgImage else {
        return nil
    }

    context.draw(finalCGImage, in: CGRect(x: 0, y: 0, width: width, height: height))

    return buffer
}
```

---

## 2. BiosenseSignalReactNativeSDK.swift

**Location:** `node_modules/biosensesignal-react-native-sdk/ios/BiosenseSignalReactNativeSDK.swift`

### Add Bridge Methods

Add these methods after the `getSessionState` method (around line 135):

```swift
@objc(startVideoRecording:width:height:fps:withResolver:withRejecter:)
func startVideoRecording(outputPath: String, width: NSNumber, height: NSNumber, fps: NSNumber, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
    do {
        try SessionManager.shared.startVideoRecording(outputPath: outputPath, width: width.intValue, height: height.intValue, fps: fps.intValue)
        resolve(nil)
    } catch {
        reject(
            (error as NSError).code.description,
            (error as NSError).domain,
            error
        )
    }
}

@objc(stopVideoRecording:withRejecter:)
func stopVideoRecording(resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) -> Void {
    let outputPath = SessionManager.shared.stopVideoRecording()
    resolve(outputPath)
}
```

---

## 3. BiosenseSignalReactNativeSDK.m

**Location:** `node_modules/biosensesignal-react-native-sdk/ios/BiosenseSignalReactNativeSDK.m`

### Add Bridge Method Declarations

Add these method declarations after the `getSessionState` declaration (around line 39):

```objc
RCT_EXTERN_METHOD(startVideoRecording:
                  (nonnull NSString *)outputPath
                  width:(nonnull NSNumber *)width
                  height:(nonnull NSNumber *)height
                  fps:(nonnull NSNumber *)fps
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(stopVideoRecording:
                  (RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)
```

---

## 4. Session.ts

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
3. **Asynchronous Processing**: Frames are processed on a background queue to avoid blocking the SDK
4. **Proper Cleanup**: All resources are properly released after recording stops, including state reset in `cleanupVideoRecording`
5. **Error Handling**: Graceful failure - returns `null` if no video was recorded instead of crashing
6. **CGImage/CIImage Support**: Handles both CGImage and CIImage-based UIImages
7. **Directory Creation**: Automatically creates output directory if it doesn't exist
8. **State Management**: Properly handles already-recording state by stopping previous recording before starting new one
9. **Session Termination**: Video recording is automatically cleaned up when session terminates

---

## Testing

After applying these changes:

1. Run `pod install` in the `ios` directory
2. Rebuild the iOS app: `yarn run ios` or build from Xcode
3. Check logs for video recording messages
4. Verify video file is created and uploaded to S3

---

## Important Notes

- The video recording uses `AVAssetWriter` which is the standard iOS API for video encoding
- Frames are processed asynchronously to avoid blocking the SDK's image callbacks
- The implementation handles both `CGImage` and `CIImage` based `UIImage` objects
- Portrait mode is assumed (no rotation needed as facescans are always in portrait)
