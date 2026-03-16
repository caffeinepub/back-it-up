import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useSaveCallerUserProfile } from "../hooks/useQueries";

export default function ProfileSetupScreen() {
  const [name, setName] = useState("");
  const { mutateAsync: saveProfile, isPending } = useSaveCallerUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      await saveProfile({ name: name.trim() });
      toast.success("Profile saved! Let's go.");
    } catch {
      toast.error("Failed to save profile. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-4 mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{
              background: "oklch(var(--primary) / 0.12)",
              boxShadow: "0 0 24px oklch(var(--primary) / 0.1)",
            }}
          >
            <User
              className="w-8 h-8"
              style={{ color: "oklch(var(--primary))" }}
            />
          </div>
          <div className="text-center">
            <h1
              className="text-3xl text-foreground"
              style={{
                fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
                fontWeight: 800,
                letterSpacing: "-0.04em",
              }}
            >
              welcome!
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Set up your profile to get started with back it up.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-12 rounded-xl"
              autoFocus
              data-ocid="profile.input"
            />
          </div>
          <Button
            type="submit"
            disabled={!name.trim() || isPending}
            className="w-full h-12 rounded-2xl font-bold"
            style={{
              fontFamily: "'Bricolage Grotesque', system-ui, sans-serif",
              letterSpacing: "-0.02em",
            }}
            data-ocid="profile.submit_button"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                saving…
              </span>
            ) : (
              "continue →"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
