import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { useQueryClient } from "@tanstack/react-query";
import { Info, LogOut, Save, Settings, User } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetSettings, useUpdateSettings } from "../hooks/useQueries";
import { useGetCallerUserProfile } from "../hooks/useQueries";

export default function SettingsScreen() {
  const { data: settings, isLoading: settingsLoading } = useGetSettings();
  const { data: userProfile } = useGetCallerUserProfile();
  const { mutateAsync: updateSettings, isPending: isSaving } =
    useUpdateSettings();
  const { clear, identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const [threshold, setThreshold] = useState<number>(10);

  useEffect(() => {
    if (settings) {
      setThreshold(settings.postureThreshold);
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      await updateSettings({ postureThreshold: threshold });
      toast.success("Settings saved!");
    } catch {
      toast.error("Failed to save settings.");
    }
  };

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const getPostureLabel = (val: number) => {
    if (val <= 15) return "Very Strict";
    if (val <= 25) return "Strict";
    if (val <= 35) return "Moderate";
    if (val <= 45) return "Relaxed";
    return "Very Relaxed";
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold text-foreground">Settings</h2>
        <p className="text-sm text-muted-foreground">
          Customize your posture monitoring preferences
        </p>
      </div>

      {/* Profile card */}
      <Card className="rounded-3xl border-border shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Profile</CardTitle>
              <CardDescription className="text-xs">
                {userProfile?.name ?? "Loading…"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-xs text-muted-foreground break-all">
            Principal: {identity?.getPrincipal().toString().slice(0, 20)}…
          </p>
        </CardContent>
      </Card>

      {/* Sensitivity settings */}
      <Card className="rounded-3xl border-border shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Settings className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Posture Sensitivity</CardTitle>
              <CardDescription className="text-xs">
                Adjust how strict the neck angle detection is
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {settingsLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full rounded-full" />
              <Skeleton className="h-8 w-full rounded-xl" />
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">
                  Angle Threshold
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-primary">
                    {threshold}°
                  </span>
                  <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">
                    {getPostureLabel(threshold)}
                  </span>
                </div>
              </div>

              <Slider
                min={10}
                max={60}
                step={1}
                value={[threshold]}
                onValueChange={(val) => setThreshold(val[0])}
                className="w-full"
              />

              <div className="flex justify-between text-xs text-muted-foreground">
                <span>10° (Strict)</span>
                <span>60° (Relaxed)</span>
              </div>

              {/* Info box */}
              <div className="flex items-start gap-2 bg-primary/5 rounded-xl p-3 border border-primary/10">
                <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  A lower threshold means the app will flag bad posture sooner.
                  With amplified 3D detection, start with{" "}
                  <strong>15–20°</strong> for best results.
                </p>
              </div>

              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full h-11 rounded-2xl font-semibold"
              >
                {isSaving ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    Saving…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Save Settings
                  </span>
                )}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Logout */}
      <Card className="rounded-3xl border-border shadow-xs">
        <CardContent className="pt-4">
          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full h-11 rounded-2xl font-semibold text-destructive border-destructive/30 hover:bg-destructive/5"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Log Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
