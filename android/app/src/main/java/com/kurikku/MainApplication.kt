// MainApplication.kt
// Simplified version — no PackageList, no OpenSourceMergedSoMapping
// Compatible with plain Maven dependency approach (no RN Gradle plugin)

package com.kurikku

import android.app.Application
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.soloader.SoLoader
import com.kurikku.bridge.AutoClickPackage

class MainApplication : Application(), ReactApplication {

    override val reactNativeHost: ReactNativeHost =
        object : DefaultReactNativeHost(this) {

            override fun getPackages(): List<ReactPackage> {
                // Manually list all packages — no PackageList auto-generation
                return listOf(
                    AutoClickPackage()
                )
            }

            override fun getJSMainModuleName(): String = "index"

            override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

            override val isNewArchEnabled: Boolean = false

            override val isHermesEnabled: Boolean = true
        }

    override val reactHost: ReactHost
        get() = getDefaultReactHost(applicationContext, reactNativeHost)

    override fun onCreate() {
        super.onCreate()
        // Use simple SoLoader init — no OpenSourceMergedSoMapping needed
        SoLoader.init(this, false)
    }
}