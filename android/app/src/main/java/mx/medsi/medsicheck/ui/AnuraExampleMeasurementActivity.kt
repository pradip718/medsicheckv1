/*
 *              Copyright (c) 2016-2023, Nuralogix Corp.
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

package mx.medsi.medsicheck.ui

import mx.medsi.medsicheck.R
import mx.medsi.medsicheck.utils.KEY_DFX_EXTRACTION_LIBRARY_STUDY_CONFIG
import mx.medsi.medsicheck.utils.SharedPreferencesHelper
import ai.nuralogix.anuracream.ui.views.MeasurementView
import ai.nuralogix.anuracream.utils.DisplayUtil.maximizeScreenBrightness
import ai.nuralogix.anuracream.utils.DisplayUtil.resumeScreenBrightness
import ai.nuralogix.anurasdk.config.CameraConfiguration
import ai.nuralogix.anurasdk.config.Configuration
import ai.nuralogix.anurasdk.config.DfxPipeConfiguration
import ai.nuralogix.anurasdk.config.RenderingVideoSinkConfig
import ai.nuralogix.anurasdk.core.Core
import ai.nuralogix.anurasdk.core.MeasurementPipeline
import ai.nuralogix.anurasdk.core.MeasurementPipelineListener
import ai.nuralogix.anurasdk.core.VideoFormat
import ai.nuralogix.anurasdk.core.result.MeasurementResults
import ai.nuralogix.anurasdk.core.states.MeasurementState
import ai.nuralogix.anurasdk.error.AnuraError
import ai.nuralogix.anurasdk.face.FaceTrackerAdapter
import ai.nuralogix.anurasdk.face.MediaPipeFaceTracker
import ai.nuralogix.anurasdk.network.DeepFXClient
import ai.nuralogix.anurasdk.render.Render
import ai.nuralogix.anurasdk.utils.Countdown
import ai.nuralogix.anurasdk.utils.DCResult
import ai.nuralogix.anurasdk.utils.DefaultCountdown
import ai.nuralogix.anurasdk.utils.ImageUtils
import ai.nuralogix.anurasdk.views.AbstractTrackerView
import ai.nuralogix.anurasdk.views.utils.MeasurementUIConfiguration
import ai.nuralogix.dfx.ChunkPayload
import ai.nuralogix.dfx.ConstraintResult
import ai.nuralogix.dfx.ConstraintResult.ConstraintReason
import android.annotation.SuppressLint
import android.content.res.Resources
import android.opengl.GLSurfaceView.Renderer
import android.os.Bundle
import android.util.Log
import android.view.Window
import android.view.WindowManager
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.LiveData
import mx.medsi.medsicheck.Action
import mx.medsi.medsicheck.AppConfig
import mx.medsi.medsicheck.Event
import mx.medsi.medsicheck.MeasurementConfig
import mx.medsi.medsicheck.RNTEventBridge
import com.facebook.react.bridge.Arguments
import kotlin.io.encoding.Base64
import kotlin.io.encoding.ExperimentalEncodingApi
import kotlin.math.max
import mx.medsi.medsicheck.MeasurementUIConfig
import java.util.Timer
import java.util.TimerTask
import kotlin.math.roundToInt


/**
 * This is an example implementation of an Activity that uses Anura Core SDK. This Activity closely
 * resembles the measurement screen from the standard Anura app from NuraLogix.
 *
 * Your application can further customize the appearance and behaviour of this activity.
 */
