import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface VerifyResult {
    found: boolean;
    accountName?: string;
    message: string;
    accountNumber?: string;
}
export interface PublicationAccount {
    branch: string;
    dateOfDormancy: string;
    accountName: string;
}
export interface DormantAccount {
    branch: string;
    dateOfDormancy: string;
    accountName: string;
    accountNumber: string;
}
export interface AlreadyActivated {
    id: bigint;
    createdAt: string;
    fullName: string;
    ghanaCardFrontKey: ExternalBlob;
    exportedAt: string;
    extraInfo?: string;
    ghanaCardSelfieKey: ExternalBlob;
    accountNumber: string;
    phoneNumber: string;
    ghanaCardBackKey: ExternalBlob;
}
export interface FollowupRecord {
    id: bigint;
    createdAt: string;
    accountName: string;
    accountNumber: string;
    phoneNumber: string;
}
export interface OnlineReactivation {
    id: bigint;
    status: string;
    activatedAt?: string;
    createdAt: string;
    fullName: string;
    ghanaCardFrontKey: ExternalBlob;
    extraInfo?: string;
    ghanaCardSelfieKey: ExternalBlob;
    accountNumber: string;
    phoneNumber: string;
    ghanaCardBackKey: ExternalBlob;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    clearActivatedAccounts(): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    clearFollowups(): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    clearReactivations(): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    deleteActivatedAccounts(ids: Array<bigint>): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    deleteFollowups(ids: Array<bigint>): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    deleteReactivations(ids: Array<bigint>): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    exportReactivation(id: bigint): Promise<{
        __kind__: "ok";
        ok: AlreadyActivated;
    } | {
        __kind__: "err";
        err: string;
    }>;
    getActivatedAccounts(search: string | null): Promise<Array<AlreadyActivated>>;
    getActivatedData(): Promise<Array<AlreadyActivated>>;
    getCallerUserRole(): Promise<UserRole>;
    getDormantAccounts(): Promise<Array<DormantAccount>>;
    getFollowups(): Promise<Array<FollowupRecord>>;
    getFollowupsData(): Promise<Array<FollowupRecord>>;
    getPendingReactivations(): Promise<Array<OnlineReactivation>>;
    getPendingReactivationsData(): Promise<Array<OnlineReactivation>>;
    getPublicationAccounts(): Promise<Array<PublicationAccount>>;
    isCallerAdmin(): Promise<boolean>;
    seedDormantAccounts(accounts: Array<DormantAccount>): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    submitFollowup(accountNumber: string, phoneNumber: string): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    submitOnlineReactivation(fullName: string, phoneNumber: string, accountNumber: string, extraInfo: string | null, ghanaCardFrontKey: ExternalBlob, ghanaCardBackKey: ExternalBlob, ghanaCardSelfieKey: ExternalBlob): Promise<{
        __kind__: "ok";
        ok: string;
    } | {
        __kind__: "err";
        err: string;
    }>;
    verifyAccount(accountNumber: string): Promise<VerifyResult>;
}
