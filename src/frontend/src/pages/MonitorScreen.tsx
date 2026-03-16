import { Button } from "@/components/ui/button";
import { AlertCircle, CameraOff, Play, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Session } from "../backend";
import BadPostureOverlay from "../components/BadPostureOverlay";
import PostureStatusBadge from "../components/PostureStatusBadge";
import { useCamera } from "../hooks/useCamera";
import { usePostureDetection } from "../hooks/usePostureDetection";
import { useAddSession, useGetSettings } from "../hooks/useQueries";

export default function MonitorScreen() {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const sessionStartRef = useRef<number | null>(null);
  const goodDurationRef = useRef<number>(0);
  const badDurationRef = useRef<number>(0);
  const lastTickRef = useRef<number | null>(null);

  const { data: settings } = useGetSettings();
  const threshold = settings?.postureThreshold ?? 20;

  const { mutateAsync: addSession } = useAddSession();

  const {
    isActive: cameraActive,
    isSupported,
    error: cameraError,
    isLoading: cameraLoading,
    startCamera,
    stopCamera,
    videoRef,
    canvasRef,
  } = useCamera({ facingMode: "user", width: 640, height: 480 });

  const { postureState, angle, isModelLoading, modelError } =
    usePostureDetection(videoRef, threshold, cameraActive && isMonitoring);

  useEffect(() => {
    if (!isMonitoring || postureState === "unknown") {
      lastTickRef.current = null;
      return;
    }
    const now = Date.now();
    if (lastTickRef.current !== null) {
      const delta = (now - lastTickRef.current) / 1000;
      if (postureState === "good") {
        goodDurationRef.current += delta;
      } else if (postureState === "bad") {
        badDurationRef.current += delta;
      }
    }
    lastTickRef.current = now;
  }, [postureState, isMonitoring]);

  const handleStartMonitoring = async () => {
    const success = await startCamera();
    if (success) {
      setIsMonitoring(true);
      sessionStartRef.current = Date.now();
      goodDurationRef.current = 0;
      badDurationRef.current = 0;
      lastTickRef.current = null;
    }
  };

  const handleStopMonitoring = async () => {
    setIsMonitoring(false);
    await stopCamera();
    const totalDuration = goodDurationRef.current + badDurationRef.current;
    if (sessionStartRef.current && totalDuration >= 5) {
      try {
        const session: Session = {
          timestamp: BigInt(sessionStartRef.current * 1_000_000),
          totalGoodPostureDuration: BigInt(Math.round(goodDurationRef.current)),
          totalBadPostureDuration: BigInt(Math.round(badDurationRef.current)),
          threshold: threshold,
        };
        await addSession(session);
        toast.success("Session saved to history!");
      } catch {
        toast.error("Could not save session.");
      }
    }
    sessionStartRef.current = null;
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const showOverlay = isMonitoring && postureState === "bad";

  return (
    <div className="flex flex-col gap-4">
      <BadPostureOverlay visible={showOverlay} angle={angle} />

      {/* Page title */}
      <div>
        <h2
          className="text-xl text-foreground"
          style={{
            fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
            fontWeight: 700,
            letterSpacing: "-0.03em",
          }}
        >
          posture monitor
        </h2>
        <p className="text-sm text-muted-foreground">
          {isMonitoring
            ? "monitoring your neck posture in real time"
            : "start monitoring to detect your posture"}
        </p>
      </div>

      {/* Camera preview */}
      <div
        className="relative w-full rounded-3xl overflow-hidden border"
        style={{
          aspectRatio: "4/3",
          background: "oklch(var(--card))",
          borderColor:
            cameraActive && isMonitoring
              ? "oklch(var(--primary) / 0.35)"
              : "oklch(var(--border))",
          boxShadow:
            cameraActive && isMonitoring
              ? "0 0 0 1px oklch(var(--primary) / 0.2), 0 8px 32px oklch(var(--primary) / 0.08)"
              : "0 4px 20px rgba(0,0,0,0.3)",
          transition: "border-color 0.4s ease, box-shadow 0.4s ease",
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover scale-x-[-1]"
          style={{ display: cameraActive ? "block" : "none" }}
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Placeholder when camera is off */}
        {!cameraActive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: "oklch(var(--muted) / 0.6)" }}
            >
              <CameraOff className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground font-medium">
              camera off
            </p>
          </div>
        )}

        {/* Camera loading */}
        {cameraLoading && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: "oklch(var(--muted) / 0.8)" }}
          >
            <div className="flex flex-col items-center gap-2">
              <div
                className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
                style={{
                  borderColor: "oklch(var(--primary) / 0.3)",
                  borderTopColor: "oklch(var(--primary))",
                }}
              />
              <p className="text-xs text-muted-foreground">starting camera…</p>
            </div>
          </div>
        )}

        {/* Model loading indicator */}
        {cameraActive && isModelLoading && (
          <div className="absolute top-3 left-3 right-3">
            <div
              className="rounded-xl px-3 py-2 flex items-center gap-2 border"
              style={{
                background: "oklch(var(--card) / 0.9)",
                backdropFilter: "blur(8px)",
                borderColor: "oklch(var(--border))",
              }}
            >
              <div
                className="w-3 h-3 border-2 border-t-transparent rounded-full animate-spin flex-shrink-0"
                style={{
                  borderColor: "oklch(var(--primary) / 0.3)",
                  borderTopColor: "oklch(var(--primary))",
                }}
              />
              <span className="text-xs font-medium text-foreground">
                loading face mesh AI…
              </span>
            </div>
          </div>
        )}

        {/* Live indicator */}
        {cameraActive && isMonitoring && !isModelLoading && (
          <div className="absolute top-3 left-3">
            <div
              className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
              style={{
                background: "rgba(220,38,38,0.85)",
                backdropFilter: "blur(8px)",
              }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-white text-xs font-bold tracking-wide">
                LIVE
              </span>
            </div>
          </div>
        )}

        {/* Posture status overlay on camera */}
        {cameraActive && isMonitoring && !isModelLoading && (
          <div className="absolute bottom-3 left-3 right-3">
            <PostureStatusBadge
              postureState={postureState}
              angle={angle}
              isLoading={false}
            />
          </div>
        )}
      </div>

      {/* Camera error */}
      {cameraError && (
        <div
          className="flex items-start gap-3 rounded-2xl p-4 border"
          style={{
            background: "oklch(var(--destructive) / 0.08)",
            borderColor: "oklch(var(--destructive) / 0.25)",
          }}
        >
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-destructive">
              Camera Error
            </p>
            <p
              className="text-xs mt-0.5"
              style={{ color: "oklch(var(--destructive) / 0.8)" }}
            >
              {cameraError.message}
            </p>
            {cameraError.type === "permission" && (
              <p className="text-xs text-muted-foreground mt-1">
                Allow camera access in your browser settings and reload.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Model error */}
      {modelError && (
        <div
          className="flex items-start gap-3 rounded-2xl p-4 border"
          style={{
            background: "oklch(var(--destructive) / 0.08)",
            borderColor: "oklch(var(--destructive) / 0.25)",
          }}
        >
          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-destructive">
              AI Model Error
            </p>
            <p
              className="text-xs mt-0.5"
              style={{ color: "oklch(var(--destructive) / 0.8)" }}
            >
              {modelError}
            </p>
          </div>
        </div>
      )}

      {/* Camera not supported */}
      {isSupported === false && (
        <div
          className="flex items-start gap-3 rounded-2xl p-4 border border-border"
          style={{ background: "oklch(var(--muted))" }}
        >
          <AlertCircle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            Camera is not supported in this browser. Please use a modern browser
            with camera support.
          </p>
        </div>
      )}

      {/* Status badge (when not monitoring) */}
      {!isMonitoring && (
        <PostureStatusBadge
          postureState={postureState}
          angle={angle}
          isLoading={isModelLoading}
        />
      )}

      {/* Control button */}
      <Button
        onClick={isMonitoring ? handleStopMonitoring : handleStartMonitoring}
        disabled={cameraLoading || isSupported === false}
        variant={isMonitoring ? "destructive" : "default"}
        className="w-full h-12 rounded-2xl font-bold text-base"
        style={{
          fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
          letterSpacing: "-0.02em",
        }}
        data-ocid="monitor.primary_button"
      >
        {cameraLoading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            starting…
          </span>
        ) : isMonitoring ? (
          <span className="flex items-center gap-2">
            <Square className="w-4 h-4" />
            stop monitoring
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Play className="w-4 h-4" />
            start monitoring
          </span>
        )}
      </Button>

      {/* Info card */}
      <div
        className="rounded-2xl p-4 border border-border"
        style={{ background: "oklch(var(--card))" }}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            bad posture triggered at
          </span>
          <span
            className="text-sm font-bold"
            style={{
              color: "oklch(var(--primary))",
              fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
            }}
          >
            {threshold}° neck tilt
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
          Using 3D facial geometry — works at any phone angle. Adjust
          sensitivity in Settings.
        </p>
      </div>
    </div>
  );
}
