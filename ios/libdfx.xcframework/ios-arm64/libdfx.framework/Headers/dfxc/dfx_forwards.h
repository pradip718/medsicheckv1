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
#ifndef LIBDFX_C_FORWARDS_H
#define LIBDFX_C_FORWARDS_H

#include <stdint.h>
#include <stddef.h>

#ifdef __cplusplus
extern "C" {
#endif

struct dfx_client;
typedef struct dfx_client dfx_client;

struct dfx_error;
typedef struct dfx_error dfx_error;

struct dfx_face;
typedef struct dfx_face dfx_face;

struct dfx_factory;
typedef struct dfx_factory dfx_factory;

struct dfx_frame;
typedef struct dfx_frame dfx_frame;

struct dfx_chunk_data;
typedef struct dfx_chunk_data dfx_chunk_data;

struct dfx_collector;
typedef struct dfx_collector dfx_collector;

struct dfx_measurement_data;
typedef struct dfx_measurement_data dfx_measurement_data;

struct dfx_measurement_result;
typedef struct dfx_measurement_result dfx_measurement_result;

#ifdef __cplusplus
}
#endif

#endif