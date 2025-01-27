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
#ifndef LIBDFX_MEASUREMENTRESULT_H
#define LIBDFX_MEASUREMENTRESULT_H

#include "dfx/MeasurementData.h"

#include <memory>
#include <stdint.h>
#include <string>
#include <vector>

namespace dfx {

/**
 * \class MeasurementResult MeasurementResult.h "dfx/MeasurementResult.h"
 *
 * A MeasurementResult is the decoded MeasurementResult from the server
 * and contains properties along with individual MeasurementData for the
 * various signals available in the study.
 */
class MeasurementResult {
public:
    /*
     * \brief MeasurementResult destructor
     */
    virtual ~MeasurementResult() {
        // Empty but necessary for vtable
    }

    /**
     * Returns true if this measurement result is valid, otherwise returns false.
     *
     * \returns true (non-zero) if measurement result is valid, otherwise false (zero)
     */
    virtual uint8_t isValid() = 0;

    /**
     * Returns a list of measurement property keys that can be used with
     * getMeasurementProperty().
     *
     * \return list of measurement property keys
     */
    virtual std::vector<std::string> getMeasurementPropertyKeys() = 0;

    /**
     * Obtain individual properties associated with this MeasurementResult.
     *
     * These properties are useful when communicating with the server about the
     * Measurement. Specifically, it will include "MeasurementID",
     * "MeasurementDataID", "MeasurementResultID" and possibly others.
     *
     * \param key the measurement property to look up
     * \return the valid of the measurement property or an empty string
     */
    virtual std::string getMeasurementProperty(const std::string& key) = 0;

    /**
     * Returns a list of available data keys contained in this measurement result.
     *
     * The actual list is a function of the study definition and what the server
     * was able to generate based upon the data provided. This is a convenience
     * method to assist in inspecting the measurment data result, but if you
     * know the keys of interest those can be asked for directly using
     * getMeasurementData().
     *
     * Possible keys might include "HEART_RATE", "SNR", etc.
     *
     * \return a list of keys present in this measurement result
     */
    virtual std::vector<std::string> getMeasurementDataKeys() = 0;

    /**
     * Obtains the MeasurementData for a known key.
     *
     * If the key does not exist, a nullptr will be returned.
     *
     * \param key to obtain the MeasurementData for
     * \return the MeasurementData
     */
    virtual std::shared_ptr<MeasurementData> getMeasurementData(const std::string& key) = 0;

    /**
     * Returns the error code associated with the measurement.
     *
     * If the MeasurementResult isValid(), this will be "OK" otherwise it will
     * contain another code which identifies an error like "INTERNAL_ERROR".
     *
     * \return the error code associated with the measurement result.
     */
    virtual std::string getErrorCode() = 0;
};

} // namespace dfx

#endif // LIBDFX_MEASUREMENTRESULT_H
