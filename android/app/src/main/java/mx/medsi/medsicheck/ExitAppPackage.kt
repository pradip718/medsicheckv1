package mx.medsi.medsicheck

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class ExitAppPackage : ReactPackage {

    // Method to create and return NativeModules to be used by React Native
    override fun createNativeModules(reactApplicationContext: ReactApplicationContext): List<NativeModule> {
        val modules = mutableListOf<NativeModule>()
        // Add your custom NativeModule implementations to the list
        modules.add(ExitAppModule(reactApplicationContext)) // Add ExitAppModule as a NativeModule
        return modules
    }

    // Method to create and return ViewManagers to be used by React Native
    override fun createViewManagers(reactApplicationContext: ReactApplicationContext): List<ViewManager<*, *>> {
        return emptyList() // Return an empty list if you don't have custom ViewManagers
    }
}
