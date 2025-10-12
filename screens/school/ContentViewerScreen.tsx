import React, {useState} from 'react';
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
    Platform,
} from 'react-native';
import {useNavigation, RouteProp} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {StyledText} from "../../components/StyledText";
import {FontsEnum} from "../../constants/FontsEnum";
import {useTranslation} from "react-i18next";
import {Ionicons} from "@expo/vector-icons";
import Colors from "../../constants/Colors";
import {ContentDTO, MediaEnum} from "../../models/LMS";
import {WebView} from 'react-native-webview';
import {TabHomeParamList} from "../../types";

const {width, height} = Dimensions.get('window');

type ContentViewerScreenNavigationProp = StackNavigationProp<TabHomeParamList, 'ContentViewer'>;
type ContentViewerScreenRouteProp = RouteProp<TabHomeParamList, 'ContentViewer'>;

interface ContentViewerScreenProps {
    route: ContentViewerScreenRouteProp;
}

const ContentViewerScreen = ({route}: ContentViewerScreenProps) => {
    const {content} = route.params;
    const navigation = useNavigation<ContentViewerScreenNavigationProp>();
    const {t} = useTranslation();
    const [imageLoading, setImageLoading] = useState(true);
    const [webViewLoading, setWebViewLoading] = useState(true);

    const openExternally = async () => {
        if (content.media?.link) {
            const supported = await Linking.canOpenURL(content.media.link);
            if (supported) {
                await Linking.openURL(content.media.link);
            } else {
                Alert.alert(
                    t('error') || 'Error',
                    t('cannotOpenLink') || 'Cannot open this link'
                );
            }
        }
    };

    const renderImage = () => (
        <View style={styles.imageScrollContainer}>
            <ScrollView
                style={{flex: 1}}
                contentContainerStyle={styles.imageScrollContent}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                bounces={false}
                minimumZoomScale={1}
                maximumZoomScale={3}
                bouncesZoom={true}
                scrollEnabled={true}
                pinchGestureEnabled={true}
            >
                <View 
                    style={styles.imageContainer}
                    onStartShouldSetResponder={() => true}
                    onResponderGrant={() => {}}
                >
                    {imageLoading && (
                        <View style={styles.imageLoaderContainer}>
                            <ActivityIndicator
                                size="large"
                                color={Colors.primary}
                            />
                            <StyledText style={styles.loadingText}>
                                {t('loadingDocument') || 'Loading...'}
                            </StyledText>
                        </View>
                    )}
                    <Image
                        source={{uri: content.media?.link}}
                        style={styles.image}
                        resizeMode="contain"
                        onLoadStart={() => setImageLoading(true)}
                        onLoadEnd={() => setImageLoading(false)}
                        onError={() => {
                            setImageLoading(false);
                            Alert.alert(
                                t('error') || 'Error',
                                t('errorLoadingImage') || 'Failed to load image'
                            );
                        }}
                    />
                    {/* Overlay to prevent long-press/context menu */}
                    <View 
                        style={styles.imageOverlay}
                        pointerEvents="box-only"
                    />
                </View>
            </ScrollView>
            
            {/* Zoom instruction hint */}
            {!imageLoading && (
                <View style={styles.zoomHint}>
                    <Ionicons name="expand-outline" size={16} color="rgba(255,255,255,0.8)" />
                    <StyledText style={styles.zoomHintText}>
                        Pinch to zoom
                    </StyledText>
                </View>
            )}
            
            {/* Security watermark for images */}
            <View style={styles.imageWatermark} pointerEvents="none">
                <Ionicons name="shield-checkmark" size={14} color="rgba(255,255,255,0.7)" />
                <StyledText style={styles.imageWatermarkText}>Protected Content</StyledText>
            </View>
        </View>
    );

    const renderPDF = () => {
        // Use Google Docs Viewer for better PDF rendering
        const pdfUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(content.media?.link || '')}`;
        
        // Inject JavaScript to prevent right-click and download
        const injectedJavaScript = `
            (function() {
                // Prevent context menu
                document.addEventListener('contextmenu', function(e) {
                    e.preventDefault();
                    return false;
                });
                
                // Prevent text selection
                document.body.style.webkitUserSelect = 'none';
                document.body.style.userSelect = 'none';
                
                // Prevent copy
                document.addEventListener('copy', function(e) {
                    e.preventDefault();
                    return false;
                });
                
                // Hide download buttons if any
                const style = document.createElement('style');
                style.innerHTML = \`
                    [download], 
                    a[href*="download"],
                    button[title*="Download"],
                    .download-btn { 
                        display: none !important; 
                    }
                \`;
                document.head.appendChild(style);
            })();
            true;
        `;
        
        return (
            <View style={styles.pdfContainer}>
                {webViewLoading && (
                    <View style={styles.webViewLoader}>
                        <ActivityIndicator size="large" color={Colors.primary} />
                        <StyledText style={styles.loadingText}>
                            {t('loadingDocument') || 'Loading document...'}
                        </StyledText>
                    </View>
                )}
                <WebView
                    source={{uri: pdfUrl}}
                    style={styles.webView}
                    onLoadStart={() => setWebViewLoading(true)}
                    onLoadEnd={() => setWebViewLoading(false)}
                    onError={() => setWebViewLoading(false)}
                    scalesPageToFit
                    javaScriptEnabled
                    domStorageEnabled
                    injectedJavaScript={injectedJavaScript}
                    allowsInlineMediaPlayback
                    mediaPlaybackRequiresUserAction
                    // Prevent file downloads
                    onShouldStartLoadWithRequest={(request) => {
                        // Block download attempts
                        if (request.url.includes('download') || request.url.includes('blob:')) {
                            return false;
                        }
                        return true;
                    }}
                />
                {/* Security watermark */}
                <View style={styles.securityWatermark} pointerEvents="none">
                    <Ionicons name="shield-checkmark" size={16} color="rgba(0,0,0,0.3)" />
                    <StyledText style={styles.watermarkText}>Protected Content</StyledText>
                </View>
            </View>
        );
    };

    const renderVideo = () => (
        <View style={styles.videoContainer}>
            <Ionicons name="play-circle-outline" size={80} color={Colors.primary} />
            <StyledText style={styles.videoTitle}>
                {t('videoContent') || 'Video Content'}
            </StyledText>
            <StyledText style={styles.videoDescription}>
                {t('videoMessage') || 'Video playback will be available soon'}
            </StyledText>
            <TouchableOpacity
                style={styles.openButton}
                onPress={openExternally}
                activeOpacity={0.8}
            >
                <Ionicons name="open-outline" size={20} color="#FFFFFF" />
                <StyledText style={styles.openButtonText}>
                    {t('openInBrowser') || 'Open in Browser'}
                </StyledText>
            </TouchableOpacity>
        </View>
    );

    const renderDefault = () => (
        <View style={styles.defaultContainer}>
            <Ionicons name="document-text-outline" size={80} color={Colors.primary} />
            <StyledText style={styles.defaultTitle}>
                {content.title}
            </StyledText>
            {content.description && (
                <StyledText style={styles.defaultDescription}>
                    {content.description}
                </StyledText>
            )}
            {content.media?.link && (
                <TouchableOpacity
                    style={styles.openButton}
                    onPress={openExternally}
                    activeOpacity={0.8}
                >
                    <Ionicons name="open-outline" size={20} color="#FFFFFF" />
                    <StyledText style={styles.openButtonText}>
                        {t('openInBrowser') || 'Open in Browser'}
                    </StyledText>
                </TouchableOpacity>
            )}
        </View>
    );

    const renderContent = () => {
        if (!content.media?.link) {
            return renderDefault();
        }

        switch (content.media?.type) {
            case MediaEnum.IMAGE:
                return renderImage();
            case MediaEnum.DOCUMENT:
                return renderPDF();
            case MediaEnum.VIDEO:
                return renderVideo();
            default:
                return renderDefault();
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
            
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.7}
                >
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <StyledText style={styles.headerTitle} numberOfLines={2}>
                        {content.title}
                    </StyledText>
                </View>
            </View>

            {/* Content */}
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
        fontSize: 10,
        color: 'rgba(0,0,0,0.5)',
        fontFamily: FontsEnum.Poppins_400Regular,
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
        color: '#666666',
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

