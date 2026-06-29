// AutoClickPackage.kt
// Registers AutoClickModule with React Native.
// Must be added to the packages list in MainApplication.kt.

package com.kurikku.bridge

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class AutoClickPackage : ReactPackage {

    /**
     * Returns the list of native modules to register.
     * Add AutoClickModule here so React Native can find it.
     */
    override fun createNativeModules(
        reactContext: ReactApplicationContext,
    ): List<NativeModule> {
        return listOf(AutoClickModule(reactContext))
    }

    /**
     * No custom view managers needed for this package.
     */
    override fun createViewManagers(
        reactContext: ReactApplicationContext,
    ): List<ViewManager<*, *>> {
        return emptyList()
    }
}