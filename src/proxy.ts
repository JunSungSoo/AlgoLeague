import { jwtVerify } from "jose";
import { NextResponse, type NextRequest } from "next/server";
import { PUBLIC_ROUTES, ROUTES } from "@/lib/route-paths";

const PUBLIC_PATHS = new Set<string>(PUBLIC_ROUTES);
function sessionSecret() {
    return new TextEncoder().encode(
        process.env.SESSION_SECRET ?? "development-only-secret-change-me-32chars",
    );
}
type ProxySession = { userId: string; role: string; scopes: string[] };

async function readSession(request: NextRequest): Promise<ProxySession | false> {
    const token = request.cookies.get("ac_session")?.value;
    if (!token) return false;
    try {
        const { payload } = await jwtVerify(token, sessionSecret());
        return typeof payload.userId === "string" &&
            typeof payload.role === "string" &&
            Array.isArray(payload.scopes) &&
            payload.scopes.every((scope) => typeof scope === "string")
            ? { userId: payload.userId, role: payload.role, scopes: payload.scopes as string[] }
            : false;
    } catch {
        return false;
    }
}

export async function proxy(request: NextRequest) {
    const session = await readSession(request);
    const isPublic = PUBLIC_PATHS.has(request.nextUrl.pathname);
    if (!session && !isPublic) {
        const loginUrl = new URL(ROUTES.LOGIN, request.url);
        loginUrl.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
        const response = NextResponse.redirect(loginUrl);
        response.cookies.delete("ac_session");
        return response;
    }
    if (session && isPublic) return NextResponse.redirect(new URL(ROUTES.HOME, request.url));
    if (
        session &&
        request.nextUrl.pathname.startsWith(ROUTES.ADMIN) &&
        !session.scopes?.includes("admin:write")
    )
        return NextResponse.redirect(new URL(ROUTES.FORBIDDEN, request.url));
    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|apng|jpg|jpeg|gif|webp)$).*)",
    ],
};
