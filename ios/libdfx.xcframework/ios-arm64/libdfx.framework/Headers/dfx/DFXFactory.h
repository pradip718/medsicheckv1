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
#ifndef LIBDFX_FACTORY_H
#define LIBDFX_FACTORY_H

#include <map>
#include <memory>
#include <string>

#include "dfx/Collector.h"

namespace dfx {
/**
 * \class DFXFactory DFXFactory.h "dfx/DFXFactory.h"
 *
 * \brief DFXFactory is the primary entry point for the collector and
 *        is used create a collector.
 *
 * Applications are able to analyze video stream and summarize relevent
 * portions of the stream which can be sent using the DFX API to the
 * DFX Server for additional signal processing and model prediction.
 *
 * Typical usage of the DFX API and DFX Extraction library involves only a
 * few application level calls.
 *
 * While the DFX Extraction library does not perform server calls, it 
 * does construct the payloads which a client platform will send to the 
 * server. The DFX Extraction library also expects to be initialized with 
 * the server response to properly initialize the engine.
 *
 *  \code{.cpp}
 *     // Obtain a study reference from the DFX API
 *     auto studyResponse = Application::getAPIStudy();
 *     std::vector<unsigned int> study =
 *
 *     dfx::DFXFactory factory;    // Create the DFX factory instance
 *     factory.initializeStudy(study);
 *
 *     auto collector = factory.createCollector();
 *     collector->setTargetFPS(30.0f);
 *
 *     collector->prepareMeasurement(measurementResponsePayload);
 *
 *     // Enable all possible client contraints to minimize server side rejections
 *     collector->setEnableConstraints(collector->getAvailableConstraintIDs());
 *
 *     collector->startCollection();
 *
 *     int frameNumber = 0;
 *     cv::Mat image;
 *     cv::VideoCapture video("theVideoFile.mp4");
 *     while( video.read(image) ) {
 *
 *        dfx::VideoFrame videoFrame;
 *        videoFrame.image = image;
 *        videoFrame.channelOrder = dfx::VideoFormat::BGRA;
 *        videoFrame.timestamp = std::chrono::high_resolution_clock::now();
 *        videoFrame.number = frameNumber++;
 *
 *        auto frame = collector->createFrame(videoFrame);
 *
 *        // Application provides face tracking and builds face
 *        // and adds it to frame.
 *        auto face = Application::getDFXFace(videoFrame);
 *        frame->addFace(face);
 *
 *        // Add markers, acceleration, rotation etc. if needed
 *        frame->addMarker("smile");
 *
 *        // Define the collector regions of interest for this frame.
 *        collector->defineRegions(frame);
 *
 *        std::vector<std::string> violations;
 *        auto result = collector->checkConstraints(frame, violations);
 *        if( result != ConstraintResult::Error ) {
 *
 *          // Extract the channels for this frame
 *          collector->extractChannels(frame);
 *
 *          // Different studies have different requirements on number of
 *          // frames to produce a chunk.
 *          if ( collector->isChunkReady() ) {
 *             auto chunkData = collector->getChunkData();
 *
 *             auto chunkPayload = chunkData->getChunkPayload();
 *
 *             std::vector<uint8_t> metadata = chunkPayload.metadata;
 *             std::vector<uint8_t> payload  = chunkPayload.payload;
 *
 *             // This is where the Application uses the DFX API to make
 *             // the network call to the DFX Server.
 *             auto payload = Application::getAPIcollectorPayload(metadata, bytes);
 *             auto prediction = Application::getAPIPrediction(payload);
 *          }
 *        } else {
 *          collector->resetCollection();
 *        }
 *     }
 *  \endcode
 */
class DFXFactory {
  public:
    /**
     * \brief DFXFactory destructor
     */
    virtual ~DFXFactory() {
        // Empty but necessary for vtable
    }

    /**
     * \brief The version ID of this DFX Extraction library.
     *
     * \return the version ID of this DFX Extraction library.
     */
    virtual std::string getVersion() const = 0;

    /**
     * \brief The ID of this DFX Extraction library.
     *
     * When requesting a study file from the DFX server it
     * requires the ID which is returned by this method.
     *
     * \since 4.3.13
     * \return the ID of this DFX Extraction library.
     */
    virtual std::string getSdkID() const = 0;

