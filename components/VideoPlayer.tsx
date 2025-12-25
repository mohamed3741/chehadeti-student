import React, { useState, useEffect, useRef } from "react";
import {
    View,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Platform,
    Dimensions,
} from "react-native";
import { VideoView, useVideoPlayer, Video } from "expo-video";
import { useEvent } from "expo";
import { Ionicons } from "@expo/vector-icons";
import { StyledText } from "./StyledText";
import { FontsEnum } from "../constants/FontsEnum";
import Colors from "../constants/Colors";
import {
    downloadVideo,
    getLocalVideoPath,
    isVideoDownloaded,
    deleteDownloadedVideo,
    formatBytes,
    type DownloadedVideo,
} from "../utils/videoUtils";
import { useTranslation } from "react-i18next";
import * as ScreenCapture from "expo-screen-capture";

const { width, height } = Dimensions.get("window");

export interface VideoPlayerProps {
    source: { uri: string };
    contentId: number;
    style?: View["props"]["style"];
    onLoad?: () => void;
    onError?: (error: string) => void;
    onPlaybackStatusUpdate?: (status: any) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
    source,
    contentId,
    style,
    onLoad,
    onError,
    onPlaybackStatusUpdate,
}) => {
    const { t } = useTranslation();
    const [isDownloaded, setIsDownloaded] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [videoUri, setVideoUri] = useState<string>(source.uri);
    const [isScreenCaptureEnabled, setIsScreenCaptureEnabled] = useState(false);
    const [isPictureInPictureActive, setIsPictureInPictureActive] = useState(false);
    const [isPictureInPictureSupported, setIsPictureInPictureSupported] = useState(false);
    const playerRef = useRef<VideoView>(null);

    // Check if video is already downloaded
    useEffect(() => {
        checkDownloadStatus();
    }, [contentId]);

    // Update videoUri when source changes
    useEffect(() => {
        setVideoUri(source.uri);
    }, [source.uri]);

    // Check if Picture-in-Picture is supported
    useEffect(() => {
        const checkPiPSupport = () => {
            try {
                const supported = Video.isPictureInPictureSupported();
                setIsPictureInPictureSupported(supported);
            } catch (error) {
                console.log("Error checking PiP support:", error);
                setIsPictureInPictureSupported(false);
            }
        };
        checkPiPSupport();
    }, []);

    // Enable screen capture protection
    useEffect(() => {
        let cancelled = false;
        const enableProtection = async () => {
            try {
                if (!cancelled) {
                    await ScreenCapture.preventScreenCaptureAsync();
                    setIsScreenCaptureEnabled(true);
                }
            } catch (error) {
                console.log("Screen capture protection failed:", error);
            }
        };
        enableProtection();

        return () => {
            cancelled = true;
            ScreenCapture.allowScreenCaptureAsync().catch(() => {});
            setIsScreenCaptureEnabled(false);
        };
    }, []);

    const checkDownloadStatus = async () => {
        try {
            const downloaded = await isVideoDownloaded(contentId);
            setIsDownloaded(downloaded);
            if (downloaded) {
                const localPath = await getLocalVideoPath(contentId);
                if (localPath) {
                    // Use local path if available for offline playback
                    setVideoUri(localPath);
                } else {
                    // If file was deleted, reset to online source
                    setIsDownloaded(false);
                    setVideoUri(source.uri);
                }
            } else {
                // Not downloaded, use online source
                setVideoUri(source.uri);
            }
        } catch (error) {
            console.error("Error checking download status:", error);
            // Fallback to online source on error
            setVideoUri(source.uri);
        }
    };

    const handleDownload = async () => {
        if (isDownloading || isHLS) return;

        try {
            setIsDownloading(true);
            setDownloadProgress(0);

            const localPath = await downloadVideo(contentId, source.uri, (progress) => {
                setDownloadProgress(progress);
            });

            setVideoUri(localPath);
            setIsDownloaded(true);
            Alert.alert(
                t("downloadComplete") || "Download Complete",
                t("videoDownloadedSuccessfully") || "Video has been downloaded successfully. You can now watch it offline."
            );
        } catch (error: any) {
            console.error("Download error:", error);
            const errorMessage = error?.message || t("failedToDownloadVideo") || "Failed to download video. Please try again.";
            Alert.alert(
                t("downloadError") || "Download Error",
                errorMessage
            );
        } finally {
            setIsDownloading(false);
            setDownloadProgress(0);
        }
    };

    const handleDeleteDownload = async () => {
        Alert.alert(
            t("deleteDownload") || "Delete Download",
            t("deleteDownloadMessage") || "Are you sure you want to delete this downloaded video?",
            [
                {
                    text: t("cancel") || "Cancel",
                    style: "cancel",
                },
                {
                    text: t("delete") || "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await deleteDownloadedVideo(contentId);
                            setVideoUri(source.uri);
                            setIsDownloaded(false);
                            Alert.alert(
                                t("deleted") || "Deleted",
                                t("videoDeletedSuccessfully") || "Video has been deleted successfully."
                            );
                        } catch (error: any) {
                            console.error("Delete error:", error);
                            Alert.alert(
                                t("error") || "Error",
                                error?.message || t("failedToDeleteVideo") || "Failed to delete video."
                            );
                        }
                    },
                },
            ]
        );
    };

    // Create video player - useVideoPlayer automatically handles URI changes
    const player = useVideoPlayer(videoUri, (player) => {
        player.loop = false;
        player.muted = false;
    });

    // Use useEvent hook for better event handling (best practice from documentation)
    const { status } = useEvent(player, "statusChange", {
        status: player.status,
    });

    // Handle player status changes with useEvent (reactive state)
    useEffect(() => {
        if (status === "readyToPlay") {
            setIsLoading(false);
            onLoad?.();
        }
        if (status === "error") {
            setIsLoading(false);
        }
    }, [status, onLoad]);

    // Use addListener for error details and status updates (complementary to useEvent)
    useEffect(() => {
        if (!player) return;

        const subscription = player.addListener("statusChange", ({ status: playerStatus, error: playerError }) => {
            if (playerStatus === "error") {
                const errorMessage = playerError?.message || "Unknown error";
                console.error("Video player error:", errorMessage);
                onError?.(errorMessage);
            }
            onPlaybackStatusUpdate?.({ status: playerStatus, error: playerError });
        });

        return () => {
            subscription.remove();
        };
    }, [player, onError, onPlaybackStatusUpdate]);

    // Handle Picture-in-Picture events
    const handlePictureInPictureStart = () => {
        setIsPictureInPictureActive(true);
    };

    const handlePictureInPictureStop = () => {
        setIsPictureInPictureActive(false);
    };

    // Handle Picture-in-Picture button press
    const handlePictureInPicturePress = async () => {
        if (!playerRef.current || !isPictureInPictureSupported) {
            Alert.alert(
                t("pictureInPictureNotSupported") || "Picture-in-Picture Not Supported",
                t("pictureInPictureNotSupportedMessage") || "Picture-in-Picture is not supported on this device."
            );
            return;
        }

        try {
            if (isPictureInPictureActive) {
                await playerRef.current.stopPictureInPicture();
            } else {
                await playerRef.current.startPictureInPicture();
            }
        } catch (error: any) {
            console.error("Picture-in-Picture error:", error);
            Alert.alert(
                t("pictureInPictureError") || "Picture-in-Picture Error",
                error?.message || t("pictureInPictureErrorMessage") || "Failed to toggle Picture-in-Picture mode. Please try again."
            );
        }
    };

    // Determine if source is HLS (.m3u8)
    const isHLS = source.uri.toLowerCase().includes(".m3u8") || source.uri.toLowerCase().includes("m3u8");

    return (
        <View style={[styles.container, style]}>
            {/* Video Player */}
            <View style={styles.videoContainer}>
                {isLoading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color="#FFFFFF" />
                        <StyledText style={styles.loadingText}>
                            {t("loadingVideo") || "Loading video..."}
                        </StyledText>
                    </View>
                )}

                {player && (
                    <VideoView
                        ref={playerRef}
                        player={player}
                        style={styles.video}
                        allowsFullscreen
                        allowsPictureInPicture={isPictureInPictureSupported}
                        contentFit="contain"
                        nativeControls
                        onPictureInPictureStart={handlePictureInPictureStart}
                        onPictureInPictureStop={handlePictureInPictureStop}
                    />
                )}

                {/* Picture-in-Picture Button */}
                {isPictureInPictureSupported && player && !isLoading && (
                    <TouchableOpacity
                        style={styles.pipButton}
                        onPress={handlePictureInPicturePress}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name={isPictureInPictureActive ? "close-circle" : "open-outline"}
                            size={24}
                            color="#FFFFFF"
                        />
                        <StyledText style={styles.pipButtonText}>
                            {isPictureInPictureActive
                                ? t("exitPictureInPicture") || "Exit PiP"
                                : t("enterPictureInPicture") || "Picture-in-Picture"}
                        </StyledText>
                    </TouchableOpacity>
                )}

