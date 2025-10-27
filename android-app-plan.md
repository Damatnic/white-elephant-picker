# White Elephant Android App - Complete Production Plan

## Research Findings

### Common White Elephant Rule Sets
1. **Traditional Secret Santa** - Simple random pairing with no restrictions
2. **Family/Couples Exclusions** - Can't pick your spouse/partner (like current site)
3. **Max Price/Multiple Participants** - Everyone brings gift, random assignment
4. **Stealing Rounds** - Multiple rounds of stealing gifts (advanced)
5. **Theme-Based** - All gifts follow a theme

### Essential Features for Production App
- **Setup Screen**: Add participants with customizable rules per person
- **Rule Templates**: Pre-set rule sets (Family, Office, Friends, Custom)
- **Visual Confirmation**: Picker sees who they got
- **Secrecy**: No one else can see who's been picked
- **Stats Tracking**: Shows totals without revealing identities
- **One-Phone Flow**: Perfect for passing phone around
- **Export Results**: Optional ability to save results

## Technology Choice: Capacitor (Recommended)

**Why Capacitor?**
- ✅ Convert existing Next.js web app to native Android with minimal changes
- ✅ Full access to native Android features
- ✅ Can use existing React/TypeScript code
- ✅ Easy to build APK for production
- ✅ Can extend to iOS later
- ✅ Better than WebView wrapper (full native bridge)
- ✅ Active community and good documentation

## Feature List

### 1. Setup & Configuration Screen
```
[Main Setup Interface]
- Event Name (e.g., "Holiday 2024 Gift Exchange")
- Rule Set Template: Family / Office / Friends / Custom
- Participant Management:
  * Add Name
  * Add Phone Number
  * Add Emoji Icon
  * Set Restrictions
- Rule Options Per Person:
  * Can't choose: [Select from other participants]
  * Can choose anybody
  * Can only choose from: [Select specific group]
- Participant List Display
- [Start Exchange] Button
```

### 2. Enhanced Rule Engine
- Pre-built templates:
  - **Family Mode**: Auto-restrict spouses/couples
  - **Office Mode**: Can pick anyone
  - **Friends Mode**: Can pick anyone
  - **Custom Mode**: Full control
- Per-person rules:
  - Block specific people
  - Allow only specific people
  - Multiple rule combinations
- Fallback handling when restrictions conflict

### 3. Picking Experience
- Person selects who is picking
- Shows available count
- Animated selection with confetti
- **Shows result to picker** (who they got)
- "Pick Again" to reset for next person
- Pass phone to next person

### 4. Statistics & Tracking
- Total picks made (count only)
- Available now (count only)
- Remaining (count only)
- **Never shows identities** until final export

### 5. Advanced Features
- **Export Results**: Optional JSON/text file of all pairs
- **History**: Save past exchanges
- **Dark Mode**: Toggle (already works)
- **SMS Notifications**: Send results via text (already works)

### 6. Production Polish
- App icon and splash screen
- Smooth animations
- Offline capability
- Error handling
- Loading states
- Privacy-first (all data local)

## File Structure for Android App

```
white-elephant-app/
├── app/                          # Existing Next.js app
│   ├── page.tsx                  # Main game interface
│   ├── layout.tsx
│   ├── globals.css
│   └── api/
│       └── send-sms/
│           └── route.ts
├── android/                      # New - Capacitor Android project
│   ├── app/
│   │   ├── src/main/java/
│   │   ├── src/main/res/
│   │   └── AndroidManifest.xml
│   └── build.gradle
├── capacitor.config.ts           # New - Capacitor config
├── package.json                  # Updated with Capacitor
└── public/                       # App icons, splash screens
    ├── icon.png
    ├── splash.png
    └── Adaptive Icon Background.png
```

## Implementation Steps

### Phase 1: Setup Screen (New Feature)
1. Create `/setup` route in Next.js
2. Build participant management interface
3. Implement rule templates and custom rules
4. Add data persistence (localStorage)
5. Route from setup to main game

### Phase 2: Convert to Android App
1. Install Capacitor dependencies
2. Initialize Capacitor Android project
3. Configure app metadata (name, package, version)
4. Build APK for testing
5. Test on Android device

### Phase 3: Native Features
1. Add SMS native bridge (better than API)
2. Add share functionality (export results)
3. Add app icons and splash screens
4. Configure permissions

### Phase 4: Production Build
1. Generate signed APK
2. Test thoroughly
3. Prepare for Google Play Store

## Questions to Clarify

1. **Setup Screen Priority**: Should we build the full setup screen first in the web app, then convert? Or convert first, then add setup?
2. **Data Storage**: Prefer localStorage (local-only) or add database for multi-device sync?
3. **Export Format**: What format for results? JSON, CSV, PDF?
4. **Advanced Rules**: Need complex rules or keep it simple with basic restrictions?

## Recommended Approach

**Option A: Build Setup Screen First (Web)**
- Add /setup route with full configuration
- Test everything in browser
- Then convert to Android
- ⏱️ Estimated: 3-4 hours

**Option B: Convert to Android First**
- Get Android app working ASAP
- Add setup screen to Android app
- ⏱️ Estimated: 2-3 hours for conversion, 3-4 hours for setup

**Recommendation**: Option A - Build complete setup screen in web app first, fully test, then convert. Better for production quality.

