import { Link, useLocation } from "@tanstack/react-router";
import { Activity, History, Settings } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const path = location.pathname;

  const navItems = [
    { to: "/monitor", icon: Activity, label: "Monitor" },
    { to: "/history", icon: History, label: "History" },
    { to: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header
        className="sticky top-0 z-40 border-b border-border"
        style={{
          background: "oklch(var(--background) / 0.85)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg overflow-hidden flex-shrink-0">
              <img
                src="/assets/generated/app-icon.dim_256x256.png"
                alt="back it up"
                className="w-full h-full object-cover"
              />
            </div>
            <span
              className="wordmark text-xl text-foreground"
              style={{
                fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
                fontWeight: 800,
                letterSpacing: "-0.03em",
              }}
            >
              back it up
            </span>
          </Link>
          <div
            className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
            style={{
              background: "oklch(var(--primary) / 0.12)",
              border: "1px solid oklch(var(--primary) / 0.25)",
            }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: "oklch(var(--primary))" }}
            />
            <span
              className="text-xs font-semibold"
              style={{ color: "oklch(var(--primary))" }}
            >
              active
            </span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-4 pb-24">
        {children}
      </main>

      {/* Bottom navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-border"
        style={{
          background: "oklch(var(--card) / 0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <div className="max-w-lg mx-auto flex">
          {navItems.map(({ to, icon: Icon, label }) => {
            const isActive = path === to;
            return (
              <Link
                key={to}
                to={to}
                className="flex-1 flex flex-col items-center gap-1 py-3 transition-colors relative"
                style={{
                  color: isActive
                    ? "oklch(var(--primary))"
                    : "oklch(var(--muted-foreground))",
                }}
                data-ocid={`nav.${label.toLowerCase()}.link`}
              >
                {isActive && (
                  <span
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                    style={{ background: "oklch(var(--primary))" }}
                  />
                )}
                <Icon
                  className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : "stroke-[1.75]"}`}
                />
                <span
                  className={`text-xs font-medium ${isActive ? "font-semibold" : ""}`}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <footer className="fixed bottom-16 left-0 right-0 pointer-events-none">
        <div className="max-w-lg mx-auto px-4 pb-1 flex justify-center">
          <p className="text-[10px] text-muted-foreground/40 pointer-events-auto">
            © {new Date().getFullYear()} Built with ♥ using{" "}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || "backitup")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-muted-foreground"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
