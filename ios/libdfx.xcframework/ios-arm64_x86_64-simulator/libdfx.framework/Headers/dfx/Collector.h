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
#ifndef LIBDFX_COLLECTOR_H
#define LIBDFX_COLLECTOR_H

#include "dfx/ChunkData.h"
#include "dfx/Face.h"
#include "dfx/Frame.h"
#include "dfx/MeasurementResult.h"

#include <functional>
#include <map>
#include <memory>
#include <string>
#include <vector>

/**
 * \namespace dfx
 * The namespace containing all dfx related classes.
 */
namespace dfx {

class Frame;

/*! \enum ConstraintResult
 *  \brief The possible constraint return values.
 */
enum class ConstraintResult : char {
    Good = 0, /*!< Good indicates there is nothing presently detected in constraints */
    Warn = 1, /*!< Warn indicates a problem that needs to be corrected */
    Error = 2 /*!< Error indicates a problem that has failed the measurement */
};

/*! \enum CollectorState
 *  \brief A Collector state indicates whether a Collector is in error or
 *         ready to collect data.
 *
 *  \image latex collector-states.png
 */
enum class CollectorState : char {
    Waiting = 0,    /*!< Collector is WAITING to start collection */
    Collecting = 1, /*!< Collector is COLLECTING frame data */
    ChunkReady = 2, /*!< Collector has a CHUNK READY to send to server */
    Completed = 3,  /*!< Collector is COMPLETED and should be sent to server */
    Error = 4,      /*!< Collector in ERROR and collection aborted */
};

/*! \class Collector Collector.h "dfx/Collector.h"
 *
 *  \brief Collector extracts region channel information from video frames
 *         for server signal processing.
 *
 *  A Collector involves significant processing on video frames using
 *  located faces to identify regions of interest, extract and summarize
 *  the data for server signal processing.
 */
class Collector {
  public:
    /*!
     * \brief Collector destructor
     */
    virtual ~Collector() {
        // Empty but necessary for vtable
    }

    /**
     * \brief Creates a Frame from a user supplied video frame.
     *
     * \param videoFrame is the video Frame to wrap.
     *
     * \return a reference to a Frame.
     */
    virtual std::shared_ptr<dfx::Frame> createFrame(const dfx::VideoFrame &videoFrame) = 0;

    /*!
     * \brief When the client is ready to start a measurement
     * they will notify the collector to start collecting data.
     *
     * Prior to starting, a measurement should be in the WAITING
     * state. A call to resetCollector will always ensure
     * the measurement is in WAITING state.
     *
     * While in a WAITING state, regions can be obtained and
     * constraints analyzed for violations prior to a collection
     * starting.
     *
     * \return the current internal state, which should be
     * COLLECTING unless an ERROR occurred.
     */
    virtual CollectorState startCollection() = 0;

    /**
     * \brief When the client creates a new Measurement with the 
     * API, the Collector should be prepared with the API
     * Measurement CreateResponse payload.
     *
     * \deprecated: Support for this method will be removed in a future.
     * It has been replaced with a no-op.
     *
     * \param createMeasurementPayload the payload from DFX server
     * \return true if collector was happy, false otherwise
     */
    virtual bool prepareMeasurement(const std::vector<uint8_t>& createMeasurementPayload) = 0;

    /*!
     * \brief The current internal state of this measurement
     * collector.
     *
     * The internal state of this measurement collector. This is 
     * the same state returned by defineRegions or extractChannels.
     *
     * Once the measurement is in error state, it will remain
     * in ERROR until reset which will place it back in WAITING.
     *
     * \return the current internal state.
     */
    virtual CollectorState getCollectorState() = 0;

    /*!
     * \brief Returns the operating mode of the Collector.
     *
     * The mode is configured in the Factory prior to Collector
     * creation.
     *
     * \return the operating mode for current collector.
     */
    virtual std::string getMode() const = 0;

