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
#ifndef LIBDFX_POSEPOINT_H
#define LIBDFX_POSEPOINT_H

#include <opencv2/opencv.hpp> // For cv::Point3f (an cv::Mat) from core

namespace dfx {

/**
 * \struct PosePoint PosePoint.h "dfx/PosePoint.h"
 *
 * \brief Pose points are used to identify individual MPEG-4 Facial Data Points
 *        of a face.
 *
 * DFX utilizes a subset of the 84 feature points described in the MPEG-4
 * Facial Data Points when constructing regions of interest.
 *
 * \image latex mpeg4-feature-points.png
 *
 * \see <a href="http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.330.8043&rep=rep1&type=pdf">MPEG-4 Facial Data
 * Points</a>
 */
struct PosePoint {
    /**
     * \brief the X,Y,Z point location information.
     *
     * Presently, the Z is ignored for all study processing as the
     * image is fundamentally 2-D and we are able to construct
     * accurate regions from just the X and Y.
     */
    cv::Point3f point;

    /**
     * \brief if this point is valid, false otherwise.
     *
     * Because a face maybe partially obscured, not all points may be
     * valid within a specified face and this flag is used to indicate
     * those points which are not valid.
     */
    bool valid;

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
    bool estimated;

    /**
     * \brief the probability quality probability of this point between
     * zero and one.
     *
     * Providing this information can help the region definitions chose
     * it's anchor points more accurately.
     */
    float quality;
};
} // namespace dfx

#endif // LIBDFX_POSEPOINT_H
