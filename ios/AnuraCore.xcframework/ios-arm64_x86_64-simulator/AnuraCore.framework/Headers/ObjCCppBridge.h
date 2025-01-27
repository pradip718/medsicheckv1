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

#ifdef __cplusplus

#import <Foundation/Foundation.h>
#import <string>
#import <vector>

NS_ASSUME_NONNULL_BEGIN

@interface ObjCCppBridge : NSObject

+(NSArray<NSString*>*)toNSArrayStringFrom:(std::vector<std::string>)vector;
+(NSArray<NSNumber*>*)toNSArrayNumberFrom:(std::vector<double>)vector;
+(NSString*)toNSStringFrom:(std::string)string;
+(std::string)toStdStringFrom:(NSString*)string;

+(std::vector<unsigned char>)toStdVectorFromNSData:(NSData*)data;
+(std::vector<unsigned char>)toStdVectorFromNSString:(NSString*)string;

@end

NS_ASSUME_NONNULL_END

#endif
