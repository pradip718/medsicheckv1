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

#import <React/RCTEventEmitter.h>
#import <React/RCTBridge.h>

NS_ASSUME_NONNULL_BEGIN

extern NSString *const EventReminderString;
extern NSString *const NativeActionName;

@interface RNTEventBridge : RCTEventEmitter<RCTBridgeModule>
+ (void)sendCommonEvent:(NSString *)name body:(nullable id)object;
+ (void)sendResultsEvent:(NSString *)name body:(nullable id)object;
+ (void)stopCommonObserving;
+ (void)stopResultsObserving;
@end

NS_ASSUME_NONNULL_END
