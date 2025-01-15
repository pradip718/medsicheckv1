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

package mx.medsi.medsicheck

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import mx.medsi.medsicheck.ui.MainActivity
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import org.json.JSONObject
import java.util.Locale

enum class Action {
    StartMeasurement,
    SynchronizeAppConfiguration,
    SynchronizeConfiguration,
    SynchronizeUIConfiguration,
    StopCommonObserving,
    StopResultsObserving;

    val stringValue = this.toString().replaceFirstChar { it.lowercase(Locale.getDefault()) }
}

enum class Event {
    AnuraMeasurementPageDidLoad,
    AnuraMeasurementPageDidAppear,
    AnuraMeasurementPageDidDisappear,
    AnuraMeasurementPageIsReadyToMeasure,
    AnuraMeasurementPageDidStartMeasuring,
    AnuraMeasurementPageDidFinishMeasuring,
    AnuraMeasurementGetResultsSuccess,
    AnuraMeasurementGetResultsFailure;

    val stringValue = this.toString().replaceFirstChar { it.lowercase(Locale.getDefault()) }
}

class RNTEventBridge(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    companion object {
        lateinit var reactContext: ReactApplicationContext

        @JvmStatic fun sendCommomEvent(name: String, params: WritableMap?) {
            val newParams = Arguments.createMap().apply {
                putString("nativeActionName", name)
                putMap("data", params)
            }
            sendEvent(reactContext, "eventReminder_common", newParams)
        }

        @JvmStatic fun sendResultsEvent(name: String, params: WritableMap?) {
            val newParams = Arguments.createMap().apply {
                putString("nativeActionName", name)
                putMap("data", params)
            }
            sendEvent(reactContext, "eventReminder_results", newParams)
        }

        private fun sendEvent(reactContext: ReactContext, eventName: String, params: WritableMap?) {
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit(eventName, params)
        }
    }

    override fun getName() = "RNTEventBridge"

    @ReactMethod
    fun doSomething(eventName: String, property: String?) {
        when (eventName) {
            Action.StartMeasurement.stringValue -> {
                (MainActivity.currentContext as MainActivity).startMeasurementActivity(jsonToMap(property))
            }
            Action.SynchronizeAppConfiguration.stringValue -> {
                AppConfig.synchronizeAppConfiguration(jsonToMap(property))
            }
            Action.SynchronizeConfiguration.stringValue -> {
                MeasurementConfig.synchronizeMeasurementConfiguration(jsonToMap(property))
            }
            Action.SynchronizeUIConfiguration.stringValue -> {
                MeasurementUIConfig.synchronizeMeasurementUIConfiguration(jsonToMap(property))
            }
        }
    }

    private fun jsonToMap(jsonString: String?): Map<String, Any>? {
        if (jsonString == null) return null
        val json = JSONObject(jsonString)
        val map = mutableMapOf<String, Any>()
        for (key in json.keys()) {
            val value = json.get(key)
            map[key] = value
        }
        return map
    }

    @ReactMethod
    fun anura_startCommonObserving() {}

    @ReactMethod
    fun anura_startResultsObserving() {}

    @ReactMethod
    fun addListener(eventName: String) {}

    @ReactMethod
    fun removeListeners(count: Int) {}
}