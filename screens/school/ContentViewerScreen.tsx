import React, {useState, useEffect, useRef} from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    Image,
    Dimensions,
    ActivityIndicator,
    Alert,
    Linking,
    ScrollView,
    Platform, AppState,
} from 'react-native';
import {useNavigation, RouteProp, useFocusEffect} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {StyledText} from "../../components/StyledText";
import {FontsEnum} from "../../constants/FontsEnum";
import {useTranslation} from "react-i18next";
import {Ionicons} from "@expo/vector-icons";
import Colors from "../../constants/Colors";
import {ContentDTO, MediaEnum} from "../../models/LMS";
import {WebView} from 'react-native-webview';
import {TabHomeParamList} from "../../types";
import * as ScreenCapture from 'expo-screen-capture';

const {width, height} = Dimensions.get('window');

type ContentViewerScreenNavigationProp = StackNavigationProp<TabHomeParamList, 'ContentViewer'>;
type ContentViewerScreenRouteProp = RouteProp<TabHomeParamList, 'ContentViewer'>;

interface ContentViewerScreenProps {
    route: ContentViewerScreenRouteProp;
}

// === ContentViewerScreen (updated, no imports/styles) ===
const ContentViewerScreen = ({ route }: ContentViewerScreenProps) => {
    const { content } = route.params;
    const navigation = useNavigation<ContentViewerScreenNavigationProp>();
    const { t } = useTranslation();

    const [imageLoading, setImageLoading] = useState(true);
    const [webViewLoading, setWebViewLoading] = useState(true);
    const [focusKey, setFocusKey] = useState(0);
    const [pdfShellUrl, setPdfShellUrl] = useState<string | null>(null);
    const [isScreenCaptureEnabled, setIsScreenCaptureEnabled] = useState(false);

    const webRef = React.useRef<WebView>(null);
    const appState = React.useRef(AppState.currentState);

    // Enhanced screenshot protection for PDF documents
    useFocusEffect(
        React.useCallback(() => {
            let cancelled = false;
            const enableProtection = async () => {
                try {
                    if (!cancelled) {
                        await ScreenCapture.preventScreenCaptureAsync();
                        setIsScreenCaptureEnabled(true);
                        console.log('🔒 Screen capture protection enabled');
                    }
                } catch (error) {
                    console.log('⚠️ Screen capture protection failed:', error);
                }
            };
            enableProtection();

            // On every focus, bump key to guarantee a fresh surface (prevents black view)
            setFocusKey((k) => k + 1);

            return () => {
                cancelled = true;
                ScreenCapture.allowScreenCaptureAsync().catch(() => {});
                setIsScreenCaptureEnabled(false);
                console.log('🔓 Screen capture protection disabled');
            };
        }, [])
    );

    // Recover GPU surface after backgrounding
    useEffect(() => {
        const sub = AppState.addEventListener("change", (next) => {
            const prev = appState.current;
            appState.current = next;
            if (prev.match(/background|inactive/) && next === "active") {
                try {
                    webRef.current?.reload();
                } catch {
                    setFocusKey((k) => k + 1);
                }
            }
        });
        return () => sub.remove();
    }, []);

    // Create a custom HTML wrapper for PDF viewing that prevents external launches
    const createPDFWrapper = (pdfUrl: string) => {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
            <style>
                body, html {
                    margin: 0;
                    padding: 0;
                    width: 100%;
                    height: 100%;
                    overflow: hidden;
                    background: #f5f5f5;
                }
                .pdf-container {
                    width: 100%;
                    height: 100vh;
                    border: none;
                    position: relative;
                }
                .security-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    z-index: 9999;
                    background: repeating-linear-gradient(
                        45deg,
                        transparent,
                        transparent 100px,
                        rgba(0,0,0,0.02) 100px,
                        rgba(0,0,0,0.02) 200px
                    );
                }
                .security-badge {
                    position: fixed;
                    bottom: 10px;
                    left: 10px;
                    background: rgba(0,0,0,0.7);
                    color: white;
                    padding: 5px 10px;
                    border-radius: 5px;
                    font-size: 12px;
                    font-family: Arial, sans-serif;
                }
            </style>
        </head>
        <body>
            <div class="security-overlay"></div>
            <div class="security-badge">🔒 Protected Content</div>
            <iframe 
                class="pdf-container" 
                src="${pdfUrl}" 
                frameborder="0"
                allowfullscreen
                sandbox="allow-same-origin allow-scripts allow-forms"
                onload="console.log('PDF loaded successfully')"
            ></iframe>
            
            <script>
                // Prevent all external navigation
                window.addEventListener('beforeunload', function(e) {
                    e.preventDefault();
                    e.returnValue = '';
                    return '';
                });
                
                // Block external links
                document.addEventListener('click', function(e) {
                    if (e.target.tagName === 'A' && e.target.href) {
                        e.preventDefault();
                        console.log('Blocked external link:', e.target.href);
                    }
                });
                
                // Block context menu
                document.addEventListener('contextmenu', function(e) {
                    e.preventDefault();
                });
                
                // Block keyboard shortcuts
                document.addEventListener('keydown', function(e) {
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                    }
                });
                
                console.log('PDF wrapper loaded with security measures');
            </script>
        </body>
        </html>
        `;
    };

    // Build PDF URL for in-app viewing with custom wrapper
    useEffect(() => {
        if (content.media?.type === MediaEnum.DOCUMENT || content.media?.type === "DOCUMENT" || 
            (content.media?.link && (content.media.link.includes('.pdf') || content.media.link.includes('pdf') || content.media.link.includes('document')))) {
            
            const pdfLink = content.media?.link || "";
            console.log('📄 Processing document URL:', pdfLink);
            
            // Use custom HTML wrapper approach for maximum security
            let pdfUrl = "";
            
            // Determine the best PDF viewer based on URL characteristics
            if (pdfLink.includes('.pdf') || pdfLink.includes('pdf')) {
                // Use Mozilla PDF.js viewer with custom wrapper for .pdf files
                pdfUrl = `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(pdfLink)}#toolbar=0&navpanes=0&scrollbar=0&statusbar=0&messages=0&sidebar=0`;
            } else {
                // Use Google Docs Viewer with custom wrapper for other document types
                pdfUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(pdfLink)}&chrome=false&widget=true&headers=false`;
            }
            
            // Create custom HTML wrapper
            const wrappedHTML = createPDFWrapper(pdfUrl);
            const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(wrappedHTML)}`;
            
            setPdfShellUrl(dataUrl);
            console.log('📄 Setting PDF URL with custom wrapper for in-app viewing');
        } else {
            setPdfShellUrl(null);
        }
    }, [content]);

    const renderImage = () => (
        <View key={`img-${focusKey}`} style={styles.imageScrollContainer}>
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={styles.imageScrollContent}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                bounces={false}
                minimumZoomScale={1}
                maximumZoomScale={3}
                bouncesZoom
                scrollEnabled
                pinchGestureEnabled
            >
                <View style={styles.imageContainer} onStartShouldSetResponder={() => true}>
                    {imageLoading && (
                        <View style={styles.imageLoaderContainer}>
                            <ActivityIndicator size="large" color={Colors.primary} />
                            <StyledText style={styles.loadingText}>{t("loadingDocument") || "Loading..."}</StyledText>
                        </View>
                    )}
                    <Image
                        key={`img-el-${focusKey}`}
                        source={{ uri: content.media?.link }}
                        style={styles.image}
                        resizeMode="contain"
                        onLoadStart={() => setImageLoading(true)}
                        onLoadEnd={() => setImageLoading(false)}
                        onError={() => {
                            setImageLoading(false);
                            Alert.alert(t("error") || "Error", t("errorLoadingImage") || "Failed to load image");
                        }}
                    />
                    <View style={styles.imageOverlay} pointerEvents="box-only" />
                </View>
            </ScrollView>

            {!imageLoading && (
                <View style={styles.zoomHint}>
                    <Ionicons name="expand-outline" size={16} color="rgba(255,255,255,0.8)" />
                    <StyledText style={styles.zoomHintText}>{t("pinchToZoom") || "Pinch to zoom"}</StyledText>
                </View>
            )}

            <View style={styles.imageWatermark} pointerEvents="none">
                <Ionicons name="shield-checkmark" size={14} color="rgba(255,255,255,0.7)" />
                <StyledText style={styles.imageWatermarkText}>{t("protectedContent") || "Protected Content"}</StyledText>
            </View>
        </View>
    );

    const injectedPDFGuards = `
    (function(){
      // Enhanced security guards for PDF viewing
      const hide = () => {
        const sel = [
          '[download]','a[download]','a[href*="download"]','a[title*="Download"]',
          'button[title*="Download"]','[aria-label*="Download"]','[aria-label*="download"]',
          '[aria-label*="Print"]','[title*="Print"]','button[onclick*="print"]',
          '[onclick*="download"]','[onclick*="save"]','[onclick*="export"]',
          '.download','.print','.save','.export','#download','#print','#save','#export',
          '[class*="download"]','[class*="print"]','[class*="save"]','[class*="export"]',
          '[id*="download"]','[id*="print"]','[id*="save"]','[id*="export"]'
        ];
        document.querySelectorAll(sel.join(',')).forEach(n=>{
          n.style.display='none'; n.style.visibility='hidden'; n.style.pointerEvents='none';
          n.remove(); // Completely remove elements
        });
      };
      
      // Hide controls immediately and continuously
      hide();
      const mo = new MutationObserver(hide);
      mo.observe(document.documentElement, {subtree:true,childList:true,attributes:true});
      
      // Prevent copy, cut, paste, and context menu
      ['copy', 'cut', 'paste', 'contextmenu', 'selectstart', 'dragstart'].forEach(event => {
        addEventListener(event, e => e.preventDefault(), true);
      });
      
      // Disable text selection
      document.body && (
        document.body.style.webkitUserSelect='none', 
        document.body.style.userSelect='none',
        document.body.style.webkitTouchCallout='none',
        document.body.style.webkitTapHighlightColor='transparent'
      );
      
      // Disable right-click context menu
      document.addEventListener('contextmenu', e => e.preventDefault(), true);
      
      // Block keyboard shortcuts for copy, print, save
      document.addEventListener('keydown', e => {
        if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'p' || e.key === 's' || e.key === 'a')) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
        // Block F12, Ctrl+Shift+I, Ctrl+U (developer tools)
        if (e.key === 'F12' || 
            ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'I') ||
            ((e.ctrlKey || e.metaKey) && e.key === 'u')) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }, true);
      
      // Block external app launches and redirects
      const originalOpen = window.open;
      window.open = function(url, target, features) {
        console.log('🚫 Blocked window.open attempt:', url);
        return null;
      };
      
      // Block location changes that might trigger external apps
      const originalAssign = window.location.assign;
      window.location.assign = function(url) {
        console.log('🚫 Blocked location.assign attempt:', url);
        return false;
      };
      
      // Block location replace
      const originalReplace = window.location.replace;
      window.location.replace = function(url) {
        console.log('🚫 Blocked location.replace attempt:', url);
        return false;
      };
      
      // Disable image dragging
      document.addEventListener('dragstart', e => e.preventDefault(), true);
      
      // Add watermark overlay
      const watermark = document.createElement('div');
      watermark.style.cssText = \`
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9999;
        background: repeating-linear-gradient(
          45deg,
          transparent,
          transparent 100px,
          rgba(0,0,0,0.03) 100px,
          rgba(0,0,0,0.03) 200px
        );
        opacity: 0.1;
      \`;
      document.body.appendChild(watermark);
      
      true;
    })();
    `;

    const renderPDF = () => {
        // If no PDF URL is available, show a message
        if (!pdfShellUrl) {
            return (
                <View style={styles.pdfContainer}>
                    <View style={styles.errorContainer}>
                        <Ionicons name="document-outline" size={80} color={Colors.primary} />
                        <StyledText style={styles.errorTitle}>{t("documentNotAvailable") || "Document Not Available"}</StyledText>
                        <StyledText style={styles.errorDescription}>
                            {t("documentNotAvailableMessage") || "This document cannot be displayed at the moment."}
                        </StyledText>
                    </View>
                </View>
            );
        }

        return (
            <View key={`pdf-${focusKey}`} style={styles.pdfContainer}>
                {webViewLoading && (
                    <View style={styles.webViewLoader}>
                        <ActivityIndicator size="large" color={Colors.primary} />
                        <StyledText style={styles.loadingText}>{t("loadingDocument") || "Loading document..."}</StyledText>
                    </View>
                )}

            <WebView
                ref={webRef}
                key={`wv-${focusKey}`}
                source={pdfShellUrl ? { uri: pdfShellUrl } : undefined}
                style={styles.webView}
                onLoadStart={() => setWebViewLoading(true)}
                onLoadEnd={() => setWebViewLoading(false)}
                onError={(e) => {
                    setWebViewLoading(false);
                    console.log('❌ WebView error:', e.nativeEvent);
                    Alert.alert(t("error") || "Error", t("failedToLoadDocument") || "Failed to load document. Please try again.");
                }}
                onHttpError={(e) => {
                    console.log('❌ WebView HTTP error:', e.nativeEvent);
                }}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                // CRITICAL: Prevent opening new windows/tabs (keeps it in-app)
                setSupportMultipleWindows={false}
                // Enhanced security properties to prevent external app launches
                allowsBackForwardNavigationGestures={false}
                allowsLinkPreview={false}
                allowsPictureInPictureMediaPlayback={false}
                allowsProtectedMedia={false}
                allowsAirPlayForMediaPlayback={false}
                // Disable developer tools and debugging
                allowsInlineMediaPlayback={false}
                mediaPlaybackRequiresUserAction={true}
                // Additional security measures
                hideKeyboardAccessoryView={true}
                keyboardDisplayRequiresUserAction={true}
                // Disable file access
                allowsFileAccess={false}
                allowsFileAccessFromFileURLs={false}
                allowsUniversalAccessFromFileURLs={false}
                // Prevent external app launches
                allowsArbitraryLoads={false}
                allowsArbitraryLoadsInWebContent={false}
                // Force in-app viewing
                onNavigationStateChange={(navState) => {
                    console.log('🧭 Navigation state change:', navState.url);
                    // Prevent any navigation that might trigger external apps
                    if (navState.url.includes('safari') || navState.url.includes('chrome')) {
                        console.log('🚫 Blocked external browser navigation');
                        return false;
                    }
                }}
                // Allow all origins for Google Docs Viewer
                originWhitelist={["*"]}
                // Allow mixed content for better compatibility
                mixedContentMode="always"
                // Enable caching for better performance
                cacheEnabled={true}
                incognito={false}
                // Cookies needed for Google Docs Viewer
                sharedCookiesEnabled={true}
                thirdPartyCookiesEnabled={true}
                // Keep rendering stable (prevents black screen)
                renderToHardwareTextureAndroid={false}
                androidLayerType="software"
                // CRITICAL: Force PDF viewing to stay within the app
                onShouldStartLoadWithRequest={(req) => {
                    const url = (req?.url || "").toLowerCase();
                    
                    console.log('🔗 WebView navigation request:', url);
                    
                    // BLOCK any attempt to open external browsers or apps
                    if (
                        url.includes('safari') ||
                        url.includes('chrome') ||
                        url.includes('firefox') ||
                        url.includes('browser') ||
                        url.includes('external') ||
                        url.includes('redirect') ||
                        url.includes('open') ||
                        url.includes('launch')
                    ) {
                        console.log('🚫 Blocked external browser/app launch:', url);
                        return false;
                    }
                    
                    // Block download/print/save attempts more comprehensively
                    if (
                        url.includes('/download') ||
                        url.includes('?download') ||
                        url.includes('&download') ||
                        url.includes('print') ||
                        url.includes('save') ||
                        url.includes('export') ||
                        url.includes('attachment') ||
                        url.startsWith('blob:') ||
                        url.startsWith('data:application/') ||
                        url.includes('file://') ||
                        url.includes('ftp://') ||
                        url.includes('javascript:') ||
                        url.includes('vbscript:')
                    ) {
                        console.log('🚫 Blocked download/print/save attempt:', url);
                        return false;
                    }
                    
                    // Allow Mozilla PDF.js and Google Docs Viewer resources (CRITICAL for in-app viewing)
                    if (
                        url.includes('mozilla.github.io') ||
                        url.includes('pdf.js') ||
                        url.includes('docs.google.com') ||
                        url.includes('drive.google.com') ||
                        url.includes('googleusercontent.com') ||
                        url.includes('gstatic.com') ||
                        url.includes('googleapis.com')
                    ) {
                        console.log('✅ Allowed PDF viewer resource');
                        return true;
                    }
                    
                    // Allow HTTPS for loading the actual PDF (but be more restrictive)
                    if (url.startsWith('https://') && !url.includes('download') && !url.includes('print')) {
                        console.log('✅ Allowed HTTPS resource');
                        return true;
                    }
                    
                    // Block everything else
                    console.log('🚫 Blocked unknown navigation:', url);
                    return false;
                }}
                // iOS render-process death recovery
                onContentProcessDidTerminate={() => {
                    try { webRef.current?.reload(); } catch { setFocusKey((k) => k + 1); }
                }}
                injectedJavaScript={injectedPDFGuards}
                // Enable zoom and proper scaling
                scalesPageToFit={true}
                // Start with loading indicator
                startInLoadingState={true}
                // Hide scrollbars for cleaner look
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
            />

            <View style={styles.securityWatermark} pointerEvents="none">
                <Ionicons name="shield-checkmark" size={14} color="rgba(0,0,0,0.4)" />
                <StyledText style={styles.watermarkText}>
                    {isScreenCaptureEnabled ? 
                        `${t("protected") || "Protected"} • ${t("screenshotBlocked") || "Screenshot Blocked"}` : 
                        `${t("protected") || "Protected"}`
                    }
                </StyledText>
            </View>
        </View>
        );
    };

    const renderVideo = () => {
        // If it's actually a document, render as PDF instead
        if (content.media?.link && (content.media.link.includes('.pdf') || content.media.link.includes('pdf'))) {
            return renderPDF();
        }
        
        // For actual video content, show video placeholder without external browser button
        return (
            <View style={styles.videoContainer}>
                <Ionicons name="play-circle-outline" size={80} color={Colors.primary} />
                <StyledText style={styles.videoTitle}>{t("videoContent") || "Video Content"}</StyledText>
                <StyledText style={styles.videoDescription}>{t("videoMessage") || "Video playback will be available soon"}</StyledText>
                <View style={styles.noActionContainer}>
                    <Ionicons name="eye-outline" size={24} color={Colors.primary} />
                    <StyledText style={styles.noActionText}>{t("viewInApp") || "View in App"}</StyledText>
                </View>
            </View>
        );
    };

    const renderDefault = () => {
        // Always try to render as PDF if there's a media link
        if (content.media?.link) {
            console.log('📄 Default render: attempting to render as PDF');
            return renderPDF();
        }
        
        // Only show placeholder if no media link
        return (
            <View style={styles.defaultContainer}>
                <Ionicons name="document-text-outline" size={80} color={Colors.primary} />
                <StyledText style={styles.defaultTitle}>{content.title}</StyledText>
                {content.description && <StyledText style={styles.defaultDescription}>{content.description}</StyledText>}
                <View style={styles.noActionContainer}>
                    <Ionicons name="eye-outline" size={24} color={Colors.primary} />
                    <StyledText style={styles.noActionText}>{t("viewInApp") || "View in App"}</StyledText>
                </View>
            </View>
        );
    };

    const renderContent = () => {
        if (!content.media?.link) return renderDefault();
        
        const mediaType = content.media?.type;
        const mediaLink = content.media?.link.toLowerCase();
        
        // Enhanced PDF detection - check both type and URL
        const isPDF = mediaType === MediaEnum.DOCUMENT || 
                     mediaType === "DOCUMENT" || 
                     mediaLink.includes('.pdf') || 
                     mediaLink.includes('pdf') ||
                     mediaLink.includes('document');
        
        // Enhanced image detection
        const isImage = mediaType === MediaEnum.IMAGE || 
                       mediaType === "IMAGE" || 
                       mediaLink.includes('.jpg') || 
                       mediaLink.includes('.jpeg') || 
                       mediaLink.includes('.png') || 
                       mediaLink.includes('.gif') || 
                       mediaLink.includes('.webp');
        
        // Enhanced video detection
        const isVideo = mediaType === MediaEnum.VIDEO || 
                      mediaType === "VIDEO" || 
                      mediaLink.includes('.mp4') || 
                      mediaLink.includes('.avi') || 
                      mediaLink.includes('.mov') || 
                      mediaLink.includes('.wmv');
        
        // Render based on detected content type
        if (isPDF) {
            console.log('📄 Detected PDF content, rendering PDF viewer');
            return renderPDF();
        } else if (isImage) {
            console.log('🖼️ Detected image content, rendering image viewer');
            return renderImage();
        } else if (isVideo) {
            console.log('🎥 Detected video content, rendering video placeholder');
            return renderVideo();
        } else {
            console.log('📄 Unknown content type, trying PDF viewer as fallback');
            return renderDefault();
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <StyledText style={styles.headerTitle} numberOfLines={2}>
                        {content.title}
                    </StyledText>
                </View>
            </View>

            {renderContent()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    header: {
        backgroundColor: Colors.primary,
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    headerContent: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
        fontFamily: FontsEnum.Poppins_600SemiBold,
        marginBottom: 2,
    },
    protectionBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    protectionBadgeText: {
        fontSize: 10,
        color: 'rgba(255, 255, 255, 0.8)',
        fontFamily: FontsEnum.Poppins_400Regular,
    },
    imageScrollContainer: {
        flex: 1,
    },
    imageScrollContent: {
        flexGrow: 1,
    },
    imageContainer: {
        flex: 1,
        minHeight: height - 150,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000000',
    },
    image: {
        width: width,
        height: height - 150,
    },
    imageLoader: {
        position: 'absolute',
        zIndex: 1,
    },
    imageLoaderContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000000',
        zIndex: 2,
    },
    imageOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'transparent',
        zIndex: 0,
    },
    zoomHint: {
        position: 'absolute',
        top: 20,
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
    },
    zoomHintText: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.9)',
        fontFamily: FontsEnum.Poppins_400Regular,
    },
    pdfContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    securityWatermark: {
        position: 'absolute',
        bottom: 10,
        left: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(255,255,255,0.8)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    watermarkText: {
        fontSize: 9,
        color: 'rgba(0,0,0,0.6)',
        fontFamily: FontsEnum.Poppins_600SemiBold,
    },
    imageWatermark: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    imageWatermarkText: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.9)',
        fontFamily: FontsEnum.Poppins_400Regular,
    },
    webView: {
        flex: 1,
    },
    webViewLoader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        zIndex: 1,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 14,
        color: '#FFFFFF',
        fontFamily: FontsEnum.Poppins_400Regular,
    },
    openExternalButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
        gap: 8,
    },
    openExternalText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
        fontFamily: FontsEnum.Poppins_600SemiBold,
    },
    videoContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    videoTitle: {
        fontSize: 22,
        fontWeight: '600',
        color: '#333333',
        fontFamily: FontsEnum.Poppins_600SemiBold,
        marginTop: 24,
        marginBottom: 12,
        textAlign: 'center',
    },
    videoDescription: {
        fontSize: 14,
        color: '#666666',
        fontFamily: FontsEnum.Poppins_400Regular,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 32,
    },
    defaultContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    defaultTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333333',
        fontFamily: FontsEnum.Poppins_600SemiBold,
        marginTop: 24,
        marginBottom: 12,
        textAlign: 'center',
    },
    defaultDescription: {
        fontSize: 14,
        color: '#666666',
        fontFamily: FontsEnum.Poppins_400Regular,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 32,
    },
    openButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
        gap: 10,
    },
    openButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFFFFF',
        fontFamily: FontsEnum.Poppins_600SemiBold,
    },
    noActionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.05)',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        gap: 8,
        marginTop: 20,
    },
    noActionText: {
        fontSize: 14,
        fontWeight: '500',
        color: Colors.primary,
        fontFamily: FontsEnum.Poppins_500Medium,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        backgroundColor: '#FFFFFF',
    },
    errorTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.primary,
        fontFamily: FontsEnum.Poppins_600SemiBold,
        marginTop: 20,
        marginBottom: 10,
        textAlign: 'center',
    },
    errorDescription: {
        fontSize: 14,
        color: '#666666',
        fontFamily: FontsEnum.Poppins_400Regular,
        textAlign: 'center',
        lineHeight: 20,
    },
});

export default ContentViewerScreen;

