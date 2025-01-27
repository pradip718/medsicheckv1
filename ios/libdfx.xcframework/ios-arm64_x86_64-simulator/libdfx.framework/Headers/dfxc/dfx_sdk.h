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
#ifndef LIBDFX_C_LIBRARY_VERISON_H
#define LIBDFX_C_LIBRARY_VERISON_H

#include "dfxc/dfx_visibility.h"

#ifdef __cplusplus
extern "C" {
#endif

/**
 * \brief Obtain the version identifier string for the
 *        DFX Extraction library version.
 *
 * This is a convenience function which does not require a
 * factory instance to obtain and returns the same string as
 * dfx_factory_get_version.
 *
 * \note the returned buffer is a const internal reference and
 *       should not be released.
 */
DFX_API const char* dfx_sdk_get_version();

#ifdef __cplusplus
}
#endif

#endif