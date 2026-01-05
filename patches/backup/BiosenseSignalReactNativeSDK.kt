package com.biosensesignal.react_native_sdk

import com.biosensesignal.sdk.api.HealthMonitorException
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule.RCTDeviceEventEmitter

class BiosenseSignalReactNativeSDKModule(reactContext: ReactApplicationContext) :
	ReactContextBaseJavaModule(reactContext) {

	companion object {
		const val NAME = "BiosenseSignalReactNativeSDK"
	}

	init {
		BiosenseSignalPreviewViewManager.setDataSource(SessionManager)
	}

	override fun initialize() {
		super.initialize()
		SessionManager.eventChannel = BiosenseSignalEventEmitter(reactApplicationContext.getJSModule(RCTDeviceEventEmitter::class.java))
	}

	override fun getName(): String {
		return NAME
	}

	@ReactMethod
	fun createSession(configuration: ReadableMap, promise: Promise) {
		try {
			SessionManager.createCameraSession(
        reactApplicationContext.applicationContext,
				configuration.getString("licenseKey")!!,
				configuration.optString("productId"),
				configuration.optInt("deviceOrientation"),
				configuration.optInt("subjectSex"),
				configuration.optDouble("subjectAge"),
				configuration.optDouble("subjectWeight"),
				configuration.optDouble("subjectHeight"),
        configuration.optInt("subjectSmokingStatus"),
				configuration.optBoolean("detectionAlwaysOn"),
        configuration.optBoolean("strictMeasurementGuidance"),
        configuration.optInt("cameraLocation"),
        configuration.optBoolean("sdkAnalytics"),
				configuration.getMap("options")?.toHashMap()
			)
			promise.resolve(null)
		} catch (e: HealthMonitorException) {
			promise.reject(e.errorCode.toString(), e.domain, e)
		}
	}

	@ReactMethod
	fun createPPGDeviceSession(configuration: ReadableMap, promise: Promise) {
		try {
			SessionManager.createPPGDeviceSession(
        reactApplicationContext.applicationContext,
				configuration.getString("licenseKey")!!,
				configuration.optString("productId"),
				configuration.getString("deviceId")!!,
				configuration.getInt("deviceType"),
				configuration.optInt("subjectSex"),
				configuration.optDouble("subjectAge"),
				configuration.optDouble("subjectWeight"),
				configuration.optDouble("subjectHeight"),
				configuration.optInt("subjectSmokingStatus"),
        configuration.optBoolean("fallDetection"),
        configuration.optBoolean("sdkAnalytics"),
        configuration.getMap("options")?.toHashMap()
			)
			promise.resolve(null)
		} catch (e: HealthMonitorException) {
			promise.reject(e.errorCode.toString(), e.domain, e)
		}
	}

	@ReactMethod
	fun startPPGDevicesScan(scannerId: String, deviceType: Int, timeout: Int? = null, promise: Promise) {
		try {
			SessionManager.startPPGDevicesScan(
				reactApplicationContext,
				scannerId,
				deviceType,
				timeout?.toLong()
			)
			promise.resolve(null);
		} catch (e: HealthMonitorException) {
			promise.reject(e.errorCode.toString(), e.domain, e)
		}
	}

	@ReactMethod
	fun stopPPGDevicesScan(scannerId: String, promise: Promise) {
		SessionManager.stopPPGScan(scannerId)
		promise.resolve(null);
	}

	@ReactMethod
	fun start(measurementDuration: Int, promise: Promise) {
		try {
			SessionManager.startSession(measurementDuration)
			promise.resolve(null)
		} catch (e: HealthMonitorException) {
			promise.reject(e.errorCode.toString(), e.domain, e)
		}
	}

	@ReactMethod
	fun stop(promise: Promise) {
		try {
			SessionManager.stopSession()
			promise.resolve(null)
		} catch (e: HealthMonitorException) {
			promise.reject(e.errorCode.toString(), e.domain, e)
		}
	}

	@ReactMethod
	fun terminate(promise: Promise) {
		SessionManager.terminateSession()
		promise.resolve(null)
	}

	@ReactMethod
	fun getState(promise: Promise) {
		promise.resolve(SessionManager.getSessionState()?.ordinal)
	}
}


