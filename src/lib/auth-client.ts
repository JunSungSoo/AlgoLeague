export type ProgrammingLanguage = "python" | "java" | "javascript" | "cpp";
import type { UserRole } from "@/lib/permissions";

export const SESSION_EXPIRED_EVENT = "algorithm-champions-session-expired";

export type AuthUser = {
    id: string;
    username: string;
    name: string;
    phone: string;
    nickname: string;
    address: string | null;
    profileImageUrl: string | null;
    preferredLanguage: ProgrammingLanguage;
    preferredRuntimeVersion: string | null;
    role: UserRole;
    grade: number;
    verifiedSolves: number;
};

export class AuthApiError extends Error {
    constructor(
        message: string,
        public readonly status: number,
    ) {
        super(message);
        this.name = "AuthApiError";
    }
}

export function notifySessionExpired(response: Response, path: string) {
    if (response.status !== 401 || path === "/api/auth/login" || typeof window === "undefined")
        return;

    forgetUser();
    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
}

export async function authRequest<T>(path: string, body: unknown): Promise<T> {
    const response = await fetch(path, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
    });
    const result = await response.json().catch(() => ({ error: "응답을 처리할 수 없습니다." }));
    if (!response.ok) {
        notifySessionExpired(response, path);
        throw new AuthApiError(result.error ?? "요청을 처리하지 못했습니다.", response.status);
    }
    return result as T;
}

export async function authGet<T>(path: string): Promise<T> {
    const response = await fetch(path, { credentials: "include", cache: "no-store" });
    const result = await response.json().catch(() => ({ error: "응답을 처리할 수 없습니다." }));
    if (!response.ok) {
        notifySessionExpired(response, path);
        throw new AuthApiError(result.error ?? "요청을 처리하지 못했습니다.", response.status);
    }
    return result as T;
}

export function rememberUser(user: AuthUser) {
    localStorage.setItem("algorithm-champions-user", JSON.stringify(user));
    localStorage.setItem("algorithm-champions-preferred-language", user.preferredLanguage);
    if (user.preferredRuntimeVersion)
        localStorage.setItem(
            "algorithm-champions-preferred-runtime-version",
            user.preferredRuntimeVersion,
        );
    else localStorage.removeItem("algorithm-champions-preferred-runtime-version");
    window.dispatchEvent(new Event("algorithm-champions-auth"));
}
export function currentUser(): AuthUser | null {
    try {
        const value = localStorage.getItem("algorithm-champions-user");
        return value ? (JSON.parse(value) as AuthUser) : null;
    } catch {
        return null;
    }
}
export function forgetUser() {
    localStorage.removeItem("algorithm-champions-user");
    localStorage.removeItem("algorithm-champions-preferred-language");
    localStorage.removeItem("algorithm-champions-preferred-runtime-version");
    window.dispatchEvent(new Event("algorithm-champions-auth"));
}
export function preferredLanguage(): ProgrammingLanguage {
    const value = localStorage.getItem("algorithm-champions-preferred-language");
    return value === "java" || value === "javascript" || value === "cpp" ? value : "python";
}

export function preferredRuntimeVersion() {
    return localStorage.getItem("algorithm-champions-preferred-runtime-version");
}
