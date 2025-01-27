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
#ifndef LIBDFX_C_CHUNKDATA_H
#define LIBDFX_C_CHUNKDATA_H

#include <stdint.h>

#include "dfxc/dfx_forwards.h"
#include "dfxc/dfx_handlers.h"
#include "dfxc/dfx_error.h"

#ifdef __cplusplus
extern "C" {
#endif

/**
 * \brief Release the resources associated with this dfx_chunk_data.
 *
 * \param chunk_data which will have it's resources released.
 * \return true if chunk_data was succesfully destroyed, false otherwise.
 *
 * \note dfx_face instances are created by a dfx_collector instance
 */
DFX_API uint8_t dfx_chunk_data_destroy(
	dfx_chunk_data* chunk_data);

/**
 * \brief The payload chunk of bytes to send for the current request.
 *
 * The chunk data is collapsed and summarized into the payload
 * information necessary for the server to construct the requested
 * signal(s).
 *
 * \param chunk_data to be worked on
 * \param handler called with chunk payload value
 * \param client_data to be passed to handler
 * \param out_error error message on failure
 */
DFX_API void dfx_chunk_data_get_chunk_payload(
	dfx_chunk_data* chunk_data,
	dfx_payload_callback_handler handler,
	void* client_data,
    dfx_error** out_error);

#ifdef __cplusplus
}
#endif

#endif