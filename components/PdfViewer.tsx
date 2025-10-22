
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Platform,
    StyleSheet,
    Text,
    View,
    useWindowDimensions,
} from "react-native";
import PdfRendererView from "react-native-pdf-renderer";
import * as FileSystem from "expo-file-system/legacy";


type Source =
    | { uri: string; headers?: Record<string, string> }
    | { base64: string };

export interface PdfViewerProps {
    source: Source;
    style?: View["props"]["style"];
    theme?: "dark" | "light";
    initialZoom?: number;
    enableFastScroll?: boolean;
    onLoad?: (pages: number) => void;
    onError?: (err: string) => void;
}


const CACHE_PREFIX = "viewer_";

function randName() {
    return `${CACHE_PREFIX}${Math.random().toString(36).slice(2)}.pdf`;
}

async function writeBase64ToCache(path: string, base64: string) {
    await FileSystem.writeAsStringAsync(path, base64, {
        encoding: FileSystem.EncodingType.Base64,
    });
}

async function downloadToCache(url: string, headers?: Record<string, string>) {
    const target = `${FileSystem.cacheDirectory}${randName()}`;
    const res = await FileSystem.downloadAsync(url, target, {
        headers: { Accept: "application/pdf,application/octet-stream", ...(headers || {}) },
    });
    return res.uri;
}


const PdfViewer: React.FC<PdfViewerProps> = ({
                                                 source,
                                                 style,
                                                 theme = "dark",
                                                 initialZoom = 1,
                                                 enableFastScroll = true,
                                                 onLoad,
                                                 onError,
                                             }) => {
    const { width, height } = useWindowDimensions();
    const viewerRef = useRef<
        | (React.Component & {
        setPage?: (n: number) => void;
        setZoom?: (z: number) => void;
        getPageCount?: () => number | undefined;
    })
        | null
    >(null);

    const [pageCount, setPageCount] = useState(0);
    const [page, setPage] = useState(1);
    const [pdfPath, setPdfPath] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const reportError = useCallback(
        (msg: unknown) => {
            const text =
                typeof msg === "string" ? msg : typeof msg === "object" ? JSON.stringify(msg) : String(msg);
            console.error("PdfViewer error:", text);
            try {
                onError?.(text);
            } catch {}
        },
        [onError]
    );


    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setPdfPath(null);
        setPageCount(0);
        setPage(1);

        (async () => {
            try {
                if ("base64" in source) {
                    const path = `${FileSystem.cacheDirectory}${randName()}`;
                    const payload = source.base64.replace(/^data:application\/pdf;base64,/, "");
                    await writeBase64ToCache(path, payload);
                    if (!cancelled) setPdfPath(path);
                    return;
                }

                const url = source.uri;
                const headers = { ...(source.headers || {}), Accept: "application/pdf,application/octet-stream" };
                const local = await downloadToCache(url, headers);
                if (!cancelled) setPdfPath(local);
            } catch (e) {
                if (!cancelled) reportError(e);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [source, reportError]);


    const finalizePages = useCallback(
        (maybePages?: number) => {

            if (typeof maybePages === "number" && Number.isFinite(maybePages) && maybePages > 0) {
                setPageCount(maybePages);
                try {
                    onLoad?.(maybePages);
                } catch {}
                return;
            }


            const viaRef = viewerRef.current?.getPageCount?.();
            if (typeof viaRef === "number" && viaRef > 0) {
                setPageCount(viaRef);
                try {
                    onLoad?.(viaRef);
                } catch {}
                return;
            }


            setPageCount((prev) => (prev > 0 ? prev : Math.max(1, page)));
            try {
                onLoad?.(Math.max(1, page));
            } catch {}
        },
        [onLoad, page]
    );


    const handleLoadComplete = useCallback(
        (p?: number) => finalizePages(p),
        [finalizePages]
    );
    const handleLoad = useCallback(
        (p?: number) => finalizePages(p),
        [finalizePages]
    );

    const onPageChanged = useCallback((p: number) => setPage(p), []);

    const themed = useMemo(() => {
        const dark = theme === "dark";
        return {
            pageBackground: dark ? "#111216" : "#ffffff",
            appBackground: dark ? "#0b0c10" : "#f5f6f8",
            muted: dark ? "#a7adbb" : "#6a6f7a",
            badgeBg: dark ? "rgba(21,23,30,0.9)" : "rgba(255,255,255,0.92)",
            badgeBorder: dark ? "#2a2e38" : "#e5e7eb",
        };
    }, [theme]);

    const NativeOk = typeof PdfRendererView !== "undefined" && PdfRendererView !== null;


    useEffect(() => {
        if (!pdfPath) return;
        const id = setTimeout(() => {
            if (pageCount === 0) {
                const viaRef = viewerRef.current?.getPageCount?.();
                if (typeof viaRef === "number" && viaRef > 0) setPageCount(viaRef);
                else setPageCount((prev) => (prev > 0 ? prev : Math.max(1, page)));
            }
        }, 300);
        return () => clearTimeout(id);
    }, [pdfPath, pageCount, page]);

    if (!NativeOk) {
        return (
            <View style={[styles.container, style]}>
                <View style={styles.loader}>
                    <Text style={{ textAlign: "center" }}>
                        PDF viewer not available (ensure dev build & default import).
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: themed.appBackground }, style]}>
            {/* Viewer */}
            <View style={[styles.viewerWrap, { backgroundColor: themed.pageBackground }]}>
                {(loading || !pdfPath) && (
                    <View style={styles.loader}>
                        <ActivityIndicator size="large" />
                    </View>
                )}

                {pdfPath && (
                    <>
                        <PdfRendererView
                            ref={viewerRef}
                            style={{ width, height }}
                            source={pdfPath}
                            enableFastScroll={enableFastScroll}
                            enableDoubleTapZoom
                            spacing={8}

                            onLoadComplete={handleLoadComplete}
                            onLoad={handleLoad}
                            onPageChanged={onPageChanged}
                            onError={() => reportError("PdfRendererView reported an error")}
                        />
                    </>
                )}
            </View>


        </View>
    );
};

export default PdfViewer;


const styles = StyleSheet.create({
    container: { flex: 1 },
    viewerWrap: { flex: 1 },
    loader: {
        ...StyleSheet.absoluteFillObject,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10,
    },


    pageBadge: {
        position: "absolute",
        right: 12,
        bottom: 12,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        borderWidth: StyleSheet.hairlineWidth,
    },
    pageBadgeText: {
        fontSize: 12,
        fontWeight: "700",
    },

    footerNote: { padding: 8, alignItems: "center" },
    footerNoteText: { fontSize: 11, color: "#98a0ad", textAlign: "center", paddingHorizontal: 8 },
});
