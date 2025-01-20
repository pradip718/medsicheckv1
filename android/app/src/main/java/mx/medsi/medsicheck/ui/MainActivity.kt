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

import ai.nuralogix.anurasdk.core.entity.MeasurementQuestionnaire
import ai.nuralogix.anurasdk.utils.AnuLogUtil
import android.Manifest
import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import mx.medsi.medsicheck.AppConfig
import mx.medsi.medsicheck.BuildConfig
import mx.medsi.medsicheck.utils.SharedPreferencesHelper
import mx.medsi.medsicheck.viewmodel.ExampleStartViewModel

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.google.android.material.dialog.MaterialAlertDialogBuilder
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.Dispatcher
import kotlin.system.exitProcess

import com.zoontek.rnbootsplash.RNBootSplash
import mx.medsi.medsicheck.R


class MainActivity : ReactActivity() {
  companion object {
    @SuppressLint("StaticFieldLeak")
    lateinit var currentContext: Context

    /**
     * Your application is responsible for collecting user profile information.
     * For more information on which DeepAffex Points need this information,
     * please refer to:
     *
     * https://docs.deepaffex.ai/points/introduction.html
     *
     * The [MeasurementQuestionnaire] is recommended to assist with the
     * the validation of the user information and prevent common errors when
     * starting a measurement.
     */
    var measurementQuestionnaire = MeasurementQuestionnaire()

    /**
     * Partner ID can hold a unique-per-user identifier, or any other value which could be used
     * to link your application's end users with their measurements taken on DeepAffex Cloud.
     * This is because your application's end users are considered anonymous users on DeepAffex
     * Cloud.
     *
     * For more information on Partner ID, refer to:
     *
     * https://docs.deepaffex.ai/guide/cloud/4_users.html#anonymous-measurements
     */
    var PARTNER_ID = ""
  }

  private val exampleStartViewModel: ExampleStartViewModel
          by viewModels { ExampleStartViewModel.Factory }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "MedsiCheck"


  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  override fun onCreate(savedInstanceState: Bundle?) {
    RNBootSplash.init(this, R.style.BootTheme) // ⬅️ initialize the splash screen
    super.onCreate(null)
    currentContext = this
    requestCameraAccessPermission()
    initialize()
  }
  private suspend fun updateLicenceAndStudyID() {
    exampleStartViewModel.initialize()
    checkLicenceAndStudyID()
  }

  private suspend fun checkLicenceAndStudyID() {
    /**
     * Check if the application has been configured with a DeepAffex License Key and Study ID
     */
    if (checkEmbeddedDeepAffexLicenseAndStudyID()) {
        /**
         * Before launching [AnuraExampleMeasurementActivity], we need to ensure that the
         * application has a valid DeepAffex Cloud access token. The application also needs
         * to ensure it has the latest study configuration binary that's required to
         * initialize DeepAffex Extraction Library
         */
        exampleStartViewModel.verifyDeepAffexTokenAndStudyFile()
    } else {
      /**
       * If either the DeepAffex License Key or Study ID are not configured, show an error
       * dialog box and exit the app
       */
      runOnUiThread {
        showExitAppDialog(
          "Sample App Configuration Error",
          "Your DFX_LICENSE_KEY and DFX_STUDY_ID are not set"
        )
      }
    }
  }

  /**
   * Initialization code for various aspects of this activity
   */
  private fun initialize() {
    SharedPreferencesHelper.initialize(application)
    AnuLogUtil.setShowLog(BuildConfig.DEBUG)
    exampleStartViewModel.error.observe(this) { handleError(it) }
  }

  fun startMeasurementActivity(properties: Map<String, Any>?) {
    val questionnaire = MeasurementQuestionnaire()
    (properties?.get("height"))?.let { questionnaire.setHeightInCm(it as Int) }
    (properties?.get("weight"))?.let { questionnaire.setWeightInKg(it as Int) }
    (properties?.get("age"))?.let { questionnaire.setAge(it as Int) }
    (properties?.get("gender"))?.let { questionnaire.setSexAssignedAtBirth(it as String) }
    (properties?.get("partnerID"))?.let { PARTNER_ID = it as String }
    measurementQuestionnaire = questionnaire
    val intent = Intent(this, AnuraExampleMeasurementActivity::class.java)
    if (exampleStartViewModel.readyToMeasure) {
      startActivity(intent)
    } else {
      lifecycleScope.launch {
        updateLicenceAndStudyID()
        if (exampleStartViewModel.readyToMeasure) {
          withContext(Dispatchers.Main) {
            startActivity(intent)
          }
        }
      }
    }
  }

  /**
   * Check if the application has been configured with a DeepAffex License Key or Study ID.
   * This Sample Application includes these parameters as part of the BuildConfig generated by
   * Gradle from server.properties file.
   *
   * Refer to README.md for more information on how to set up this Sample App
   */
  private fun checkEmbeddedDeepAffexLicenseAndStudyID(): Boolean {
    return !(AppConfig.DFX_LICENSE_KEY.isEmpty() || AppConfig.DFX_STUDY_ID.isEmpty())
  }

  /**
   * Generic method to handle errors. Your application is responsible for gracefully handling
   * errors and explaining what's happening to your end users
   */
  private fun handleError(errorMsg: String?) {
    Toast.makeText(this, "Error:$errorMsg", Toast.LENGTH_SHORT).show()
  }

  /**
   * Request camera access permission from the Android System. Your application is responsible
   * for asking your end users for permission to use the camera, and to explain how and why the
   * camera is used.
   */
  private fun requestCameraAccessPermission() {
    if (ContextCompat.checkSelfPermission(
        this,
        Manifest.permission.CAMERA
      ) == PackageManager.PERMISSION_GRANTED
    ) {
      // Permission already granted
      return
    }
    registerForActivityResult(ActivityResultContracts.RequestPermission()) {
      runOnUiThread {
        Toast.makeText(
          this@MainActivity,
          "Camera Permission ${if (it) "Granted" else "Denied"}!",
          Toast.LENGTH_SHORT
        ).show()
      }
    }.run { launch(Manifest.permission.CAMERA) }
  }

  /**
   * Shows an error dialog box if your application is not correctly configured. Your application's
   * end users should never see this.
   */
  private fun showExitAppDialog(title: String, msg: String) {
    MaterialAlertDialogBuilder(this)
      .setTitle(title)
      .setMessage(msg)
      .setNegativeButton("Exit")
      { _, _ -> exitProcess(0) }
      .setCancelable(false)
      .show()
  }
}
