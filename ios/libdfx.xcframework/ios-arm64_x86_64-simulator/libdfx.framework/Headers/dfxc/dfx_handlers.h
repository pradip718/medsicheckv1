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
#ifndef LIBDFX_C_HANDLERS_H
#define LIBDFX_C_HANDLERS_H

#include <stdint.h>
#include <stddef.h>

#ifdef __cplusplus
extern "C" {
#endif

typedef void (*dfx_string_callback_handler)(
   void* client_data,
   const char* string1
);

typedef void (*dfx_string_string_callback_handler)(
   void* client_data,
   const char* string1,
   const char* string2
);

typedef void (*dfx_float_callback_handler)(
        void* client_data,
        float value
);

typedef void (*dfx_payload_callback_handler)(
   void* client_data,
   uint8_t  valid,
   uint32_t start_frame,
   uint32_t end_frame,
   uint32_t chunk_number,
   uint32_t number_chunks,
   uint32_t first_chunk_start_time_s,
   uint32_t start_time_s,
   uint32_t end_time_s,
   float    duration_s,
   uint32_t number_payload_bytes,
   uint8_t* payload_data,
   uint32_t number_metadata_bytes,
   uint8_t* metadata
);

typedef void (*dfx_point_callback_handler)(
	void* client_data,
	float x,
	float y
);

typedef void (*dfx_constraint_callback_handler)(
	void* client_data,
	const char* string1,
	uint8_t result
);

typedef void (*dfx_vector_double_callback_handler)(
   void* client_data,
   uint32_t data_length,
   double* data
);

typedef void (*dfx_matrix_callback_handler)(
	void* client_data,
	uint16_t rows,
	uint16_t cols,
	uint8_t  pixel_type,
	size_t   stride,
	const uint8_t* data,
	uint8_t  order
);

#ifdef __cplusplus
}
#endif

#endif