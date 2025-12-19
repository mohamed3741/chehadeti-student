"use client";

import React, { useState, useEffect, useRef } from "react";
import {
    View,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    Image,
    Dimensions,
    ActivityIndicator,
    Alert,
    Platform,
    AppState,
    ScrollView,
} from "react-native";
import { useNavigation, type RouteProp, useFocusEffect } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { StyledText } from "../../components/StyledText";
import { FontsEnum } from "../../constants/FontsEnum";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../../constants/Colors";
import { MediaEnum } from "../../models/LMS";
import type { TabHomeParamList } from "../../types";
import * as ScreenCapture from "expo-screen-capture";
import PdfViewer from "../../components/PdfViewer";
import VideoPlayer from "../../components/VideoPlayer";
import { LMSApi } from "../../api/LMSApi";
import { Toast } from "../../components/Toast";
// NOTE: imports and styles intentionally omitted as requested.

const {width, height} = Dimensions.get('window');

type ContentViewerScreenNavigationProp = StackNavigationProp<TabHomeParamList, "ContentViewer">;
type ContentViewerScreenRouteProp = RouteProp<TabHomeParamList, "ContentViewer">;

interface ContentViewerScreenProps {
    route: ContentViewerScreenRouteProp;
}

type KnownType = "PDF" | "IMAGE" | "VIDEO" | "UNKNOWN";





interface ContentViewerScreenProps {
    route: ContentViewerScreenRouteProp;
}


