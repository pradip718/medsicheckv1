//
//  Copyright (c) 2016-2023, Nuralogix Corp.
//  All Rights reserved
//  THIS SOFTWARE IS LICENSED BY AND IS THE CONFIDENTIAL AND
//  PROPRIETARY PROPERTY OF NURALOGIX CORP. IT IS
//  PROTECTED UNDER THE COPYRIGHT LAWS OF THE USA, CANADA
//  AND OTHER FOREIGN COUNTRIES. THIS SOFTWARE OR ANY
//  PART THEREOF, SHALL NOT, WITHOUT THE PRIOR WRITTEN CONSENT
//  OF NURALOGIX CORP, BE USED, COPIED, DISCLOSED,
//  DECOMPILED, DISASSEMBLED, MODIFIED OR OTHERWISE TRANSFERRED
//  EXCEPT IN ACCORDANCE WITH THE TERMS AND CONDITIONS OF A
//  NURALOGIX CORP SOFTWARE LICENSE AGREEMENT.
//

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
