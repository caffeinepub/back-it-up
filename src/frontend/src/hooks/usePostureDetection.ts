import { useCallback, useEffect, useRef, useState } from "react";

export type PostureState = "good" | "bad" | "unknown";

export interface PostureDetectionResult {
  postureState: PostureState;
  angle: number | null;
  isModelLoading: boolean;
  modelError: string | null;
}

// Singleton load state for MediaPipe
let mpLoaded = false;
let mpLoadPromise: Promise<void> | null = null;

function loadMediaPipeScripts(): Promise<void> {
  if (mpLoaded) return Promise.resolve();
  if (mpLoadPromise) return mpLoadPromise;

  mpLoadPromise = new Promise((resolve, reject) => {
    const loadScript = (src: string): Promise<void> =>
      new Promise((res, rej) => {
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) {
          res();
          return;
        }
        const s = document.createElement("script");
        s.src = src;
        s.onload = () => res();
        s.onerror = () => rej(new Error(`Failed to load: ${src}`));
        document.head.appendChild(s);
      });

    (async () => {
      try {
        await loadScript(
          "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js",
        );
        await loadScript(
          "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js",
        );
        mpLoaded = true;
        resolve();
      } catch (e) {
        reject(e);
      }
    })();
  });

  return mpLoadPromise;
}

// Landmark indices
const LM_FOREHEAD = 10;
const LM_CHIN = 152;
const LM_LEFT_TMJ = 234;
const LM_RIGHT_TMJ = 454;
const LM_LEFT_EYE_OUTER = 33;
const LM_RIGHT_EYE_OUTER = 263;
const LM_NOSE_TIP = 1;

interface Landmark {
  x: number;
  y: number;
  z: number;
}
interface Vec3 {
  x: number;
  y: number;
  z: number;
}

function vec3From(a: Landmark, b: Landmark): Vec3 {
  return { x: b.x - a.x, y: b.y - a.y, z: b.z - a.z };
}
function cross3(a: Vec3, b: Vec3): Vec3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}
function mag3(v: Vec3): number {
  return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}
