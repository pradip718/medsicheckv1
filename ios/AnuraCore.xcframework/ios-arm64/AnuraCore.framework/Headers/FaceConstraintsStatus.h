//
//  Copyright (c) 2016-2020, Nuralogix Corp.
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

#ifndef FaceConstraintsStatus_h
#define FaceConstraintsStatus_h

typedef NS_OPTIONS(uint64_t, FaceConstraintsStatus) {
    pass                    =  0,
    warning                 =  (1 << 0),
    fail                    =  (1 << 1),
    faceDirection           =  (1 << 3),
    faceTooFar              =  (1 << 4),
    faceTooClose            =  (1 << 5),
    faceMovement            =  (1 << 6),
    brightness              =  (1 << 7),
    darkness                =  (1 << 8),
    fps                     =  (1 << 9),
    exposure                =  (1 << 10),
    backlight               =  (1 << 11),
    cameraMovement          =  (1 << 12),
    network                 =  (1 << 13),
    server                  =  (1 << 14),
    faceMissing             =  (1 << 15),
    snr                     =  (1 << 16),
    calibration             =  (1 << 17),
    lighting                =  (1 << 18),
    faceOffTarget           =  (1 << 19),
    unknown                 =  (1 << 30)
};

#endif /* FaceConstraintsStatus_h */
