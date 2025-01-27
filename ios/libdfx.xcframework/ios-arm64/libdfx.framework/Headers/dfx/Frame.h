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
#ifndef LIBDFX_FRAME_H
#define LIBDFX_FRAME_H

#include "dfx/Face.h"
#include "dfx/VideoFrame.h"

#include <memory>
#include <string>

namespace dfx {
/*! \class Frame Frame.h "dfx/Frame.h"
 *
 *  \brief Frame is a wrapper which links a VideoFrame with one or
 *         more Face objects and additional state needed for regions
 *         and channel construction.
 *
 *  In addition to the video image, a Frame will have Faces and
 *  addition state. It also enables client applications to augment
 *  the Frame with markers and device data like Acceleration and
 *  Rotation data if available.
 */
class Frame {
  public:
    /*!
     * \brief Frame destructor
     */
    virtual ~Frame() {
        // Empty but necessary for vtable
    }

    /**
     * \brief Convenience method to retrieve the VideoFrame
     * associated with this Frame instance.
     *
     * return the associated VideoFrame
     */
    virtual VideoFrame getVideoFrame() const = 0;

    /**
     * \brief Add a face and associated data to the frame.
     *
     * Multiple faces can be added if an image contains multiple faces.
     *
     * \param face data to add to this Frame.
     * \return true if face successfully added, false if the limit
     * on the number of faces has been reached.
     */
    virtual bool addFace(std::shared_ptr<dfx::Face> face) = 0;

    /**
     * \brief Calculates the quality metrics for the current frame.
     *
     * \deprecated: Support for this method will be removed in a future
     * release. Please use the getOpticalQualityMetrics instead.
     *
     * The provided ISO and exposure settings along with the current frame
     * image data are used to construct a set of quality metrics which
     * are used by the exposure algorithm to determine if the ISO needs
     * to be increased or decreased to improve the image quality.
     *
     * \param iso the current iso setting
     * \param exposure the current exposure setting
     * \return the quality metrics
     */
    virtual std::vector<float> getQualityMetrics(float iso, float exposure) = 0;

    /**
     * \brief Calculates the optical quality metrics for the current frame.
     *
     * \return the quality metrics
     */
    virtual std::vector<float> getOpticalQualityMetrics() = 0;

    /**
     * \brief Provide the 5-star rating value for the current frame, available
     * after a call to getQualityMetrics.
     *
     * \deprecated: Support for this method will be removed in a future
     * release. Please use the getOpticalQualityRating instead.
     *
     * \param the feedback string
     * \return the 5-star rating
     * \see getQualityMetrics
     */
    virtual int getStarRating(std::string& feedback) = 0;

    /**
     * \brief Provide the 5-star rating value for the current frame, available
     * after a call to getOpticalQualityMetrics.
     *
     * \param the feedback string
     * \return the 5-star rating
     * \see getQualityMetrics
     */
    virtual int getOpticalQualityRating(std::string& feedback) = 0;

    /**
     * \brief Adds a marker/label to a video frame.
     *
     * If multiple events occur within a frame, multiple markers can be
     * addedd and annotated against a frame.
     *
     * \param label the string marker identifier to add to the frame.
     * \return true if marker succesfully added, false if the limit
     * on the number of markers has been reached.
     */
    virtual bool addMarker(const std::string &label) = 0;

    /**
     * \brief Returns the marker/labels in a video frame.
     *
     * \return returns a list of markers in this frame.
     */
    virtual std::vector<std::string> getMarkers() const = 0;

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
     * \return the list of desired attribute names
     */
    virtual std::vector<std::string> getDesiredFaceAttributes() const = 0;

    /**
     * \brief Returns a list of desired device attributes for this
     * frame.
     *
     * This enables the DFX engine to request additional
     * properties like "acceleration", "rotation", etc. which
     * it would like to have but which might not always be
     * available depending upon the use case.
     *
     * These attributes should be added with frame setDeviceAttribute()
     * if they are available for the current frame.
     *
     * \return the list of desired attribute names
     * \see setDeviceAttribute
     */
    virtual std::vector<std::string> getDesiredDeviceAttributes() const = 0;

    /**
     * \brief Returns the value of a device attribute if it exists or zero.
     *
     * \param key the attribute name.
     * \return value the value of the attribute or zero.
     */
    virtual double getDeviceAttribute(const std::string& key) const = 0;

    /**
     * \brief add a device attribute
     *
     * Device attributes are things like "acceleration" or "rotation".
     *
     * When these attributes involve multiple values, like X and Y co-ordinates
     * they should be expanded as "acceleration:x" and "acceleration:y".
     *
     * \param key the attribute name.
     * \param value the value of the attribute.
     */
    virtual void setDeviceAttribute(const std::string& key, double value) = 0;

    /**
     * \brief obtain the known face identifiers within this frame.
     *
     * Every face is known by an identifier which uniquely identifies
     * the face.
     *
     * \return vector of face IDs currently known to this frame.
     */
    virtual std::vector<std::string> getFaceIdentifiers() const = 0;

    /**
     * \brief obtains the names of regions which are defined for the
     * face within this frame.
     *
     * \param faceID identifier for the face of interest.
     *
     * \return vector of region names which can be retrieved for the
     * face.
     */
    virtual std::vector<std::string> getRegionNames(const std::string &faceID) const = 0;

    /**
     * \brief obtain the polygon for the region of interest.
     *
     * \param faceID identifier for the face of interest.
     * \param regionName which points are needed for drawing.
     *
     * \return vector of points forming a closed polygon shape for region of interest.
     */
    virtual std::vector<cv::Point> getRegionPolygon(const std::string &faceID, const std::string &regionName) const = 0;

    /**
     * \brief Regions can have numeric properties attached to them.
     *
     * \param faceID identifier for the face of interest.
     * \param regionName to inspect the property of.
     * \param property to be returned
     *
     * \return the numeric value of the property.
     */
    virtual int32_t getRegionIntProperty(const std::string& faceID, const std::string& regionName, const std::string& property) const = 0;

    /**
     * \brief obtain the histogram for a region of interest.
     *
     * \param faceID identifier for the face of interest.
     * \param regionName which histogram is desired.
     *
     * \return histogram for the region if it is known, empty cv::Mat if not known.
     */
    virtual cv::Mat getRegionHistogram(const std::string &faceID, const std::string &regionName) const = 0;
};
} // namespace dfx

#endif // LIBDFX_FRAME_H
