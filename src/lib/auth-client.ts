export type ProgrammingLanguage = "python" | "java" | "javascript" | "cpp";
import type { UserRole } from "@/lib/permissions";
export type AuthUser = {
    id: string;
    username: string;
    name: string;
    phone: string;
    nickname: string;
    address: string | null;
    profileImageUrl: string | null;
    preferredLanguage: ProgrammingLanguage;
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

function sessionExpired(response: Response, path: string) {
    if (response.status === 401 && path !== "/api/auth/login" && typeof window !== "undefined")
        window.dispatchEvent(new Event("algorithm-champions-session-expired"));
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
        sessionExpired(response, path);
        throw new AuthApiError(result.error ?? "요청을 처리하지 못했습니다.", response.status);
    }
    return result as T;
}

export async function authGet<T>(path: string): Promise<T> {
    const response = await fetch(path, { credentials: "include", cache: "no-store" });
    const result = await response.json().catch(() => ({ error: "응답을 처리할 수 없습니다." }));
    if (!response.ok) {
        sessionExpired(response, path);
        throw new AuthApiError(result.error ?? "요청을 처리하지 못했습니다.", response.status);
    }
    return result as T;
}

export function rememberUser(user: AuthUser) {
    localStorage.setItem("algorithm-champions-user", JSON.stringify(user));
    localStorage.setItem("algorithm-champions-preferred-language", user.preferredLanguage);
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
    window.dispatchEvent(new Event("algorithm-champions-auth"));
}
export function preferredLanguage(): ProgrammingLanguage {
    const value = localStorage.getItem("algorithm-champions-preferred-language");
    return value === "java" || value === "javascript" || value === "cpp" ? value : "python";
}
