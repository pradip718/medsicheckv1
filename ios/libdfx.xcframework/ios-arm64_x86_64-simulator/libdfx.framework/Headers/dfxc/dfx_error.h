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
#ifndef LIBDFX_C_ERROR_H
#define LIBDFX_C_ERROR_H

#include "dfxc/dfx_forwards.h"
#include "dfxc/dfx_visibility.h"

#include <stdint.h>

#ifdef __cplusplus
extern "C" {
#endif

/**
 * \brief get the internal string representation of this error.
 * \param error message to translate to string representation.
 * \return error message details
 */
DFX_API const char* dfx_error_message(dfx_error* error);

/**
 * \brief release the memory associated with the error.
 * \param error message to release.
 * \return true on success, false otherwise.
 */
DFX_API uint8_t dfx_error_destroy(dfx_error* error);

/// \cond UNDOCUMENTED_METHODS
/**
 * \brief a convenience for validating the dfx_error handling mechanism
 * from FFI bindings. The returned dfx_error will need to be destroyed.
 */
DFX_API void dfx_error_test_throw(const char* message, dfx_error** out_error);
/// \endcond

#ifdef __cplusplus
}
#endif

#endif