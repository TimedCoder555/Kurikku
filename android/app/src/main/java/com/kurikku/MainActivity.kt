// MainActivity.kt
// The single Android Activity that hosts the React Native UI.
// All React Native screens render inside this Activity.
// Kept minimal — business logic lives in Kotlin services and modules.

package com.kurikku

import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

    /**
     * Returns the name of the main component registered in index.js.
     * Must match the name passed to AppRegistry.registerComponent().
     */
    override fun getMainComponentName(): String = "Kurikku"

    /**
     * Creates the React Native activity delegate.
     * Using DefaultReactActivityDelegate with new architecture disabled
     * to keep the build simple and compatible.
     */
    override fun createReactActivityDelegate(): ReactActivityDelegate {
        return DefaultReactActivityDelegate(
            this,
            mainComponentName,
            // fabricEnabled is false — new architecture not needed
            // for this lightweight app
            fabricEnabled,
        )
    }

    /**
     * Called when the Activity is first created.
     * We call super with null to let React Native
     * manage its own saved instance state.
     */
    override fun onCreate(savedInstanceState: Bundle?) {
        // Pass null instead of savedInstanceState to avoid
        // React Native navigation state conflicts on reload
        super.onCreate(null)
    }
}