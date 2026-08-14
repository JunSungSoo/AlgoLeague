import type { AuthUser, ProgrammingLanguage } from "@/lib/auth-client";

export const PROFILE_LANGUAGES: [ProgrammingLanguage, string][] = [
    ["python", "Python"],
    ["java", "Java"],
    ["javascript", "JavaScript"],
    ["cpp", "C++"],
];

export type ProfileResponse = {
    user: AuthUser;
    nicknameChangedAt: string | null;
    nicknameChangeAvailableAt: string | null;
    canChangeNickname: boolean;
};

export type GradeProgress = {
    grade: number;
    verifiedSolves: number;
    progress: { current: number; required: number; label: string; next: number | null };
    championsEligible: boolean;
    acceptedDates: string[];
    events: GradeEvent[];
};

export type GradeEvent = {
    id: string;
    kind: string;
    fromGrade: number;
    toGrade: number;
    checkpoint: number;
    createdAt: string;
};

export type PasswordFlow = {
    challengeId: string;
    code: string;
    devCode: string;
    verificationToken: string;
    next: string;
    confirm: string;
};

export type ProfileBusy =
    "nickname" | "password-code" | "password-verify" | "password" | "language" | "image" | null;
