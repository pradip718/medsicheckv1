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
#ifndef LIBDFX_C_POSEPOINT_H
#define LIBDFX_C_POSEPOINT_H

#include "dfxc/dfx_visibility.h"

#include <stdint.h>

#ifdef __cplusplus
extern "C" {
#endif

/**
 * \brief Pose points are used to identify individual MPEG-4 Facial Data Points
 *        of a face.
 *
 * DFX utilizes a subset of the 84 feature points described in the MPEG-4
 * Facial Data Points when constructing regions of interest.
 *
 * \see <a href="http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.330.8043&rep=rep1&type=pdf">MPEG-4 Facial Data
 * Points</a>
 */
struct dfx_pose_point {
    /**
     * \brief the X point location information.
     */
    float x;

    /**
     * \brief the Y point location information.
     */
    float y;

    /**
     * \brief the Z point location information.
     */
    float z;

    /**
     * \brief if this point is valid, false otherwise.
     *
     * Because a face maybe partially obscured, not all points may be
     * valid within a specified face and this flag is used to indicate
     * those points which are not valid.
     */
    uint8_t valid;

    /**
     * \brief if this point is "well known", or estimated based on other
     * points.
     *
     * When the MPEG-4 feature points are based on machine learning
     * techniques, this value would be false as they are assumed to be
     * more strongly known. On the otherhand, if this point was extrapolated
     * or estimated based on other points that were machine learned,
     * this flag should be set to true.
     */
    uint8_t estimated;

    /**
     * \brief the probability quality probability of this point between
     * zero and one.
     *
     * Providing this information can help the region definitions chose
     * it's anchor points more accurately.
     */
    float quality;
};

#ifdef __cplusplus
}
#endif

#endif // LIBDFX_C_POSEPOINT_H
