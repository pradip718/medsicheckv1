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

package mx.medsi.medsicheck.viewmodel

import mx.medsi.medsicheck.BuildConfig
import mx.medsi.medsicheck.utils.KEY_DFX_EXTRACTION_LIBRARY_STUDY_CONFIG
import mx.medsi.medsicheck.utils.KEY_STUDY_HASH
import mx.medsi.medsicheck.utils.SharedPreferencesHelper
import mx.medsi.medsicheck.utils.SampleTokenStore
import ai.nuralogix.anurasdk.error.AnuraError
import ai.nuralogix.anurasdk.network.DeepAffexDataSpec
import ai.nuralogix.anurasdk.network.DeepFXClient
import ai.nuralogix.anurasdk.network.RestClient
import android.util.Log
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewmodel.initializer
import androidx.lifecycle.viewmodel.viewModelFactory
import mx.medsi.medsicheck.AppConfig
import kotlinx.coroutines.CancellableContinuation
import kotlinx.coroutines.suspendCancellableCoroutine
import org.json.JSONObject
import kotlin.coroutines.resume
import kotlin.coroutines.resumeWithException

/**
 * ExampleStartViewModel handles the initial connection to DeepAffex Cloud API. It performs the
 * following steps:
 *
 * 1. Registers your application's DeepAffex License key
 * 2. Obtains an access token and stores it through [SampleTokenStore]
 * 3. Downloads the latest study configuration file to configure DeepAffex Extraction Library and
 *    stores it in SharedPreferences
 *
 * It also will automatically handle refreshing the stored device token when the token expires.
 *
 * For more information on DeepAffex Cloud API, refer to the documentation:
 *
 * https://dfxapiversion10.docs.apiary.io/
 *
 */
class ExampleStartViewModel() : ViewModel() {
    private val TAG = javaClass.simpleName

    /**
     * When a valid DeepAffex API device token and study configuration file are obtained,
     * [readyToMeasure] is set to `true`
     */
    var readyToMeasure: Boolean = false

    /**
     * Any errors encountered while communicating with DeepAffex Cloud API will be posted here
     */
    val error: MutableLiveData<String> = MutableLiveData()

    /**
     * A place to store the latest study configuration file to configure DeepAffex Extraction Library
     */
    private var savedStudyFile by SharedPreferencesHelper(KEY_DFX_EXTRACTION_LIBRARY_STUDY_CONFIG, "")

    /**
     * The hash of the currently saved study configuration file. This will be used to check if there
     * is a newer study configuration file available.
     */
    private var savedStudyHash by SharedPreferencesHelper(KEY_STUDY_HASH, "")

    /**
     * [SampleTokenStore] handles storing DeepAffex Cloud API access tokens and refresh tokens
     */
    private lateinit var tokenStore: SampleTokenStore

    fun initialize() {
        DeepAffexDataSpec.REST_SERVER = AppConfig.DFX_REST_URL
        DeepAffexDataSpec.WS_SERVER = AppConfig.DFX_WS_URL

        tokenStore = SampleTokenStore()
        RestClient.getInstance().setTokenStore(tokenStore)
    }

    /**
     * The function to call to perform the main steps to obtain a DeepAffex Cloud API access token
     * and download the latest study configuration file for DeepAffex Extraction Library
     */
    suspend fun verifyDeepAffexTokenAndStudyFile() {
        try {
            verifyToken(tokenStore.getToken())
            verifyStudyFileHash(savedStudyHash)
            DeepFXClient.getInstance().setTokenAuthorisation(tokenStore.getToken())
            readyToMeasure = true
        } catch (e: Exception) {
            e.printStackTrace()
            error.postValue(e.message)
        }
    }

    /**
     * Verify if the current access token is still valid. If there's no token stored, call the
     * `registerLicense` DeepAffex Cloud API endpoint
     */
    private suspend fun verifyToken(unverifiedToken: String) {
        try {
            if (tokenStore.getToken().isEmpty()) {
                registerLicense()
                return
            }
            val statusResult = getLicenseStatus(unverifiedToken)
            val activeLicense = JSONObject(statusResult).optBoolean("ActiveLicense")
            if (!activeLicense) {
                throw Exception("Your DeepAffex license key has expired, please contact NuraLogix support")
            }
        } catch (e: HttpException) {
            e.printStackTrace()
            error.postValue(e.message)
        }
    }