class AnuraExampleMeasurementActivity :
    AppCompatActivity(),
    MeasurementPipelineListener,
    AbstractTrackerView.TrackerViewListener {

    companion object {
        const val TAG = "AnuraMeasurementActivity"

        /**
         * Generally, the front-facing camera sensor is rotated, and so the width and height are
         * reversed. You may adjust IMAGE_WIDTH and IMAGE_HEIGHT to suit your application and
         * hardware.
         */
        var IMAGE_WIDTH = 640.0f
        var IMAGE_HEIGHT = 480.0f

        /**
         * Measurement duration is typically set to 30 seconds, with a total of 6 chunks that are
         * 5 seconds each. This allows the application to get measurement results every 5 seconds
         */
        var MEASUREMENT_DURATION = 30.0
        var TOTAL_NUMBER_CHUNKS = 6
    }

    /**
     * [MeasurementState] reflects the current state of the measurement. This is used to manage the
     * state of the UI.
     */
    private var measurementViewState: MeasurementState = MeasurementState.Off

    /**
     * Core manages the threads and dispatching work to the various components of Anura Core SDK.
     */
    private lateinit var core: Core

    /**
     * [MeasurementPipeline] connects the various components of Anura Core SDK, from fetching camera
     * video frames all the way through rendering the video in the UI. It also manages the
     * measurement state.
     */
    private lateinit var measurementPipeline: MeasurementPipeline

    /**
     * [FaceTrackerAdapter] is responsible for integrating a face tracker component to Anura Core.
     * Included in Anura Core SDK is a FaceTrackerAdapter for MediaPipe FaceMesh from Google.
     *
     * Earlier versions of Anura Core SDK included Visage FaceTrack. If you still would like to use
     * Visage FaceTrack, please refer to the 2.4.0 Migration Guide.
     */
    private lateinit var faceTracker: FaceTrackerAdapter

    /**
     * [VideoFormat] specifies the format of the camera video frames
     */
    private lateinit var videoFormat: VideoFormat

    /**
     * [Render] is responsible for rendering the camera video frames in the UI. Anura Core SDK
     * includes a Render class based on OpenGL
     */
    private lateinit var render: Render

    /**
     * [MeasurementView] displays the various UI elements on top of the camera view
     * (measurement outline, histograms, heart image, etc)
     */
    private lateinit var measurementView: MeasurementView

    /**
     * [MeasurementUIConfiguration] configures the various aspects of MeasurementView
     */
    private lateinit var measurementUIConfig: MeasurementUIConfiguration

    /**
     * Handles the "3...2...1..." measurementStartCountdown when the measurement is about
     * to start
     */
    private lateinit var measurementStartCountdown: Countdown

    /**
     * This is the saved config data binary that is used to initalize DeepAffex Extraction Library
     * based on the DeepAffex Cloud study ID of your application.
     */
    private var deepAffexExtractionLibraryStudyConfigData
            by SharedPreferencesHelper(KEY_DFX_EXTRACTION_LIBRARY_STUDY_CONFIG, "")


    //region Common Methods
    /**
     * This method will get called when measurement is complete DeepAffex Cloud has finished
     * processing the measurement data
     *
     * Here your application can save the data from [MeasurementResults]. As an example, here the
     * results will be displayed in a simple list in a new activity
     */
    private fun handleMeasurementResultsComplete(results: MeasurementResults) {
        // Callback event to React
        val resultsList = results.allResults.toSortedMap().map {
            Arguments.toBundle(Arguments.createMap().apply {
                putString("key", it.key)
                putDouble("value", it.value.value)
            }
            )
        }
        val params = Arguments.createMap().apply {
            putString("measurementID", results.measurementID)
            putArray("results", Arguments.fromList(resultsList))
        }
        RNTEventBridge.sendResultsEvent(Event.AnuraMeasurementGetResultsSuccess.stringValue, params)
        RNTEventBridge.sendResultsEvent(Action.StopResultsObserving.stringValue, null)
    }

    /**
     * Start the measurement. This method will only start the measurement if the state is in
     * [MeasurementState.ReadyToMeasure]. Starting a measurement makes a call to DeepAffex Cloud API
     * and creates a new Measurement ID.
     *
     * Reference: https://dfxapiversion10.docs.apiary.io/#reference/0/measurements/create
     */
    private fun startMeasurement() {
        if (!this::core.isInitialized) {
            return
        }

        println(MainActivity.measurementQuestionnaire)
        println(MainActivity.PARTNER_ID)

        val status = measurementPipeline.startMeasurement(
            MainActivity.measurementQuestionnaire,
            AppConfig.DFX_STUDY_ID,
            "",
            MainActivity.PARTNER_ID
        )

        if (status == AnuraError.Core.OK) {
            setupMeasurementViewForStartMeasurement()
        }
    }

    /**
     * Stop the current active measurement. This method will only stop the measurement if the state
     * is in [MeasurementState.Measuring] or [MeasurementState.Analyzing]
     */
    private fun stopMeasurement() = runOnUiThread {
        println("rn--android...stopMeasurement")
        if (!this::core.isInitialized) {
            return@runOnUiThread
        }

        val status = measurementPipeline.stopMeasurement()

        if (status == AnuraError.Core.OK) {
            resetMeasurementView()
        }
    }

    /**
     * Handle a new [MeasurementState] and update the UI accordingly
     */
    private fun handleMeasurementViewState(state: MeasurementState) = runOnUiThread {

        /**
         * If the new state is the same as the previous state, do nothing
         */
        if (state == measurementViewState) return@runOnUiThread

        when (state) {
            /**
             * [MeasurementPipeline] is off. Shutdown everything.
             */
            MeasurementState.Off -> {
                resetMeasurementView()
            }

            /**
             * Calibrating is reserved for a future version of Anura Core SDK.
             */
            MeasurementState.Calibrating -> {
                // reserved
            }

            /**
             * Locked occurs after a measurement cancellation to show the user feedback and allow
             * time for the measurement to reset.
             */
            MeasurementState.Locked -> {
                resetMeasurementView()
            }

            /**
             * Idle is when there's no face is detected in the camera.
             */
            MeasurementState.Idle -> {
                resetMeasurementView()
                measurementView.promptMsg = resources.getString(R.string.MEASURING_MSG_DEFAULT)
            }

            /**
             * Extracting is when a face is detected, but the user isn't yet in the correct
             * position based on the active DeepAffex Extraction Library constraints.
             */
            MeasurementState.Extracting -> {
                resetMeasurementView()
                if (MeasurementConfig.screenLightControlEnabled != false) {
                    maximizeScreenBrightness(this)
                }
                measurementView.tracker.showHistograms(measurementUIConfig.showHistograms)
            }

            /**
             * Hold is when the user is in the correct position. That's when the lighting quality
             * stars appear along with a "Perfect! Hold still" status message appears on the screen.
             */
            MeasurementState.Hold -> {
                prepareViewForHoldState()
            }

            /**
             * ReadyToMeasure occurs after the Hold state if the user is still in the correct
             * position and ready to measure. This is when the "3...2...1..." countdown starts.
             */
            MeasurementState.ReadyToMeasure -> {
                measurementStartCountdown.start()
                measurementView.promptMsg = resources.getString(R.string.MEASURING_COUNTDOWN)

                RNTEventBridge.sendCommomEvent(Event.AnuraMeasurementPageIsReadyToMeasure.stringValue, null)
            }

            /**
             * Measuring reflects an active measurement.
             */
            MeasurementState.Measuring -> {
                with(measurementView) {
                    showHeartRate(true)
                    setHeartRate("--")
                    promptMsg = ""
                }

                RNTEventBridge.sendCommomEvent(Event.AnuraMeasurementPageDidStartMeasuring.stringValue, null)
            }

            /**
             * Analyzing occurs after the Measuring state when extraction is complete. In this
             * state, DeepAffex Cloud is processing the measurement data and the application is
             * waiting for results.
             */
            MeasurementState.Analyzing -> {
                if (MeasurementConfig.screenLightControlEnabled != false) {
                    resumeScreenBrightness(this)
                }
                resetMeasurementView()

                RNTEventBridge.sendCommomEvent(Event.AnuraMeasurementPageDidFinishMeasuring.stringValue, null)

                Timer().schedule(object : TimerTask() {
                    override fun run() {
                        if (measurementViewState == MeasurementState.Analyzing) {
                            finish()
                        }
                    }
                }, 30000)

                moveTaskToBack(true)
            }

            /**
             * Complete indicates a complete measurement, with results being available if the
             * measurement passed the quality checks on DeepAffex Cloud.
             */
            MeasurementState.Complete -> {
                stopMeasurement()

                RNTEventBridge.sendCommomEvent(Event.AnuraMeasurementPageDidFinishMeasuring.stringValue, null)
            }

            /**
             * Failure occurs only after a Measuring state if an error occurs during a measurement.
             */
            MeasurementState.Failure -> {
                if (measurementViewState == MeasurementState.Analyzing) {
                    finish()
                    // Callback event to React
                    val params = Arguments.createMap().apply {
                        putInt("errorCode", -1)
                        putString("errorDescription", "snr error!")
                    }
                    RNTEventBridge.sendResultsEvent(Event.AnuraMeasurementGetResultsFailure.stringValue, params)
                    RNTEventBridge.sendResultsEvent(Action.StopResultsObserving.stringValue, null)
                } else {
                    stopMeasurement()
                    measurementPipeline.unprepare()
                    if (MeasurementConfig.screenLightControlEnabled != false) {
                        resumeScreenBrightness(this)
                    }
                }
            }
        }

        measurementViewState = state
    }

    /**
     * This method is called after MeasurementPipeline and MeasurementView have finished setting up.
     * As an example, this method simply displays the version number of DeepAffex Extraction Library
     */
    // private fun setupCustomViews() {
    //     val dfxIDText = findViewById<TextView>(R.id.dfx_sdk_version)
    //     dfxIDText.setTextColor(measurementUIConfig.statusMessagesTextColor)
    //     dfxIDText.text =  getString(R.string.dfx_id_version, core.dfxSdkID, core.coreSdkVersion)
    // }

    //endregion Common Methods

    /**
     * Configures MeasurementView for the Hold State.
     */
    private fun prepareViewForHoldState() = runOnUiThread {
        measurementView.tracker.flipTrackerColor(true)
        with(measurementView) {
            promptMsg = resources.getString(R.string.MEASURING_PERFECT)
            tracker.showHistograms(measurementUIConfig.showHistograms)
            showHeartRate(false)
            setStars(0f)
            showStars(true)
        }
    }

    //region MeasurementPipelineListener

    /**
     * [MeasurementPipeline] callback to provide a way to observe [MeasurementState].
     */
    override fun onMeasurementStateLiveData(measurementState: LiveData<MeasurementState>?) {
        measurementState?.observe(this) { newState: MeasurementState ->
            handleMeasurementViewState(state = newState)
        }
    }

    /**
     * [MeasurementPipeline] callback to provide the measurementID as soon as
     * it is available.
     */
    override fun onMeasurementCreated(measurementID: String?) {
        Log.d(TAG, "measurementID:$measurementID")
    }

    /**
     * [MeasurementPipeline] callback to get the current camera parameters and lighting quality
     * score. [lightQAS] can be used to display and update the stars on the measurement UI.
     */
    override fun onMeasurementLightParam(
        dcResult: DCResult,
        ISO: Int,
        maxISO: Int,
        exposureDuration: Long,
        aeCompensation: Int,
        lightQAS: Float
    ) = runOnUiThread {
        measurementView.setStars(lightQAS)
    }

    /**
     * [MeasurementPipeline] callback to get the current histograms for display on the measurement
     * UI. If you set [RenderingVideoSinkConfig.RuntimeKey.UPDATE_HISTOGRAM] to `FALSE`, this method
     * will not be called.
     */
    override fun onHistogramReceived(regionCenters: FloatArray, histograms: FloatArray) =
        runOnUiThread {
            Log.d(TAG, "onHistogramReceived")
            measurementView.tracker.setHistograms(histograms, regionCenters)
        }

    /**
     * [MeasurementPipeline] callback to get the current violations of DeepAffex Extraction
     * Library's Constraint system. For more information on Constraints, please refer to DeepAffex
     * Developer Guide:
     *
     * https://docs.deepaffex.ai/guide/sdk/5_constraints.html
     */
    override fun onMeasurementConstraint(
        isMeasuring: Boolean,
        status: ConstraintResult.ConstraintStatus,
        constraints: MutableMap<String, ConstraintResult.ConstraintStatus>
    ) {

        /**
         * Parse the constraint violation reason
         */
        var constraintReason: ConstraintReason = ConstraintReason.UNKNOWN
        constraints.forEach {
            constraintReason = ConstraintResult.getConstraintReasonFromString(it.key)
        }

        /**
         * Update the constraint message on the UI
         */
        setConstraintMessage(isMeasuring, status, constraintReason)
    }

    /**
     * [MeasurementPipeline] callback to get the current [MeasurementResults] during a measurement.
     * For a typical 30-second measurement of 6 chunks that are 5 seconds each, this method will be
     * called 5 times.
     *
     * @param payload   The payload data generated by DeepAffex Extraction Library and sent to
     *                  DeepAffex Cloud for processing
     * @param results   A [MeasurementResults] instance containing results of the current
     *                  measurement so far
     */
    override fun onMeasurementPartialResult(payload: ChunkPayload?, results: MeasurementResults) {
        Log.d(TAG, "onMeasurementPartialResult - " +
                "MeasurementID ${results.measurementID} - " +
                "${results.chunkOrder}")

        /**
         * Check the SNR of the measurement so far
         */
        handleResultSNR(results, false)
    }

    /**
     * [MeasurementPipeline] callback to get the current [MeasurementResults] when a measurement is
     * complete.
     *
     * @param payload   The last chunk of the payload data generated by DeepAffex Extraction Library
     * @param results   A [MeasurementResults] instance containing results of the completed
     *                  measurement
     */
    override fun onMeasurementDone(payload: ChunkPayload?, results: MeasurementResults) {
        Log.d(TAG, "onMeasurementDone - " +
                "MeasurementID ${results.measurementID} - " +
                "${results.chunkOrder}")

        /**
         * Check the SNR of the measurement
         */
        handleResultSNR(results, true)
    }

    /**
     * [MeasurementPipeline] callback to handle any errors during a measurement
     */
    override fun onMeasurementError(error: AnuraError) {
        Log.d(TAG, "onMeasurementError")
        handleMeasurementError(error)
    }

    /**
     * [MeasurementPipeline] callback to report back the progress of a measurement during
     * [MeasurementState.Measuring]. The parameter [progressPercent] can be used to update the UI
     * and show feedback to the user on the current progress.
     */
    override fun onMeasurementProgress(progressPercent: Float, frameRate: Float) {
        measurementView.tracker.setMeasurementProgress(progressPercent)
    }
    //endregion MeasurementPipelineListener

    //region pipeline initialization

    /**
     * Setup and initialize [MeasurementPipeline]
     */
    private fun setupMeasurementPipeline() {
        Log.d(TAG, "initPipeline")

        core = Core.createAnuraCore(this)

        setupFaceTracker()
        setupMeasurementDuration()
        setupCountdownTimer()
        setupRenderer()
        createMeasurementPipeline()
    }

    /**
     * Instantiate [MeasurementPipeline]
     */
    private fun createMeasurementPipeline() {
        Log.d(TAG, "createMeasurementPipeline")

        measurementPipeline =
            MeasurementPipeline.createMeasurementPipeline(
                core,
                MEASUREMENT_DURATION.toInt(),
                videoFormat,
                getStudyFileByteData(),
                render,
                getConfigurations(),
                faceTracker,
                this
            )

        measurementView.trackerImageView.setRenderer(render as Renderer)
    }

    /**
     * Load the study configuration file for DeepAffex Extraction Library from SharedPreferences
     */
    @OptIn(ExperimentalEncodingApi::class)
    private fun getStudyFileByteData(): ByteArray {
        return Base64.decode(
            deepAffexExtractionLibraryStudyConfigData,
            0,
            deepAffexExtractionLibraryStudyConfigData.length
        )
    }

    /**
     * Setup and initialize [MediaPipeFaceTracker]
     */
    private fun setupFaceTracker() {
        val display = resources.displayMetrics
        val width = display.widthPixels
        val height = display.heightPixels

        faceTracker = MediaPipeFaceTracker(core.context)
        faceTracker.setTrackingRegion(0, 0, width, height)
    }

    /**
     * Set up the [Configuration] parameters used by the various stages of [MeasurementPipeline]
     */
    private fun getConfigurations(): HashMap<String, Configuration<*, *>> {
        val configurations = HashMap<String, Configuration<*, *>>()
        val cameraConfig = getCameraConfiguration()
        val dfxPipeConfig = getDfxPipeConfiguration()
        val renderingVideoSinkConfig = getRenderingVideoSinkConfig()

        configurations[cameraConfig.id] = cameraConfig
        configurations[dfxPipeConfig.id] = dfxPipeConfig
        configurations[renderingVideoSinkConfig.id] = renderingVideoSinkConfig

        return configurations
    }

    /**
     * Create a [RenderingVideoSinkConfig]
     */
    private fun getRenderingVideoSinkConfig(): RenderingVideoSinkConfig {
        val renderingVideoSinkConfig = RenderingVideoSinkConfig(application.applicationContext, null)

        /**
         * By default, [RenderingVideoSinkConfig.RuntimeKey.UPDATE_HISTOGRAM] should be set to `false`
         * In previous versions of Anura Core SDK, this parameter was set to true.
         */
        renderingVideoSinkConfig.setRuntimeParameter(
            RenderingVideoSinkConfig.RuntimeKey.UPDATE_HISTOGRAM,
            measurementUIConfig.showHistograms.toString()
        )
        return renderingVideoSinkConfig
    }

    /**
     * Create a [DfxPipeConfiguration]. This is used to configure DeepAffex Extraction Library and
     * the Constraint System. For more information, please refer to the DeepAffex Developer Guide:
     *
     * https://docs.deepaffex.ai/guide/4_sdk.html
     */
    private fun getDfxPipeConfiguration(): DfxPipeConfiguration {
        val dfxPipeConfiguration = DfxPipeConfiguration(applicationContext, null)

        /**
         * By default, these constraints should be set to `true`;
         *  - [DfxPipeConfiguration.RuntimeKey.CHECK_FACE_DISTANCE]
         *  - [DfxPipeConfiguration.RuntimeKey.CHECK_MAX_FACE_DISTANCE]
         *  - [DfxPipeConfiguration.RuntimeKey.CHECK_FACE_CENTERED]
         *  - [DfxPipeConfiguration.RuntimeKey.CHECK_FACE_DIRECTION]
         *  - [DfxPipeConfiguration.RuntimeKey.CHECK_FACE_MOVEMENT]
         * In previous versions of Anura Core SDK, this parameter was set to false.
         */
        dfxPipeConfiguration.setRuntimeParameter(
            DfxPipeConfiguration.RuntimeKey.CHECK_FACE_DISTANCE,
            MeasurementConfig.defaultConstraintsEnabled ?: true
        )
        dfxPipeConfiguration.setRuntimeParameter(
            DfxPipeConfiguration.RuntimeKey.CHECK_MAX_FACE_DISTANCE,
            MeasurementConfig.defaultConstraintsEnabled ?: true
        )
        dfxPipeConfiguration.setRuntimeParameter(
            DfxPipeConfiguration.RuntimeKey.CHECK_FACE_CENTERED,
            MeasurementConfig.defaultConstraintsEnabled ?: true
        )
        dfxPipeConfiguration.setRuntimeParameter(
            DfxPipeConfiguration.RuntimeKey.CHECK_FACE_DIRECTION,
            MeasurementConfig.defaultConstraintsEnabled ?: true
        )
        dfxPipeConfiguration.setRuntimeParameter(
            DfxPipeConfiguration.RuntimeKey.CHECK_FACE_MOVEMENT,
            MeasurementConfig.defaultConstraintsEnabled ?: true
        )
        dfxPipeConfiguration.setRuntimeParameter(
            DfxPipeConfiguration.RuntimeKey.CHECK_LIGHTING,
            MeasurementConfig.lightingQualityConstraintEnabled ?: false
        )

        return dfxPipeConfiguration
    }

    private fun getCameraConfiguration(): CameraConfiguration {
        val configuration = CameraConfiguration(this, null)

        /**
         * Set the cameraId you prefer from configuration
         */
        MeasurementConfig.cameraPosition?.let {
            configuration.setRuntimeParameter(CameraConfiguration.RuntimeKey.CAMERA_ID, it)
        }
        /**
         * Uncomment below line to set the camera flip to desired setting
         */
        // configuration.setRuntimeParameter(CameraConfiguration.RuntimeKey.CAMERA_FLIP, CameraAdapter.ADJUST_CAMERA_FLIP_FLIP)

        return configuration
    }

    /**
     * Setup the measurement duration in [DfxPipeConfiguration]. This is typically set to 30 seconds
     * with a total of 6 chunks that are 5 seconds each. This allows the application to get
     * measurement results every 5 seconds
     */
    private fun setupMeasurementDuration() {
        val dfxConfig = DfxPipeConfiguration(this, null)
        dfxConfig.setRuntimeParameter(DfxPipeConfiguration.RuntimeKey.TOTAL_NUMBER_CHUNKS, 6)

        TOTAL_NUMBER_CHUNKS =
            dfxConfig.getRuntimeParameterInt(DfxPipeConfiguration.RuntimeKey.TOTAL_NUMBER_CHUNKS, 6)
        val duration = TOTAL_NUMBER_CHUNKS * dfxConfig.getRuntimeParameterFloat(
            DfxPipeConfiguration.RuntimeKey.DURATION_PER_CHUNK,
            5f
        )
        MEASUREMENT_DURATION = duration.toDouble()

        (MeasurementConfig.measurementDuration)?.let { MEASUREMENT_DURATION = it.toDouble() }
        (MeasurementConfig.chunkDuration)?.let { TOTAL_NUMBER_CHUNKS = (MEASUREMENT_DURATION / it).toInt() }

        measurementView.tracker.setMeasurementDuration(MEASUREMENT_DURATION)
    }
    //endregion pipeline initialization

    /**
     * Resets the [MeasurementView] class configuration to its default idle state
     */
    private fun resetMeasurementView() = runOnUiThread {
        if (MeasurementConfig.screenLightControlEnabled != false) {
            resumeScreenBrightness(this)
        }
        measurementStartCountdown.cancel()
        with(measurementView) {
            with(tracker) {
                showMask(true)
                showMeasurementProgress(false)
                setMeasurementProgress(0.0f)
                flipTrackerColor(false)
                showHistograms(false)
            }
            reset()
            showHeartRate(false)
            showStars(false)
        }
        setupStarPositionsBasedOnScreenSize()
    }

    //region result and error handling

    /**
     * This method handles [MeasurementResults] from DeepAffex Cloud.
     * @param results    An object containing the current measurement results
     * @param isFinalResult         determines if this is the final result for the current
     *                              active measurement
     */
    private fun handleResultSNR(results: MeasurementResults, isFinalResult: Boolean) {
        val resultIndex = results.chunkOrder
        println("\nrn--android...Current result index=$resultIndex and snr=${results.snr}")
        println(results.allResults)
        /**
         * Update the heart rate result on the UI
         */
        updateHeartRateResult(results)

        /**
         * Pass the SNR and chunk order to [MeasurementPipeline.shouldCancelMeasurement] to check
         * if the measurement should be cancelled early due to a failure in measurement quality
         * checks
         */
        if (measurementPipeline.shouldCancelMeasurement(results.snr, resultIndex)) {
            Log.d("handleResultSNR-shouldCancel", "stopMeasurement")
            if (measurementViewState == MeasurementState.Analyzing) {
                finish()
                // Callback event to React
                 val params = Arguments.createMap().apply {
                    putInt("errorCode", -1)
                    putString("errorDescription", "snr error!")
                }
                RNTEventBridge.sendResultsEvent(Event.AnuraMeasurementGetResultsFailure.stringValue, params)
                RNTEventBridge.sendResultsEvent(Action.StopResultsObserving.stringValue, null)
            } else {
                stopMeasurement()
                setMeasurementErrorMsg(resources.getString(R.string.ERR_MSG_SNR_SHORT))
            }
            return
        }

        /**
         * If it's the final result, pass the results to another activity for display
         */
        if (isFinalResult) {
            Log.d("handleResultSNR-isLastResult", "stopMeasurement")
            println("rn--android...MeasurementState.Complete")
            handleMeasurementResultsComplete(results)
            finish()
        }
    }

    /**
     * This method handles DeepAffex Cloud network errors
     */
    private fun handleMeasurementError(error: AnuraError) = runOnUiThread {
        Log.d(TAG, "handleMeasurementError:$error")
        when (error) {
            AnuraError.Network.LICENSE_EXPIRED -> {
                Toast.makeText(
                    this,
                    resources.getString(R.string.ERR_SERVER_CONNECTION),
                    Toast.LENGTH_LONG
                ).show()
            }

            AnuraError.Network.LOW_SNR -> {
                setMeasurementErrorMsg(resources.getString(R.string.ERR_MSG_SNR_SHORT))
            }

            AnuraError.Network.DFX_VALIDATION_ERROR -> {
                setMeasurementErrorMsg(resources.getString(R.string.ERR_MSG_ANALYZER_FAILED))
            }

            AnuraError.Network.DFX_GENERAL_ERROR, AnuraError.Network.DFX_DISCONNECTED_ERROR -> {
                setMeasurementErrorMsg(resources.getString(R.string.ERR_SERVER_CONNECTION))
            }

            else -> {
                setMeasurementErrorMsg(resources.getString(R.string.ERR_MSG_MEASUREMENT_FAILED))
            }
        }

        stopMeasurement()
    }

    /**
     * This method handles the DeepAffex Extraction Library's Constraint system messages and
     * displays feedback to the user in the status message area under the measurement outline
     * @param isMeasuring           A boolean that determines if the measurement is currently active
     * @param status                An enum that indicates if the current constraint status is
     *                              `GOOD`, `WARNING` or `ERROR
     * @param eReason               An object containing the reason why the Constraints system
     *                              was triggered
     */
    private fun setConstraintMessage(
        isMeasuring: Boolean,
        status: ConstraintResult.ConstraintStatus,
        eReason: ConstraintReason
    ) {

        var constraintMessage = ""

        when (eReason) {
            /**
             * Default prompt when there's no face or image
             */
            ConstraintReason.UNKNOWN,
            ConstraintReason.IMAGE_EMPTY ->
                constraintMessage = resources.getString(R.string.MEASURING_MSG_DEFAULT)

            /**
             * Prompt when face moves outside the camera frame
             */
            ConstraintReason.FACE_OFFTARGET,
            ConstraintReason.FACE_NONE ->
                constraintMessage = if (isMeasuring) {
                    resources.getString(R.string.ERR_CONSTRAINT_POSITION)
                } else {
                    resources.getString(R.string.WARNING_CONSTRAINT_POSITION)
                }

            /**
             * Prompt when the face is too far
             */
            ConstraintReason.FACE_FAR ->
                constraintMessage = if (isMeasuring) {
                    resources.getString(R.string.ERR_CONSTRAINT_TOO_FAR)
                } else {
                    resources.getString(R.string.WARNING_CONSTRAINT_TOO_FAR)
                }

            /**
             * Prompt when there's too much movement
             */
            ConstraintReason.FACE_MOVEMENT,
            ConstraintReason.CAMERA_MOVEMENT ->
                constraintMessage = if (isMeasuring) {
                    resources.getString(R.string.ERR_CONSTRAINT_MOVEMENT)
                } else {
                    resources.getString(R.string.WARNING_CONSTRAINT_MOVEMENT)
                }

            /**
             * Prompt when camera frames-per-second is too low
             */
            ConstraintReason.LOW_FPS ->
                constraintMessage = if (isMeasuring) {
                    resources.getString(R.string.ERR_CONSTRAINT_FPS)
                } else {
                    resources.getString(R.string.WARNING_CONSTRAINT_FPS)
                }

            /**
             * Prompt when there's too much light
             */
            ConstraintReason.IMAGE_BRIGHT,
            ConstraintReason.IMAGE_BACKLIT ->
                constraintMessage = if (isMeasuring) {
                    resources.getString(R.string.ERR_CONSTRAINT_BRIGHTNESS)
                } else {
                    resources.getString(R.string.WARNING_CONSTRAINT_BRIGHTNESS)
                }

            /**
             * Prompt when there's not enough light
             */
            ConstraintReason.IMAGE_QUALITY,
            ConstraintReason.IMAGE_DARK ->
                constraintMessage = if (isMeasuring) {
                    resources.getString(R.string.ERR_CONSTRAINT_DARKNESS)
                } else {
                    resources.getString(R.string.WARNING_CONSTRAINT_DARKNESS)
                }

            /**
             * Prompt when the face is not facing the camera
             */
            ConstraintReason.FACE_DIRECTION ->
                constraintMessage = if (isMeasuring) {
                    resources.getString(R.string.ERR_CONSTRAINT_GAZE)
                } else {
                    resources.getString(R.string.WARNING_CONSTRAINT_GAZE)
                }

            /**
             * Prompt when the face is too close
             */
            ConstraintReason.FACE_NEAR -> {
                constraintMessage = if (isMeasuring) {
                    resources.getString(R.string.ERR_CONSTRAINT_POSITION)
                } else {
                    resources.getString(R.string.WARNING_CONSTRAINT_TOO_CLOSE)
                }
            }
        }

        if (isMeasuring && (status == ConstraintResult.ConstraintStatus.Error
                    || status == ConstraintResult.ConstraintStatus.Warn)
        ) {
            val measurementCancelledMessage = resources.getString(R.string.MEASUREMENT_CANCELED)
            constraintMessage = "$measurementCancelledMessage\n $constraintMessage"
        }

        runOnUiThread {
            measurementView.promptMsg = constraintMessage
        }
    }
    //endregion result and error handling

    //region View Logic
    /**
     * This method sets up and configures the [MeasurementView] class that displays the various UI
     * elements on top of the camera view
     */
    private fun setupMeasurementView() = runOnUiThread {
        measurementView = findViewById(R.id.measurement_view)

        /**
         * Use [MeasurementUIConfiguration] to configure various aspects MeasurementView
         * The default configuration that closely matches the appearance of the standard Anura app
         * from NuraLogix.
         * If you need to use the legacy UI, you can use
         * [MeasurementUIConfiguration.anuraDefaultLegacyUIConfiguration]
         */
        measurementUIConfig = MeasurementUIConfiguration()

        getResource(MeasurementUIConfig.heartRateImage)?.let {
            measurementUIConfig.heartRateImage = it
        }

        getResource(MeasurementUIConfig.lightingQualityStarsEmptyImage)?.let {
            measurementUIConfig.lightingQualityStarsEmptyImage = it
        }

        getResource(MeasurementUIConfig.lightingQualityStarsFilledImage)?.let {
            measurementUIConfig.lightingQualityStarsFilledImage = it
        }

        MeasurementUIConfig.overlayBackgroundColor?.let {
            measurementUIConfig.overlayBackgroundColor = it
        }

        MeasurementUIConfig.measurementOutlineInactiveColor?.let {
            measurementUIConfig.measurementOutlineInactiveColor = it
        }

        MeasurementUIConfig.measurementOutlineActiveColor?.let {
            measurementUIConfig.measurementOutlineActiveColor = it
        }

        MeasurementUIConfig.timerTextColor?.let {
            measurementUIConfig.timerTextColor = it
        }

        MeasurementUIConfig.statusMessagesTextColor?.let {
            measurementUIConfig.statusMessagesTextColor = it
        }

        MeasurementUIConfig.histogramActiveColor?.let {
            measurementUIConfig.histogramActiveColor = it
        }

        MeasurementUIConfig.histogramInactiveColor?.let {
            measurementUIConfig.histogramInactiveColor = it
        }

        MeasurementUIConfig.showHeartRateDuringMeasurement?.let {
            measurementUIConfig.showHeartRateDuringMeasurement = it
        }

        MeasurementUIConfig.showOverlay?.let {
            measurementUIConfig.showOverlay = it
        }

        MeasurementUIConfig.showHistograms?.let {
            measurementUIConfig.showHistograms = it
        }

        measurementView.setMeasurementUIConfiguration(measurementUIConfig)

        
        measurementView.setIconImageResource(0)
        
        // getResource(MeasurementUIConfig.logoImage)?.let {
        //     measurementView.setIconImageResource(it)
        // }

        MeasurementUIConfig.showCountdown?.let {
            measurementView.showCountdown(it)
        }

        MeasurementUIConfig.showStatusMessages?.let {
            measurementView.showPromptMsg(it)
        }

        MeasurementUIConfig.animateHeartRateImage?.let {
            if (it) {
                measurementView.startHeartBeating()
            }
        }

        MeasurementUIConfig.showLightingQualityStars?.let {
            measurementView.showStars(it)
        }

        /**
         * Set camera frame dimensions for MeasurementView
         */
        with(measurementView.tracker) {
            setImageDimension(IMAGE_HEIGHT, IMAGE_WIDTH)
            setListener(this@AnuraExampleMeasurementActivity)
        }
    }

    /**
     * This method sets up the OpenGL [Render] class that displays the camera view
     */
    private fun setupRenderer() {
        /**
         * Typically [VideoFormat] should not be changed. You may adjust [IMAGE_HEIGHT] and
         * [IMAGE_WIDTH] to suit your application and hardware
         */
        videoFormat = VideoFormat(
            VideoFormat.ColorFormat.BGRA,
            MeasurementConfig.frameRate?:30,
            IMAGE_HEIGHT.toInt(),
            IMAGE_WIDTH.toInt()
        )

        /**
         * The [Render] class makes a slight adjustment to the view based on
         * [MeasurementUIConfiguration.MeasurementOutlineStyle]
         */
        val usingOvalUI = measurementUIConfig.measurementOutlineStyle ==
                MeasurementUIConfiguration.MeasurementOutlineStyle.OVAL
        render = Render.createGL20Render(videoFormat, usingOvalUI)
    }

    /**
     * This method sets up the position on the lighting quality star rating based on the screen size
     */
    private fun setupStarPositionsBasedOnScreenSize() = runOnUiThread {
        val screenWidth = Resources.getSystem().displayMetrics.widthPixels
        val screenHeight = Resources.getSystem().displayMetrics.heightPixels
        val xScale = screenWidth.toFloat() / IMAGE_HEIGHT
        val yScale = screenHeight.toFloat() / IMAGE_WIDTH
        val scale = max(xScale, yScale)
        val top = (474 * scale).toInt()
        measurementView.setStarsPosition(30, top, 30, 0)
    }

    /**
     * This method sets up the "3...2...1..." countdown timer when the measurement is about to start
     */
    private fun setupCountdownTimer() {
        val countdownDuration = MeasurementConfig.countdownDuration ?: 3
        measurementStartCountdown = DefaultCountdown(countdownDuration, object : Countdown.Listener {
            override fun onCountdownTick(value: Int) {
                runOnUiThread {
                    measurementView.setCountdown(value.toString())
                }
            }

            override fun onCountdownEnd() {
                startMeasurement()
            }

            override fun onCountdownCancel() {
                runOnUiThread {
                    measurementView.setCountdown("")
                }
            }
        })
    }

    /**
     * This method configures the [MeasurementView] class when starting the measurement to show the
     * measurement progress
     */
    private fun setupMeasurementViewForStartMeasurement() = runOnUiThread {
        with(measurementView) {
            with(tracker) {
                showMeasurementProgress(true)
                setMeasurementProgress(0.0f)
            }
            promptMsg = ""
            setCountdown("")
        }
    }

    /**
     * This method displays an error message in the status message area under the measurement outline
     * @param message   The cancellation message to be displayed
     */
    private fun setMeasurementErrorMsg(message: String) = runOnUiThread {
        val measurementCancelledMessage = resources.getString(R.string.MEASUREMENT_CANCELED)
        val errorMsg = "$measurementCancelledMessage\n$message"
        measurementView.promptMsg = errorMsg
        resetMeasurementView()
    }

    /**
     * This method updates the heart rate result inside the heart graphic under the
     * measurement outline
     * @param results   A [MeasurementResults] object containing the results for the current
     *                  measurement
     */
    private fun updateHeartRateResult(results: MeasurementResults) = runOnUiThread {
        if (!results.heartRate.isNaN()) {
            measurementView.setHeartRate(results.heartRate.roundToInt().toString())
        } else {
            measurementView.setHeartRate("--")
        }
    }

    /**
     * This method responds to [AbstractTrackerView.TrackerViewListener] callback method that occurs
     * when the view size is changed. The face tracker and rendering area need to accommodate
     * the view size change
     */
    override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) = runOnUiThread {
        Log.d(TAG, "onSizeChanged w=$w h=$h")
        val targetBox = ImageUtils.getFaceTargetBox(
            w,
            h,
            IMAGE_HEIGHT.toInt(),
            IMAGE_WIDTH.toInt(),
            measurementUIConfig.measurementOutlineStyle == MeasurementUIConfiguration.MeasurementOutlineStyle.OVAL
        )
        measurementView.tracker.setFaceTargetBox(targetBox)
        faceTracker.setTrackingRegion(w, h, IMAGE_HEIGHT.toInt(), IMAGE_WIDTH.toInt())
        measurementPipeline.setScreenSize(w, h, oldw, oldh)
    }

    //endregion view logic

    //region Activity LifeCycle Methods
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        println("rn--android...onCreate")

        /**
         * Keep the screen on while on the measurement screen
         */
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)

        /**
         * Setting the layout of the activity
         */
        supportRequestWindowFeature(Window.FEATURE_NO_TITLE)
        setContentView(R.layout.activity_anura_measurement)

        /**
         * Initialize and setup Anura Core SDK and associated views
         */
        setupMeasurementView()
        setupMeasurementPipeline()
        // setupCustomViews()

        /**
         * Connect to DeepAffex Cloud
         */
        DeepFXClient.getInstance().connect()

        RNTEventBridge.sendCommomEvent(Event.AnuraMeasurementPageDidLoad.stringValue, null)
    }

    override fun onResume() {
        super.onResume()
        println("rn--android...onResume")
        if (this::core.isInitialized) {
            measurementPipeline.prepare(true)
            measurementPipeline.setListener(this)
        }
        setupStarPositionsBasedOnScreenSize()

        RNTEventBridge.sendCommomEvent(Event.AnuraMeasurementPageDidAppear.stringValue, null)
    }

    override fun onPause() {
        super.onPause()
        println("rn--android...onPause")
        if (measurementViewState != MeasurementState.Analyzing) {
            stopMeasurement()
            if (this::core.isInitialized) {
                measurementPipeline.unprepare()
                if (MeasurementConfig.screenLightControlEnabled != false) {
                    resumeScreenBrightness(this)
                }
            }
        }
    }

    override fun onStop() {
        super.onStop()
        println("rn--android...onStop")

        if (measurementViewState == MeasurementState.Analyzing) {
             RNTEventBridge.sendCommomEvent(Action.StopCommonObserving.stringValue, null)
        } else {
            finish()
        }
        RNTEventBridge.sendCommomEvent(Event.AnuraMeasurementPageDidDisappear.stringValue, null)
    }

    override fun onDestroy() {
        Log.d(TAG, "Measurement screen destroyed")
        measurementStartCountdown.stop()
        DeepFXClient.getInstance().disconnect()
        DeepFXClient.getInstance().setListener(null)
        if (this::core.isInitialized) {
            try {
                measurementPipeline.close()
                faceTracker.close()
            } catch (e: Exception) {
                Log.e(TAG, "Failed on closing MeasurementPipeline: " + e.message)
            }
        }
        super.onDestroy()

        println("rn--android...Measurement screen destroyed")
    }
    //endregion

    @SuppressLint("DiscouragedApi")
    private fun getResource(name: String?): Int? {
        if (name != null) {
            val ctx = baseContext
            val resId = resources.getIdentifier(name, "mipmap", ctx.packageName)
            return resId
        }
        return null
    }
}