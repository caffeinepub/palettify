import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  ArtStyle,
  ArtStyleWithProgress,
  QuizQuestion,
  QuizResult,
  StyleId,
  UserStats,
} from "../backend.d";
import { useActor } from "./useActor";

export function useAllArtStylesWithProgress() {
  const { actor, isFetching } = useActor();
  return useQuery<ArtStyleWithProgress[]>({
    queryKey: ["artStylesWithProgress"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllArtStylesWithProgress();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30_000,
  });
}

export function useAllArtStyles() {
  const { actor, isFetching } = useActor();
  return useQuery<ArtStyle[]>({
    queryKey: ["artStyles"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllArtStyles();
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });
}

export function useArtStyle(id: StyleId | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<ArtStyle | null>({
    queryKey: ["artStyle", id?.toString()],
    queryFn: async () => {
      if (!actor || id === undefined) return null;
      return actor.getArtStyle(id);
    },
    enabled: !!actor && !isFetching && id !== undefined,
    staleTime: 60_000,
  });
}

export function useCallerStats() {
  const { actor, isFetching } = useActor();
  return useQuery<UserStats | null>({
    queryKey: ["callerStats"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerStats();
    },
    enabled: !!actor && !isFetching,
    staleTime: 15_000,
  });
}

export function useRandomQuizQuestion() {
  const { actor, isFetching } = useActor();
  return useQuery<QuizQuestion | null>({
    queryKey: ["randomQuizQuestion", Date.now()],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getRandomQuizQuestion();
    },
    enabled: !!actor && !isFetching,
    staleTime: 0,
    gcTime: 0,
  });
}

export function useMarkStyleAsStudied() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (styleId: StyleId) => {
      if (!actor) throw new Error("Not connected");
      return actor.markStyleAsStudied(styleId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["artStylesWithProgress"],
      });
      void queryClient.invalidateQueries({ queryKey: ["callerStats"] });
    },
  });
}

export function useUnmarkStyleAsStudied() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (styleId: StyleId) => {
      if (!actor) throw new Error("Not connected");
      return actor.unmarkStyleAsStudied(styleId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["artStylesWithProgress"],
      });
      void queryClient.invalidateQueries({ queryKey: ["callerStats"] });
    },
  });
}

export function useSubmitQuizAnswer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      styleId,
      selectedStyleId,
      score,
    }: {
      styleId: StyleId;
      selectedStyleId: StyleId;
      score: bigint;
    }): Promise<QuizResult> => {
      if (!actor) throw new Error("Not connected");
      return actor.submitQuizAnswer(styleId, selectedStyleId, score);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["callerStats"] });
    },
  });
}
