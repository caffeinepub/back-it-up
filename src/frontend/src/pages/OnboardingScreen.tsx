import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { BarChart2, Camera, CheckCircle2, Shield } from "lucide-react";
import { useEffect } from "react";

const ONBOARDING_KEY = "backitup_onboarded";

export default function OnboardingScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const done = localStorage.getItem(ONBOARDING_KEY);
    if (done === "true") {
      navigate({ to: "/monitor" });
    }
  }, [navigate]);

  const handleStart = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    navigate({ to: "/monitor" });
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)]">
      {/* Hero */}
      <div
        className="relative w-full rounded-3xl overflow-hidden mb-6"
        style={{ aspectRatio: "4/3" }}
      >
        <img
          src="/assets/generated/onboarding-hero.dim_800x600.png"
          alt="Good posture illustration"
          className="w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, oklch(var(--background)) 0%, oklch(var(--background) / 0.5) 50%, transparent 100%)",
          }}
        />
        <div className="absolute bottom-5 left-5 right-5">
          <h1
            className="text-3xl text-foreground leading-tight"
            style={{
              fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
              fontWeight: 800,
              letterSpacing: "-0.04em",
            }}
          >
            back it up.
          </h1>
          <p
            className="text-sm mt-1"
            style={{ color: "oklch(var(--muted-foreground))" }}
          >
            Real-time posture monitoring using your front camera
          </p>
        </div>
      </div>

      {/* Features */}
      <div className="space-y-2.5 mb-8">
        {[
          {
            icon: Camera,
            title: "Camera Detection",
            desc: "Uses your front camera to analyze neck angle in real time",
          },
          {
            icon: Shield,
            title: "Smart Blocking",
            desc: "Automatically blocks the screen when bad posture is detected",
          },
          {
            icon: CheckCircle2,
            title: "Instant Feedback",
            desc: "Color-coded status badge shows your posture quality live",
          },
          {
            icon: BarChart2,
            title: "Session History",
            desc: "Track your posture improvement over time",
          },
        ].map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="flex items-start gap-3 rounded-2xl p-4 border border-border"
            style={{ background: "oklch(var(--card))" }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: "oklch(var(--primary) / 0.12)" }}
            >
              <Icon
                className="w-4 h-4"
                style={{ color: "oklch(var(--primary))" }}
              />
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">{title}</p>
              <p
                className="text-xs mt-0.5 leading-relaxed"
                style={{ color: "oklch(var(--muted-foreground))" }}
              >
                {desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      <Button
        onClick={handleStart}
        className="w-full h-12 rounded-2xl font-bold text-base"
        style={{
          fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
          letterSpacing: "-0.02em",
        }}
        data-ocid="onboarding.primary_button"
      >
        start monitoring →
      </Button>
    </div>
  );
}
