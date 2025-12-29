package com.biosensesignal.react_native_sdk

import android.content.Context
import com.biosensesignal.sdk.api.HealthMonitorException
import com.biosensesignal.sdk.api.SessionEnabledVitalSigns
import com.biosensesignal.sdk.api.alerts.ErrorData
import com.biosensesignal.sdk.api.alerts.WarningData
import com.biosensesignal.sdk.api.fall_detection.FallDetectionData
import com.biosensesignal.sdk.api.fall_detection.FallDetectionListener
import com.biosensesignal.sdk.api.images.DeviceOrientation
import com.biosensesignal.sdk.api.images.ImageData
import com.biosensesignal.sdk.api.images.ImageListener
import com.biosensesignal.sdk.api.license.LicenseDetails
import com.biosensesignal.sdk.api.license.LicenseInfo
import com.biosensesignal.sdk.api.ppg_device_scanner.PPGDevice
import com.biosensesignal.sdk.api.ppg_device_scanner.PPGDeviceInfo
import com.biosensesignal.sdk.api.ppg_device_scanner.PPGDeviceScanner
import com.biosensesignal.sdk.api.ppg_device_scanner.PPGDeviceScannerListener
import com.biosensesignal.sdk.api.session.CameraLocation
import com.biosensesignal.sdk.api.session.Session
import com.biosensesignal.sdk.api.session.SessionInfoListener
import com.biosensesignal.sdk.api.session.SessionState
import com.biosensesignal.sdk.api.session.demographics.Sex
import com.biosensesignal.sdk.api.session.demographics.SubjectDemographic
import com.biosensesignal.sdk.api.session.ppg_device.PPGDeviceInfoListener
import com.biosensesignal.sdk.api.session.user_info.SmokingStatus
import com.biosensesignal.sdk.api.session.user_info.UserInformation
import com.biosensesignal.sdk.api.vital_signs.VitalSign
import com.biosensesignal.sdk.api.vital_signs.VitalSignsListener
import com.biosensesignal.sdk.api.vital_signs.VitalSignsResults
import com.biosensesignal.sdk.ppg_data.ppg_device.PPGDeviceType
import com.biosensesignal.sdk.ppg_device_scanner.PPGDeviceScannerFactory
import com.biosensesignal.sdk.session.FaceSessionBuilder
import com.biosensesignal.sdk.session.MeasurementMode
import com.biosensesignal.sdk.session.PolarSessionBuilder
import com.facebook.react.bridge.Arguments
import kotlinx.coroutines.channels.BufferOverflow
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableSharedFlow

