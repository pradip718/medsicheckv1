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
#ifndef LIBDFX_C_FRAME_H
#define LIBDFX_C_FRAME_H

#include "dfxc/dfx_error.h"
#include "dfxc/dfx_forwards.h"
#include "dfxc/dfx_handlers.h"
#include "dfxc/dfx_visibility.h"

#ifdef __cplusplus
extern "C" {
#endif

/**
 * \brief Release the resources associated with this frame.
 *
 * \param frame which will have it's resources released.
 * \return true if face was succesfully destroyed, false otherwise.
 *
 * \see dfx_frame_create
 * \note dfx_frame instances are created by a dfx_client instance
 */
DFX_API uint8_t dfx_frame_destroy(
	dfx_frame* frame);

/**
 * \brief Add a face and associated data to the frame.
 *
 * Multiple faces can be added if an image contains multiple faces.
 *
 * \param frame to be worked on
 * \param face to add to this Frame.
 * \param out_error error message on failure
 * \return true if added successfully, false if a limit was reached.
 *
 * \note the face still needs to be released by caller with dfx_face_destroy
 * when it no longer needs the reference.
 */
DFX_API uint8_t dfx_frame_add_face(
	dfx_frame* frame,
    dfx_face*  face,
    dfx_error** out_error);

/**
 * \brief Calculates the quality metrics for the current frame.
 *
 * \deprecated: Support for this method will be removed in a future
 * release. Please use the dfx_frame_get_optical_quality_metrics instead.
 *
 * The provided ISO and exposure settings along with the current frame
 * image data are used to construct a set of quality metrics which
 * are used by the exposure algorithm to determine if the ISO needs
 * to be increased or decreased to improve the image quality.
 *
 * \param frame to be worked on
 * \param iso the current iso setting
 * \param exposure the current exposure setting
 * \param array_size is the maximum size of the float array
 * \param array is the float metrics
 * \param number_metrics the number of metrics up to maximum size
 * \return true if successful, false on failure
 */
DFX_API uint8_t dfx_frame_get_quality_metrics(dfx_frame* frame,
                                              float iso,
                                              float exposure,
                                              int array_size,
                                              float* array,
                                              int* number_metrics
                                              );

/**
 * \brief Calculates the quality metrics for the current frame.
 *
 * \param frame to be worked on
 * \param array_size is the maximum size of the float array
 * \param array is the float metrics
 * \param number_metrics the number of metrics up to maximum size
 * \return true if successful, false on failure
 */
DFX_API uint8_t dfx_frame_get_optical_quality_metrics(dfx_frame* frame,
                                              int array_size,
                                              float* array,
                                              int* number_metrics
);

/**
 * \brief Provide the 5-star rating value for the current frame.
 *
 * \deprecated: Support for this method will be removed in a future
 * release. Please use the dfx_frame_get_optical_quality_rating instead.
 *
 * \param feedback_size the length of the feedback buffer
 * \param the feedback string buffer
 * \param rating calculated rating value being returned
 * \return true if successful, false on failure
 */
DFX_API uint8_t dfx_frame_get_star_rating(dfx_frame* frame,
                                          int feedback_size,
                                          char *feedback,
                                          int* rating);

/**
 * \brief Provide the 5-star rating value for the current frame.
 *
 * \param feedback_size the length of the feedback buffer
 * \param the feedback string buffer
 * \param rating calculated rating value being returned
 * \return true if successful, false on failure
 */
DFX_API uint8_t dfx_frame_get_optical_quality_rating(dfx_frame* frame,
                                          int feedback_size,
                                          char *feedback,
                                          int* rating);

/**
 * \brief Adds a marker/label to a frame.
 *
 * If multiple events occur within a frame, multiple markers can be
 * addedd and annotated against a frame.
 *
 * \param frame to be worked on
 * \param label the text marker to associate with the frame
 * \param out_error error message on failure
 * \return true if added successfully, false if a limit was reached.
 */
DFX_API uint8_t dfx_frame_add_marker(
	dfx_frame* frame,
    const char* label,
    dfx_error** out_error);

/**
 * \brief Returns the marker/labels in a video frame.
 *
 * \param frame to be worked on
 * \param handler called with marker within this frame
 * \param client_data to be passed to handler.
 * \param out_error error message on failure
 */
DFX_API void dfx_frame_get_markers(
	dfx_frame* frame,
	dfx_string_callback_handler handler,
	void* client_data,
	dfx_error** out_error);

/**
 * \brief Returns a list of desired face attributes for this
 * frame.
 *
 * This enables the DFX engine to request additional
 * properties like "age", "gender", "weight" etc. which
 * it would like to have but which might not always be
 * available depending upon the use case.
 *
 * These attributes should be added to the Face attribute
 * map if they are available for the current frame.
 *
 * \param frame to be worked on
 * \param handler called with attribute
 * \param client_data to be passed to handler.
 * \param out_error error message on failure
 */
DFX_API void dfx_frame_get_desired_face_attributes(
	dfx_frame* frame,
	dfx_string_callback_handler handler,
	void* client_data,
	dfx_error** out_error);

/**
 * \brief Returns a list of desired device attributes for this
 * frame.
 *
 * This enables the DFX engine to request additional
 * properties like "acceleration", "rotation", etc. which
 * it would like to have but which might not always be
 * available depending upon the use case.
 *
 * These attributes should be added with frame dfx_frame_set_device_attribute
 * if they are available for the current frame.
 *
 * \param frame to be worked on
 * \param handler called with attribute
 * \param client_data to be passed to handler.
 * \param out_error error message on failure
 * \see dfx_frame_set_device_attribute
 */
DFX_API void dfx_frame_get_desired_device_attributes(
	dfx_frame* frame,
	dfx_string_callback_handler handler,
	void* client_data,
	dfx_error** out_error);

/**
 * \brief Returns the value of a device attribute if it exists or zero.
 *
 * \param frame to be worked on
 * \param key the attribute name.
 * \param out_error error message on failure
 * \return value the value of the attribute or zero.
 */
DFX_API double dfx_frame_get_device_attribute(
	dfx_frame* frame,
	const char* key,
    dfx_error** out_error);

/**
 * \brief add a device attribute
 *
 * Device attributes are things like "acceleration" or "rotation".
 *
 * When these attributes involve multiple values, like X and Y co-ordinates
 * they should be expanded as "acceleration:x" and "acceleration:y".
 *
 * \param frame to be worked on
 * \param key the attribute name.
 * \param value the value of the attribute.
 * \param out_error error message on failure
 */
DFX_API void dfx_frame_set_device_attribute(
	dfx_frame* frame,
	const char* key,
    double value,
    dfx_error** out_error);

/**
 * \brief obtain the known face identifiers within this frame.
 *
 * Every face is known by an identifier which uniquely identifies
 * the face.
 *
 * \param frame to be worked on
 * \param handler called with each face ID within this frame
 * \param client_data to be passed to handler.
 * \param out_error error message on failure
 */
DFX_API void dfx_frame_get_face_identifiers(
    const dfx_frame* frame,
	dfx_string_callback_handler handler,
	void* client_data,
	dfx_error** out_error);

/**
 * \brief obtains the names of regions which are defined for the
 * face within this frame.
 *
 * \deprecated: Support for this method will be removed in a future release.
 *
 * \param frame to be worked on
 * \param face_id identifier for the face of interest
 * \param handler called with each region names within this frame for face_id
 * \param client_data to be passed to handler.
 * \param out_error error message on failure
 */
DFX_API void dfx_frame_get_region_names(
    const dfx_frame* frame,
    const char* face_id,
	dfx_string_callback_handler handler,
	void* client_data,
	dfx_error** out_error);

/**
 * \brief obtain the polygon for the region of interest.
 *
 * \deprecated: Support for this method will be removed in a future release.
 *
 * \param frame to be worked on
 * \param face_id identifier for the face of interest
 * \param region_name identifier for region of interest
 * \param handler called with each dfx_point in the region of interest
 * \param client_data to be passed to handler.
 * \param out_error error message on failure
 */
DFX_API void dfx_frame_get_region_polygon(
	const dfx_frame* frame,
	const char* face_id,
	const char* region_name,
	dfx_point_callback_handler handler,
	void* client_data,
	dfx_error** out_error
	);

/**
 * \brief Regions can have numeric properties attached to them.
 *
 * \deprecated: Support for this method will be removed in a future release.
 *
 * \param frame to be worked on
 * \param face_id identifier for the face of interest
 * \param region_name identifier for region of interest
 * \param property to be returned
 * \param out_error error message on failure
 * \return the value of the property
 */
DFX_API int32_t dfx_frame_get_region_int_property(
	const dfx_frame* frame,
	const char* face_id,
	const char* region_name,
	const char* property,
	dfx_error** out_error
	);

/**
 * \brief obtain the histogram for a region of interest.
 *
 * \deprecated: Support for this method will be removed in a future release.
 *
 * \param frame to be worked on
 * \param face_id identifier for the face of interest
 * \param region_name identifier for region of interest
 * \param handler called with the histogram for the region of interest
 * \param client_data to be passed to handler.
 * \param out_error error message on failure
 */
DFX_API void dfx_frame_get_region_histogram(
	const dfx_frame* frame,
	const char* face_id,
	const char* region_name,
	dfx_matrix_callback_handler handler,
	void* client_data,
	dfx_error** out_error
	);

#ifdef __cplusplus
}
#endif

#endif