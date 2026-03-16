import { CheckCircle2, HelpCircle, XCircle } from "lucide-react";
import type { PostureState } from "../hooks/usePostureDetection";

interface PostureStatusBadgeProps {
  postureState: PostureState;
  angle: number | null;
  isLoading?: boolean;
}

export default function PostureStatusBadge({
  postureState,
  angle,
  isLoading,
}: PostureStatusBadgeProps) {
  if (isLoading) {
    return (
      <div
        className="flex items-center gap-3 rounded-2xl px-4 py-3 border border-border"
        style={{
          background: "oklch(var(--card) / 0.9)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div
          className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
          style={{
            borderColor: "oklch(var(--muted-foreground) / 0.3)",
            borderTopColor: "oklch(var(--muted-foreground))",
          }}
        />
        <span className="text-sm font-medium text-muted-foreground">
          loading model…
        </span>
      </div>
    );
  }

  const config = {
    good: {
      icon: CheckCircle2,
      label: "good posture",
      bgStyle: {
        background: "oklch(var(--success) / 0.1)",
        backdropFilter: "blur(12px)",
      },
      borderStyle: { borderColor: "oklch(var(--success) / 0.3)" },
      textStyle: { color: "oklch(var(--success))" },
      dotStyle: { background: "oklch(var(--success))" },
    },
    bad: {
      icon: XCircle,
      label: "bad posture",
      bgStyle: {
        background: "oklch(var(--destructive) / 0.1)",
        backdropFilter: "blur(12px)",
      },
      borderStyle: { borderColor: "oklch(var(--destructive) / 0.3)" },
      textStyle: { color: "oklch(var(--destructive))" },
      dotStyle: { background: "oklch(var(--destructive))" },
    },
    unknown: {
      icon: HelpCircle,
      label: "detecting…",
      bgStyle: {
        background: "oklch(var(--muted) / 0.7)",
        backdropFilter: "blur(12px)",
      },
      borderStyle: { borderColor: "oklch(var(--border))" },
      textStyle: { color: "oklch(var(--muted-foreground))" },
      dotStyle: { background: "oklch(var(--muted-foreground))" },
    },
  };

  const {
    icon: Icon,
    label,
    bgStyle,
    borderStyle,
    textStyle,
    dotStyle,
  } = config[postureState];

  return (
    <div
      className="flex items-center gap-3 rounded-2xl px-4 py-3 border transition-all duration-500"
      style={{ ...bgStyle, ...borderStyle }}
    >
      <Icon className="w-5 h-5 flex-shrink-0" style={textStyle} />
      <div className="flex flex-col">
        <span
          className="text-sm font-bold"
          style={{
            ...textStyle,
            fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
            letterSpacing: "-0.02em",
          }}
        >
          {label}
        </span>
        {angle !== null && (
          <span className="text-xs text-muted-foreground">
            neck angle: <span className="font-semibold">{angle}°</span>
          </span>
        )}
      </div>
      {postureState !== "unknown" && (
        <div
          className="ml-auto w-2 h-2 rounded-full animate-pulse"
          style={dotStyle}
        />
      )}
    </div>
  );
}