function normalize3(v: Vec3): Vec3 {
  const m = mag3(v);
  return m < 1e-9
    ? { x: 0, y: 0, z: 0 }
    : { x: v.x / m, y: v.y / m, z: v.z / m };
}
function dot3(a: Vec3, b: Vec3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

/**
 * Rotation-invariant 3D head pitch detection.
 * Works at any phone orientation (portrait, landscape, tilted).
 * Amplified 1.6x for high sensitivity — trigger threshold should be ~20-25°.
 */
function calculateNeckAngle(landmarks: Landmark[]): number | null {
  if (!landmarks || landmarks.length < 455) return null;

  const forehead = landmarks[LM_FOREHEAD];
  const chin = landmarks[LM_CHIN];
  const leftTMJ = landmarks[LM_LEFT_TMJ];
  const rightTMJ = landmarks[LM_RIGHT_TMJ];
  const leftEye = landmarks[LM_LEFT_EYE_OUTER];
  const rightEye = landmarks[LM_RIGHT_EYE_OUTER];
  const noseTip = landmarks[LM_NOSE_TIP];
  // noseBase reserved for future use

  if (
    !forehead ||
    !chin ||
    !leftTMJ ||
    !rightTMJ ||
    !leftEye ||
    !rightEye ||
    !noseTip
  )
    return null;

  // --- Measure 1: Face normal pitch ---
  // Cross product of TMJ axis and chin→forehead gives face normal vector
  const rightVec = vec3From(leftTMJ, rightTMJ);
  const upVec = vec3From(chin, forehead);
  const faceNormal = normalize3(cross3(rightVec, upVec));

  // Pitch of the face normal in the YZ plane (0° = face toward camera)
  const pitchNormal =
    (Math.atan2(-faceNormal.y, Math.abs(faceNormal.z)) * 180) / Math.PI;

  // --- Measure 2: Z-depth differential (chin vs forehead depth) ---
  // Captures forward lean directly from depth data
  const faceHeightVec = vec3From(chin, forehead);
  const faceH = mag3(faceHeightVec);
  const zDiff = forehead.z - chin.z; // positive = head tilting back; negative = forward lean
  const depthAngle =
    faceH > 1e-9 ? (Math.atan2(Math.abs(zDiff), faceH) * 180) / Math.PI : 0;

  // --- Measure 3: Nose tip depth relative to face plane ---
  // Nose sticks out from face — when head tilts down, nose z decreases relative to forehead
  const faceCenter = {
    x: (forehead.x + chin.x + leftTMJ.x + rightTMJ.x) / 4,
    y: (forehead.y + chin.y + leftTMJ.y + rightTMJ.y) / 4,
    z: (forehead.z + chin.z + leftTMJ.z + rightTMJ.z) / 4,
  };
  // Dot nose-to-center vector with face normal to get how much nose deviates
  const noseDelta = vec3From(faceCenter, noseTip);
  const noseProjection = Math.abs(dot3(normalize3(noseDelta), faceNormal));
  const nosePitchBoost = noseProjection * 10; // small boost from nose alignment

  // --- Eye symmetry: detect lateral head tilt (subtract from score) ---
  const eyeHeightDiff = Math.abs(leftEye.y - rightEye.y);
  const eyeWidthDist = Math.abs(rightEye.x - leftEye.x);
  const lateralTiltFactor =
    eyeWidthDist > 1e-6 ? eyeHeightDiff / eyeWidthDist : 0;
  // Reduce score if head is mostly tilted sideways (not forward)
  const lateralPenalty = Math.min(lateralTiltFactor * 15, 8);

  // --- Composite score (amplified 1.6x for high sensitivity) ---
  const raw = pitchNormal * 0.5 + depthAngle * 0.4 + nosePitchBoost * 0.1;
  const composite = Math.max(0, (raw - lateralPenalty) * 1.6);

  return Math.round(composite * 10) / 10;
}

export function usePostureDetection(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  threshold: number,
  isActive: boolean,
): PostureDetectionResult {
  const [postureState, setPostureState] = useState<PostureState>("unknown");
  const [angle, setAngle] = useState<number | null>(null);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [modelError, setModelError] = useState<string | null>(null);

  const faceMeshRef = useRef<any>(null);
  const rafRef = useRef<number | null>(null);
  const mountedRef = useRef(true);
  const lastFrameTimeRef = useRef<number>(0);
  const thresholdRef = useRef(threshold);
  const isActiveRef = useRef(isActive);

  useEffect(() => {
    thresholdRef.current = threshold;
  }, [threshold]);
  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  const stopDetection = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const startDetection = useCallback(() => {
    if (!faceMeshRef.current || !videoRef.current) return;
    stopDetection();

    const loop = async (timestamp: number) => {
      if (!mountedRef.current || !isActiveRef.current) return;
      rafRef.current = requestAnimationFrame(loop);

      // ~60fps — no heavy throttle, just skip if frame is too fresh
      if (timestamp - lastFrameTimeRef.current < 16) return;
      lastFrameTimeRef.current = timestamp;

      const video = videoRef.current;
      if (!video || video.readyState < 2) return;

      try {
        await faceMeshRef.current.send({ image: video });
      } catch {
        // ignore frame errors
      }
    };

    rafRef.current = requestAnimationFrame(loop);
  }, [videoRef, stopDetection]);

  useEffect(() => {
    mountedRef.current = true;
    let cancelled = false;

    (async () => {
      try {
        setIsModelLoading(true);
        setModelError(null);

        await loadMediaPipeScripts();
        if (cancelled) return;

        const FaceMesh = (window as any).FaceMesh;
        if (!FaceMesh) throw new Error("MediaPipe FaceMesh failed to load");

        const faceMesh = new FaceMesh({
          locateFile: (file: string) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
        });

        faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: false, // faster — no iris tracking needed
          minDetectionConfidence: 0.3, // lower = picks up face sooner
          minTrackingConfidence: 0.3, // lower = tracks more aggressively
        });

        faceMesh.onResults((results: any) => {
          if (!mountedRef.current) return;

          const multiLandmarks = results.multiFaceLandmarks;
          if (!multiLandmarks || multiLandmarks.length === 0) {
            setPostureState("unknown");
            setAngle(null);
            return;
          }

          const landmarks: Landmark[] = multiLandmarks[0];
          const detectedAngle = calculateNeckAngle(landmarks);

          if (detectedAngle === null) {
            setPostureState("unknown");
            setAngle(null);
            return;
          }

          setAngle(detectedAngle);
          setPostureState(
            detectedAngle > thresholdRef.current ? "bad" : "good",
          );
        });

        if (cancelled) return;
        faceMeshRef.current = faceMesh;
        setIsModelLoading(false);
      } catch (err) {
        if (!cancelled) {
          setModelError(
            err instanceof Error
              ? err.message
              : "Failed to load face mesh model",
          );
          setIsModelLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      mountedRef.current = false;
      stopDetection();
    };
  }, [stopDetection]);

  useEffect(() => {
    if (!isModelLoading && !modelError && isActive && faceMeshRef.current) {
      startDetection();
    } else {
      stopDetection();
      if (!isActive) {
        setPostureState("unknown");
        setAngle(null);
      }
    }
    return () => stopDetection();
  }, [isModelLoading, modelError, isActive, startDetection, stopDetection]);

  return { postureState, angle, isModelLoading, modelError };
}
