/*
 *              Copyright (c) 2016-2019, Nuralogix Corp.
 *                      All Rights reserved
 *
 *      THIS SOFTWARE IS LICENSED BY AND IS THE CONFIDENTIAL AND
 *      PROPRIETARY PROPERTY OF NURALOGIX CORP. IT IS
 *      PROTECTED UNDER THE COPYRIGHT LAWS OF THE USA, CANADA
 *      AND OTHER FOREIGN COUNTRIES. THIS SOFTWARE OR ANY
 *      PART THEREOF, SHALL NOT, WITHOUT THE PRIOR WRITTEN CONSENT
 *      OF NURALOGIX CORP, BE USED, COPIED, DISCLOSED,
 *      DECOMPILED, DISASSEMBLED, MODIFIED OR OTHERWISE TRANSFERRED
 *      EXCEPT IN ACCORDANCE WITH THE TERMS AND CONDITIONS OF A
 *      NURALOGIX CORP SOFTWARE LICENSE AGREEMENT.
 */
#pragma once
#ifndef LIBDFX_C_VISIBILITY_H
#define LIBDFX_C_VISIBILITY_H

#if defined(_WIN32) || defined(__CYGWIN__)
  #ifdef DFX_BUILD_DLL
    #ifdef __GNUC__
      #define DFX_API __attribute__ ((dllexport))
    #else
      #define DFX_API __declspec(dllexport)
    #endif
  #else
    #ifdef __GNUC__
      #define DFX_API __attribute__ ((dllimport))
    #else
      #define DFX_API __declspec(dllimport)
    #endif
  #endif
#else
  #ifdef __EMSCRIPTEN__
    #include <emscripten.h>
    #define DFX_API EMSCRIPTEN_KEEPALIVE
  #else
    #if __GNUC__ >= 4
      #define DFX_API __attribute__ ((visibility ("default")))
    #else
      #define DFX_API
    #endif
  #endif
#endif

#endif