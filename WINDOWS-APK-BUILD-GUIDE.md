# Complete Guide: Building APK on Windows

## Step 1: Install Required Software

### 1.1 Install Node.js (if not already installed)
1. Download from: https://nodejs.org/
2. Install the LTS version
3. Verify installation:
   ```cmd
   node --version
   npm --version
   ```

### 1.2 Install Java Development Kit (JDK)
1. Download JDK 11 or higher from: https://adoptium.net/temurin/releases/
2. Choose "Windows x64" and ".msi" installer
3. Install with default settings
4. Verify installation:
   ```cmd
   java -version
   ```

### 1.3 Install Android Studio
1. Download from: https://developer.android.com/studio
2. Run the installer with default settings
3. When Android Studio opens, complete the setup wizard
4. Install recommended SDK packages

## Step 2: Configure Environment Variables

### 2.1 Set JAVA_HOME
1. Open "Environment Variables":
   - Press `Win + R`, type `sysdm.cpl`, press Enter
   - Click "Environment Variables" button
   - Under "System Variables", click "New"
   - Variable name: `JAVA_HOME`
   - Variable value: `C:\Program Files\Eclipse Adoptium\jdk-11.0.19.7-hotspot` (adjust path if different)

### 2.2 Set ANDROID_HOME
1. Find your Android SDK location:
   - Open Android Studio
   - Go to File → Settings → Appearance & Behavior → System Settings → Android SDK
   - Note the "Android SDK Location" path (usually `C:\Users\YourName\AppData\Local\Android\Sdk`)
2. Add environment variable:
   - Variable name: `ANDROID_HOME`
   - Variable value: `C:\Users\YourName\AppData\Local\Android\Sdk` (use your actual path)

### 2.3 Set CAPACITOR_ANDROID_STUDIO_PATH
1. Add environment variable:
   - Variable name: `CAPACITOR_ANDROID_STUDIO_PATH`
   - Variable value: `C:\Program Files\Android\Android Studio\bin\studio64.exe`

### 2.4 Update PATH
1. In Environment Variables, find "Path" under System Variables
2. Click "Edit" → "New" and add these paths:
   - `%ANDROID_HOME%\platform-tools`
   - `%ANDROID_HOME%\tools`

**IMPORTANT**: Restart your computer after setting environment variables!

## Step 3: Configure Android Studio

### 3.1 Install SDK Components
1. Open Android Studio
2. Go to Tools → SDK Manager
3. Install these components:
   - Android SDK Platform 33 (or latest)
   - Android SDK Build-Tools 33.0.0 (or latest)
   - Android Emulator
   - Android SDK Platform-Tools
   - Intel x86 Emulator Accelerator (HAXM installer)

### 3.2 Create Virtual Device (Optional for testing)
1. Go to Tools → AVD Manager
2. Click "Create Virtual Device"
3. Choose Pixel 4, click Next
4. Select API 33 system image, click Next
5. Click Finish

## Step 4: Build Your APK

### Method 1: Using the Automated Script

1. Open Command Prompt as Administrator
2. Navigate to your project folder:
   ```cmd
   cd C:\path\to\your\project
   ```
3. Run the build script:
   ```cmd
   scripts\build-apk-windows.bat
   ```

### Method 2: Manual Steps

1. **Build the web app:**
   ```cmd
   npm run build
   ```

2. **Add Android platform (if not already added):**
   ```cmd
   npx cap add android
   ```

3. **Copy web assets:**
   ```cmd
   npx cap copy android
   ```

4. **Sync Capacitor:**
   ```cmd
   npx cap sync android
   ```

5. **Open in Android Studio:**
   ```cmd
   npx cap open android
   ```

6. **Build APK in Android Studio:**
   - Wait for Gradle sync to complete
   - Go to Build → Build Bundle(s) / APK(s) → Build APK(s)
   - Wait for build to complete

## Step 5: Find Your APK

Your APK will be located at:
```
android\app\build\outputs\apk\debug\app-debug.apk
```

## Step 6: Install APK on Android Device

### Option A: USB Installation
1. Enable Developer Options on your Android device:
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times
2. Enable USB Debugging:
   - Go to Settings → Developer Options
   - Enable "USB Debugging"
3. Connect device to computer
4. Copy APK to device and install

### Option B: Direct Transfer
1. Copy the APK file to your device (email, cloud storage, etc.)
2. On your device, enable "Install from Unknown Sources"
3. Open the APK file and install

## Troubleshooting Common Issues

### Issue 1: "Unable to launch Android Studio"
**Solution:**
```cmd
setx CAPACITOR_ANDROID_STUDIO_PATH "C:\Program Files\Android\Android Studio\bin\studio64.exe"
```
Then restart Command Prompt.

### Issue 2: "ANDROID_HOME not set"
**Solution:**
1. Verify Android Studio SDK location
2. Set ANDROID_HOME environment variable
3. Restart computer

### Issue 3: "Build failed"
**Solution:**
1. Open Android Studio
2. Go to File → Invalidate Caches and Restart
3. Try building again

### Issue 4: "Gradle sync failed"
**Solution:**
1. Check internet connection
2. In Android Studio: File → Sync Project with Gradle Files
3. If still failing, try: Build → Clean Project

## Quick Commands Reference

```cmd
# Check installations
node --version
java -version
echo %ANDROID_HOME%
echo %CAPACITOR_ANDROID_STUDIO_PATH%

# Build process
npm run build
npx cap copy android
npx cap sync android
npx cap open android

# Alternative: Use automated script
scripts\build-apk-windows.bat
```

## File Locations

- **Project APK**: `android\app\build\outputs\apk\debug\app-debug.apk`
- **Android Studio**: `C:\Program Files\Android\Android Studio\`
- **Android SDK**: `C:\Users\YourName\AppData\Local\Android\Sdk`
- **Build Scripts**: `scripts\` folder in your project

## Next Steps After Building

1. Test the APK on different Android devices
2. For production release, create a signed APK
3. Optimize app size and performance
4. Consider publishing to Google Play Store

---

**Need Help?**
- Run `scripts\setup-environment-windows.bat` to check your setup
- Check the troubleshooting section above
- Ensure all environment variables are set correctly