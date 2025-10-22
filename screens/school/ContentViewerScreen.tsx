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
// NOTE: imports and styles intentionally omitted as requested.

const { width } = Dimensions.get("window");

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
    const appState = useRef(AppState.currentState);

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

            // Re-render on focus (do NOT reset any loading flags here)
            setFocusKey((k) => k + 1);

            return () => {
                cancelled = true;
                ScreenCapture.allowScreenCaptureAsync().catch(() => {});
                setIsScreenCaptureEnabled(false);
                console.log("🔓 Screen capture protection disabled");
            };
        }, [])
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
                    onLoad={() => console.log("📄 PDF loaded (PdfViewer)")}
                    onError={() => {
                        console.log("❌ PDF error (PdfViewer)");
                        Alert.alert(t("error") || "Error", t("failedToLoadDocument") || "Failed to load document.");
                    }}
                    theme="dark"
                    initialZoom={1}
                    enableFastScroll
                />

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
    };

    const renderImage = () => (
        <View key={`img-${focusKey}`} style={styles.contentContainer}>
            {imageLoading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FFFFFF" />
                    <StyledText style={styles.loadingText}>{t("loadingDocument") || "Loading..."}</StyledText>
                </View>
            )}
            <Image
                key={`img-el-${focusKey}`}
                source={{ uri: content.media?.link }}
                style={styles.fullImage}
                resizeMode="contain"
                onLoadStart={() => setImageLoading(true)}
                onLoadEnd={() => setImageLoading(false)}
                onError={() => {
                    setImageLoading(false);
                    Alert.alert(t("error") || "Error", t("errorLoadingImage") || "Failed to load image");
                }}
            />
            <View style={styles.securityBadge}>
                <Ionicons name="shield-checkmark" size={12} color="#FFFFFF" />
                <StyledText style={styles.securityBadgeText}>
                    {t("protectedContent") || "Protected Content"}
                </StyledText>
            </View>
        </View>
    );

    const renderDefault = () => (
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

    // ---------- Simplified routing (trust contentType first) ----------
    const renderContent = () => {
        const link = content.media?.link || "";
        if (!link) return renderDefault();

        if (isPdfContent) return renderPDF();
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

    // Image fills remaining screen; contain keeps aspect
    fullImage: {
        width: "100%",
        height: "100%",
    },

    // Native PDF view should stretch; width set to screen width for safety
    pdf: {
        flex: 1,
        width: width,
        backgroundColor: "#111216",
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
