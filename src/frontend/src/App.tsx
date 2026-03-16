import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import Layout from "./components/Layout";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "./hooks/useQueries";
import LoginScreen from "./pages/LoginScreen";
import MonitorScreen from "./pages/MonitorScreen";
import OnboardingScreen from "./pages/OnboardingScreen";
import ProfileSetupScreen from "./pages/ProfileSetupScreen";
import SessionHistoryScreen from "./pages/SessionHistoryScreen";
import SettingsScreen from "./pages/SettingsScreen";

function AppContent() {
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched,
  } = useGetCallerUserProfile();

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-5">
          <div
            className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin"
            style={{
              borderColor: "oklch(var(--primary) / 0.3)",
              borderTopColor: "oklch(var(--primary))",
            }}
          />
          <p
            className="text-base font-semibold"
            style={{
              fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
              color: "oklch(var(--primary))",
            }}
          >
            back it up
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  const showProfileSetup =
    isAuthenticated && !profileLoading && isFetched && userProfile === null;
  if (showProfileSetup) {
    return <ProfileSetupScreen />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

const rootRoute = createRootRoute({
  component: AppContent,
});

const onboardingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: OnboardingScreen,
});

const monitorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/monitor",
  component: MonitorScreen,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: SettingsScreen,
});

const historyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/history",
  component: SessionHistoryScreen,
});

const routeTree = rootRoute.addChildren([
  onboardingRoute,
  monitorRoute,
  settingsRoute,
  historyRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster richColors position="top-center" />
    </>
  );
}
