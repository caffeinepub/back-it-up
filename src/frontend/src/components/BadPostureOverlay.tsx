import { AlertTriangle } from "lucide-react";

interface BadPostureOverlayProps {
  visible: boolean;
  angle: number | null;
}

export default function BadPostureOverlay({
  visible,
  angle,
}: BadPostureOverlayProps) {
  return (
    <>
      {/* Backdrop blur layer — blurs ALL content behind it */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-300 ${
          visible ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        style={{
          backdropFilter: visible ? "blur(20px) brightness(0.4)" : "none",
          WebkitBackdropFilter: visible ? "blur(20px) brightness(0.4)" : "none",
        }}
      />

      {/* Foreground content layer */}
      <div
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-all duration-300 ${
          visible
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        style={{ background: "rgba(0,0,0,0.85)" }}
        aria-live="assertive"
        aria-atomic="true"
        data-ocid="posture.overlay.panel"
      >
        {/* Pulsing red edge glow */}
        <div
          className={`absolute inset-0 pointer-events-none ${
            visible ? "posture-glow-border" : ""
          }`}
          style={{
            boxShadow: visible
              ? "inset 0 0 60px 20px rgba(239,68,68,0.6), inset 0 0 120px 40px rgba(239,68,68,0.25)"
              : "none",
            animation: visible ? "pulseGlow 1.5s ease-in-out infinite" : "none",
          }}
        />

        <div className="flex flex-col items-center gap-6 px-8 text-center relative z-10">
          {/* Warning icon */}
          <div className="relative">
            <div
              className="w-28 h-28 rounded-full flex items-center justify-center"
              style={{
                background: "rgba(239,68,68,0.2)",
                boxShadow: "0 0 40px rgba(239,68,68,0.5)",
                animation: "pulseGlow 1.5s ease-in-out infinite",
              }}
            >
              <img
                src="/assets/generated/bad-posture-icon.dim_256x256.png"
                alt="Bad posture warning"
                className="w-20 h-20 object-contain drop-shadow-lg"
              />
            </div>
          </div>

          {/* Message */}
          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-white leading-tight tracking-tight">
              Fix Your Posture!
            </h1>
            <p className="text-white/80 text-base font-medium leading-relaxed">
              Straighten your neck to unlock the screen.
            </p>
            {angle !== null && (
              <div
                className="inline-flex items-center gap-2 rounded-full px-4 py-2"
                style={{
                  background: "rgba(239,68,68,0.3)",
                  border: "1px solid rgba(239,68,68,0.5)",
                }}
              >
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <span className="text-white font-bold text-sm">
                  Neck tilt: {angle}° &nbsp;
                  <span className="text-red-300 font-normal">
                    (threshold: 40°)
                  </span>
                </span>
              </div>
            )}
          </div>

          {/* Instruction */}
          <div
            className="rounded-2xl p-4 max-w-xs"
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <p className="text-white/70 text-sm leading-relaxed">
              Sit up straight, lift your chin, and align your ears over your
              shoulders. Detection is automatic.
            </p>
          </div>

          {/* Animated indicator */}
          <div className="flex gap-2 mt-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-red-400"
                style={{
                  animation: "bounce 1.2s ease-in-out infinite",
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Keyframes injected via style tag */}
      <style>{`
        @keyframes pulseGlow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </>
  );
}
