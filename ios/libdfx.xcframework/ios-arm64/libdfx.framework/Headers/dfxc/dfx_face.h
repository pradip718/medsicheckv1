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
#ifndef LIBDFX_C_FACE_H
#define LIBDFX_C_FACE_H

#include <stdint.h>

#include "dfxc/dfx_forwards.h"
#include "dfxc/dfx_frame.h"
#include "dfxc/dfx_error.h"

#ifdef __cplusplus
extern "C" {
#endif

/**
 * \brief Creates a dfx_face identified by the name provided.
 *
 * The created dfx_face is owned by the caller and can be safely
 * destroyed typically after the face has been added to the
 * frame with dfx_frame_add_face.
 *
 * \param identifier to uniquely identify the face and associate
 *        this face over subsequent frames.
 * \param out_error error message on failure
 * \return a dfx_face which needs to be released by the caller
 *         or nullptr on failure.
 *
 * \see dfx_face_destroy
 * \see dfx_frame_add_face
 */
DFX_API dfx_face* dfx_face_create(
    const char* identifier,
    dfx_error** out_error);

/**
 * \brief Release the resources associated with this face.
 *
 * \param face which will have it's resources released.
 * \return true if face was succesfully destroyed, false otherwise.
 *
 * \see dfx_face_create
 * \note dfx_face instances are created by a dfx_client instance
 */
DFX_API uint8_t dfx_face_destroy(
	dfx_face* face);

/**
 * \brief Change the identifier associate with the dfx_face instance.
 *
 * Generally, the dfx_face will not need to have the associated
 * identifier updated after creation.
 *
 * \param face to be worked on
 * \param identifier to associate with the dfx_face
 * \param out_error error message on failure
 */
DFX_API void dfx_face_set_identifier(
	dfx_face* face,
	const char* identifier,
	dfx_error** out_error);

/**
 * \brief Obtain the identifier associate with the dfx_face instance.
 *
 * \param face to be worked on
 * \param out_error error message on failure
 * \return the identifier associated with the face
 *
 * \note the identifier is returned as a const char* to the
 *       internal representation and should not be freed, it will
 *       be released when the dfx_face instance is destroyed.
 */
DFX_API const char* dfx_face_get_identifier(
	dfx_face* face,
	dfx_error** out_error);

/**
 * \brief The bounding rectangle of the face.
 *
 * Identifies the crude bounding box of a face. Face detection
 * algorithms will typically identify the face rect and then
 * perform pose estimation within the faceRect to obtain more
 * detailed pose points for a face.
 *
 * \param face to work on
 * \param x top left co-ordinate in pixels
 * \param y top left co-ordinate in pixels
 * \param width the horizontal width in pixels
 * \param height the vertical height in pixels
 * \param out_error error message on failure
 */
DFX_API void dfx_face_set_face_rect(
	dfx_face* face,
	uint16_t x,
	uint16_t y,
	uint16_t width,
	uint16_t height,
	dfx_error** out_error);

/**
 * \brief Identifies if the pose is valid.
 *
 * If a pose is lost between subsequent frames, in the frames
 * it is lost the pose_valid should be set to false.
 *
 * In general, passing invalid poses will cause the dfx_measurement
 * constraints to be violated and the Measurement will need to be
 * reset in order to continue.
 *
 * \param face the face work on
 * \param pose_valid flag to set, true if valid, false if invalid
 * \param out_error error message on failure
 */
DFX_API void dfx_face_set_pose_valid(
	dfx_face* face,
	uint8_t pose_valid,
	dfx_error** out_error);

/**
 * \brief Identifies if the pose is detected or assumed based on prior
 *        knowledge.
 *
 * If a pose was not detected for this frame but instead
 * being provided as an estimate. It is used to help DFX know how
 * much it should trust this face data when making predictions.
 *
 * \param face the face work on
 * \param detected flag to set, true if detected, false if not detected
 * \param out_error error message on failure
 */
DFX_API void dfx_face_set_detected(
	dfx_face* face,
	uint8_t detected,
	dfx_error** out_error);

/**
 * \brief adds a dfx_pose_point to this face.
 *
 * dfx_pose_point information is required in order for more accurate
 * predictions which build regions of interest based on the defined
 * dfx_pose_points.
 *
 * \param face the face to work on
 * \param point_name the identifier for the dfx_pose_point.
 * \param x the x location of the pose point
 * \param y the y location of the pose point
 * \param z the z location of the pose point
 * \param valid is the pose point valid, or did it get obscured or off screen.
 * \param estimated is the pose point value being estimated based on previous frames.
 * \param quality is the estimated quality of the point on scale of 0 to 1, 100% accurate.
 * \param out_error error message on failure
 */
DFX_API void dfx_face_add_pose_point(
	dfx_face* face,
	const char* point_name,
	float x,
	float y,
	float z,
	uint8_t valid,
	uint8_t estimated,
	float quality,
	dfx_error** out_error);

/**
 * \brief are used to augment the face with additional data.
 *
 * While it is not required, applications can provide additional face
 * attributes for studies which know how to interpret the labels.
 *
 * An example of this might be "age" or "weight" of the individual
 * depicted by the face is known, the attributes can include that
 * metric data.
 *
 * Some libraries provide "pitch", "roll", and "yaw" for a face.
 *
 * All studies have a known set of attribute labels which they
 * expect or optionally can accept and ignore all others.
 *
 * \param face to work on
 * \param attribute_name to associate with the face
 * \param attribute to associate with this face
 * \param out_error error message on failure
 */
DFX_API void dfx_face_add_attribute(
	dfx_face* face,
	const char* attribute_name,
	double attribute,
	dfx_error** out_error);

#ifdef __cplusplus
}
#endif

#endif