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
#ifndef LIBDFX_CPPDFXFactory_H
#define LIBDFX_CPPDFXFactory_H

#include "dfxc/dfx_forwards.h"
#include "dfxc/dfx_visibility.h"

#include <map>
#include <memory>
#include <string>

#include "dfx/DFXFactory.h"
#include "dfx/Frame.h"
#include "dfx/Collector.h"


namespace dfxcpp {
/**
 * \class DFXFactory
 * \brief DFXFactory is the primary entry point for the client and is used
 *        to construct the elements necessary to perform a collection.
 *
 * Applications are able to analyze video stream and summarize relavent
 * portions of the stream which can be sent using the DFX API to the
 * DFX Server for additional signal processing and model prediction.
 *
 * Typical usage of the DFX API and DFX Engine involves only a
 * few application level calls.
 *
 * While DFXEngine does not perform server calls, it does construct the
 * payloads which a client platform will send to the server. DFXEngine
 * also expects to be initialized with the server response to properly
 * initialize the factory.
 *
 *  \code{.cpp}
 *     // Obtain a study reference from the DFX API
 *     auto studyResponse = Application::getAPIStudy();
 *     std::vector<unsigned int> payload =
 *
 *     dfx::DFXFactory factory;    // Create the DFX Client Engine instance
 *     factory.initializeStudy(study);
 *
 *     auto collector = factory.createCollector();
 *     collector->setTargetFPS(30.0f);
 *
 *     // Enable all possible client contraints to minimize server side rejections
 *     collector->setEnableConstraints(collector->getAvailableConstraintIDs());
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
 *        auto frame = engine.createFrame(videoFrame);
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
 *             auto payload = Application::getAPIMeasurementPayload(metadata, bytes);
 *             auto prediction = Application::getAPIPrediction(payload);
 *
 *          }
 *        } else {
 *          collector->reset();
 *        }
 *     }
 *  \endcode
 */
class DFX_API DFXFactory : public dfx::DFXFactory {
  private:
    std::unique_ptr<dfx_factory, void(*)(dfx_factory*)> dfxFactory;

  public:
    /**
     * \brief Construct a CppDFXFactory which delegates to the dfx_client.
     */
    DFXFactory();

    /**
     * \brief CppDFXFactory destructor
     */
    ~DFXFactory() = default;

    /**
     * \brief The version ID of this DFXEngine.
     *
     * \return the version ID of this DFXEngine.
     */
    std::string getVersion() const override;

    /**
     * \brief The SDK ID of this DFX SDK.
     *
     * When requesting a study file from the DFX server it
     * requires an SDK ID which is returned by this method.
     *
     * \since 4.3.13
     * \return the SDK ID of this DFX SDK.
     */
    std::string getSdkID() const override;

    /**
     * \brief Set the operating mode which will be used when
     *        creating a new collector.
     *
     * Identifies the collector as being a "continuous" or
     * a "discrete" collector. By default the collector
     * is considered "discrete".
     *
     * \param mode the string representing the operating mode.
     * \return true if mode was successfully changed, false otherwise.
     */
    bool setMode(const std::string& mode) override;

    /*
     * \brief Returns the current operating mode when
     *        creating collectors.
     *
     * \return the currently configured operating mode
     */
    std::string getMode() const override;

    /**
     * \brief If there was an error getLastErrorMessage may contain
     * more information about why the erorr occurred.
     *
     * \return the last known error
     */
    std::string getLastErrorMessage() override;

    /**
     * \brief Specifies a configurable property key/value pair to
     * configure the DFX Engine.
     *
     * \param key of property to configure.
     * \param value of property to configure.
     *
     * \see getValidProperties
     */
    void setProperty(const std::string &key, const std::string &value) override;

    /**
     * \brief Returns a property value from a key.
     *
     * \param key to obtain the property value for.
     * \return the property if it exists or an empty string.
     */
    std::string getProperty(const std::string &key) override;

    /**
     * \brief Removes a property from the factory if it exists.
     *
     * \param key of property to remove if it exists, ignored if it does not exist.
     *
     * \see getValidProperties, setProperties
     */
    void removeProperty(const std::string &key) override;

    /**
     * \brief Obtain a list of valid property keys which can be configured.
     *
     * \return list of configurable property keys.
     *
     * \see setProperty
     */
    std::vector<std::string> getValidProperties() const override;

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
    virtual bool initializeStudy(const std::vector<unsigned char> &data) override;

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
    virtual bool addToStudy(const std::vector<unsigned char> &data) override;

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
    virtual bool initializeStudyFromFile(const std::string &pathToFile) override;

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
    virtual bool addToStudyFromFile(const std::string &pathToFile) override;

    /**
     * \brief Creates a Collector to process video frames and build a
     * request payload.
     *
     * \return a reference to a Collector.
     */
    std::shared_ptr<dfx::Collector> createCollector() override;
};
} // namespace dfx

#endif // LIBDFX_CPPDFXFactory_H
