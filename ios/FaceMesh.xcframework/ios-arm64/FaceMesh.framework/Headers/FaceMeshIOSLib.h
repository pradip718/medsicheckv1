#import <CoreVideo/CoreVideo.h>
#import <Foundation/Foundation.h>


@interface FaceLandmarkPoint : NSObject
@property (nonatomic) float x;
@property (nonatomic) float y;
@property (nonatomic) float z;
@end

typedef void (^LandmarkCompleteBlock)(NSArray<NSArray<FaceLandmarkPoint *> *> *);

@interface FaceMeshIOSLib : NSObject
- (instancetype)init;
- (void)startGraph;
- (NSArray<NSArray<FaceLandmarkPoint *> *> *)processVideoFrameWithData:(unsigned char*)data
                                                                         cols:(int)cols
                                                                         rows:(int)rows;
- (void)processVideoFrameWithData:(unsigned char*)data
                             cols:(int)cols
                             rows:(int)rows
                         complete:(LandmarkCompleteBlock)complete;
- (NSArray<NSArray<FaceLandmarkPoint *> *> *)processVideoFrame:(CVPixelBufferRef)imageBuffer;
- (void)processVideoFrame:(CVPixelBufferRef)imageBuffer
                 complete:(LandmarkCompleteBlock)complete;
@property(nonatomic) size_t timestamp;
@end
