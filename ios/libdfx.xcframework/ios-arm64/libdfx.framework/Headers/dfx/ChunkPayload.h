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
#ifndef LIBDFX_CHUNKPAYLOAD_H
#define LIBDFX_CHUNKPAYLOAD_H

#include <stdint.h>
#include <vector>

namespace dfx {

/**
 * \headerfile ChunkPayload.h "dfx/ChunkPayload.h"
 *
 * \brief Chunk that was captured by a Collection.
 */
struct ChunkPayload {
    /** \brief if this payload was succesfully created. */
    uint8_t   valid;

    /** \brief starting frame of chunk. */
    uint32_t  startFrame;

    /** \brief last frame in chunk. */
    uint32_t  endFrame;

    /** \brief sequential number of the chunk starting at zero */
    uint32_t chunkNumber;

    /** \brief the number of chunks expected in measurement */
    uint32_t numberChunks;

    /** \brief the start time of the first chunk in seconds */
    uint32_t firstChunkStartTime_s;

    /** \brief start time of the chunk in seconds */
    uint32_t startTime_s;

    /** \brief end time of the chunk in seconds */
    uint32_t endTime_s;

    /** \brief duration of the chunk in seconds */
    float    duration_s;

    /** \brief binary payload of chunk */
    std::vector<uint8_t> payload;

    /** \brief metadata information associated with chunk (JSON) */
    std::vector<uint8_t> metadata;
};

} // namespace dfx

#endif // LIBDFX_CHUNKPAYLOAD_H