    /*!
     * \brief Identifies what the anticipated FPS is suppose to be.
     *
     * The anticipated target FPS defaults to 30.0 FPS, but if a video
     * frame rate of 60.0 FPS or higher is required it can be customized. While
     * the actual FPS is established based on the individual VideoFrame
     * timestamps, the anticipated FPS assists with model calibration.
     *
     * Post-processing a pre-recorded video file will generally have a more
     * consistent FPS and yield less noisy results then a live extraction
     * which needs to share CPU processing power for video frame handling
     * with video frame processing.
     *
     * If the target or actual FPS falls outside model tolerances either too
     * high or too low the collection will be rejected.
     *
     * \param targetFPS the anticipated target FPS
     * \return true if the targetFPS was successfully changed, false
     * otherwise.
     */
    virtual bool setTargetFPS(float targetFPS) = 0;

    /*!
     * \brief Sets the desired collected chunk duration in seconds.
     *
     * Identifies to the collector what the desired chunk duration
     * should be in terms of seconds. This will typically ensure
     * that a chunk is ready for collecting whenever the duration
     * has been reached.
     *
     * \param chunkDurationSeconds the chunk duration in seconds.
     * \return true if the chunk durations was successfully changed,
     * false otherwise.
     */
    virtual bool setChunkDurationSeconds(float chunkDurationSeconds) = 0;

    /*!
     * \brief Returns the desired collected chunk duration in seconds.
     *
     * \return the chunk durations in seconds.
     */
    virtual float getChunkDurationSeconds() = 0;

    /*!
     * \brief Sets number of chunks before the measurement is
     * complete.
     *
     * \param numberChunks the number of chunks.
     * \return true if the number of chunks was successfully changed,
     * false otherwise.
     */
    virtual bool setNumberChunks(uint32_t numberChunks) = 0;

    /*!
     * \brief Returns the total number of chunks the collector will
     * process for this measurement.
     *
     * \return the total number of chunks.
     */
    virtual uint32_t getNumberChunks() = 0;

    /*!
     * \brief Enable constraint handling for the identified constraint.
     *
     * Some constraint validation can be done on the frames provided
     * by the client to ensure they meet sufficient criteria to
     * satisfy server data quality.
     *
     * This may include standard checks for things like face presence
     * and frame rate along with movement, lighting, etc.
     *
     * \param constraint to enable
     * \return true if the constraintID was changeable, false otherwise.
     */
    virtual bool enableConstraint(const std::string &constraintID) = 0;

    /**
     * \brief Disable a constraint for the identified constraint.
     *
     * If the constraint was currently enabled, it will be removed
     * from the set of currently active constraints. If it was
     * not active or does not exist, the request is ignored.
     *
     * \param constraint to disable
     * \return true if the constraintID was changeable, false otherwise.
     */
    virtual bool disableConstraint(const std::string &constraintID) = 0;

    /**
     * \brief Returns the currently enabled constraints.
     *
     * \return a list of the currently enabled constraint IDs.
     */
    virtual std::vector<std::string> getEnabledConstraints() = 0;

    /**
     * \brief Obtain all available constraint IDs
     *
     * The set of available known constraint IDs which can be
     * enabled by calling setEnableConstraints.
     *
     * \return the vector of available constraint IDs.
     */
    virtual std::vector<std::string> getAvailableConstraints() const = 0;

    /**
     * \brief Check for constraint violations.
     *
     * When some constraints are enabled and a constraint
     * is detected as being violated that constraint will be
     * added to the violations list.
     *
     * \param frame the video frame currently being operated on
     * \param results is set of constraints and associated state
     *
     * \return result of the constraint check
     */
    virtual ConstraintResult checkConstraints(std::shared_ptr<dfx::Frame> &frame, std::vector<std::pair<std::string,dfx::ConstraintResult>> &results) = 0;

    /**
     * \brief Obtain a message which represents the violation ID.
     *
     * When presenting on a GUI, the returned constaint message is a more
     * meaningful representation of the constraint violation ID.
     *
     * \param violationID the constraint ID to obtain the error message for
     *
     * \return error message of the corresponding violationID.
     */
    virtual std::string getConstraintErrorMessage(const std::string &violationID) = 0;

    /**
     * \brief Configures the constraint system properties.
     *
     * The constraint system configuration accepts a key "json" and the
     * corresponding JSON payload to configure the system.
     *
     * \param key the configuration key to work on, currently "json"
     * \param property the value to set this property to
     *
     * \return true if the property was successfully set, false on error
     */
    virtual bool setConstraintsConfig(const std::string& key, const std::string &propertyValue) = 0;

