package mx.medsi.medsicheck

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class ExitAppModule(context: ReactApplicationContext) : ReactContextBaseJavaModule(context) {

    override fun getName(): String {
        return "ExitApp"
    }

    @ReactMethod
    fun exitApp() {
        System.exit(0)
    }
}
