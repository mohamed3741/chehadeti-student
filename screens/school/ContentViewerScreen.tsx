import React, {useState, useEffect} from 'react';
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

    const webRef = React.useRef<WebView>(null);
    const appState = React.useRef(AppState.currentState);

    // Enable/disable screenshot protection only while this screen is focused.
    useFocusEffect(
        React.useCallback(() => {
            let cancelled = false;
            const enable = async () => {
                try {
                    if (!cancelled) await ScreenCapture.preventScreenCaptureAsync();
                } catch {}
            };
            enable();

            // On every focus, bump key to guarantee a fresh surface (prevents black view)
            setFocusKey((k) => k + 1);

            return () => {
                cancelled = true;
                ScreenCapture.allowScreenCaptureAsync().catch(() => {});
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

    // Build Google Docs Viewer URL for in-app PDF viewing (like WhatsApp)
    useEffect(() => {
        if (content.media?.type === MediaEnum.DOCUMENT || content.media?.type === "DOCUMENT") {
            const pdfLink = content.media?.link || "";
            // Google Docs Viewer is the most reliable way to keep PDFs in-app
            // It's trusted by iOS/Android WebView and won't trigger external browser
            const googleDocsUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(pdfLink)}`;
            setPdfShellUrl(googleDocsUrl);
            console.log('📄 Setting PDF URL for in-app viewing');
        } else {
            setPdfShellUrl(null);
        }
    }, [content]);

    const openExternally = async () => {
        if (content.media?.link) {
            const supported = await Linking.canOpenURL(content.media.link);
            if (supported) {
                await Linking.openURL(content.media.link);
            } else {
                Alert.alert(t("error") || "Error", t("cannotOpenLink") || "Cannot open this link");
            }
        }
    };

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
      // Hide download/print-like controls if any appear inside the HTML shell
      const hide = () => {
        const sel = [
          '[download]','a[download]','a[href*="download"]','a[title*="Download"]',
          'button[title*="Download"]','[aria-label*="Download"]','[aria-label*="download"]',
          '[aria-label*="Print"]','[title*="Print"]'
        ];
        document.querySelectorAll(sel.join(',')).forEach(n=>{
          n.style.display='none'; n.style.visibility='hidden'; n.style.pointerEvents='none';
        });
      };
      hide();
      const mo = new MutationObserver(hide);
      mo.observe(document.documentElement, {subtree:true,childList:true,attributes:true});
      addEventListener('copy', e => e.preventDefault(), true);
      addEventListener('cut', e => e.preventDefault(), true);
      addEventListener('contextmenu', e => e.preventDefault(), true);
      document.body && (document.body.style.webkitUserSelect='none', document.body.style.userSelect='none');
      true;
    })();
  `;

    const renderPDF = () => (
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
                    Alert.alert(t("error") || "Error", t("failedToLoadDocument") || "Failed to load document. Please try again.");
                }}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                // CRITICAL: Prevent opening new windows/tabs (keeps it in-app)
                setSupportMultipleWindows={false}
                allowsInlineMediaPlayback={false}
                mediaPlaybackRequiresUserAction={true}
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
                // Keep PDF viewing inside the app - block external navigation
                onShouldStartLoadWithRequest={(req) => {
                    const url = (req?.url || "").toLowerCase();
                    
                    console.log('🔗 WebView navigation request:', url);
                    
                    // Block download/print attempts
                    if (
                        url.includes('/download') ||
                        url.includes('?download') ||
                        url.includes('&download') ||
                        url.includes('print') ||
                        url.startsWith('blob:') ||
                        url.startsWith('data:application/')
                    ) {
                        console.log('🚫 Blocked download/print attempt');
                        return false;
                    }
                    
                    // Allow Google Docs Viewer and its resources (CRITICAL for in-app viewing)
                    if (
                        url.includes('docs.google.com') ||
                        url.includes('drive.google.com') ||
                        url.includes('googleusercontent.com') ||
                        url.includes('gstatic.com')
                    ) {
                        console.log('✅ Allowed Google Docs Viewer resource');
                        return true;
                    }
                    
                    // Allow HTTPS for loading the actual PDF
                    if (url.startsWith('https://') || url.startsWith('http://')) {
                        console.log('✅ Allowed HTTPS resource');
                        return true;
                    }
                    
                    // Block everything else
                    console.log('🚫 Blocked unknown navigation');
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
                <StyledText style={styles.watermarkText}>{t("protected") || "Protected"}</StyledText>
            </View>
        </View>
    );

    const renderVideo = () => (
        <View style={styles.videoContainer}>
            <Ionicons name="play-circle-outline" size={80} color={Colors.primary} />
            <StyledText style={styles.videoTitle}>{t("videoContent") || "Video Content"}</StyledText>
            <StyledText style={styles.videoDescription}>{t("videoMessage") || "Video playback will be available soon"}</StyledText>
            <TouchableOpacity style={styles.openButton} onPress={openExternally} activeOpacity={0.8}>
                <Ionicons name="open-outline" size={20} color="#FFFFFF" />
                <StyledText style={styles.openButtonText}>{t("openInBrowser") || "Open in Browser"}</StyledText>
            </TouchableOpacity>
        </View>
    );

    const renderDefault = () => (
        <View style={styles.defaultContainer}>
            <Ionicons name="document-text-outline" size={80} color={Colors.primary} />
            <StyledText style={styles.defaultTitle}>{content.title}</StyledText>
            {content.description && <StyledText style={styles.defaultDescription}>{content.description}</StyledText>}
            {content.media?.link && (
                <TouchableOpacity style={styles.openButton} onPress={openExternally} activeOpacity={0.8}>
                    <Ionicons name="open-outline" size={20} color="#FFFFFF" />
                    <StyledText style={styles.openButtonText}>{t("openInBrowser") || "Open in Browser"}</StyledText>
                </TouchableOpacity>
            )}
        </View>
    );

    const renderContent = () => {
        if (!content.media?.link) return renderDefault();
        const mediaType = content.media?.type;
        switch (mediaType) {
            case MediaEnum.IMAGE:
            case "IMAGE":
                return renderImage();
            case MediaEnum.DOCUMENT:
            case "DOCUMENT":
                return renderPDF();
            case MediaEnum.VIDEO:
            case "VIDEO":
                return renderVideo();
            default:
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
});

export default ContentViewerScreen;

