//
//  Copyright (c) 2016-2019, Nuralogix Corp.
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

#import <Foundation/Foundation.h>
#import <CoreGraphics/CoreGraphics.h>
#import <CoreMedia/CoreMedia.h>
#import "FaceConstraintsStatus.h"

NS_ASSUME_NONNULL_BEGIN

@class VideoFrame;
@class TrackedFace;
@class Region;
@class MeasurementPayload;
@class MeasurementConfiguration;
@class MeasurementResult;
@protocol DFXSDKClientDelegate;
@protocol CameraProtocol;

@interface FaceTrackingClient : NSObject

-(void)reset;
-(VideoFrame * _Nonnull)createVideoFrameFrom:(void *)pixels
                                       width:(CGFloat)width
                                      height:(CGFloat)height
                                      stride:(NSUInteger)stride
                                 frameNumber:(UInt32)frameNumber
                                   timestamp:(CMTimeValue)timestamp;
-(void)addFrame:(VideoFrame * _Nonnull)videoFrame
           face:(TrackedFace * _Nonnull)face
     fromCamera:(id<CameraProtocol> _Nonnull)camera
     completion:(void(^_Nonnull)(NSArray<Region *> * _Nonnull, FaceConstraintsStatus))completion NS_SWIFT_NAME( add(_:face:from:completion:) );

-(void)enableLightingConstraints;
-(void)startMeasurement;
-(void)cancelMeasurement;
-(MeasurementResult*)decodeMeasurementResult:(NSData*)data;
-(void)setPayloadProperties:(NSDictionary<NSString*, NSString*>*)properties;
-(void)setMeasurementConfiguration:(MeasurementConfiguration *)measurementConfiguration;
-(instancetype)initWithConfiguration:(MeasurementConfiguration * _Nonnull)measurementConfiguration;

-(void)enableConstaint:(NSString * _Nonnull)key;
-(void)disableConstraint:(NSString * _Nonnull)key;
-(void)setConstraint:(NSString * _Nonnull)key value:(NSString * _Nonnull)value;
-(void)loadConfiguration:(MeasurementConfiguration * _Nonnull)measurementConfiguration additionalStudyCommands:(NSString*)commands;

@property (atomic, readonly) BOOL    isMeasuring;
@property (atomic) CGRect            displayBoundingBox;
@property (atomic) CGRect            strictBoundingBox;

@property (nonatomic, weak) id<DFXSDKClientDelegate> delegate;

@end

NS_ASSUME_NONNULL_END
