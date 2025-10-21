// PdfViewer.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
    useWindowDimensions,
} from "react-native";
import PdfRendererView from "react-native-pdf-renderer";
import * as FileSystem from "expo-file-system/legacy"

// -------------------- Types --------------------



export interface PdfViewerProps {
    source: Source;
    style?: View["props"]["style"];
    theme?: "dark" | "light";
    initialZoom?: number; // 1 = fit width; >1 zoom in
    enableFastScroll?: boolean;
    onLoad?: (pages: number) => void;
    onError?: (err: string) => void;
}
// NOTE: imports and styles intentionally omitted as requested.

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

// ---------- Helpers ----------
const CACHE_PREFIX = "viewer_";

async function writeBase64ToCache(path: string, base64: string) {
    await FileSystem.writeAsStringAsync(path, base64, {
        encoding: FileSystem.EncodingType.Base64,
    });
}

function randName() {
    return `${CACHE_PREFIX}${Math.random().toString(36).slice(2)}.pdf`;
}

async function downloadToCache(url: string, headers?: Record<string, string>) {
    // Force a reasonable Accept header; Firebase ignores the extension and uses metadata.
    const target = `${FileSystem.cacheDirectory}${randName()}`;
    const res = await FileSystem.downloadAsync(url, target, {
        headers: { Accept: "application/pdf,application/octet-stream", ...(headers || {}) },
    });
    return res.uri; // file:///...
}

async function readFirstBytes(url: string, headers?: Record<string, string>) {
    try {
        const res = await fetch(url, {
            method: "GET",
            headers: { Range: "bytes=0-7", ...(headers || {}) },
        });
        if (!res.ok) return null;
        const buf = await res.arrayBuffer();
        return new Uint8Array(buf);
    } catch {
        return null;
    }
}

function isPdfMagic(bytes: Uint8Array | null) {
    if (!bytes || bytes.length < 5) return false;
    return bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46 && bytes[4] === 0x2d; // %PDF-
}

// ---------- UI atoms ----------
function Btn({
                 label,
                 onPress,
                 disabled,
             }: {
    label: string;
    onPress: () => void;
    disabled?: boolean;
}) {
    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
            style={({ pressed }) => [
                styles.btn,
                disabled && styles.btnDisabled,
                pressed && !disabled && styles.btnPressed,
            ]}
        >
            <Text style={styles.btnText}>{label}</Text>
        </Pressable>
    );
}

function Pill({ children }: { children: React.ReactNode }) {
    return <View style={styles.pill}>{children}</View>;
}

