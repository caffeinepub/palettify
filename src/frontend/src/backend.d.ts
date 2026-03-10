import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type StyleId = bigint;
export interface Artwork {
    title: string;
    artist: string;
}
export interface ArtStyleWithProgress {
    progress?: StyleProgress;
    artStyle: ArtStyle;
    isStudied: boolean;
}
export interface QuizQuestion {
    clue: string;
    correctStyleId: StyleId;
    clueType: string;
    options: Array<QuizOption>;
}
export interface ArtStyle {
    id: StyleId;
    name: string;
    description: string;
    artworks: Array<Artwork>;
    characteristics: Array<string>;
    timePeriod: string;
    notableArtists: Array<string>;
}
export interface StyleProgress {
    attemptsCount: bigint;
    bestScore: bigint;
}
export interface QuizResult {
    correctStyleId: StyleId;
    correct: boolean;
    correctStyleName: string;
}
export interface QuizOption {
    styleId: StyleId;
    styleName: string;
}
export interface UserStats {
    stylesStudied: bigint;
    quizzesTaken: bigint;
    perStyleProgress: Array<[StyleId, StyleProgress]>;
    averageScore: bigint;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addArtStyle(style: ArtStyle): Promise<StyleId>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteArtStyle(id: StyleId): Promise<void>;
    getAllArtStyles(): Promise<Array<ArtStyle>>;
    getAllArtStylesWithProgress(): Promise<Array<ArtStyleWithProgress>>;
    getArtStyle(id: StyleId): Promise<ArtStyle | null>;
    getCallerStats(): Promise<UserStats>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getRandomQuizQuestion(): Promise<QuizQuestion | null>;
    getStudiedStyles(): Promise<Array<StyleId>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getUserStats(user: Principal): Promise<UserStats>;
    isCallerAdmin(): Promise<boolean>;
    markStyleAsStudied(styleId: StyleId): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitQuizAnswer(styleId: StyleId, selectedStyleId: StyleId, score: bigint): Promise<QuizResult>;
    unmarkStyleAsStudied(styleId: StyleId): Promise<void>;
    updateArtStyle(id: StyleId, style: ArtStyle): Promise<void>;
}
