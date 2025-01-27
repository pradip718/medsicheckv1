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
#ifndef LIBDFX_MEASUREMENTDATA_H
#define LIBDFX_MEASUREMENTDATA_H

#include <stdint.h>
#include <string>
#include <vector>

namespace dfx {

/**
 * \class MeasurementData MeasurementData.h "dfx/MeasurementData.h"
 *
 * A MeasurementData contains MeasurementResult data for a specific signal.
 */
class MeasurementData {
public:
    /*
     * \brief MeasurementData destructor
     */
    virtual ~MeasurementData() {
        // Empty but necessary for vtable
    }

    /**
     * \brief Returns a list of measurement data property keys that can be used with
     * getDataProperty().
     *
     * \return list of measurement data property keys
     */
    virtual std::vector<std::string> getDataPropertyKeys() = 0;

    /**
     * \brief Returns a measurement data property by key.
     *
     * Measurement data may include additional properties which are available
     * based upon what is returned by getDataPropertyKeys().
     *
     * This may include for instance "ID" which could be "HEART_RATE" if the
     * signal this MeasurementData represents is associated with "HEART_RATE".
     *
     * \return the value of the property, or an empty string if key doesn't exist.
     */
    virtual std::string getDataProperty(const std::string& key) = 0;

    /**
     * \brief Returns the numerical data associated with this MeasurmentData.
     *
     * The vector can contain one or more values based upon the study definition
     * and what the server is able to provide.
     *
     * For instance, if the MeasurementData is for "HEART_RATE" this may be
     * one value which would be a summary for the entire measurement chunk
     * or it could be an estimated value per-frame of the measurement chunk.
     *
     * \return a vector of bytes containing the data of the MeasurementData.
     */
    virtual std::vector<double> getData() = 0;
};

} // namespace dfx

#endif // LIBDFX_MEASUREMENTDATA_H
