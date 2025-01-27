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
#ifndef LIBDFX_VIDEOFRAME_H
#define LIBDFX_VIDEOFRAME_H

#include <limits>
#include <opencv2/opencv.hpp>  // For cv::Mat (and cv::Point3f) from core

namespace dfx {

/**
 * \struct VideoFrame VideoFrame.h "dfx/VideoFrame.h"
 *
 * \brief Represents the internal structure for how image frames
 * are passed to the DFX Engine since there is little in the way
 * of standards.
 *
 * DFX requires having all three color channels and an accurate
 * timestamp for the video frame along with knowing it's position
 * within the stream.
 */
struct VideoFrame {
    /**
     * \enum ChannelOrder is used to identify the channel
     * order of a VideoFrame.
     *
     * Typically, OpenCV uses BGRA but different client
     * platforms have different internal representations
     * which can be identified through the ChannelOrder
     * format so the library knows where to find the
     * channels of interest when processing regions of
     * interest.
     */
    enum class ChannelOrder {
        /** channels are provided in blue, green, red order */
        BGR = 1,

        /** channels are provided in red, green, blue order */
        RGB = 2,

        /** channels are provided in blue, green, red, alpha order */
        BGRA = 3,

        /** channels are provided in red, green, blue, alpha order */
        RGBA = 4,

        /** channels are provided as 8-bit infrared */
        Infrared = 5,

        /** channels are provided as 3-channels of 8-bit infrared */
        Infrared888 = 6,

        /** channels are provided in blue, green, red, infrared order */
        BGR_Infrared = 7,

        /** channels are provided in red, green, blue, infrared order */
        RGB_Infrared = 8,

        /** channels are provided as gray scale */
        Gray = 9
    };

    /**
     * \brief the image color channels for the frame.
     *
     * OpenCV cv::Mat structure is used as a convenience when
     * specifying the image data.
     */
    cv::Mat image;

    /**
     * \brief the image channel ordering.
     *
     * The order is used to help identify the internal format of the
     * cv::Mat structure since it internally doesn't provide a way to
     * identified the color channels.
     */
    ChannelOrder order;

    /**
     * \brief the timestamp of this video frame.
     *
     * Accurate DFX predictions require a consistent and accurate
     * timestamp for the video frames. This is easily achievable
     * when processing offline videos, but will require some
     * effort for processing real-time camera feeds to ensure
     * the frames maintain a consistent inter-frame interval.
     *
     * \deprecated this will be removed in favor of timestamp_millisec
     */
    uint64_t timestamp_ns;

    /**
     * \brief the video frame number within the video sequence.
     *
     * Frame numbers are expected to be sequentially provided for
     * a measurement and the number of sequential frames must be
     * sufficient for the study measurement requirements to be
     * fulfilled. Since multiple measurements can be performed
     * on a video sequence, the frame number helps identify
     * positioning within a video and if a frame is lost.
     */
    uint32_t number;

    /**
     * \brief the timestamp of the video frame in milliseconds
     *
     * When this value is provided, not NaN, it will be used and
     * timestamp_ns will be ignored. The addition of this while
     * keeping timestamp_ns is to allow for a brief transition period.
     *
     * The value has type double to allow for fractions of a
     * millisecond and is analogous to how the web handles
     * DOMHighResTimeStamp.
     *
     * Migrating code from timestamp_ns to timestamp_millisec can
     * be done by converting from:
     *
     *     frame.timestamp_ns = getTimestamp()
     * to:
     *     frame.timstamp_millisec = getTimestamp()/static_cast<double>(1e6);
     *
     * Accurate DFX predictions require a consistent and accurate
     * timestamp for the video frames. This is easily achievable
     * when processing offline videos, but will require some
     * effort for processing real-time camera feeds to ensure
     * the frames maintain a consistent inter-frame interval.
     *
     * \since 4.7
     * \see https://developer.mozilla.org/en-US/docs/Web/API/DOMHighResTimeStamp
     */
    double timestamp_millisec{std::numeric_limits<double>::quiet_NaN()};
};
} // namespace dfx

#endif // LIBDFX_VIDEOFRAME_H
