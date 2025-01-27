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
#ifndef LIBDFX_C_FACTORY_H
#define LIBDFX_C_FACTORY_H

#include "dfxc/dfx_error.h"
#include "dfxc/dfx_forwards.h"
#include "dfxc/dfx_handlers.h"
#include "dfxc/dfx_collector.h"
#include "dfxc/dfx_visibility.h"

#include <stdint.h>

#ifdef __cplusplus
extern "C" {
#endif

/**
 * \brief Creates a factory instance.
 *
 * \return a dfx_factory which needs to be released by the caller
 *         or nullptr on failure. */
DFX_API dfx_factory* dfx_factory_create();

/**
 * \brief Function to be called typically on shutdown to
 *        release all of the dfx_factory resources.
 *
 * \param factory to be released
 * \return true if factory was succesfully destroyed, false otherwise.
 */
DFX_API uint8_t dfx_factory_destroy(
    dfx_factory* factory);

/**
 * \brief Obtain the version identifier string for a dfx_factory
 *        instance.
 *
 * \param factory to be worked on
 * \param out_error error message on failure
 * \return the version identifer for the dfx_factory.
 *
 * \note the returned buffer is a const internal reference and
 *       should not be released.
 */
DFX_API const char* dfx_factory_get_version(
    dfx_factory* factory,
    dfx_error** out_error);

/**
 * \brief The ID of this DFX Extraction library.
 *
 * When requesting a study file from the DFX server it
 * requires an ID which is returned by this method.
 *
 * \param factory to be worked on
 * \param out_error error message on failure
 * \return the ID of this DFX Extraction library.
 *
 * \since 4.3.13
 * \note the returned buffer is a const internal reference and
 *       should not be released.
 */
DFX_API const char* dfx_factory_get_sdk_id(
        dfx_factory* factory,
        dfx_error** out_error);

/**
 * \brief Set the operating mode which will be used when
 *        creating a new collector.
 *
 * Identifies the collector as being a "streaming" or
 * a "discrete" collector. By default the collector
 * is considered "discrete".
 *
 * \param factory to be worked on
 * \param mode the string representing the operating mode.
 * \param out_error error message on failure
 * \return true if the mode was successfully changed, false
 *         otherwise.
 */
DFX_API uint8_t dfx_factory_set_mode(
    dfx_factory* factory,
    const char* mode,
    dfx_error** out_error);

/**
 * \brief Returns the current operating mode used when
 *        creating collectors.
 *
 * \param factory to be worked on
 * \param out_error error message on failure
 * \return the currently configured operating mode
 *
 * \note the returned buffer is a const internal reference and
 *       should not be released.
 */
DFX_API const char* dfx_factory_get_mode(
    dfx_factory* factory,
    dfx_error** out_error);

/**
 * \brief If there was an error dfx_factory_get_last_error_message
 * may contain more information about why the error occurred.
 *
 * \param collector to be worked on
 * \param handler called with the last known error message
 * \param client_data to be passed to handler
 * \param out_error error message on failure
 */
DFX_API void dfx_factory_get_last_error_message(
    const dfx_factory* factory,
    dfx_string_callback_handler handler,
    void* client_data,
    dfx_error** out_error);

/**
 * \brief Specifies a configurable property key/value pair to
 * configure the DFX Engine.
 *
 * \param factory to be worked on
 * \param key of property to configure.
 * \param value of property to configure.
 * \param out_error error message on failure
 *
 * \see dfx_factory_get_valid_properties
 */
DFX_API void dfx_factory_set_property(
    dfx_factory* factory,
    const char* key,
    const char* value,
    dfx_error** out_error);

/**
 * \brief Returns a property value for a key.
 *
 * \param factory to be worked on
 * \param key to obtain the property value for.
 * \param handler to be called back with the value.
 * \param factory_data to be passed to handler.
 * \param out_error error message on failure
 */
DFX_API void dfx_factory_get_property(
    dfx_factory* factory,
    const char* key,
    dfx_string_callback_handler handler,
    void* factory_data,
    dfx_error** out_error);

/**
 * \brief Removes a property from the factory if it exists.
 *
 * \param factory to be worked on
 * \param key of property to remove if it exists, ignored if it does not exist.
 * \param out_error error message on failure
 *
 * \see dfx_factory_get_valid_properties, dfx_factory_set_property
 */
DFX_API void dfx_factory_remove_property(
    dfx_factory* factory,
    const char* key,
    dfx_error** out_error);

/**
 * \brief Obtain a list of valid property keys which can be configured.
 *
 * \param factory to be worked on
 * \param handler to be called back with the values.
 * \param factory_data to be passed to handler.
 * \param out_error error message on failure
 *
 * \see dfx_factory_set_property
 */
DFX_API void dfx_factory_get_valid_properties(
    dfx_factory* factory,
	dfx_string_callback_handler handler,
	void* factory_data,
	dfx_error** out_error);

/**
 * \brief Initializes the factory to create collectors for a study
 * with a memory based data definition.
 *
 * An instance of a DFXFactory will only create collectors for the most
 * recently configured study. Previously initialized study definitions
 * are replaced with the new data if true is returned.
 *
 * \param factory to be worked on
 * \param length of response data buffer
 * \param response from the server which identifies the study
 *        characteristics this dfx_factory will use.
 * \param out_error error message on failure
 * \return true if the the data passes some basic sanity, false otherwise.
 *
 * \see DFXNetworkAPI
 */
DFX_API uint8_t dfx_factory_initialize_study(
    dfx_factory* factory,
    uint32_t length,
    const uint8_t* response,
    dfx_error** out_error);

/**
 * \brief Adds to the study definition when a definition is comprised
 * of multiple parts with an additional memory based definition.
 *
 * If this is the first call, it will initialize the study with the
 * definition otherwise it will be added to the existing data
 * definitions.
 *
 * \param factory to be worked on
 * \param length of response data buffer
 * \param response from the server which identifies the study
 *        characteristics this dfx_factory will use.
 * \param out_error error message on failure
 * \return true if the the data passes some basic sanity, false otherwise.
 *
 * \see DFXNetworkAPI
 */
DFX_API uint8_t dfx_factory_add_to_study(
    dfx_factory* factory,
    uint32_t length,
    const uint8_t* response,
    dfx_error** out_error);

/**
 * \brief Initializes the factory to create collectors for a study
 * with a file based data definition.
 *
 * An instance of a DFXFactory will only create collectors for the most
 * recently configured study. Previously initialized study definitions
 * are replaced with the new data if true is returned.
 *
 * \param factory to be worked on
 * \param pathToFile the filesystem path to the file to load
 * \param out_error error message on failure
 * \return true if the the data passes some basic sanity, false otherwise.
 *
 * \see DFXNetworkAPI
 */
DFX_API uint8_t dfx_factory_initialize_study_from_file(
    dfx_factory* factory,
    const char* pathToFile,
    dfx_error** out_error);

/**
 * \brief Adds to the study definition when a definition is comprised
 * of multiple parts with an additional file based definition.
 *
 * If this is the first call, it will initialize the study with the
 * definition otherwise it will be added to the existing data
 * definitions.
 *
 * \param factory to be worked on
 * \param pathToFile the filesystem path to the file to load
 * \param out_error error message on failure
 * \return true if the the data passes some basic sanity, false otherwise.
 *
 * \see DFXNetworkAPI
 */
DFX_API uint8_t dfx_factory_add_to_study_from_file(
    dfx_factory* factory,
    const char* pathToFile,
    dfx_error** out_error);

/**
 * \brief Creates a dfx_collector to process video frames and build a
 * request payload.
 *
 * \param factory to be worked on
 * \return a dfx_collector which needs to be released by the caller
 *         or nullptr on failure.
 *
 * \see dfx_collector_destroy
 */
DFX_API dfx_collector* dfx_collector_create(
    dfx_factory* factory);

#ifdef __cplusplus
}
#endif

#endif