const ContentViewerScreen = ({ route }: ContentViewerScreenProps) => {
    const { content } = route.params;
    const navigation = useNavigation<ContentViewerScreenNavigationProp>();
    const { t } = useTranslation();

    const [imageLoading, setImageLoading] = useState(true);

    // IMPORTANT: don't gate the UI behind an external "pdfLoading" flag that never flips
    // if the child component doesn't call onLoad. We'll let PdfViewer manage its own
    // loading UI. We only keep a _transient_ gate until we have a URL string.
    const [pdfBootLoading, setPdfBootLoading] = useState(true);

    const [focusKey, setFocusKey] = useState(0);
    const [isScreenCaptureEnabled, setIsScreenCaptureEnabled] = useState(false);
    const [hasTrackedVisit, setHasTrackedVisit] = useState(false);
    const appState = useRef(AppState.currentState);

    // Track content visit when screen is focused
    const trackContentVisit = async () => {
        if (hasTrackedVisit || !content?.id) return;
        
        try {
            await LMSApi.trackContentVisit(content.id);
            setHasTrackedVisit(true);
            console.log("📊 Content visit tracked:", content.id);
        } catch (error) {
            console.error("❌ Failed to track content visit:", error);
            // Don't show error to user as this is background functionality
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            let cancelled = false;
            const enableProtection = async () => {
                try {
                    if (!cancelled) {
                        await ScreenCapture.preventScreenCaptureAsync();
                        setIsScreenCaptureEnabled(true);
                        console.log("🔒 Screen capture protection enabled");
                    }
                } catch (error) {
                    console.log("⚠️ Screen capture protection failed:", error);
                }
            };
            enableProtection();

            // Track visit when screen is focused
            trackContentVisit();

            // Re-render on focus (do NOT reset any loading flags here)
            setFocusKey((k) => k + 1);

            return () => {
                cancelled = true;
                ScreenCapture.allowScreenCaptureAsync().catch(() => {});
                setIsScreenCaptureEnabled(false);
                console.log("🔓 Screen capture protection disabled");
            };
        }, [content?.id, hasTrackedVisit])
    );

    useEffect(() => {
        const sub = AppState.addEventListener("change", (next) => {
            const prev = appState.current;
            appState.current = next;
            if (prev.match(/background|inactive/) && next === "active") {
                // Avoid resetting loading here; just bump key to refresh the viewer if needed
                setFocusKey((k) => k + 1);
            }
        });
        return () => sub.remove();
    }, []);

    // ---------- Helpers ----------

    // Treat backend as canonical: if contentType says PDF, we render as PDF regardless of extension.
    const isPdfContent = React.useMemo(() => {
        const ct = String(content?.contentType || "").toUpperCase();
        if (ct === "PDF") return true;
        // fallback heuristics (only if no contentType)
        const href = String(content?.media?.link || "").toLowerCase();
        return /\.(pdf)(\?|$)/.test(href);
    }, [content]);

    const isImageContent = React.useMemo(() => {
        const ct = String(content?.contentType || "").toUpperCase();
        if (ct === "IMAGE") return true;
        const href = String(content?.media?.link || "").toLowerCase();
        return /\.(png|jpe?g|gif|webp)(\?|$)/.test(href);
    }, [content]);

    const isVideoContent = React.useMemo(() => {
        const ct = String(content?.contentType || "").toUpperCase();
        if (ct === "VIDEO") return true;
        const href = String(content?.media?.link || "").toLowerCase();
        return /\.(mp4|m3u8|mov|avi|mkv|webm)(\?|$)/.test(href) || href.includes("m3u8");
    }, [content]);

    // ---------- Renderers ----------

    const renderPDF = () => {
        const rawUrl = content.media?.link;

        // Boot gate: only show our "Loading document..." until we have some URL value.
        useEffect(() => {
            setPdfBootLoading(true);
            // as soon as we have a non-empty URL, lift the boot loader;
            // PdfViewer has its own internal spinner after that.
            if (rawUrl) {
                // small microtask to avoid flicker when switching screens
                const id = setTimeout(() => setPdfBootLoading(false), 0);
                return () => clearTimeout(id);
            } else {
                setPdfBootLoading(false);
            }
        }, [rawUrl]);

        if (!rawUrl) {
            return (
                <View style={styles.contentContainer}>
                    <View style={styles.errorContainer}>
                        <Ionicons name="document-outline" size={64} color={Colors.primary} />
                        <StyledText style={styles.errorTitle}>
                            {t("documentNotAvailable") || "Document Not Available"}
                        </StyledText>
                        <StyledText style={styles.errorDescription}>
                            {t("documentNotAvailableMessage") || "This document cannot be displayed."}
                        </StyledText>
                    </View>
                </View>
            );
        }

        return (
            <View key={`pdf-${focusKey}`} style={styles.contentContainer}>
                {pdfBootLoading && (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#FFFFFF" />
                        <StyledText style={styles.loadingText}>
                            {t("loadingDocument") || "Loading document..."}
                        </StyledText>
                    </View>
                )}

                {/* IMPORTANT:
            1) Our PdfViewer accepts { uri: string } and downloads to a local file.
            2) We do NOT keep an external spinner alive; PdfViewer will show its own progress.
        */}
                <PdfViewer
                    source={{ uri: rawUrl }}
                    style={styles.pdf}
                    // We do NOT toggle any outer spinner here; avoid "stuck spinner" issues.
                    onLoad={() => {
                        console.log("📄 PDF loaded (PdfViewer)");
                        // Track visit when PDF is successfully loaded
                        trackContentVisit();
                    }}
                    onError={() => {
                        console.log("❌ PDF error (PdfViewer)");
                        Alert.alert(t("error") || "Error", t("failedToLoadDocument") || "Failed to load document.");
                    }}
                    theme="dark"
                    initialZoom={1}
                    enableFastScroll
                />


            </View>
        );
    };

    const renderImage = () => (
        <View key={`img-${focusKey}`} style={styles.contentContainer}>
            {imageLoading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FFFFFF" />
                    <StyledText style={styles.loadingText}>{t("loadingDocument") || "Loading..."}</StyledText>
                </View>
            )}
            
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                minimumZoomScale={1}
                maximumZoomScale={3}
                bouncesZoom={true}
                scrollEnabled={true}
                pinchGestureEnabled={true}
            >
                <Image
                    source={{ uri: content.media?.link }}
                    style={styles.fullImage}
                    resizeMode="contain"
                    onLoadStart={() => setImageLoading(true)}
                    onLoadEnd={() => {
                        setImageLoading(false);
                        // Track visit when image is successfully loaded
                        trackContentVisit();
                    }}
                    onError={() => {
                        setImageLoading(false);
                        Alert.alert(t("error") || "Error", t("errorLoadingImage") || "Failed to load image");
                    }}
                />
            </ScrollView>
            
            <View style={styles.securityBadge}>
                <Ionicons name="shield-checkmark" size={12} color="#FFFFFF" />
                <StyledText style={styles.securityBadgeText}>
                    {isScreenCaptureEnabled
                        ? `${t("protected") || "Protected"} • ${t("screenshotBlocked") || "Screenshot Blocked"}`
                        : `${t("protected") || "Protected"}`}
                </StyledText>
            </View>
        </View>
    );

    const renderVideo = () => {
        const rawUrl = content.media?.link;

        if (!rawUrl) {
            return (
                <View style={styles.contentContainer}>
                    <View style={styles.errorContainer}>
                        <Ionicons name="videocam-off-outline" size={64} color={Colors.primary} />
                        <StyledText style={styles.errorTitle}>
                            {t("videoNotAvailable") || "Video Not Available"}
                        </StyledText>
                        <StyledText style={styles.errorDescription}>
                            {t("videoNotAvailableMessage") || "This video cannot be displayed."}
                        </StyledText>
                    </View>
                </View>
            );
        }

        return (
            <View key={`video-${focusKey}`} style={styles.contentContainer}>
                <VideoPlayer
                    source={{ uri: rawUrl }}
                    contentId={content.id}
                    style={styles.video}
                    onLoad={() => {
                        console.log("🎥 Video loaded");
                        // Track visit when video is successfully loaded
                        trackContentVisit();
                    }}
                    onError={(error) => {
                        console.log("❌ Video error:", error);
                        Alert.alert(t("error") || "Error", t("failedToLoadVideo") || "Failed to load video.");
                    }}
                />
            </View>
        );
    };

    const renderDefault = () => {
        // Track visit for text content immediately since there's no loading state
        React.useEffect(() => {
            trackContentVisit();
        }, []);

        return (
            <View style={styles.contentContainer}>
                <View style={styles.placeholderContainer}>
                    <Ionicons name="document-text-outline" size={64} color={Colors.primary} />
                    <StyledText style={styles.placeholderTitle}>{content.title}</StyledText>
                    {content.description && (
                        <StyledText style={styles.placeholderDescription}>{content.description}</StyledText>
                    )}
                </View>
            </View>
        );
    };

    // ---------- Simplified routing (trust contentType first) ----------
    const renderContent = () => {
        const link = content.media?.link || "";
        if (!link) return renderDefault();

        if (isPdfContent) return renderPDF();
        if (isVideoContent) return renderVideo();
        if (isImageContent) return renderImage();

        // If your backend mislabels PDFs as images by name (.png) but contentType==="PDF",
        // the first branch already routes to PDF. If contentType is missing, fallback
        // to image to avoid a stuck spinner.
        return renderImage();
    };

    // ---------- Layout ----------
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />

            {/* Fixed header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <StyledText style={styles.headerTitle} numberOfLines={1}>
                        {content.title}
                    </StyledText>
                </View>
            </View>

            {/* Content area fills remaining space */}
            {renderContent()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000000",
    },
    header: {
        backgroundColor: Colors.primary,
        paddingTop: Platform.OS === "ios" ? 50 : 40,
        paddingBottom: 12,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255, 255, 255, 0.15)",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    headerTitleContainer: {
        flex: 1,
        justifyContent: "center",
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: "600",
        color: "#FFFFFF",
        fontFamily: FontsEnum.Poppins_600SemiBold,
    },

    // Content region below header
    contentContainer: {
        flex: 1,
        backgroundColor: "#000000",
        position: "relative",
    },

    // ScrollView for zoom functionality
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Image fills remaining screen; contain keeps aspect
    fullImage: {
        width: width,
        height: height - 150, // Account for header
    },

    // Native PDF view should stretch; width set to screen width for safety
    pdf: {
        flex: 1,
        width: width,
        backgroundColor: "#111216",
    },
    video: {
        flex: 1,
        width: width,
        backgroundColor: "#000000",
    },

    loadingContainer: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#000000",
        zIndex: 10,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 14,
        color: "#FFFFFF",
        fontFamily: FontsEnum.Poppins_400Regular,
    },

    securityBadge: {
        position: "absolute",
        bottom: 16,
        left: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    securityBadgeText: {
        fontSize: 11,
        color: "#FFFFFF",
        fontFamily: FontsEnum.Poppins_600SemiBold,
        fontWeight: "600",
    },

    placeholderContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40,
        backgroundColor: "#FFFFFF",
    },
    placeholderTitle: {
        fontSize: 20,
        fontWeight: "600",
        color: "#1A1A1A",
        fontFamily: FontsEnum.Poppins_600SemiBold,
        marginTop: 20,
        marginBottom: 8,
        textAlign: "center",
    },
    placeholderDescription: {
        fontSize: 14,
        color: "#666666",
        fontFamily: FontsEnum.Poppins_400Regular,
        textAlign: "center",
        lineHeight: 20,
    },

    errorContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40,
        backgroundColor: "#FFFFFF",
    },
    errorTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: Colors.primary,
        fontFamily: FontsEnum.Poppins_600SemiBold,
        marginTop: 20,
        marginBottom: 8,
        textAlign: "center",
    },
    errorDescription: {
        fontSize: 14,
        color: "#666666",
        fontFamily: FontsEnum.Poppins_400Regular,
        textAlign: "center",
        lineHeight: 20,
    },
});

export default ContentViewerScreen;
