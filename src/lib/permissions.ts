export type UserRole = "LEARNER" | "OPERATOR" | "ADMIN";

export function canManage(role: string | undefined | null) {
    return role === "ADMIN" || role === "OPERATOR";
}
