import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Session, UserProfile, UserSettings } from "../backend";
import { useActor } from "./useActor";

// ---- User Profile ----

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not available");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

// ---- Settings ----

export function useGetSettings() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserSettings>({
    queryKey: ["settings"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getSettings();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useUpdateSettings() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: UserSettings) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateSettings(settings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
}

// ---- Sessions ----

export function useGetSortedSessions() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Session[]>({
    queryKey: ["sessions"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getSortedSessions();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useAddSession() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (session: Session) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addSession(session);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });
}
