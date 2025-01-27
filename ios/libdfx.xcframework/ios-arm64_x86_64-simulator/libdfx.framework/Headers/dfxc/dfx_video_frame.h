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
#ifndef LIBDFX_C_VIDEOFRAME_H
#define LIBDFX_C_VIDEOFRAME_H

#include "dfxc/dfx_error.h"
#include "dfxc/dfx_visibility.h"

#include <math.h>
#include <stdint.h>
#include <stddef.h>

#ifdef __cplusplus
extern "C" {
#endif

/**
 * \enum ChannelOrder is used to identify the channel
 * order of a VideoFrame.
 */
enum DFXChannelOrder {
    /** channels are provided in blue, green, red order */
    DFX_CHANNEL_ORDER_BGR = 1,

    /** channels are provided in red, green, blue order */
    DFX_CHANNEL_ORDER_RGB = 2,

    /** channels are provided in blue, green, red, alpha order */
    DFX_CHANNEL_ORDER_BGRA = 3,

    /** channels are provided in red, green, blue, alpha order */
    DFX_CHANNEL_ORDER_RGBA = 4,

    /** channels are provided as 8-bit infrared */
    DFX_CHANNEL_ORDER_INFRARED = 5,

    /** channels are provided as 3-channels of 8-bit infrared */
    DFX_CHANNEL_ORDER_INFRARED888 = 6,

    /** channels are provided in blue, green, red, infrared order */
    DFX_CHANNEL_ORDER_BGR_INFRARED = 7,

    /** channels are provided in red, green, blue, infrared order */
    DFX_CHANNEL_ORDER_RGB_INFRARED = 8,

    /** channels are provided as gray scale */
    DFX_CHANNEL_ORDER_GRAY = 9
};

enum DFXPixelType {
    /** One channel of 8-bit unsigned data. ie. Gray */
    DFX_PIXEL_TYPE_8UC1 = 0,

    /** Two channels of 8-bit unsigned data. */
    DFX_PIXEL_TYPE_8UC2 = 8,

    /** Three channels of 8-bit unsigned data. ie. RGB */
    DFX_PIXEL_TYPE_8UC3 = 16,

    /** Four channels of 8-bit unsigned data. ie. RGBA */
    DFX_PIXEL_TYPE_8UC4 = 24
};

/**
 * \brief represents the internal structure for how image frames
 * are passed to the DFX Engine since there is little in the way
 * of standards.
 *
 * DFX requires having all three color channels and an accurate
 * timestamp for the video frame along with knowing it's position
 * within the stream.
 */
typedef struct dfx_video_frame {

    /**
     * \brief the number of rows in the image data
     */
    uint16_t rows;

    /**
     * \brief the number of cols in the image data
     */
    uint16_t cols;

    /**
     * \brief the type of the image data. Either PIXEL_TYPE_8UC3 or
     * PIXEL_TYPE_8UC4.
     */
    uint8_t pixel_type;

    /**
     * \brief the stride of a row of image data to account for
     *        any padding which might be in the image.
     *
     * If zero, it will be calculated as sizeof(pixel_type) * cols
     */
    size_t stride;

    /**
     * \brief the image data for the frame.
     *
     * This is the raw data for the image.
     */
    uint8_t *data;

    /**
     * \brief the image channel ordering.
     *
     * The order is used to help identify the internal format of the
     * cv::Mat structure since it internally doesn't provide a way to
     * identified the color channels.
     */
    uint8_t order;

    /**
     * \brief the timestamp of this video frame.
     *
     * Accurate DFX predictions require a consistent and accurate
     * timestamp for the video frames. This is easily achievable
     * when processing offline videos, but will require some
     * effort for processing real-time camera feeds to ensure
     * the frames maintain a consistent inter-frame interval.
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
    double timestamp_millisec = NAN;

} dfx_video_frame;

#ifdef __cplusplus
}
#endif

#endif // LIBDFX_C_VIDEOFRAME_H
