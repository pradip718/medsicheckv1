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

import android.graphics.Color
import org.json.JSONObject

/**
 * Your DeepAffex license key and study ID can be obtained
 * by your administrator from DeepAffex Dashboard: https://dashboard.deepaffex.ai
 * for ReactNative project, you should configure them in AppConfig.js file
 **/
class AppConfig {
    companion object {
        /**
         * Must provide a DeepAffex license key for the app to work
         **/
        var DFX_LICENSE_KEY: String = ""

        /**
         * Must provide a study ID to send measurement data
         **/
        var DFX_STUDY_ID: String = ""

        /**
         * DeepAffex API Hostname
         * International: api.deepaffex.ai
         * China: api.deepaffex.cn
         * REST url: https://${API Hostname}, WS url: wss://${API Hostname}
         **/
        var DFX_REST_URL: String = ""
        var DFX_WS_URL: String = ""

        fun synchronizeAppConfiguration(appConfig: Map<String, Any>?) {
            (appConfig?.get("deepaffexLicenseKey"))?.let { DFX_LICENSE_KEY = it as String }
            (appConfig?.get("deepaffexStudyID"))?.let { DFX_STUDY_ID = it as String }
            (appConfig?.get("deepaffexAPIHostname"))?.let { DFX_REST_URL = "https://$it" }
            (appConfig?.get("deepaffexAPIHostname"))?.let { DFX_WS_URL = "wss://$it" }
        }
    }
}

class MeasurementConfig {
    companion object {
        var measurementDuration: Int? = null
        var defaultConstraintsEnabled: Boolean? = null
        var cameraPosition: String? = null
        var frameRate: Int? = null
        var countdownDuration: Int? = null
        var screenLightControlEnabled: Boolean? = null
        var lightingQualityConstraintEnabled: Boolean? = null
        var chunkDuration: Int? = null

        fun synchronizeMeasurementConfiguration(config: Map<String, Any>?) {
            (config?.get("measurementDuration"))?.let { measurementDuration = it as Int }
            (config?.get("defaultConstraintsEnabled"))?.let { defaultConstraintsEnabled = it as Boolean }
            (config?.get("cameraPosition"))?.let { cameraPosition = if (it == "back") "0" else "1" }
            (config?.get("frameRate"))?.let { frameRate = it as Int }
            (config?.get("countdownDuration"))?.let { countdownDuration = it as Int }
            (config?.get("screenLightControlEnabled"))?.let { screenLightControlEnabled = it as Boolean }
            (config?.get("lightingQualityConstraintEnabled"))?.let { lightingQualityConstraintEnabled = it as Boolean }
            (config?.get("chunkDuration"))?.let { chunkDuration = it as Int }
        }
    }
}

class MeasurementUIConfig {
    companion object {
        var logoImage: String? = null
        var heartRateImage: String? = null
        var lightingQualityStarsFilledImage: String? = null
        var lightingQualityStarsEmptyImage: String? = null
        var overlayBackgroundColor: Int? = null
        var measurementOutlineInactiveColor: Int? = null
        var measurementOutlineActiveColor: Int? = null
        var timerTextColor: Int? = null
        var statusMessagesTextColor: Int? = null
        var histogramActiveColor: Int? = null
        var histogramInactiveColor: Int? = null
        var showHeartRateDuringMeasurement: Boolean? = null
        var showLightingQualityStars: Boolean? = null
        var showCountdown: Boolean? = null
        var showOverlay: Boolean? = null
        var showStatusMessages: Boolean? = null
        var animateHeartRateImage: Boolean? = null
        var showHistograms: Boolean? = null

        fun synchronizeMeasurementUIConfiguration(config: Map<String, Any>?) {
            (config?.get("logoImage"))?.let { logoImage = it as String }
            (config?.get("heartRateImage"))?.let { heartRateImage = it as String }
            (config?.get("lightingQualityStarsFilledImage"))?.let { lightingQualityStarsFilledImage = it as String }
            (config?.get("lightingQualityStarsEmptyImage"))?.let { lightingQualityStarsEmptyImage = it as String }

            (config?.get("overlayBackgroundColor"))?.let {
                overlayBackgroundColor = parseColor(it as JSONObject)
            }
            (config?.get("measurementOutlineInactiveColor"))?.let {
                measurementOutlineInactiveColor = parseColor(it as JSONObject)
            }
            (config?.get("measurementOutlineActiveColor"))?.let {
                measurementOutlineActiveColor = parseColor(it as JSONObject)
            }
            (config?.get("timerTextColor"))?.let {
                timerTextColor = parseColor(it as JSONObject)
            }
            (config?.get("statusMessagesTextColor"))?.let {
                statusMessagesTextColor = parseColor(it as JSONObject)
            }
            (config?.get("histogramActiveColor"))?.let {
                histogramActiveColor = parseColor(it as JSONObject)
            }
            (config?.get("histogramInactiveColor"))?.let {
                histogramInactiveColor = parseColor(it as JSONObject)
            }

            (config?.get("showHeartRateDuringMeasurement"))?.let { showHeartRateDuringMeasurement = it as Boolean }
            (config?.get("showLightingQualityStars"))?.let { showLightingQualityStars = it as Boolean }
            (config?.get("showCountdown"))?.let { showCountdown = it as Boolean }
            (config?.get("showOverlay"))?.let { showOverlay = it as Boolean }
            (config?.get("showStatusMessages"))?.let { showStatusMessages = it as Boolean }
            (config?.get("animateHeartRateImage"))?.let { animateHeartRateImage = it as Boolean }
            (config?.get("showHistograms"))?.let { showHistograms = it as Boolean }
        }

        private fun parseColor(json: JSONObject): Int {
            val hex = json.get("hex").toString()
            val alphaInt = (json.get("alpha").toString().toDouble() * 255).toInt()
            var alphaString = alphaInt.toString(16)
            if (alphaInt == 0) {
                alphaString = "00"
            }
            return Color.parseColor("#$alphaString$hex")
        }
    }
}