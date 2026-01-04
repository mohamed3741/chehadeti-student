import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";

const VIDEO_STORAGE_KEY = "downloaded_videos";
const VIDEO_DIRECTORY = `${FileSystem.documentDirectory}videos/`;

export interface DownloadedVideo {
    contentId: number;
    videoUrl: string;
    localPath: string;
    fileName: string;
    downloadedAt: string;
    fileSize?: number;
}

/**
 * Ensure the videos directory exists
 */
export async function ensureVideoDirectory(): Promise<void> {
    const dirInfo = await FileSystem.getInfoAsync(VIDEO_DIRECTORY);
    if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(VIDEO_DIRECTORY, { intermediates: true });
    }
}

/**
 * Get all downloaded videos from storage
 */
export async function getDownloadedVideos(): Promise<DownloadedVideo[]> {
    try {
        const data = await AsyncStorage.getItem(VIDEO_STORAGE_KEY);
        if (!data) return [];
        return JSON.parse(data);
    } catch (error) {
        console.error("Error reading downloaded videos:", error);
        return [];
    }
}

/**
 * Save downloaded video info to storage
 */
export async function saveDownloadedVideo(video: DownloadedVideo): Promise<void> {
    try {
        const videos = await getDownloadedVideos();
        // Remove existing entry if present
        const filtered = videos.filter((v) => v.contentId !== video.contentId);
        filtered.push(video);
        await AsyncStorage.setItem(VIDEO_STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
        console.error("Error saving downloaded video:", error);
        throw error;
    }
}

/**
 * Get local path for a video if it's downloaded
 */
export async function getLocalVideoPath(contentId: number): Promise<string | null> {
    try {
        const videos = await getDownloadedVideos();
        const video = videos.find((v) => v.contentId === contentId);
        if (!video) return null;

        // Verify file still exists
        const fileInfo = await FileSystem.getInfoAsync(video.localPath);
        if (fileInfo.exists) {
            return video.localPath;
        } else {
            // File was deleted, remove from storage
            await removeDownloadedVideo(contentId);
            return null;
        }
    } catch (error) {
        console.error("Error getting local video path:", error);
        return null;
    }
}

/**
 * Check if video is downloaded
 */
export async function isVideoDownloaded(contentId: number): Promise<boolean> {
    const localPath = await getLocalVideoPath(contentId);
    return localPath !== null;
}

/**
 * Download video to local storage
 */
export async function downloadVideo(
    contentId: number,
    videoUrl: string,
    onProgress?: (progress: number) => void
): Promise<string> {
    try {
        await ensureVideoDirectory();

        // Generate filename from URL or contentId
        const urlParts = videoUrl.split("/");
        const fileName = urlParts[urlParts.length - 1].split("?")[0] || `video_${contentId}.mp4`;
        const localPath = `${VIDEO_DIRECTORY}${fileName}`;

        // Check if already downloaded
        const existing = await getLocalVideoPath(contentId);
        if (existing) {
            return existing;
        }

        // Check if URL is HLS (cannot be downloaded)
        if (videoUrl.toLowerCase().includes(".m3u8") || videoUrl.toLowerCase().includes("m3u8")) {
            throw new Error("HLS streams (.m3u8) cannot be downloaded. Please use a direct video URL.");
        }

        // Download the video
        const downloadResumable = FileSystem.createDownloadResumable(
            videoUrl,
            localPath,
            {},
            (downloadProgress) => {
                if (downloadProgress.totalBytesExpectedToWrite > 0) {
                    const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
                    onProgress?.(progress);
                } else {
                    // If total bytes unknown, show indeterminate progress
                    onProgress?.(0.5);
                }
            }
        );

        const result = await downloadResumable.downloadAsync();
        if (!result) {
            throw new Error("Download failed");
        }

        // Get file size
        const fileInfo = await FileSystem.getInfoAsync(result.uri);
        const fileSize = fileInfo.exists && "size" in fileInfo ? fileInfo.size : undefined;

        // Save to storage
        const downloadedVideo: DownloadedVideo = {
            contentId,
            videoUrl,
            localPath: result.uri,
            fileName,
            downloadedAt: new Date().toISOString(),
            fileSize,
        };

        await saveDownloadedVideo(downloadedVideo);

        return result.uri;
    } catch (error) {
        console.error("Error downloading video:", error);
        throw error;
    }
}

/**
 * Delete downloaded video
 */
export async function deleteDownloadedVideo(contentId: number): Promise<void> {
    try {
        const videos = await getDownloadedVideos();
        const video = videos.find((v) => v.contentId === contentId);
        if (video) {
            // Delete file
            const fileInfo = await FileSystem.getInfoAsync(video.localPath);
            if (fileInfo.exists) {
                await FileSystem.deleteAsync(video.localPath, { idempotent: true });
            }
            // Remove from storage
            await removeDownloadedVideo(contentId);
        }
    } catch (error) {
        console.error("Error deleting video:", error);
        throw error;
    }
}

/**
 * Remove video from storage (but not delete file)
 */
async function removeDownloadedVideo(contentId: number): Promise<void> {
    try {
        const videos = await getDownloadedVideos();
        const filtered = videos.filter((v) => v.contentId !== contentId);
        await AsyncStorage.setItem(VIDEO_STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
        console.error("Error removing downloaded video:", error);
        throw error;
    }
}

/**
 * Get total size of all downloaded videos
 */
export async function getTotalDownloadedSize(): Promise<number> {
    try {
        const videos = await getDownloadedVideos();
        let totalSize = 0;
        for (const video of videos) {
            if (video.fileSize) {
                totalSize += video.fileSize;
            }
        }
        return totalSize;
    } catch (error) {
        console.error("Error calculating total size:", error);
        return 0;
    }
}

/**
 * Format bytes to human readable string
 */
export function formatBytes(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
}


