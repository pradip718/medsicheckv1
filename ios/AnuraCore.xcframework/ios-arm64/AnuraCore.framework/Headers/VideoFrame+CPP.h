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

#ifndef VideoFrame_CPP_h
#define VideoFrame_CPP_h

#import <dfx/VideoFrame.h>
#import <dfx/Frame.h>
#import <opencv2/core/mat.hpp>
#import <memory>
#import "VideoFrame.h"

@interface VideoFrame()

@property (nonatomic) cv::Mat                       image;
@property (nonatomic) dfx::VideoFrame               videoFrame;
@property (nonatomic) std::shared_ptr<dfx::Frame>   dfxFrame;

-(instancetype)initWithVideoFrame:(dfx::VideoFrame)videoFrame;

@end


#endif /* VideoFrame_CPP_h */
