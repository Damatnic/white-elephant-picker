# Building the Android APK

## Prerequisites
- Node.js installed
- Android Studio installed
- Android SDK configured

## Build Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Build the Next.js App
```bash
npm run build
```

This creates the `out/` directory with the static export.

### 3. Sync with Capacitor
```bash
npx cap sync android
```

This copies the web assets to the Android project.

### 4. Open in Android Studio
```bash
npx cap open android
```

### 5. Build APK in Android Studio
1. Click "Build" > "Build Bundle(s) / APK(s)" > "Build APK(s)"
2. Wait for build to complete
3. APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

### 6. Install on Device
```bash
npx cap run android
```

Or manually install the APK on your Android device.

## App Features

### Setup Screen (`/setup`)
- Configure event name
- Choose rule template (Family/Office/Friends/Custom)
- Add participants with emojis
- Set restrictions (who can't pick whom)
- Add phone numbers for SMS notifications

### Game Screen (`/`)
- Pick random person with restrictions
- See result (only picker sees who they got)
- Pass phone to next person
- Track game stats
- Dark mode support

## Development Workflow

After making changes to the web app:
1. `npm run build` - Build the web app
2. `npx cap sync android` - Sync to Android project
3. `npx cap open android` - Open in Android Studio
4. Build/run in Android Studio

## App Configuration

- **App Name**: White Elephant Picker
- **Package ID**: com.damatnic.whiteelephant
- **Min SDK**: 22
- **Target SDK**: 34

## Notes

- The app uses localStorage for data persistence
- SMS functionality requires API setup (currently textbelt.com)
- All app logic is client-side (no server required)
- Perfect for one-phone-passed-around White Elephant exchanges

