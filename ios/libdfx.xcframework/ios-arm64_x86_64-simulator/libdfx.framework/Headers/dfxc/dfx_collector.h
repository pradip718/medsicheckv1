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
#ifndef LIBDFX_C_COLLECTOR_H
#define LIBDFX_C_COLLECTOR_H

#include "dfxc/dfx_error.h"
#include "dfxc/dfx_forwards.h"
#include "dfxc/dfx_handlers.h"
#include "dfxc/dfx_video_frame.h"
#include "dfxc/dfx_visibility.h"

#ifdef __cplusplus
extern "C" {
#endif

typedef enum {
	DFX_CONSTRAINT_GOOD = 0,
	DFX_CONSTRAINT_WARN = 1,
	DFX_CONSTRAINT_ERROR = 2
} dfx_constraint_result;

typedef enum {
	DFX_STATE_WAITING = 0,
	DFX_STATE_COLLECTING = 1,
	DFX_STATE_CHUNKREADY = 2,
	DFX_STATE_COMPLETED = 3,
	DFX_STATE_ERROR = 4
} dfx_collector_state;

typedef enum {
    DFX_SEX_ASSIGNED_AT_BIRTH = 1,     // DFX_SEX_ASSIGNED_MALE_AT_BIRTH, DFX_SEX_ASSIGNED_FEMALE_AT_BIRTH, DFX_SEX_NOT_PROVIDED
    DFX_AGE_YEARS = 2,                 // <NUMBER> of years old
    DFX_HEIGHT_CM = 3,                 // <NUMBER> of centimeters tall
    DFX_WEIGHT_KG = 4,                 // <NUMBER> of kilograms
    DFX_SMOKER = 5,                    // True (1) or False (0)
    DFX_HYPERTENSIVE = 6,              // True (1) or False (0)
    DFX_BLOOD_PRESSURE_MEDICATION = 7, // True (1) or False (0)
    DFX_DIABETES = 8                   // DIABETES_NONE, DIABETES_TYPE1, DIABETES_TYPE2
} dfx_face_attribute;

typedef enum {
    DFX_SEX_NOT_PROVIDED = 1,
    DFX_SEX_ASSIGNED_MALE_AT_BIRTH = 2,
    DFX_SEX_ASSIGNED_FEMALE_AT_BIRTH = 3,

    DFX_DIABETES_NONE = 4,
    DFX_DIABETES_TYPE1 = 5,
    DFX_DIABETES_TYPE2 = 6,
} dfx_face_value;

/**
 * \brief Release the resources associated with this collector.
 *
 * \param collector which will have it's resources released.
 * \return true if face was succesfully destroyed, false otherwise.
 *
 * \see dfx_collector_create
 * \note dfx_collector instances are created by a dfx_client instance
 */
DFX_API uint8_t dfx_collector_destroy(
    dfx_collector* collector);

/**
 * \brief Creates a dfx_frame from a user supplied dfx_video_frame.
 *
 * \param collector to be worked on
 * \param video_frame is the associated image information
 * \param out_error error message on failure
 * \return a dfx_frame which needs to be released by the caller
 *         or nullptr on failure.
 *
 * \see dfx_frame_destroy
 */
DFX_API dfx_frame* dfx_frame_create(
    dfx_collector* collector,
    dfx_video_frame* video_frame,
    dfx_error** out_error);

/*!
 * \brief Starts a collection.
 *
 * When the client is ready to start a collection this
 * will move the collector from WAITING to COLLECTING
 * unless an ERROR has occurred.
 *
 * \param collector to be worked on
 * \param out_error error message on failure
 * \return the current internal state.
 */
DFX_API dfx_collector_state dfx_collector_start_collection(
	dfx_collector* collector,
	dfx_error** out_error);

/*!
 * \brief The current internal state of this measurement
 * collector.
 *
 * The internal state of this collector. This is the same
 * state returned by dfx_collector_define_regions or
 * dfx_collector_extract_channels.
 *
 * Once the collector is in error state, it will remain
 * in ERROR until reset which will place it back in WAITING.
 *
 * \param collector to be worked on
 * \param out_error error message on failure
 * \return the current internal state.
 */
DFX_API dfx_collector_state dfx_collector_get_state(
	dfx_collector* collector,
	dfx_error** out_error);

/**
 * \brief When the client creates a new Measurement with the 
 * API, the Collector should be prepared with the API
 * Measurement CreateResponse payload.
 *
 * \param collector to be worked on
 * \parma length the number of bytes in measurementResponsePayload
 * \param measurementResponsePayload the payload from DFX server
 * \param out_error error message on failure
 * \return true if collector was happy, false otherwise
 */
DFX_API uint8_t dfx_collector_prepare_measurement(
	dfx_collector* collector,
	uint32_t length,
    const uint8_t* measurementResponsePayload,
	dfx_error** out_error);

/*!
 * \brief Returns the operating mode of the Collector.
 *
 * The mode is configured in the Factory prior to Collector
 * creation.
 *
 * \param collector to be worked on
 * \param handler called with the mode being used
 * \param client_data to be passed to handler
 * \param out_error error message on failure
 */
DFX_API void dfx_collector_get_mode(
	dfx_collector* collector,
	dfx_string_callback_handler handler,
	void* client_data,
	dfx_error** out_error);

/*!
 * \brief Identifies what the anticipated FPS is suppose to be.
 *
 * The anticipated target FPS defaults to 30.0 FPS, but if a video
 * frame rate of 60.0 FPS or higher is required it can be customized. While
 * the actual FPS is established based on the individual VideoFrame
 * timestamps, the anticipated FPS assists with model calibration.
 *
 * Post-processing a pre-recorded video file will generally have a more
 * consisent FPS and yield less noisy results then a live extraction
 * which needs to share CPU processing power for video frame handling
 * with video frame processing.
 *
 * If the target or actual FPS falls outside model tolerances either too
 * high or too low the Measurement will be rejected.
 *
 * \param collector to be worked on
 * \param targetFPS the anticipated target FPS
 * \param out_error error message on failure
 * \return true if the target FPS was successfully changed, false otherwise.
 */
DFX_API uint8_t dfx_collector_set_target_fps(
	dfx_collector* collector,
	float targetFPS,
	dfx_error** out_error);

/*!
 * \brief Sets the desired collected chunk duration in seconds.
 *
 * Identifies to the collector what the desired chunk duration
 * should be in terms of seconds. This will typically ensure
 * that a chunk is ready for collecting whenever the duration
 * has been reached.
 *
 * \param collector to be worked on
 * \param chunkDurationSeconds the chunk duration in seconds
 * \param out_error error message on failure
 * \return true if the chunk duration was successfully changed, false
 * otherwise.
 */
DFX_API uint8_t dfx_collector_set_chunk_duration_seconds(
	dfx_collector* collector,
	float chunkDurationSeconds,
	dfx_error** out_error);

/*!
 * \brief Returns the desired collected chunk duration in seconds.
 *
 * \param collector to be worked on
 * \param out_error error message on failure
 * \return the chunk durations in seconds
 */
DFX_API float dfx_collector_get_chunk_duration_seconds(
	dfx_collector* collector,
	dfx_error** out_error);

/*!
 * \brief Sets number of chunks before the measurement is
 * complete.
 *
 * \param collector to be worked on
 * \param numberChunks the number of chunks
 * \param out_error error message on failure
 * \return true if the number of chunks is successfully
 * changed, false otherwise.
 */
DFX_API uint8_t dfx_collector_set_number_chunks(
	dfx_collector* collector,
	uint32_t numberChunks,
	dfx_error** out_error);

/*!
 * \brief Returns the total number of chunks the collector will
 * process for this measurement.
 *
 * \param collector to be worked on
 * \param out_error error message on failure
 * \return the total number of chunks 
 */
DFX_API uint32_t dfx_collector_get_number_chunks(
	dfx_collector* collector,
	dfx_error** out_error);

/**
 * \brief Enable constraint handling for the identified constraint.
 *
 * Some constraint validation can be done on the frames provided
 * by the client to ensure they meet sufficient criteria to
 * satisfy server data quality.
 *
 * This may include standard checks for things like face presence
 * and frame rate along with movement, lighting, etc.
 *
 * \param collector to be worked on
 * \param constraintID the constraint to enable
 * \param out_error error message on failure
 * \return true when constraintID was able to be enabled.
 */
DFX_API uint8_t dfx_collector_enable_constraint(
	dfx_collector* collector,
	const char* constraintID,
	dfx_error** out_error);

/**
 * \brief Disable a constraint for the identified constraint.
 *
 * If the constraint was currently enabled, it will be removed
 * from the set of currently active constraints. If it was
 * not active or does not exist, the request is ignored.
 *
 * \param collector to be worked on
 * \param constraintID the constraint to disable
 * \param out_error error message on failure
 * \return true when constraintID was able to be disabled.
 */
DFX_API uint8_t dfx_collector_disable_constraint(
	dfx_collector* collector,
	const char* constraintID,
	dfx_error** out_error);

/**
 * \brief Returns the currently enabled constraints.
 *
 * \param collector to be worked on
 * \param handler called with each of the enabled constraint IDs
 * \param client_data to be passed to handler.
 * \param out_error error message on failure
 */
DFX_API void dfx_collector_get_enabled_constraints(
    const dfx_collector* collector,
	dfx_string_callback_handler handler,
	void* client_data,
	dfx_error** out_error);

/**
 * \brief Obtain all available constraint IDs
 *
 * The set of available known constraint IDs which can be
 * enabled by calling setEnableConstraints.
 *
 * \param collector to be worked on
 * \param handler called with each of the available constraint IDs
 * \param client_data to be passed to handler.
 * \param out_error error message on failure
 */
DFX_API void dfx_collector_get_available_constraints(
	const dfx_collector* collector,
	dfx_string_callback_handler handler,
	void* client_data,
	dfx_error** out_error);

/**
 * \brief Check for constraint violations.
 *
 * When some constraints are enabled and a constraint
 * is detected as being violated that constraint will be
 * added to the violations list.
 *
 * \param collector to be worked on
 * \param frame the video frame currently being operated on
 * \param handler called with each of the available constraint results
 * \param client_data to be passed to handler.
 * \param out_error error message on failure
 * \return result of the constraint check
 */
DFX_API dfx_constraint_result dfx_collector_check_constraints(
	dfx_collector* collector,
	dfx_frame* frame,
	dfx_constraint_callback_handler handler,
	void* client_data,
	dfx_error** out_error);

/**
 * \brief Obtain a message which represents the violation ID.
 *
 * When presenting on a GUI, the returned constaint message is a more
 * meaningful representation of the constraint violation ID.
 *
 * \param collector to be worked on
 * \param violationID the constraint ID to obtain the error message for
 * \param handler called with each of the available constraint IDs
 * \param client_data to be passed to handler
 * \param out_error error message on failure
 */
DFX_API void dfx_collector_get_constraint_error_message(
	const dfx_collector* collector,
    const char* violationID,
    dfx_string_callback_handler handler,
	void* client_data,
    dfx_error** out_error);

/**
 * \brief Configures the constraint system properties.
 *
 * The constraint system configuration accepts a key "json" and the
 * corresponding JSON payload to configure the system.
 *
 * \param collector to be worked on
 * \param key the configuration key to work on, currently "json"
 * \param property the value to set this property to
 * \param out_error error message on failure
 * \return true if the property was successfully set, false on error
 */
DFX_API uint8_t dfx_collector_set_constraints_config(
	const dfx_collector* collector,
    const char* key,
    const char* property,
    dfx_error** out_error);

/**
 * \brief Obtains a constraint system property
 *
 * Returns the constraint value associated with the key.
 *
 * \param collector to be worked on
 * \param key the configuration key to work on, currently "json"
 * \param handler called with property value associated with key if exists
 *                or empty string if property does not exist
 * \param client_data to be passed to handler
 * \param out_error error message on failure
 */
DFX_API void dfx_collector_get_constraints_config(
	const dfx_collector* collector,
    const char* key,
    dfx_string_callback_handler handler,
	void* client_data,
    dfx_error** out_error);

/*!
 * \brief Return the set of pose points for the configured study.
 *
 * Once a study has been initialized this method will return
 * the list of pose points required for each found face.
 *
 * \param collector to be worked on
 * \param handler called with pose point MPEG-4 ids required
 * \param client_data to be passed to handler
 * \param out_error error message on failure
 */
DFX_API void dfx_collector_get_required_pose_point_ids(
	const dfx_collector* collector,
	dfx_string_callback_handler handler,
	void* client_data,
	dfx_error** out_error);

/**
 * \brief Define the regions of interest based upon the MPEG-4 Facial
 *        Data Points.
 *
 * A Measurement leverages many regions of interest which are areas of
 * a detected face to locate the required signals. This defineRegions
 * call will analyze and build the candidate region set which the
 * channels will be constructed from.
 *
 * \param collector to be worked on
 * \param frame the video frame currently being operated on
 * \param out_error error message on failure
 * \return the Measurement state after define regions
 */
DFX_API dfx_collector_state dfx_collector_define_regions(
	dfx_collector* collector,
    dfx_frame* frame,
    dfx_error** out_error);

/**
 * \brief Extracts the channels of interest from the video frame
 *        and regions of interest.
 *
 * A Measurement will collapse the candidate regions of interest down
 * to a set of channels of interest which the server will further
 * refine into a set of signals.
 *
 * \param collector to be worked on
 * \param frame the video frame currently being operated on
 * \param out_error error message on failure
 * \return the Measurement state after extract channels
 */
DFX_API dfx_collector_state dfx_collector_extract_channels(
	dfx_collector* collector,
    dfx_frame* frame,
    dfx_error** out_error);

/**
 * \brief Identifies when a collector has collected sufficient information
 *        to make a server request.
 *
 * \param collector to be worked on
 * \param out_error error message on failure
 * \return true if the chunk is ready to be sent, false otherwise
 */
DFX_API uint8_t dfx_collector_is_chunk_ready(
	dfx_collector* collector,
    dfx_error** out_error);

/**
 * \brief The approximate number of additional video frames required
 *        before sufficient information has been collected to make the
 *        server request.
 *
 * The number frames needed is a rough guide for the client application
 * to know how many more data points will be required for a request
 * to be sent. It is not a guarantee as variance will occur for a
 * number of reasons: variable frame rate, participant movement,
 * along with environment and camera impacts. When the collector
 * has collected enough data this will be zero and isChunkReady will
 * return true. The number of frames is not necessarily monotomically
 * decreasing.
 *
 * \param collector to be worked on
 * \param out_error error message on failure
 *
 * \return the anticipated number of frames remaining or zero if
 *         sufficient information has been collected. If there is
 *         an error or inability to calculate, -1 is returned.
 */
DFX_API int32_t dfx_collector_number_frames_needed(
	dfx_collector* collector,
    dfx_error** out_error);

/**
 * \brief The measurement chunk data which has been collected up
 *        for the current chunk until this point.
 *
 * The current Collector data is returned in a dfx_chunk_data
 * instance and the Collector is reset to continue processing the
 * next chunk.
 *
 * \param collector to be worked on
 * \param chunk_data the underlying data
 * \param out_error error message on failure
 */
DFX_API dfx_chunk_data* dfx_collector_get_chunk_data(
	dfx_collector* collector,
    dfx_error** out_error);

/**
 * \brief Decodes the binary measurement response payload from the server into
 *        a MeasurementResult.
 *
 * \param collector to be worked on
 * \param measurement_response_length number values in the data
 * \param measurement_response the raw data from the server to be decoded
 * \param out_error error message on failure
 * \return the decoded measurement result or nullptr on error
 */
DFX_API dfx_measurement_result* dfx_collector_decode_measurement_result(
	dfx_collector* collector,
    uint32_t measurement_response_length,
    const uint8_t* measurement_response,
    dfx_error** out_error);

/**
 * \brief Enables client applications wishing to associate their own
 *        metadata properties can associate key=value strings to the
 *        Measurement.
 *
 * If there is metadata that a client applications wishes to tag against
 * a Measurement request, ie. barcode or participant name they should
 * invoke dfx_collector_set_property with the appropriate value to
 * ensure that it is properly encoded into the Chunk Payload.
 *
 * \param collector to be worked on
 * \param key the identifier for the metadata property. If the key
 *        already exists it will be replaced.
 * \param property the value to set this property to
 * \param out_error error message on failure
 * \return true if property was set, false otherwise
 */
DFX_API uint8_t dfx_collector_set_property(
	const dfx_collector* collector,
    const char* key,
    const char* property,
    dfx_error** out_error);

/**
 * \brief Returns a metadata property by key name if it exists.
 *
 * The returned string will be the value of the current chunk
 * metadata property.
 *
 * \param collector to be worked on
 * \param key the identifier for the metadata property to be retrieved.
 * \param handler called with metadata property if it exists or an empty
 *        string if the key did not exist
 * \param client_data to be passed to handler
 * \param out_error error message on failure
 */
DFX_API void dfx_collector_get_property(
	const dfx_collector* collector,
    const char* key,
    dfx_string_callback_handler handler,
	void* client_data,
    dfx_error** out_error);

/**
 * \brief Removes a metadata property by key name if it exists.
 *
 * \param collector to be worked on
 * \param key the identifier for the metadata property to be retrieved.
 * \param out_error error message on failure
 */
DFX_API void dfx_collector_remove_property(
	const dfx_collector* collector,
    const char* key,
    dfx_error** out_error);

/**
 * \brief Obtains the Chunk metadata for this collector request.
 *
 * The returned chunk metadata is a superset of the metadata provided
 * by the client application. Additional collector details are
 * augmented into the chunk metadata.
 *
 * \param collector to be worked on
 * \param handler called with metadata property key, values strings
 * \param client_data to be passed to handler
 * \param out_error error message on failure
 */
DFX_API void dfx_collector_get_properties(
	const dfx_collector* collector,
    dfx_string_string_callback_handler handler,
	void* client_data,
    dfx_error** out_error);

/**
 * \brief If there was an error dfx_collector_get_last_error_message
 * may contain more information about why the error occurred.
 *
 * \param collector to be worked on
 * \param handler called with the last known error message
 * \param client_data to be passed to handler
 * \param out_error error message on failure
 */
DFX_API void dfx_collector_get_last_error_message(
	const dfx_collector* collector,
    dfx_string_callback_handler handler,
	void* client_data,
    dfx_error** out_error);

/**
 * \brief Cancel the current collection.
 *
 * When a collection violates as constraint or otherwise needs
 * to stop this method can be called placing the collector back
 * into a WAIT state until the client calls startCollection
 * again.
 *
 * \param collector to be worked on
 * \param out_error error message on failure
 */
DFX_API void dfx_collector_cancel_collection(
	const dfx_collector* collector,
    dfx_error** out_error);

/**
 * \brief Stop the current collection.
 *
 * When a collection violates as constraint or otherwise needs
 * to stop this method can be called placing the collector back
 * into a WAIT state until the client calls startCollection
 * again.
 *
 * \param collector to be worked on
 * \param out_error error message on failure
 *
 * \deprecated replaced by cancelCollection which more accurately
 * describes the activity since the measurement can not be resumed
 * before being reset. Please use cancelCollection as this method
 * will eventually be removed as it simply calls cancelCollection.
 */
DFX_API void dfx_collector_stop_collection(
	const dfx_collector* collector,
    dfx_error** out_error);

/**
 * \brief Forces the completion of a collection.
 *
 * Collections will trigger a ChunkAvailable when enough data
 * has been collected. When processing a video file, the final
 * chunk may be insufficient in length and never trigger the
 * ChunkAvailable state. forceComplete() will force the
 * collector into a measurement Complete state and create a
 * final payload with any remaining state.
 *
 * \param collector to be worked on
 * \param out_error error message on failure
 */
DFX_API void dfx_collector_force_complete(
	const dfx_collector* collector,
    dfx_error** out_error);

/**
 * \brief Resets the collector state to construct a new chunk.
 *
 * The Measurement maintains internal buffers and state when
 * constructing a chunk which needs to be reset when a new
 * chunk collection starts. A client application can discard
 * a Measurement and all accumulated state by calling
 * dfx_collector_reset.
 *
 * \param collector to be worked on
 * \param out_error error message on failure
 */
DFX_API void dfx_collector_reset_collection(
	const dfx_collector* collector,
    dfx_error** out_error);

/**
 * \brief Add user data information to a payload using dfx_face_attribute key and values.
 *
 * \param collector to be worked on
 * \param face_id the face identifier to use, typically "1"
 * \param key the attribute key identifying the value being provided
 * \param value the attribute value associated with key
 * \param out_error error message on failure
 * \return true if value was applied, false if invalid value or unable to apply.
 */
DFX_API uint8_t dfx_collector_set_face_attribute_with_enum(
    const dfx_collector* collector,
    const char* face_id,
    dfx_face_attribute key,
    dfx_face_value value,
    dfx_error** out_error);

/**
 * \brief Add user data information to a payload using FaceAttribute key and numeric/boolean value.
 *
 * \param collector to be worked on
 * \param face_id the face identifier to use, typically "1"
 * \param key the attribute key identifying the value being provided
 * \param value the attribute value associated with key
 * \param out_error error message on failure
 * \return true if value was applied, false if invalid value or unable to apply.
 */
DFX_API uint8_t dfx_collector_set_face_attribute_with_value(
    const dfx_collector* collector,
    const char* face_id,
    dfx_face_attribute key,
    double value,
    dfx_error** out_error);

/**
 * \brief Provide the cloud results to the Collector to potentially improve the result.
 *
 * If the results obtained from the cloud are available to the Collector, it can make
 * additional optimizations on future payloads and provide more informed feedback.
 *
 * \param collector to be worked on
 * \param json_cloud_results the JSON results obtained from the DeepAffex Cloud API’s
 *        SubscribeToResults endpoint (Action ID: 510)
 * \param out_error error message on failure
 * \return true if result data was valid, false if result data was not valid.
 */
DFX_API uint8_t dfx_collector_set_cloud_results_feedback(const dfx_collector* collector,
                                                         const char* json_cloud_results,
                                                         dfx_error** out_error);

/**
 * \brief Configures a model within the Collector.
 *
 * \param collector to be worked on
 * \param model_type A numeric identifier associated with the model implementation
 * \param data_length Length of configuration data model in bytes
 * \param data Configuration data associated with the model
 * \param out_error error message on failure
 * @return true if the model was configured, false if it was not (invalid model, models not supported)
 */
DFX_API uint8_t dfx_collector_initialize_model(
        const dfx_collector* collector,
        int8_t model_type,
        uint32_t data_length,
        const uint8_t* data,
        dfx_error** out_error);

#ifdef __cplusplus
}
#endif

#endif