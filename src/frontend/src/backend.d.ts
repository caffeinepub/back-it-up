import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserSettings {
    postureThreshold: number;
}
export interface Session {
    totalBadPostureDuration: bigint;
    threshold: number;
    totalGoodPostureDuration: bigint;
    timestamp: Time;
}
export type Time = bigint;
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addSession(session: Session): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getSessions(): Promise<Array<Session>>;
    getSettings(): Promise<UserSettings>;
    getSortedSessions(): Promise<Array<Session>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateSettings(newSettings: UserSettings): Promise<void>;
}
