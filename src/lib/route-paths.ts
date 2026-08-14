export const ROUTES = {
    HOME: "/",
    LOGIN: "/login",
    SIGNUP: "/signup",
    ACCOUNT_PREFIX: "/account/",
    FIND_ID: "/account/find-id",
    RESET_PASSWORD: "/account/reset-password",
    ADMIN: "/admin",
    FORBIDDEN: "/forbidden",
    MY_PROBLEMS: "/my-problems",
    PROBLEMS: "/problems",
    PROFILE: "/profile",
    RANKING: "/ranking",
    PROBLEM: (slug: string) => `/problems/${encodeURIComponent(slug)}`,
    PROBLEM_COMPLETION: (slug: string, submissionId: string) =>
        `/problems/${encodeURIComponent(slug)}/completed?submission=${encodeURIComponent(submissionId)}`,
    LOGIN_WITH_NEXT: (pathname: string) => `/login?next=${encodeURIComponent(pathname)}`,
} as const;

export const PUBLIC_ROUTES = [
    ROUTES.LOGIN,
    ROUTES.SIGNUP,
    ROUTES.FIND_ID,
    ROUTES.RESET_PASSWORD,
] as const;
