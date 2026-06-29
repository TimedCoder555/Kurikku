// MainApplication.kt
// The Android Application class for Kurikku.
// Initializes React Native and registers all native modules.
// This is the first Kotlin class Android instantiates on app launch.

package com.kurikku

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.react.soloader.OpenSourceMergedSoMapping
import com.facebook.soloader.SoLoader
import com.kurikku.bridge.AutoClickPackage

class MainApplication : Application(), ReactApplication {

    override val reactNativeHost: ReactNativeHost =
        object : DefaultReactNativeHost(this) {

            /**
             * Returns all React Native packages to register.
             * PackageList auto-discovers packages from node_modules.
             * AutoClickPackage is added manually since it is our
             * own native Kotlin module.
             */
            override fun getPackages(): List<ReactPackage> {
                return PackageList(this).packages.apply {
                    // Register our custom native module bridge
                    add(AutoClickPackage())
                }
            }

            /**
             * Returns the JS bundle entry point.
             * Must match the file registered in index.js.
             */
            override fun getJSMainModuleName(): String = "index"

            /**
             * Enable dev mode features like hot reload and
             * the React Native dev menu (shake to open).
             * Set to false for production builds.
             */
            override fun getUseDeveloperSupport(): Boolean {
                return BuildConfig.DEBUG
            }

            /**
             * New Architecture (Fabric + TurboModules) is disabled.
             * Keeping old architecture for maximum compatibility
             * with React Native 0.73 and our native modules.
             */
            override val isNewArchEnabled: Boolean = false

            /**
             * Hermes JS engine is enabled for:
             * - Faster app startup
             * - Lower memory usage
             * - Better battery efficiency
             */
            override val isHermesEnabled: Boolean = true
        }

    /**
     * Required by ReactApplication interface.
     * Provides the ReactHost for the new architecture.
     * Still required even when new architecture is disabled.
     */
    override val reactHost: ReactHost
        get() = getDefaultReactHost(applicationContext, reactNativeHost)

    /**
     * Called when the Application is first created.
     * Initializes SoLoader which loads React Native native libraries.
     */
    override fun onCreate() {
        super.onCreate()

        // Initialize SoLoader — required before any React Native code runs
        SoLoader.init(this, OpenSourceMergedSoMapping)

        // Load new architecture entry point only if enabled
        if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
            load()
        }
    }
}