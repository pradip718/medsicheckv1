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
#ifndef LIBDFX_CHUNKDATA_H
#define LIBDFX_CHUNKDATA_H

#include "ChunkPayload.h"

namespace dfx {

/*! \class ChunkData ChunkData.h "dfx/ChunkData.h"
 *
 *  \brief ChunkData is the internal memory representation of a Collection
 *         from which a ChunkPayload can be constructed to send to the DFX API.
 *
 *  The ChunkData enables the Collector to quickly reset it's internal state
 *  between measurement chunks by handing the collected data to ChunkData.
 *
 *  Building the actual ChunkPayload takes some effort and time for which
 *  the Collector would otherwise be unable to start adding frames until
 *  the previous ChunkPayload had been constructed and the Collector reset.
 */
class ChunkData {
  public:
    /*!
     * \brief ChunkData destructor
     */
    virtual ~ChunkData() {
        // Empty but necessary for vtable
    }

    /**
     * \brief The measurement payload chunk of bytes to send for the
     *        current request.
     *
     * The measurement is collapsed and summarized into the payload information
     * necessary for the server to construct the requested signal(s).
     *
     * \return a vector of bytes to be passed by the client application to
     *         the server for the current measurement request
     */
    virtual ChunkPayload getChunkPayload() = 0;
};

} // namespace dfx

#endif // LIBDFX_CHUNKDATA_H
