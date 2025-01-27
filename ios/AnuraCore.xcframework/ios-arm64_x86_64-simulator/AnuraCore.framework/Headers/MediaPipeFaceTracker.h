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
#import <UIKit/UIKit.h>
#import <CoreMedia/CoreMedia.h>
#import "FaceTrackerProtocol.h"

@class VideoFrame;
@class TrackedFace;

@interface MediaPipeFaceTracker : NSObject

-(instancetype _Nonnull)initWithQuality:(FaceTrackerQuality)quality;
-(void)trackFaceFrom:(VideoFrame * _Nonnull)videoFrame completion:(void (^ _Nonnull)(TrackedFace * _Nonnull))completion;
-(void)lock;
-(void)unlock;
-(void)reset;

@property (nonatomic) FaceTrackerQuality quality;
@property (nonatomic) CGRect trackingBounds;
@property (nonatomic, weak) id<FaceTrackerDelegate> _Nullable delegate;

@end
