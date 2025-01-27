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
#ifndef LIBDFX_C_MEASUREMENT_RESULT_H
#define LIBDFX_C_MEASUREMENT_RESULT_H

#include "dfxc/dfx_error.h"
#include "dfxc/dfx_forwards.h"
#include "dfxc/dfx_handlers.h"
#include "dfxc/dfx_visibility.h"

#ifdef __cplusplus
extern "C" {
#endif

/**
 * \brief Function to be called to destroy a dfx_measurement_result instance.
 *
 * \param measurement_result to be released
 * \return true if measurement_result was succesfully destroyed, false otherwise.
 */
DFX_API uint8_t dfx_measurement_result_destroy(
	dfx_measurement_result* measurement_result);

/**
 * \brief Returns true if this measurement result is valid, otherwise
 * returns false.
 *
 * \param measurement_result instance to be checked
 * \param out_error error message on failure
 * \return true (non-zero) if measurement data is valid, otherwise false (zero)
 */
DFX_API uint8_t dfx_measurement_result_is_valid(
    dfx_measurement_result* measurement_result,
    dfx_error** out_error);

/**
 * \brief Returns a list of measurement property keys that can be used with
 * getMeasurementProperty().
 *
 * \param measurement_result instance to be checked
 * \param handler called with each of the property keys
 * \param client_data to be passed to handler.
 * \param out_error error message on failure
 */
DFX_API void dfx_measurement_result_get_measurement_property_keys(
	dfx_measurement_result* measurement_result,
	dfx_string_callback_handler handler,
	void* client_data,
	dfx_error** out_error);

/**
 * Obtain individual properties associated with this MeasurementResult.
 *
 * These properties are useful when communicating with the server about the
 * Measurement. Specifically, it will include "MeasurementID",
 * "MeasurementDataID", "MeasurementResultID" and possibly others.
 *
 * \param measurement_result instance to be checked
 * \param key the data property key to be looked up
 * \param handler called with property value associated with key if exists
 *                or empty strin if property does not exist
 * \param client_data to be passed to handler.
 * \param out_error error message on failure
 */
DFX_API void dfx_measurement_result_get_measurement_property(
	const dfx_measurement_result* measurement_result,
    const char* key,
    dfx_string_callback_handler handler,
	void* client_data,
    dfx_error** out_error);

/**
 * Returns a list of available data keys contained in this measurement result.
 *
 * The actual list is a function of the study definition and what the server
 * was able to generate based upon the data provided. This is a convenience
 * method to assist in inspecting the measurment data result, but if you
 * know the keys of interest those can be asked for directly using
 * getMeasurementData().
 *
 * Possible keys might include "HEART_RATE", "SNR", etc.
 *
 * \param measurement_result instance to be checked
 * \param handler called with each of the property keys
 * \param client_data to be passed to handler.
 * \param out_error error message on failure
 */
DFX_API void dfx_measurement_result_get_measurement_data_keys(
    dfx_measurement_result* measurement_result,
    dfx_string_callback_handler handler,
    void* client_data,
    dfx_error** out_error);

/**
 * Obtains the MeasurementData for a known key.
 *
 * If the key does not exist, a MeasurementData will be returned which
 * is empty and not valid. Otherwise, if the key does exist it will be
 * returned.
 *
 * \param dfx_measurement_result instance to be used
 * \param key to obtain dfx_measurement_data for
 * \param out_error error message on failure
 */
DFX_API dfx_measurement_data* dfx_measurement_result_get_measurement_data(
	const dfx_measurement_result* measurement_result,
    const char* key,
    dfx_error** out_error);

/**
 * \brief Returns a property value for a key.
 *
 * \param measurement_result to be worked on
 * \param handler to be called back with the error code value.
 * \param client_data to be passed to handler.
 * \param out_error error message on failure
 */
DFX_API void dfx_measurement_result_get_error_code(
    dfx_measurement_result* measurement_result,
    dfx_string_callback_handler handler,
    void* client_data,
    dfx_error** out_error);

#ifdef __cplusplus
}
#endif

#endif