    /**
     * \brief Obtains a constraint system property
     *
     * Returns the constraint value associated with the key.
     *
     * \param key the configuration key to work on, currently "json"
     *
     * \return the value of the configuration key or an empty string if key
     * did not exist.
     */
    virtual std::string getConstraintsConfig(const std::string& key) = 0;

    /*!
     * \brief Return the set of pose points for the configured study.
     *
     * Once a study has been initialized this method will return
     * the list of pose points required for each found face.
     *
     * \return the set of MPEG-4 Facial Data Points required for each
     * face.
     */
    virtual std::vector<std::string> getRequiredPosePointIDs() const = 0;

    /**
     * \brief Define the regions of interest based upon the MPEG-4 Facial
     *        Data Points.
     *
     * A Collector leverages many regions of interest which are areas of
     * a detected face to locate the required signals. This defineRegions
     * call will analyze and build the candidate region set which the
     * channels will be constructed from.
     *
     * \param frame the video frame currently being operated on
     * \return the Collector state after define regions
     */
    virtual CollectorState defineRegions(std::shared_ptr<dfx::Frame> &frame) = 0;

    /**
     * \brief Extracts the channels of interest from the video frame
     *        and regions of interest.
     *
     * A Collector will collapse the candidate regions of interest down
     * to a set of channels of interest which the server will further
     * refine into a set of signals.
     *
     * \param frame the video frame currently being operated on
     * \return the Collector state after extract channels
     */
    virtual CollectorState extractChannels(std::shared_ptr<dfx::Frame> &frame) = 0;

    /**
     * \brief Identifies when a measurement has collected sufficient information
     *        to make a server request.
     *
     * \return true if the chunk is ready to be sent, false otherwise
     */
    virtual bool isChunkReady() const = 0;

    /**
     * \brief The approximate number of additional video frames required
     *        before sufficient information has been collected to make the
     *        server request.
     *
     * The number frames needed is a rough guide for the client application
     * to know how many more data points will be required for a request
     * to be sent. It is not a guarantee as variance will occur for a
     * number of reasons: variable frame rate, participant movement,
     * along with environment and camera impacts. When the measurement
     * has collected enough data this will be zero and isChunkReady will
     * return true. The number of frames is not necessarily monotomically
     * decreasing.
     *
     * \return the anticipated number of frames remaining or zero if
     *         sufficient information has been collected. If there is
     *         an error or inability to calculate, -1 is returned.
     */
    virtual int32_t numberFramesNeeded() const = 0;

    /**
     * \brief The measurement chunk data which has been collected up
     *        for the current chunk until this point.
     *
     * The collected measurement chunk data is offloaded to the
     * ChunkData and resets the internal collector state to continue
     * processing more frames in the next chunk.
     *
     * \return ChunkData collected to this point or null if
     * the data is was not valid to create a chunk. ie. chunk
     * duration elapsed but the number of valid frames was
     * insufficient to form a useful payload.
     */
    virtual std::shared_ptr<dfx::ChunkData> getChunkData() = 0;

    /**
     * \brief Decodes the binary measurement response payload from the server into
     *        a MeasurementResult.
     *
     * \deprecated: Support for this method will be removed in a future. The server
     * now returns data in JSON format avoiding the need to decode client side.
     *
     * \param measurementResponse from the server to decode
     * \return the MeasurementResult object
     */
    virtual std::shared_ptr<dfx::MeasurementResult> decodeMeasurementResult(const std::vector<uint8_t>& measurementResponse) = 0;

    /**
     * \brief Client applications wishing to associate their own
     *        metadata properties can associate key=value strings to the
     *        Collector.
     *
     * If there is metadata that a client applications wishes to tag against
     * a Collector request, ie. barcode or participant name they should
     * invoke setProperty() with the appropriate value to ensure that
     * it is properly encoded into the Chunk Payload.
     *
     * \param key a key identifier for the metadata. If the key already
     *            exists it will be replaced
     * \param value the value to associate with the key
     * \return true if property was set, false otherwise
     */
    virtual bool setProperty(const std::string &key, const std::string &value) = 0;

