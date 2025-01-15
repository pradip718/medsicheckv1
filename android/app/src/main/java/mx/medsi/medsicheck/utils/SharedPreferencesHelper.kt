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

package mx.medsi.medsicheck.utils

import mx.medsi.medsicheck.BuildConfig
import android.app.Application
import android.content.Context
import android.content.SharedPreferences
import kotlin.properties.ReadWriteProperty
import kotlin.reflect.KProperty

/**
 * A helper class to store various data in [SharedPreferences]
 */
class SharedPreferencesHelper<T>(
    private val name: String,
    private val default: T
) :
    ReadWriteProperty<Any?, T> {
    companion object {
        lateinit var sp: SharedPreferences
        fun initialize(application: Application) {
            sp = application.getSharedPreferences(BuildConfig.APPLICATION_ID, Context.MODE_PRIVATE)
        }

        fun clearPreference() = sp.edit().clear().apply()

        fun clearPreference(key: String) = sp.edit().remove(key).commit()
    }

    override fun getValue(thisRef: Any?, property: KProperty<*>): T {
        return getSharePreferences(name, default)

    }

    override fun setValue(thisRef: Any?, property: KProperty<*>, value: T) {
        return putSharePreferences(name, value)
    }

    private fun getSharePreferences(name: String, default: T): T = with(sp) {
        val res: Any = when (default) {
            is Long -> getLong(name, default)
            is String -> this.getString(name, default)!!
            is Int -> getInt(name, default)
            is Boolean -> getBoolean(name, default)
            is Float -> getFloat(name, default)
            else -> throw IllegalArgumentException("This type can be get from Preferences")
        }
        return res as T
    }

    private fun putSharePreferences(name: String, value: T) = with(sp.edit()) {
        when (value) {
            is Long -> putLong(name, value)
            is Int -> putInt(name, value)
            is String -> putString(name, value)
            is Boolean -> putBoolean(name, value)
            is Float -> putFloat(name, value)
            else -> throw IllegalArgumentException("This type can be saved into Preferences")
        }.apply()
    }
}