# PDF Security Features Implementation

## Overview
Enhanced PDF viewing security in the ContentViewerScreen to prevent screenshots, downloads, and unauthorized access to PDF documents.

## Security Features Implemented

### 1. Screen Capture Prevention
- **expo-screen-capture**: Prevents screenshots and screen recording
- **Automatic activation**: Enabled when PDF viewer is focused
- **Automatic deactivation**: Disabled when leaving the screen
- **Status indicator**: Shows "Screenshot Blocked" in watermark

### 2. WebView Security Configuration
- **Multiple window prevention**: `setSupportMultipleWindows={false}`
- **File access disabled**: `allowsFileAccess={false}`
- **Universal file access disabled**: `allowsUniversalAccessFromFileURLs={false}`
- **Link preview disabled**: `allowsLinkPreview={false}`
- **Picture-in-picture disabled**: `allowsPictureInPictureMediaPlayback={false}`
- **AirPlay disabled**: `allowsAirPlayForMediaPlayback={false}`

### 3. Enhanced URL Filtering
Blocks the following URL patterns:
- `/download`, `?download`, `&download`
- `print`, `save`, `export`, `attachment`
- `blob:`, `data:application/`
- `file://`, `ftp://`
- `javascript:`, `vbscript:`

### 4. JavaScript Security Guards
- **Download/Print button removal**: Automatically removes any download/print buttons
- **Copy prevention**: Blocks Ctrl+C, Ctrl+A, Ctrl+P, Ctrl+S
- **Context menu disabled**: Right-click context menu blocked
- **Text selection disabled**: Prevents text selection and copying
- **Developer tools blocked**: Blocks F12, Ctrl+Shift+I, Ctrl+U
- **Drag prevention**: Prevents dragging of images/content
- **Watermark overlay**: Adds subtle diagonal watermark pattern

### 5. Visual Security Indicators
- **Security watermark**: Shows protection status
- **Dynamic status**: Updates based on screen capture state
- **Multi-language support**: Available in English, Arabic, and French

### 6. Google Docs Viewer Integration
- **In-app viewing**: Uses Google Docs Viewer for secure PDF display
- **No external browser**: Keeps PDF viewing within the app
- **Reliable rendering**: Works consistently across platforms

## Technical Implementation

### Files Modified
1. `screens/school/ContentViewerScreen.tsx` - Main security implementation
2. `translations/en.json` - English translations
3. `translations/ar.json` - Arabic translations  
4. `translations/fr.json` - French translations

### Key Security Functions
- `useFocusEffect` - Manages screen capture protection lifecycle
- `onShouldStartLoadWithRequest` - Filters malicious URLs
- `injectedJavaScript` - Client-side security guards
- Enhanced WebView properties - Platform-level security

## Usage
PDF documents are automatically protected when opened through the ContentViewerScreen. No additional configuration is required.

## Security Levels
1. **Platform Level**: WebView security properties
2. **Network Level**: URL filtering and request blocking
3. **Client Level**: JavaScript security guards
4. **Visual Level**: Watermark and status indicators
5. **System Level**: Screen capture prevention

## Testing
To test the security features:
1. Open a PDF document in the app
2. Try to take a screenshot (should be blocked)
3. Try to download the PDF (should be blocked)
4. Try to print the PDF (should be blocked)
5. Try to copy text (should be blocked)
6. Check the security watermark is visible

## Notes
- Security is automatically enabled for all PDF documents
- Screen capture protection is only active when the PDF viewer is focused
- The implementation uses Google Docs Viewer for reliable in-app PDF display
- All security measures are transparent to the user experience
