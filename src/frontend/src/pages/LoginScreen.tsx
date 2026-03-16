import { Button } from "@/components/ui/button";
import { Activity, History, Settings, Shield } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LoginScreen() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Hero */}
        <div className="flex flex-col items-center gap-6 mb-10">
          <div className="relative">
            <div
              className="w-24 h-24 rounded-3xl overflow-hidden"
              style={{
                boxShadow:
                  "0 0 0 2px oklch(var(--primary) / 0.4), 0 0 40px oklch(var(--primary) / 0.15)",
              }}
            >
              <img
                src="/assets/generated/app-icon.dim_256x256.png"
                alt="back it up"
                className="w-full h-full object-cover"
              />
            </div>
            <div
              className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center"
              style={{
                background: "oklch(var(--primary))",
                boxShadow: "0 0 12px oklch(var(--primary) / 0.5)",
              }}
            >
              <Shield
                className="w-4 h-4"
                style={{ color: "oklch(var(--primary-foreground))" }}
              />
            </div>
          </div>
          <div className="text-center">
            <h1
              className="text-4xl text-foreground"
              style={{
                fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
                fontWeight: 800,
                letterSpacing: "-0.04em",
              }}
            >
              back it up
            </h1>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed max-w-xs">
              Real-time neck posture monitoring — keeps you healthy while you
              scroll.
            </p>
          </div>
        </div>

        {/* Feature list */}
        <div className="w-full max-w-sm space-y-2.5 mb-10">
          {[
            { icon: Activity, text: "Live camera posture detection" },
            { icon: Shield, text: "Blocks screen when posture is bad" },
            { icon: History, text: "Tracks your posture history" },
            { icon: Settings, text: "Adjustable sensitivity threshold" },
          ].map(({ icon: Icon, text }) => (
            <div
              key={text}
              className="flex items-center gap-3 rounded-2xl px-4 py-3 border border-border"
              style={{ background: "oklch(var(--card))" }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "oklch(var(--primary) / 0.1)" }}
              >
                <Icon
                  className="w-4 h-4"
                  style={{ color: "oklch(var(--primary))" }}
                />
              </div>
              <span className="text-sm font-medium text-foreground">
                {text}
              </span>
            </div>
          ))}
        </div>

        {/* Login button */}
        <div className="w-full max-w-sm">
          <Button
            onClick={login}
            disabled={isLoggingIn}
            className="w-full h-12 text-base font-bold rounded-2xl"
            style={{
              fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
              letterSpacing: "-0.02em",
            }}
            data-ocid="login.primary_button"
          >
            {isLoggingIn ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Logging in…
              </span>
            ) : (
              "get started →"
            )}
          </Button>
          <p className="text-center text-xs text-muted-foreground mt-3">
            Secure login via Internet Identity
          </p>
        </div>
      </main>

      <footer className="py-4 text-center">
        <p className="text-xs text-muted-foreground/50">
          © {new Date().getFullYear()} Built with ♥ using{" "}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || "backitup")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