    /**
     * \brief Returns a metadata property by key name if it exists.
     *
     * The returned string will be the value of the current chunk
     * metadata property.
     *
     * \return a string containing the property value, or an empty string
     * if the key does not exist.
     */
    virtual std::string getProperty(const std::string& key) = 0;

    /**
     * \brief Removes a metadata property by key name if it exists.
     */
    virtual void removeProperty(const std::string& key) = 0;

    /**
     * \brief Obtains the Chunk metadata for this measurement request.
     *
     * The returned chunk metadata is a superset of the metadata provided
     * by the client application. Additional measurement details are
     * augmented into the chunk metadata.
     *
     * \return a map containing the metadata key/value strings
     */
    virtual std::map<std::string, std::string> getProperties() = 0;

    /**
     * \brief If there was an error getLastErrorMessage may contain
     * more information about why the error occurred.
     *
     * \return the last known error
     */
    virtual std::string getLastErrorMessage() = 0;

    /**
     * \brief Cancels the current collection.
     *
     * When a collection violates as constraint or otherwise needs
     * to stop this method can be called placing the collector back
     * into a WAIT state until the client calls startCollection
     * again.
     */
    virtual void cancelCollection() = 0;

    /**
     * \brief Stop the current collection.
     *
     * When a collection violates as constraint or otherwise needs
     * to stop this method can be called placing the collector back
     * into a WAIT state until the client calls startCollection
     * again.
     *
     * \deprecated replaced by cancelCollection which more accurately
     * describes the activity since the measurement can not be resumed
     * before being reset. Please use cancelCollection as this method
     * will eventually be removed as it simply calls cancelCollection.
     */
    virtual void stopCollection() = 0;

    /**
     * \brief Forces the completion of a collection.
     *
     * Collections will trigger a ChunkAvailable when enough data
     * has been collected. When processing a video file, the final
     * chunk may be insufficient in length and never trigger the
     * ChunkAvailable state. forceComplete() will force the
     * collector into a measurement Complete state and create a
     * final payload with any remaining state.
     */
    virtual void forceComplete() = 0;

    /**
     * \brief Resets the measurement state to construct a new chunk.
     *
     * The Collector maintains internal buffers and state when
     * constructing a chunk which needs to be reset when a new
     * chunk collection starts. A client application can discard
     * a collection and all accumulated state by calling
     * reset().
     */
    virtual void resetCollection() = 0;

    /**
     * \brief Add user data information to a payload using FaceAttribute key and values.
     *
     * @param faceID the face identifier to use, typically "1"
     * @param key the attribute key identifying the value being provided
     * @param value the attribute value associated with key
     * @return true if value was applied, false if invalid value or unable to apply.
     */
    virtual bool setFaceAttribute(const std::string& faceID, FaceAttribute key, FaceAttributeValue value) = 0;

    /**
     * \brief Add user data information to a payload using FaceAttribute key and numeric/boolean value.
     *
     * @param faceID the face identifier to use, typically "1"
     * @param key the attribute key identifying the value being provided
     * @param value the attribute value associated with key
     * @return true if value was applied, false if invalid value or unable to apply.
     */
    virtual bool setFaceAttribute(const std::string& faceID, FaceAttribute key, double value) = 0;

    /**
     * \brief Provide the cloud results to the Collector to potentially improve the result.
     *
     * If the results obtained from the cloud are available to the Collector, it can make
     * additional optimizations on future payloads and provide more informed feedback.
     *
     * @param jsonCloudResults the JSON results obtained from the Cloud API
     * @return true if result data was valid, false if result data was not valid.
     */
    virtual bool setCloudResultsFeedback(const std::string& jsonCloudResults) = 0;

    /**
     * \brief Configures a model within the Collector.
     *
     * @param modelType A numeric identifier associated with the model implementation
     * @param data Configuration data associated with the model
     * @return true if the model was configured, false if it was not (invalid model, models not supported)
     */
    virtual bool initializeModel(int8_t modelType, const std::vector<unsigned char> &data) = 0;
};
} // namespace dfx

#endif // LIBDFX_COLLECTOR_H