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

@interface Region : NSObject

@property (nonatomic) bool                                      requiresDraw;
@property (nonatomic, readonly) bool                            requiresExtract;
@property (nonatomic, readonly) CGPoint                         center;
@property (nonatomic, readonly) NSString * _Nonnull             name;

-(NSArray<NSNumber *> * _Nonnull)getHistogramForChannel:(NSString* _Nonnull)channelName;
-(NSNumber* _Nonnull)getMeanForChannel:(NSString * _Nonnull)channelName;
-(NSNumber* _Nonnull)getReversedMean:(NSString * _Nonnull)channelName;
-(NSNumber* _Nonnull)getSTDForChannel:(NSString * _Nonnull)channelName;
-(NSNumber* _Nonnull)getSkewnessForChannel:(NSString * _Nonnull)channelName;
-(NSNumber* _Nonnull)getKurtosisForChannel:(NSString * _Nonnull)channelName;
-(NSNumber* _Nonnull)getMomentForChannel:(NSString * _Nonnull)channelName order:(NSUInteger)order;
-(NSNumber* _Nonnull)getEntropyForChannel:(NSString * _Nonnull)channelName;
-(NSNumber* _Nonnull)getOverexposureForChannel:(NSString* _Nonnull)channelName;
@end
