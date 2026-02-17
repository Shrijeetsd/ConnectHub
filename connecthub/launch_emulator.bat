@echo off
set ANDROID_HOME=C:\Users\shrij\AppData\Local\Android\Sdk
set PATH=%ANDROID_HOME%\emulator;%ANDROID_HOME%\platform-tools;%PATH%

echo ===================================================
echo Attempting to launch: Medium_Phone_API_36.1
echo (This device seems to be correctly configured as x86_64)
echo ===================================================

emulator -avd Medium_Phone_API_36.1 -netdelay none -netspeed full

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Launch failed. Trying Pixel 9 Pro...
    emulator -avd Pixel_9_Pro_API_36 -netdelay none -netspeed full
)