    /**
     * Verify if a new study configuration file is available. If not, obtain one and store it in
     * SharedPreferences
     */
    private suspend fun verifyStudyFileHash(unverifiedStudyHash: String) {
        // Get the server study file hash
        val hashResult = getHash(AppConfig.DFX_STUDY_ID)
        val serverHash = JSONObject(hashResult).optString("MD5Hash")
        if (serverHash != unverifiedStudyHash) {
            getNewStudyFileAndSave()
        }
    }

    /**
     * Obtain and study configuration file
     */
    private suspend fun getNewStudyFileAndSave() {
        Log.d(TAG, "start -----> getStudyFileAndSave")
        // If study file hash changes, we should get the newest study file from server
        val studyFileResult = getStudyFile(AppConfig.DFX_STUDY_ID)
        val responseObject = JSONObject(studyFileResult)
        val studyFileHash = responseObject.optString("MD5Hash")
        val studyFile = responseObject.optString("ConfigFile")
        savedStudyHash = studyFileHash
        savedStudyFile = studyFile
    }

    /**
     * Call `GET verifyToken` DeepAffex Cloud API endpoint
     * Reference: https://dfxapiversion10.docs.apiary.io/#reference/0/general/verify-token
     *
     * @param [unverifiedToken] unverified access token
     */
    private suspend fun getLicenseStatus(unverifiedToken: String): String =
        suspendCancellableCoroutine { continuation ->
            changeListenerToContinuation(continuation)
            RestClient.getInstance().verifyToken(unverifiedToken)
        }

    /**
     * Call `POST registerLicense` DeepAffex Cloud API endpoint
     * Reference: https://dfxapiversion10.docs.apiary.io/#reference/0/organizations/register-license
     */
    private suspend fun registerLicense(): String =
        suspendCancellableCoroutine { continuation ->
            changeListenerToContinuation(continuation)
            RestClient.getInstance()
                .registerLicense(
                    tokenStore.getDeviceName(),
                    tokenStore.getVersionName(),
                    tokenStore.getLicense()
                )
        }

    /**
     * Call `POST retrieveSdkStudyConfigData` DeepAffex Cloud API endpoint
     * Reference: https://dfxapiversion10.docs.apiary.io/#reference/0/studies/retrieve-sdk-study-config-data
     *
     * @param [studyId] A DeepAffex Cloud Study ID
     */
    private suspend fun getStudyFile(studyId: String): String =
        suspendCancellableCoroutine { continuation ->
            changeListenerToContinuation(continuation)
            RestClient.getInstance().getStudyFile(
                tokenStore.getToken(),
                studyId,
                "default"
            )
        }

    /**
     * Call `POST retrieveSdkStudyConfigDataHash` DeepAffex Cloud API endpoint
     *
     * @param [studyId] A DeepAffex Cloud Study ID
     */
    private suspend fun getHash(studyId: String): String =
        suspendCancellableCoroutine { continuation ->
            changeListenerToContinuation(continuation)
            RestClient.getInstance().getHash(
                tokenStore.getToken(),
                studyId,
                "default"
            )
        }


    /**
     * Helpers
     */

    private fun changeListenerToContinuation(continuation: CancellableContinuation<String>) {
        RestClient.getInstance().setListener(object : RestClient.Listener {
            override fun onResult(action: Int, result: String) {
                if (continuation.isActive) continuation.resume(result)
            }

            override fun onError(error: AnuraError.NetworkErrorInfo?) {
                if (continuation.isCancelled) return
                continuation.resumeWithException(HttpException(error?.errorMessage))
            }
        })
    }
    internal data class HttpException(val errorMsg: String?): Exception(errorMsg)

    companion object{
        val Factory: ViewModelProvider.Factory = viewModelFactory {
            initializer {
                ExampleStartViewModel()
            }
        }
    }
}