{/*
                <View style={styles.controlsContainer}>
                    <TouchableOpacity
                        style={[styles.controlButton, isDownloading && styles.controlButtonDisabled]}
                        onPress={isDownloaded ? handleDeleteDownload : handleDownload}
                        disabled={isDownloading || isHLS}
                        activeOpacity={0.7}
                    >
                        {isDownloading ? (
                            <View style={styles.downloadProgressContainer}>
                                <ActivityIndicator size="small" color="#FFFFFF" />
                                <StyledText style={styles.downloadProgressText}>
                                    {Math.round(downloadProgress * 100)}%
                                </StyledText>
                            </View>
                        ) : isDownloaded ? (
                            <>
                                <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
                                <StyledText style={styles.controlButtonText}>
                                    {t("deleteDownload") || "Delete"}
                                </StyledText>
                            </>
                        ) : (
                            <>
                                <Ionicons name="download-outline" size={20} color="#FFFFFF" />
                                <StyledText style={styles.controlButtonText}>
                                    {t("download") || "Download"}
                                </StyledText>
                            </>
                        )}
                    </TouchableOpacity>



                    {isDownloaded && (
                        <View style={styles.offlineBadge}>
                            <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                            <StyledText style={styles.offlineBadgeText}>
                                {t("offlineAvailable") || "Offline"}
                            </StyledText>
                        </View>
                    )}
                </View>
*/}
            </View>


        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000000",
        position: "relative",
    },
    videoContainer: {
        flex: 1,
        backgroundColor: "#000000",
        justifyContent: "center",
        alignItems: "center",
    },
    video: {
        width: width,
        height: height - 200, // Account for header and controls
        backgroundColor: "#000000",
    },
    loadingOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        zIndex: 10,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 14,
        color: "#FFFFFF",
        fontFamily: FontsEnum.Poppins_400Regular,
    },
    controlsContainer: {
        position: "absolute",
        bottom: 20,
        left: 16,
        right: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        flexWrap: "wrap",
    },
    controlButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "rgba(106, 53, 193, 0.9)",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    controlButtonDisabled: {
        opacity: 0.6,
    },
    controlButtonText: {
        fontSize: 14,
        color: "#FFFFFF",
        fontFamily: FontsEnum.Poppins_600SemiBold,
        fontWeight: "600",
    },
    downloadProgressContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    downloadProgressText: {
        fontSize: 14,
        color: "#FFFFFF",
        fontFamily: FontsEnum.Poppins_600SemiBold,
        fontWeight: "600",
    },
    hlsInfoContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "rgba(255, 165, 0, 0.2)",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "rgba(255, 165, 0, 0.5)",
    },
    hlsInfoText: {
        fontSize: 11,
        color: "#FFA500",
        fontFamily: FontsEnum.Poppins_400Regular,
    },
    offlineBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "rgba(76, 175, 80, 0.2)",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "rgba(76, 175, 80, 0.5)",
    },
    offlineBadgeText: {
        fontSize: 11,
        color: "#4CAF50",
        fontFamily: FontsEnum.Poppins_600SemiBold,
        fontWeight: "600",
    },
    securityBadge: {
        position: "absolute",
        bottom: 16,
        right: 16,
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
    pipButton: {
        position: "absolute",
        top: 16,
        right: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "rgba(106, 53, 193, 0.9)",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
        zIndex: 20,
    },
    pipButtonText: {
        fontSize: 14,
        color: "#FFFFFF",
        fontFamily: FontsEnum.Poppins_600SemiBold,
        fontWeight: "600",
    },
});

export default VideoPlayer;