// ---------- Component ----------
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
        | (React.Component & { setPage?: (n: number) => void; setZoom?: (z: number) => void })
        | null
    >(null);

    const [pageCount, setPageCount] = useState(0);
    const [page, setPage] = useState(1);
    const [zoom, setZoom] = useState(initialZoom);
    const [pdfPath, setPdfPath] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [warn, setWarn] = useState<string | null>(null);

    const reportError = useCallback(
        (msg: unknown) => {
            const text =
                typeof msg === "string" ? msg : typeof msg === "object" ? JSON.stringify(msg) : String(msg);
            console.error("PdfViewer error:", text);
            try { onError?.(text); } catch {}
        },
        [onError]
    );

    // Resolve source → local file path (always)
    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setWarn(null);
        setPdfPath(null);

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

                // Optional probe: try to confirm PDF magic; don’t fail hard if CDN blocks ranged GET
                const magic = await readFirstBytes(url, headers);
                if (magic && !isPdfMagic(magic)) {
                    setWarn(
                        "This URL responds but initial bytes are not %PDF-. Proceeding anyway by downloading to a local file. " +
                        "If it still fails, ensure the Firebase object really stores PDF bytes (metadata Content-Type=application/pdf)."
                    );
                }

                // Always download to file:// for the native view
                const local = await downloadToCache(url, headers);
                if (!cancelled) setPdfPath(local);
            } catch (e) {
                if (!cancelled) reportError(e);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => { cancelled = true; };
    }, [source, reportError]);

    // Controls
    const canPrev = page > 1;
    const canNext = page < pageCount;

    const goPrev = useCallback(() => {
        if (!canPrev) return;
        const next = page - 1;
        setPage(next);
        viewerRef.current?.setPage?.(next);
    }, [page, canPrev]);

    const goNext = useCallback(() => {
        if (!canNext) return;
        const next = page + 1;
        setPage(next);
        viewerRef.current?.setPage?.(next);
    }, [page, canNext]);

    const zoomIn = useCallback(() => {
        const next = Math.min(zoom + 0.25, 5);
        setZoom(next);
        viewerRef.current?.setZoom?.(next);
    }, [zoom]);

    const zoomOut = useCallback(() => {
        const next = Math.max(zoom - 0.25, 0.5);
        setZoom(next);
        viewerRef.current?.setZoom?.(next);
    }, [zoom]);

    const fitWidth = useCallback(() => {
        setZoom(1);
        viewerRef.current?.setZoom?.(1);
    }, []);

    const onLoadComplete = useCallback(
        (pages: number) => {
            setPageCount(pages);
            setPage(1);
            viewerRef.current?.setPage?.(1);
            try { onLoad?.(pages); } catch {}
        },
        [onLoad]
    );

    const onPageChanged = useCallback((p: number) => setPage(p), []);

    const themed = useMemo(() => {
        const dark = theme === "dark";
        return {
            pageBackground: dark ? "#111216" : "#ffffff",
            appBackground: dark ? "#0b0c10" : "#f5f6f8",
            tint: dark ? "#e7eaf1" : "#121319",
            muted: dark ? "#a7adbb" : "#6a6f7a",
            panel: dark ? "#15171e" : "#ffffff",
            border: dark ? "#252830" : "#e7e8ea",
            accent: "#4f7cff",
        };
    }, [theme]);

    const NativeOk = typeof PdfRendererView !== "undefined" && PdfRendererView !== null;

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
            {/* Toolbar */}
            <View style={[styles.toolbar, { backgroundColor: themed.panel, borderBottomColor: themed.border }]}>
                <Pill>
                    <Text style={[styles.pageText, { color: themed.muted }]}>{page}/{pageCount || "–"}</Text>
                </Pill>
                <Btn label="‹ Prev" onPress={goPrev} disabled={!canPrev} />
                <Btn label="Next ›" onPress={goNext} disabled={!canNext} />
                <View style={styles.spacer} />
                <Btn label="−" onPress={zoomOut} />
                <Pill>
                    <Text style={[styles.zoomText, { color: themed.muted }]}>{Math.round(zoom * 100)}%</Text>
                </Pill>
                <Btn label="+" onPress={zoomIn} />
                <Btn label="Fit" onPress={fitWidth} />
            </View>

            {/* Viewer */}
            <View style={[styles.viewerWrap, { backgroundColor: themed.pageBackground }]}>
                {(loading || !pdfPath) && (
                    <View style={styles.loader}>
                        <ActivityIndicator size="large" />
                    </View>
                )}

                {warn && !loading && (
                    <View style={{ padding: 8 }}>
                        <Text style={{ textAlign: "center", fontSize: 12 }}>{warn}</Text>
                    </View>
                )}

                {pdfPath && (
                    <PdfRendererView
                        ref={viewerRef}
                        style={{ width, height: height - 56 }}
                        source={pdfPath}                 // <-- string path (file://...), not { uri }
                        enableFastScroll={enableFastScroll}
                        enableDoubleTapZoom
                        spacing={8}
                        renderFromPage={Math.max(1, page - 3)}
                        renderToPage={Math.min(pageCount || page + 3, (pageCount || page) + 3)}
                        onLoadComplete={onLoadComplete}
                        onPageChanged={onPageChanged}
                        onError={() => reportError("PdfRendererView reported an error")}
                    />
                )}
            </View>

            {Platform.OS === "android" && (
                <View style={styles.note}>
                    <Text style={styles.noteText}>
                        Tip: Android’s PdfRenderer has no selectable text layer; rendering stays crisp.
                    </Text>
                </View>
            )}
        </View>
    );
};







const styles = StyleSheet.create({
    container: { flex: 1 },
    toolbar: {
        height: 56,
        paddingHorizontal: 10,
        borderBottomWidth: StyleSheet.hairlineWidth,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    viewerWrap: { flex: 1 },
    loader: {
        ...StyleSheet.absoluteFillObject,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10,
    },
    btn: {
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 10,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: "#2b2e37",
        backgroundColor: "#1a1d24",
    },
    btnPressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
    btnDisabled: { opacity: 0.4 },
    btnText: {
        color: "#e7eaf1",
        fontSize: 13,
        fontWeight: "600",
    },
    pill: {
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 999,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: "#2b2e37",
        backgroundColor: "#15171c",
        minWidth: 52,
        alignItems: "center",
    },
    pageText: { fontSize: 12, fontWeight: "600" },
    zoomText: { fontSize: 12, fontWeight: "700" },
    spacer: { flex: 1 },
    note: { padding: 8, alignItems: "center" },
    noteText: {
        fontSize: 11,
        color: "#98a0ad",
        textAlign: "center",
        paddingHorizontal: 8,
    },
});

export default PdfViewer;
