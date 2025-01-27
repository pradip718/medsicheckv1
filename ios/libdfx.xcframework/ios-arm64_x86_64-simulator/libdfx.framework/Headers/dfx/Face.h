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
#ifndef LIBDFX_FACE_H
#define LIBDFX_FACE_H

#include "dfx/PosePoint.h"

#include <map>
#include <string>

#include <opencv2/opencv.hpp>   // for core

namespace dfx {
    enum class FaceAttribute {
        SEX_ASSIGNED_AT_BIRTH = 1,        // SEX_ASSIGNED_MALE_AT_BIRTH, SEX_ASSIGNED_FEMALE_AT_BIRTH, SEX_NOT_PROVIDED
        AGE_YEARS = 2,                    // <NUMBER> of years old
        HEIGHT_CM = 3,                    // <NUMBER> of centimeters tall
        WEIGHT_KG = 4,                    // <NUMBER> of kilograms
        SMOKER = 5,                       // True (1) or False (0)
        HYPERTENSIVE = 6,                 // True (1) or False (0)
        BLOOD_PRESSURE_MEDICATION = 7,    // True (1) or False (0)
        DIABETES = 8,                     // DIABETES_NONE, DIABETES_TYPE1, DIABETES_TYPE2
    };

    enum class FaceAttributeValue {
        SEX_NOT_PROVIDED = 1,
        SEX_ASSIGNED_MALE_AT_BIRTH = 2,
        SEX_ASSIGNED_FEMALE_AT_BIRTH = 3,

        DIABETES_NONE = 4,
        DIABETES_TYPE1 = 5,
        DIABETES_TYPE2 = 6,
    };

/**
 * \struct Face Face.h "dfx/Face.h"
 *
 * \brief identifies the properties associated with faces within the
 * video frame.
 *
 * All faces must be represented by a unique id in order to correlate
 * faces across video frames, if you only have one face it can be something
 * as simple as "1".
 */
struct Face {
    /**
     * \brief the identity of this face.
     *
     * All faces must be uniquely identified within the DFX Engine.
     * If a facial recognition engine is being used, the name of the
     * individual can be used otherwise a GUID or counter may be
     * used.
     */
    std::string id;

    /**
     * \brief the bounding rectangle of the face.
     *
     * Identifies the crude bounding box of a face. Face detection
     * algorithms will typically identify the face rect and then
     * perform pose estimation within the faceRect to obtain more
     * detailed pose points for a face.
     */
    cv::Rect faceRect;

    /**
     * \brief if the pose points are valid for this face.
     *
     * In general, passing invalid poses will cause the Measurement
     * constraints to be violated and the Measurement will need to be
     * reset in order to continue.
     */
    bool poseValid;

    /**
     * \brief if the face was detected or assumed based on prior knowledge.
     *
     * It is used to help DFX know how much it should trust this face data
     * when making predictions.
     */
    bool detected;

    /**
     * \brief the PosePoint information for this face.
     *
     * PosePoint information is required in order for more accurate predictions
     * which build regions of interest based on the defined PosePoints.
     */
    std::map<std::string, dfx::PosePoint> posePoints;

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
     */
    std::map<std::string, double> attributes;
};
} // namespace dfx

#endif // LIBDFX_FACE_H
