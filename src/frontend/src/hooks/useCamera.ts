import { useCallback, useRef, useState } from "react";

export interface CameraConfig {
  facingMode?: "user" | "environment";
  width?: number;
  height?: number;
  quality?: number;
  format?: "image/jpeg" | "image/png" | "image/webp";
}

export interface CameraError {
  type: "permission" | "not-supported" | "not-found" | "unknown" | "timeout";
  message: string;
}

export interface UseCameraReturn {
  isActive: boolean;
  isSupported: boolean | null;
  error: CameraError | null;
  isLoading: boolean;
  currentFacingMode: "user" | "environment";
  startCamera: () => Promise<boolean>;
  stopCamera: () => Promise<void>;
  capturePhoto: () => Promise<File | null>;
  switchCamera: (newFacingMode?: "user" | "environment") => Promise<boolean>;
  retry: () => Promise<boolean>;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export function useCamera(config: CameraConfig = {}): UseCameraReturn {
  const {
    facingMode: initialFacingMode = "user",
    width = 640,
    height = 480,
    quality = 0.92,
    format = "image/jpeg",
  } = config;

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<CameraError | null>(null);
  const [currentFacingMode, setCurrentFacingMode] = useState<
    "user" | "environment"
  >(initialFacingMode);
  const [isSupported] = useState<boolean | null>(
    !!(
      typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia
    ),
  );

  const stopCamera = useCallback(async () => {
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop();
      }
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
  }, []);

  const startCameraWithMode = useCallback(
    async (facing: "user" | "environment"): Promise<boolean> => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError({
          type: "not-supported",
          message: "Camera is not supported in this browser.",
        });
        return false;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Stop any existing stream first
        if (streamRef.current) {
          for (const t of streamRef.current.getTracks()) {
            t.stop();
          }
          streamRef.current = null;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: facing,
            width: { ideal: width },
            height: { ideal: height },
          },
          audio: false,
        });

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        setCurrentFacingMode(facing);
        setIsActive(true);
        setIsLoading(false);
        return true;
      } catch (err) {
        setIsLoading(false);
        const e = err as DOMException;
        if (
          e.name === "NotAllowedError" ||
          e.name === "PermissionDeniedError"
        ) {
          setError({
            type: "permission",
            message:
              "Camera permission was denied. Please allow camera access.",
          });
        } else if (
          e.name === "NotFoundError" ||
          e.name === "DevicesNotFoundError"
        ) {
          setError({
            type: "not-found",
            message: "No camera device was found.",
          });
        } else {
          setError({
            type: "unknown",
            message: e.message || "An unknown camera error occurred.",
          });
        }
        return false;
      }
    },
    [width, height],
  );

  const startCamera = useCallback(async (): Promise<boolean> => {
    return startCameraWithMode(currentFacingMode);
  }, [startCameraWithMode, currentFacingMode]);

  const switchCamera = useCallback(
    async (newFacingMode?: "user" | "environment"): Promise<boolean> => {
      const next =
        newFacingMode ??
        (currentFacingMode === "user" ? "environment" : "user");
      return startCameraWithMode(next);
    },
    [currentFacingMode, startCameraWithMode],
  );

  const retry = useCallback(async (): Promise<boolean> => {
    setError(null);
    return startCameraWithMode(currentFacingMode);
  }, [startCameraWithMode, currentFacingMode]);

  const capturePhoto = useCallback(async (): Promise<File | null> => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !isActive) return null;

    canvas.width = video.videoWidth || width;
    canvas.height = video.videoHeight || height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(null);
            return;
          }
          resolve(
            new File([blob], `photo.${format.split("/")[1]}`, { type: format }),
          );
        },
        format,
        quality,
      );
    });
  }, [isActive, width, height, format, quality]);

  return {
    isActive,
    isSupported,
    error,
    isLoading,
    currentFacingMode,
    startCamera,
    stopCamera,
    capturePhoto,
    switchCamera,
    retry,
    videoRef,
    canvasRef,
  };
}
