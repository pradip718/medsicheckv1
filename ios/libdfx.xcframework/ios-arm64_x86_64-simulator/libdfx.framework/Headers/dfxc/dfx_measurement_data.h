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
#ifndef LIBDFX_C_MEASUREMENT_DATA_H
#define LIBDFX_C_MEASUREMENT_DATA_H

#include "dfxc/dfx_error.h"
#include "dfxc/dfx_forwards.h"
#include "dfxc/dfx_handlers.h"
#include "dfxc/dfx_visibility.h"

#ifdef __cplusplus
extern "C" {
#endif

/**
 * \brief Function to be called to destroy a dfx_measurement_data instance.
 *
 * \param measurement_data to be released
 * \return true if measurement_data was succesfully destroyed, false otherwise.
 */
DFX_API uint8_t dfx_measurement_data_destroy(
	dfx_measurement_data* measurement_data);

/**
 * \brief Returns true if this measurement data is valid, otherwise
 * returns false.
 *
 * \param measurement_data instance to be checked
 * \param out_error error message on failure
 * \return true (non-zero) if measurement data is valid, otherwise false (zero)
 */
DFX_API uint8_t dfx_measurement_data_is_valid(
    dfx_measurement_data* measurement_data,
    dfx_error** out_error);

/**
 * \brief Returns a list of measurement data property keys that can be used with
 * getDataProperty().
 *
 * \param measurement_data instance to be checked
 * \param handler called with each of the property keys
 * \param client_data to be passed to handler.
 * \param out_error error message on failure
 */
DFX_API void dfx_measurement_data_get_data_property_keys(
	dfx_measurement_data* measurement_data,
	dfx_string_callback_handler handler,
	void* client_data,
	dfx_error** out_error);

/**
 * \brief Returns a measurement data property by key.
 *
 * Measurement data may include additional properties which are available
 * based upon what is returned by getDataPropertyKeys().
 *
 * This may include for instance "id" which could be "HEART_RATE" if the
 * signal this MeasurementData represents is associated with "HEART_RATE".
 *
 * \param measurement_data instance to be checked
 * \param key the data property key to be looked up
 * \param handler called with property value associated with key if exists
 *                or empty strin if property does not exist
 * \param client_data to be passed to handler.
 * \param out_error error message on failure
 */
DFX_API void dfx_measurement_data_get_data_property(
	const dfx_measurement_data* measurement_data,
    const char* key,
    dfx_string_callback_handler handler,
	void* client_data,
    dfx_error** out_error);

/**
 * \brief Returns the numerical data associated with this MeasurmentData.
 *
 * The vector can contain one or more values based upon the study definition
 * and what the server is able to provide.
 *
 * For instance, if the MeasurementData is for "HEART_RATE" this may be
 * one value which would be a summary for the entire measurement chunk
 * or it could be an estimated value per-frame of the measurement chunk.
 *
 * \param measurement_data instance to be used
 * \param handler called with the data
 * \param client_data to be passed to handler.
 * \param out_error error message on failure
 */
DFX_API void dfx_measurement_data_get_data(
	const dfx_measurement_data* measurement_data,
    dfx_vector_double_callback_handler handler,
	void* client_data,
    dfx_error** out_error);

#ifdef __cplusplus
}
#endif

#endif