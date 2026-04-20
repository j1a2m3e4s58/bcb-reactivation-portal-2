import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createActor } from "../backend";
import type {
  PublicationAccount,
  DormantAccount,
  FollowupRecord,
  OnlineReactivation,
  AlreadyActivated,
  VerifyResult,
} from "../backend";
import { ExternalBlob } from "../backend";

export type { PublicationAccount, DormantAccount, FollowupRecord, OnlineReactivation, AlreadyActivated, VerifyResult };
export { ExternalBlob };

// ─── Query Keys ────────────────────────────────────────────────────────────────
export const QUERY_KEYS = {
  publicationAccounts: ["publicationAccounts"],
  dormantAccounts: ["dormantAccounts"],
  followups: ["followups"],
  pendingReactivations: ["pendingReactivations"],
  activatedAccounts: (search?: string | null) => ["activatedAccounts", search ?? null],
  isCallerAdmin: ["isCallerAdmin"],
} as const;

// ─── Shared actor factory ─────────────────────────────────────────────────────
function useBackendActor() {
  return useActor(createActor);
}

// ─── Public hooks ─────────────────────────────────────────────────────────────
export function usePublicationAccounts() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<PublicationAccount[]>({
    queryKey: QUERY_KEYS.publicationAccounts,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPublicationAccounts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useDormantAccounts() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<DormantAccount[]>({
    queryKey: QUERY_KEYS.dormantAccounts,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getDormantAccounts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useVerifyAccount() {
  const { actor } = useBackendActor();
  return useMutation<VerifyResult, Error, string>({
    mutationFn: async (accountNumber: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.verifyAccount(accountNumber);
    },
  });
}

export function useSubmitFollowup() {
  const { actor } = useBackendActor();
  const qc = useQueryClient();
  return useMutation<
    { __kind__: "ok"; ok: string } | { __kind__: "err"; err: string },
    Error,
    { accountNumber: string; phoneNumber: string }
  >({
    mutationFn: async ({ accountNumber, phoneNumber }) => {
      if (!actor) throw new Error("Not connected");
      return actor.submitFollowup(accountNumber, phoneNumber);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.followups });
    },
  });
}

export function useSubmitOnlineReactivation() {
  const { actor } = useBackendActor();
  const qc = useQueryClient();
  return useMutation<
    { __kind__: "ok"; ok: string } | { __kind__: "err"; err: string },
    Error,
    {
      fullName: string;
      phoneNumber: string;
      accountNumber: string;
      extraInfo: string | null;
      ghanaCardFrontKey: ExternalBlob;
      ghanaCardBackKey: ExternalBlob;
      ghanaCardSelfieKey: ExternalBlob;
    }
  >({
    mutationFn: async (params) => {
      if (!actor) throw new Error("Not connected");
      return actor.submitOnlineReactivation(
        params.fullName,
        params.phoneNumber,
        params.accountNumber,
        params.extraInfo,
        params.ghanaCardFrontKey,
        params.ghanaCardBackKey,
        params.ghanaCardSelfieKey
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.pendingReactivations });
    },
  });
}

// ─── Staff hooks ──────────────────────────────────────────────────────────────
export function useFollowups() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<FollowupRecord[]>({
    queryKey: QUERY_KEYS.followups,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFollowups();
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePendingReactivations() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<OnlineReactivation[]>({
    queryKey: QUERY_KEYS.pendingReactivations,
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPendingReactivations();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useActivatedAccounts(search?: string | null) {
  const { actor, isFetching } = useBackendActor();
  return useQuery<AlreadyActivated[]>({
    queryKey: QUERY_KEYS.activatedAccounts(search),
    queryFn: async () => {
      if (!actor) return [];
      return actor.getActivatedAccounts(search ?? null);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useDeleteFollowups() {
  const { actor } = useBackendActor();
  const qc = useQueryClient();
  return useMutation<
    { __kind__: "ok"; ok: string } | { __kind__: "err"; err: string },
    Error,
    bigint[]
  >({
    mutationFn: async (ids) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteFollowups(ids);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.followups }),
  });
}

export function useClearFollowups() {
  const { actor } = useBackendActor();
  const qc = useQueryClient();
  return useMutation<
    { __kind__: "ok"; ok: string } | { __kind__: "err"; err: string },
    Error,
    void
  >({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.clearFollowups();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.followups }),
  });
}

export function useDeleteReactivations() {
  const { actor } = useBackendActor();
  const qc = useQueryClient();
  return useMutation<
    { __kind__: "ok"; ok: string } | { __kind__: "err"; err: string },
    Error,
    bigint[]
  >({
    mutationFn: async (ids) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteReactivations(ids);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.pendingReactivations }),
  });
}

export function useClearReactivations() {
  const { actor } = useBackendActor();
  const qc = useQueryClient();
  return useMutation<
    { __kind__: "ok"; ok: string } | { __kind__: "err"; err: string },
    Error,
    void
  >({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.clearReactivations();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.pendingReactivations }),
  });
}

export function useExportReactivation() {
  const { actor } = useBackendActor();
  const qc = useQueryClient();
  return useMutation<
    { __kind__: "ok"; ok: AlreadyActivated } | { __kind__: "err"; err: string },
    Error,
    bigint
  >({
    mutationFn: async (id) => {
      if (!actor) throw new Error("Not connected");
      return actor.exportReactivation(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.pendingReactivations });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.activatedAccounts() });
    },
  });
}

export function useDeleteActivatedAccounts() {
  const { actor } = useBackendActor();
  const qc = useQueryClient();
  return useMutation<
    { __kind__: "ok"; ok: string } | { __kind__: "err"; err: string },
    Error,
    bigint[]
  >({
    mutationFn: async (ids) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteActivatedAccounts(ids);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.activatedAccounts() }),
  });
}

export function useClearActivatedAccounts() {
  const { actor } = useBackendActor();
  const qc = useQueryClient();
  return useMutation<
    { __kind__: "ok"; ok: string } | { __kind__: "err"; err: string },
    Error,
    void
  >({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.clearActivatedAccounts();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.activatedAccounts() }),
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<boolean>({
    queryKey: QUERY_KEYS.isCallerAdmin,
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

// ─── Helper to unwrap result variant ─────────────────────────────────────────
export function unwrapResult<T>(
  result: { __kind__: "ok"; ok: T } | { __kind__: "err"; err: string }
): T {
  if (result.__kind__ === "err") throw new Error(result.err);
  return result.ok;
}
