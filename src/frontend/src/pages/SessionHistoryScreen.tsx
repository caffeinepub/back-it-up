import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, History, Inbox, TrendingDown } from "lucide-react";
import { useGetSortedSessions } from "../hooks/useQueries";

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  if (mins < 60) return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  return remMins > 0 ? `${hrs}h ${remMins}m` : `${hrs}h`;
}

function formatDate(timestampNs: bigint): string {
  const ms = Number(timestampNs / BigInt(1_000_000));
  const date = new Date(ms);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(timestampNs: bigint): string {
  const ms = Number(timestampNs / BigInt(1_000_000));
  const date = new Date(ms);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SessionHistoryScreen() {
  const { data: sessions, isLoading, error } = useGetSortedSessions();

  const reversedSessions = sessions ? [...sessions].reverse() : [];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold text-foreground">Session History</h2>
        <p className="text-sm text-muted-foreground">
          Your past posture monitoring sessions
        </p>
      </div>

      {/* Summary stats */}
      {sessions && sessions.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card rounded-2xl p-4 border border-border shadow-xs">
            <div className="flex items-center gap-2 mb-1">
              <History className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground font-medium">
                Total Sessions
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {sessions.length}
            </p>
          </div>
          <div className="bg-card rounded-2xl p-4 border border-border shadow-xs">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground font-medium">
                Avg Bad Posture
              </span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {Math.round(
                sessions.reduce((acc, s) => {
                  const total =
                    Number(s.totalGoodPostureDuration) +
                    Number(s.totalBadPostureDuration);
                  return (
                    acc +
                    (total > 0
                      ? (Number(s.totalBadPostureDuration) / total) * 100
                      : 0)
                  );
                }, 0) / sessions.length,
              )}
              %
            </p>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-card rounded-2xl p-4 border border-border"
            >
              <Skeleton className="h-4 w-32 mb-2 rounded-lg" />
              <Skeleton className="h-3 w-full mb-1 rounded-lg" />
              <Skeleton className="h-3 w-2/3 rounded-lg" />
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-2xl p-4">
          <p className="text-sm text-destructive font-medium">
            Failed to load sessions
          </p>
          <p className="text-xs text-destructive/70 mt-1">{error.message}</p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && reversedSessions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
            <Inbox className="w-8 h-8 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-foreground">No sessions yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Start monitoring your posture to see your history here.
            </p>
          </div>
        </div>
      )}

      {/* Session list */}
      {!isLoading && reversedSessions.length > 0 && (
        <div className="space-y-3">
          {reversedSessions.map((session, idx) => {
            const totalSecs =
              Number(session.totalGoodPostureDuration) +
              Number(session.totalBadPostureDuration);
            const badPct =
              totalSecs > 0
                ? Math.round(
                    (Number(session.totalBadPostureDuration) / totalSecs) * 100,
                  )
                : 0;
            const goodPct = 100 - badPct;
            const sessionKey = `${String(session.timestamp)}-${idx}`;

            return (
              <Card
                key={sessionKey}
                className="rounded-2xl border-border shadow-xs overflow-hidden"
              >
                <CardContent className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {formatDate(session.timestamp)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatTime(session.timestamp)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {formatDuration(totalSecs)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Threshold: {session.threshold}°
                      </p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-success font-medium">
                        Good {goodPct}%
                      </span>
                      <span className="text-destructive font-medium">
                        Bad {badPct}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden flex">
                      <div
                        className="h-full bg-success transition-all duration-500"
                        style={{ width: `${goodPct}%` }}
                      />
                      <div
                        className="h-full bg-destructive transition-all duration-500"
                        style={{ width: `${badPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Duration details */}
                  <div className="flex gap-3 mt-3">
                    <div className="flex-1 bg-success/10 rounded-xl px-3 py-2 border border-success/20">
                      <p className="text-xs text-success font-medium">
                        Good posture
                      </p>
                      <p className="text-sm font-bold text-foreground">
                        {formatDuration(
                          Number(session.totalGoodPostureDuration),
                        )}
                      </p>
                    </div>
                    <div className="flex-1 bg-destructive/10 rounded-xl px-3 py-2 border border-destructive/20">
                      <p className="text-xs text-destructive font-medium">
                        Bad posture
                      </p>
                      <p className="text-sm font-bold text-foreground">
                        {formatDuration(
                          Number(session.totalBadPostureDuration),
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
