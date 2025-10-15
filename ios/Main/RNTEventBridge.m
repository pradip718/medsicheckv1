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
//  EXCEPT IN ACCORDANCE WITH THE TERMS AND CONDlITIONS OF A
//  NURALOGIX CORP SOFTWARE LICENSE AGREEMENT.
//

#import "RNTEventBridge.h"
#import "MedsiCheckDev-Swift.h" 
//#import "MedsiCheck-Swift.h"
// #import "MedsiCheckStaging-Swift.h"

NSString *const EventReminderCommon = @"eventReminder_common";
NSString *const EventReminderResults = @"eventReminder_results";
NSString *const NativeActionName = @"nativeActionName";

typedef NS_ENUM(NSUInteger, Action) {
  StartMeasurement,
  SynchronizeAppConfiguration,
  SynchronizeConfiguration,
  SynchronizeUIConfiguration,
  StopCommonObserving,
  StopResultsObserving,
};

NSString * _Nonnull ActionName[] = {
  [StartMeasurement] = @"startMeasurement",
  [SynchronizeAppConfiguration] = @"synchronizeAppConfiguration",
  [SynchronizeConfiguration] = @"synchronizeConfiguration",
  [SynchronizeUIConfiguration] = @"synchronizeUIConfiguration",
  [StopCommonObserving] = @"stopCommonObserving",
  [StopResultsObserving] = @"stopResultsObserving",
};

@implementation RNTEventBridge

RCT_EXPORT_MODULE()

- (NSArray<NSString *> *)supportedEvents
{
  return @[EventReminderCommon, EventReminderResults];
}

RCT_EXPORT_METHOD(anura_startCommonObserving)
{
  [self startObserving:EventReminderCommon body:nil];
}

RCT_EXPORT_METHOD(anura_startResultsObserving)
{
  [self startObserving:EventReminderResults body:nil];
}


RCT_EXPORT_METHOD(doSomething:(NSString *)eventName property:(NSString *)property)
{
  dispatch_async(dispatch_get_main_queue(), ^{
    if ([eventName isEqual:ActionName[StartMeasurement]]) {
      [[StartSession shared] startWithProperties:property];
    } else if ([eventName isEqual:ActionName[SynchronizeConfiguration]]) {
      [[StartSession shared] synchronizeConfiguration:property];
    } else if ([eventName isEqual:ActionName[SynchronizeUIConfiguration]]) {
      [[StartSession shared] synchronizeUIConfiguration:property];
    } else if ([eventName isEqual:ActionName[SynchronizeAppConfiguration]]) {
      [AppConfig synchronizeAppConfiguration:property];
    }
  });
}

- (void)startObserving:(NSString *)name body:(id)object {
  NSLog(@"rn--iOS...startObserving(%@)", name);
  [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(eventSend:) name:name object:nil];
}

- (void)stopObserving:(NSString *)name body:(id)object {
  NSLog(@"rn--iOS...stopObserving(%@)", name);
  [[NSNotificationCenter defaultCenter] removeObserver:self name:name object:nil];
}

- (void)stopAllObserving {
  NSLog(@"rn--iOS...stopAllObserving");
  [[NSNotificationCenter defaultCenter] removeObserver:self];
}

- (void)eventSend:(NSNotification *)noti
{
  dispatch_async(dispatch_get_main_queue(), ^{
    if ([noti.object isKindOfClass:[NSDictionary class]] || noti.object == nil) {
      NSDictionary *dic = noti.object;
      NSString *actionName = dic[NativeActionName];
      if ([actionName isEqual:ActionName[StopCommonObserving]] || [actionName isEqual:ActionName[StopResultsObserving]]) {
        [self stopObserving:noti.name body:noti.object];
      }
      [self sendEventWithName:noti.name body:dic];
    }
  });
}

+ (void)sendCommonEvent:(NSString *)name body:(nullable id)object
{
  NSMutableDictionary *dic = [NSMutableDictionary dictionary];
  if ([object isKindOfClass:[NSDictionary class]] || [object isKindOfClass:[NSArray class]]) {
    [dic setValue:object forKey:@"data"];
    [dic setValue:name forKey:NativeActionName];
  } else if (object == nil) {
    [dic setValue:name forKey:NativeActionName];
  }
  
  [[NSNotificationCenter defaultCenter] postNotificationName:EventReminderCommon object:dic];
}

+ (void)sendResultsEvent:(NSString *)name body:(nullable id)object
{
  NSMutableDictionary *dic = [NSMutableDictionary dictionary];
  if ([object isKindOfClass:[NSDictionary class]] || [object isKindOfClass:[NSArray class]]) {
    [dic setValue:object forKey:@"data"];
    [dic setValue:name forKey:NativeActionName];
  } else if (object == nil) {
    [dic setValue:name forKey:NativeActionName];
  }
  
  [[NSNotificationCenter defaultCenter] postNotificationName:EventReminderResults object:dic];
}

+ (void)stopCommonObserving {
  [[NSNotificationCenter defaultCenter] postNotificationName:EventReminderCommon object:@{NativeActionName: ActionName[StopCommonObserving]}];
}

+ (void)stopResultsObserving {
  [[NSNotificationCenter defaultCenter] postNotificationName:EventReminderResults object:@{NativeActionName: ActionName[StopResultsObserving]}];
}
@end