object SessionManager:
    ImageDataSource,
    ImageListener,
    VitalSignsListener,
    SessionInfoListener,
    FallDetectionListener {

    private val _images = MutableSharedFlow<ImageData>(replay = 0, extraBufferCapacity = 1, onBufferOverflow = BufferOverflow.DROP_LATEST)
    private var session: Session? = null
    private val ppgScanners = mutableMapOf<String, PPGDeviceScanner>()
    override val images: Flow<ImageData> = _images

    var eventChannel: BiosenseSignalEventEmitter? = null

    @Throws(HealthMonitorException::class)
    fun createCameraSession(
        context: Context,
        licenseKey: String,
        productId: String? = null,
        deviceOrientation: Int? = null,
        subjectSex: Int? = null,
        subjectAge: Double? = null,
        subjectWeight: Double? = null,
        subjectHeight: Double? = null,
        subjectSmokingStatus: Int? = null,
        detectionAlwaysOn: Boolean? = false,
        strictMeasurementGuidance: Boolean? = false,
        cameraLocation: Int? = null,
        sdkAnalytics: Boolean? = false,
        options: Map<String, Any>? = null
    ) {
        val orientation = resolveDeviceOrientation(deviceOrientation)
        val userInformation = resolveUserInformation(
            subjectSex,
            subjectAge,
            subjectWeight,
            subjectHeight,
            subjectSmokingStatus
        )

        val sessionBuilder = FaceSessionBuilder(context)
            .withDeviceOrientation(orientation)
            .withUserInformation(userInformation)

        detectionAlwaysOn?.let {
            sessionBuilder.withDetectionAlwaysOn(it)
        }

        strictMeasurementGuidance?.let {
            sessionBuilder.withStrictMeasurementGuidance(it)
        }

        resolveCameraLocation(cameraLocation)?.let { location ->
          sessionBuilder.withCameraLocation(location)
        }

        session = sessionBuilder
            .withImageListener(this@SessionManager)
            .withVitalSignsListener(this@SessionManager)
            .withSessionInfoListener(this@SessionManager)
            .let { if (sdkAnalytics == true) it.withAnalytics() else it }
            .withOptions(options)
            .build(LicenseDetails(licenseKey, productId))
    }

    fun createPPGDeviceSession(
        context: Context,
        licenseKey: String,
        productId: String? = null,
        deviceId: String,
        deviceType: Int,
        subjectSex: Int? = null,
        subjectAge: Double? = null,
        subjectWeight: Double? = null,
        subjectHeight: Double? = null,
        subjectSmokingStatus: Int? = null,
        fallDetection: Boolean? = false,
        sdkAnalytics: Boolean? = false,
        options: Map<String, Any>? = null
    ) {
        val userInformation = resolveUserInformation(
            subjectSex,
            subjectAge,
            subjectWeight,
            subjectHeight,
            subjectSmokingStatus
        )

        if (resolvePPGDeviceType(deviceType) == PPGDeviceType.POLAR) {
            var builder = PolarSessionBuilder(context, deviceId)
                .withUserInformation(userInformation)
                .withVitalSignsListener(this@SessionManager)
                .withSessionInfoListener(this@SessionManager)
                .withPPGDeviceInfoListener(object : PPGDeviceInfoListener {
                    override fun onPPGDeviceBatteryLevel(batteryLevel: Int) {
                        eventChannel?.sendEvent(NativeBridgeEvents.ppgDeviceBatteryLevel,
                        Arguments.createMap().apply {
                            put("deviceId", deviceId)
                            put("batteryLevel", batteryLevel)
                        })
                    }

                    override fun onPPGDeviceInfo(deviceInfo: PPGDeviceInfo) {
                        eventChannel?.sendEvent(NativeBridgeEvents.ppgDeviceInfo, deviceInfo.toMap())
                    }

                })
                .let { if (sdkAnalytics == true) it.withAnalytics() else it }
                .withOptions(options)

            if (fallDetection == true) {
                builder = builder.withFallDetectionListener(this)
            }

            session = builder.build(LicenseDetails(licenseKey, productId))
        }
    }

    fun startPPGDevicesScan(
        context: Context,
        scannerId: String,
        deviceType: Int,
        timeout: Long?
    ) {
        when (resolvePPGDeviceType(deviceType)) {
            PPGDeviceType.POLAR -> {
                ppgScanners[scannerId] = PPGDeviceScannerFactory.create(
                    context,
                    PPGDeviceType.POLAR,
                    object : PPGDeviceScannerListener {
                        override fun onPPGDeviceDiscovered(device: PPGDevice) {
                            eventChannel?.sendEvent(
                                NativeBridgeEvents.ppgDeviceDiscovered,
                                Arguments.createMap().apply {
                                    put("scannerId", scannerId)
                                    put("device", device.toMap())
                                }
                            )
                        }

                        override fun onPPGDeviceScanFinished() {
                            eventChannel?.sendEvent(
                                NativeBridgeEvents.ppgDeviceScanFinished,
                                Arguments.createMap().apply {
                                    put("scannerId", scannerId)
                                }
                            )
                        }
                    }
                ).also { scanner ->
                    timeout?.let {
                        scanner.start(timeout)
                    } ?: scanner.start()
                }
            }
            else -> return
        }
    }

    fun stopPPGScan(scannerId: String) {
        ppgScanners[scannerId]?.stop();
    }

    @Throws(HealthMonitorException::class)
    fun startSession(duration: Int?) {
        session?.start(duration?.toLong() ?: 0)
    }

    @Throws(HealthMonitorException::class)
    fun stopSession() {
        session?.stop()
    }

    fun terminateSession() {
        session?.terminate()
    }

    fun getSessionState(): SessionState? {
        return session?.state
    }

    override fun onVitalSign(vitalSign: VitalSign) {
        eventChannel?.sendEvent(NativeBridgeEvents.sessionVitalSign, vitalSign.toMap() ?: return)
    }

    override fun onFinalResults(vitalSignsResults: VitalSignsResults) {
        val results = vitalSignsResults.results.mapNotNull { result ->
            result.toMap()
        }.toReadableArray()
        eventChannel?.sendEvent(NativeBridgeEvents.sessionFinalResults, results)
    }

    override fun onImage(imageData: ImageData) {
        eventChannel?.sendEvent(NativeBridgeEvents.imageData, imageData.toMap())
        _images.tryEmit(imageData)
    }

    override fun onSessionStateChange(sessionState: SessionState) {
        eventChannel?.sendEvent(NativeBridgeEvents.sessionStateChange, sessionState.ordinal)
    }

    override fun onWarning(warningData: WarningData) {
        eventChannel?.sendEvent(NativeBridgeEvents.sessionWarning, warningData.toMap())
    }

    override fun onError(errorData: ErrorData) {
        eventChannel?.sendEvent(NativeBridgeEvents.sessionError, errorData.toMap())
    }

    override fun onLicenseInfo(licenseInfo: LicenseInfo) {
        eventChannel?.sendEvent(NativeBridgeEvents.licenseInfo, licenseInfo.toMap())
    }

    override fun onEnabledVitalSigns(enabledVitalSigns: SessionEnabledVitalSigns) {
        eventChannel?.sendEvent(NativeBridgeEvents.enabledVitalSigns, enabledVitalSigns.toMap())
    }

    override fun onFallDetectionData(data: FallDetectionData) {
        eventChannel?.sendEvent(NativeBridgeEvents.fallDetectionData, data.toMap())
    }

    private fun resolveDeviceOrientation(deviceOrientation: Int?): DeviceOrientation? {
        return deviceOrientation?.let {orientation ->
            try {
                DeviceOrientation.values()[orientation]
            } catch (ignore: IndexOutOfBoundsException) {
                null
            }
        }
    }

    private fun resolveUserInformation(sexInt: Int?, age: Double?, weight: Double?, height: Double?, smokingStatusInt: Int?): UserInformation {
        val sex = sexInt?.let { sex ->
            try {
                Sex.values()[sex]
            } catch (e: IndexOutOfBoundsException) {
                Sex.UNSPECIFIED
            }
        }

        val smokingStatus = smokingStatusInt?.let { status ->
            try {
                SmokingStatus.values()[status]
            } catch (e: IndexOutOfBoundsException) {
                SmokingStatus.UNSPECIFIED
            }
        }

        return UserInformation.Builder().apply {
          sex?.let { setSex(sex) }
          age?.let { setAge(age) }
          weight?.let { setWeight(weight) }
          height?.let { setHeight(height) }
          smokingStatus?.let { setSmokingStatus(smokingStatus) }
        }.build()
    }

    private fun resolvePPGDeviceType(deviceTypeInt: Int): PPGDeviceType? {
        return try {
            PPGDeviceType.values()[deviceTypeInt]
        } catch (e: IndexOutOfBoundsException) {
            null
        }
    }

    private fun resolveCameraLocation(cameraLocation: Int?): CameraLocation? {
      return cameraLocation?.let { location ->
        try {
          CameraLocation.values()[location]
        } catch (ignore: IndexOutOfBoundsException) {
          null
        }
      }
    }
}