    /**
     * \brief Set the operating mode which will be used when
     *        creating a new collector.
     *
     * Identifies the collector as being a "streaming" or
     * a "discrete" collector. By default the collector
     * is considered "discrete".
     *
     * \param mode the string representing the operating mode.
     * \return true if mode was successfully changed, false otherwise.
     */
    virtual bool setMode(const std::string& mode) = 0;

    /**
     * \brief Returns the current operating mode when
     *        creating collectors.
     *
     * \return the currently configured operating mode
     */
    virtual std::string getMode() const = 0;

    /**
     * \brief If there was an error getLastErrorMessage may contain
     * more information about why the erorr occurred.
     *
     * \return the last known error
     */
    virtual std::string getLastErrorMessage() = 0;

    /**
     * \brief Specifies a configurable property key/value pair to
     * configure the DFX Extraction library.
     *
     * \param key of property to configure.
     * \param value of property to configure.
     *
     * \see getValidProperties
     */
    virtual void setProperty(const std::string &key, const std::string &value) = 0;

    /**
     * \brief Returns a property value for a key.
     *
     * \param key to obtain the property value for.
     * \return the property if it exists or an empty string.
     */
    virtual std::string getProperty(const std::string &key) = 0;

    /**
     * \brief Removes a property from the factory if it exists.
     *
     * \param key of property to remove if it exists, ignored if it does not exist.
     *
     * \see getValidProperties, setProperties
     */
    virtual void removeProperty(const std::string &key) = 0;

    /**
     * \brief Obtain a list of valid property keys which can be configured.
     *
     * \return list of configurable property keys.
     *
     * \see setProperty
     */
    virtual std::vector<std::string> getValidProperties() const = 0;

    /**
     * \brief Initializes the factory to create collectors for a study
     * with a memory based data definition.
     *
     * An instance of a DFXFactory will only create collectors for the most
     * recently configured study. Previously initialized study definitions
     * are replaced with the new data if true is returned.
     *
     * \param data from the server which identifies the study
     *        characteristics this DFXFactory will use.
     *
     * \return true if the the data passes some basic sanity, false otherwise.
     *
     * \see DFXNetworkAPI
     */
    virtual bool initializeStudy(const std::vector<unsigned char> &data) = 0;

    /**
     * \brief Adds to the study definition when a definition is comprised
     * of multiple parts with an additional memory based definition.
     *
     * \deprecated: Support for this method will be removed in a future
     * release. Please use the initializeStudy(const vector<unsigned char>&)
     * to initialize a study.
     *
     * If this is the first call, it will initialize the study with the
     * definition otherwise it will be added to the existing data
     * definitions.
     *
     * \param data to add to the study definition
     *
     * \return true if the the data passes some basic sanity, false otherwise.
     *
     * \see DFXNetworkAPI
     */
    virtual bool addToStudy(const std::vector<unsigned char> &data) = 0;

   /**
     * \brief Initializes the factory to create collectors for a study
     * with a file based data definition.
     *
     * \deprecated: Support for this method will be removed in a future
     * release. Please use the initializeStudy(const vector<unsigned char>&)
     * to initialize a study.
     *
     * An instance of a DFXFactory will only create collectors for the most
     * recently configured study. Previously initialized study definitions
     * are replaced with the new data if true is returned.
     *
     * \param pathToFile from the server which identifies the study
     *        characteristics this DFXFactory will use.
     *
     * \return true if the the data passes some basic sanity, false otherwise.
     *
     * \see DFXNetworkAPI
     */
    virtual bool initializeStudyFromFile(const std::string &pathToFile) = 0;

    /**
     * \brief Adds to the study definition when a definition is comprised
     * of multiple parts with an additional file based definition.
     *
     * \deprecated: Support for this method will be removed in a future
     * release. Please use the initializeStudy(const vector<unsigned char>&)
     * to initialize a study.
     *
     * If this is the first call, it will initialize the study with the
     * definition otherwise it will be added to the existing data
     * definitions.
     *
     * \param pathToFile to add to the study definition
     *
     * \return true if the the data passes some basic sanity, false otherwise.
     *
     * \see DFXNetworkAPI
     */
    virtual bool addToStudyFromFile(const std::string &pathToFile) = 0;

    /**
     * \brief Creates a Collector to process video frames and build a
     * request payload.
     *
     * \return a reference to a Collector or nullptr on failure.
     */
    virtual std::shared_ptr<dfx::Collector> createCollector() = 0;
};
} // namespace dfx

#endif // LIBDFX_FACTORY_H
