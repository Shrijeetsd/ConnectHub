# Sentry
-keepattributes LineNumberTable,SourceFile
-dontwarn io.sentry.**
-keep class io.sentry.** { *; }

# Google ErrorProne
-dontwarn com.google.errorprone.annotations.**

# React Native
-keep class com.facebook.react.bridge.CatalystInstanceImpl { *; }
-keep class com.facebook.react.bridge.WritableNativeMap { *; }
-keep class com.facebook.react.bridge.WritableNativeArray { *; }
-keep class com.facebook.react.bridge.ReadableNativeMap { *; }
-keep class com.facebook.react.bridge.ReadableNativeArray { *; }
-keep class com.facebook.react.bridge.NativeModule { *; }
-keep class com.facebook.react.bridge.JavaScriptModule { *; }
-keep class com.facebook.react.bridge.ExecutorToken { *; }
-keep class com.facebook.react.bridge.ReactContext { *; }
-keep class com.facebook.react.shell.MainPackageConfig { *; }

-dontwarn com.facebook.react.**
-dontwarn javax.annotation.**

# Keep everything in our package
-keep class com.connecthub.** { *; }
