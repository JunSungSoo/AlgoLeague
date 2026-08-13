import { describe, expect, it } from "vitest";
import { SignJWT } from "jose";
import { NextRequest } from "next/server";
import { proxy } from "./proxy";

const secret = new TextEncoder().encode("development-only-secret-change-me-32chars");
async function session(role: "LEARNER" | "OPERATOR" | "ADMIN" = "LEARNER") {
    return new SignJWT({
        userId: "user-1",
        role,
        scopes: ["problem:read", ...(role !== "LEARNER" ? ["admin:write"] : [])],
    })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("5m")
        .sign(secret);
}

describe("route access proxy", () => {
    it("redirects guests to login and preserves the destination", async () => {
        const response = await proxy(new NextRequest("http://localhost:3000/problems?grade=6"));
        expect(response.status).toBe(307);
        expect(response.headers.get("location")).toBe(
            "http://localhost:3000/login?next=%2Fproblems%3Fgrade%3D6",
        );
    });
    it.each(["/login", "/signup", "/account/find-id", "/account/reset-password"])(
        "allows public authentication page %s",
        async (path) => {
            const response = await proxy(new NextRequest(`http://localhost:3000${path}`));
            expect(response.status).toBe(200);
        },
    );
    it("allows a signed-in user into the service", async () => {
        const token = await session();
        const response = await proxy(
            new NextRequest("http://localhost:3000/problems", {
                headers: { cookie: `ac_session=${token}` },
            }),
        );
        expect(response.status).toBe(200);
    });
    it("redirects an expired session to login", async () => {
        const token = await new SignJWT({
            userId: "user-1",
            role: "LEARNER",
            scopes: ["problem:read"],
        })
            .setProtectedHeader({ alg: "HS256" })
            .setExpirationTime("0s")
            .sign(secret);
        const response = await proxy(
            new NextRequest("http://localhost:3000/ranking", {
                headers: { cookie: `ac_session=${token}` },
            }),
        );
        expect(response.headers.get("location")).toBe(
            "http://localhost:3000/login?next=%2Franking",
        );
    });
    it("redirects a signed-in user away from login", async () => {
        const token = await session();
        const response = await proxy(
            new NextRequest("http://localhost:3000/login", {
                headers: { cookie: `ac_session=${token}` },
            }),
        );
        expect(response.headers.get("location")).toBe("http://localhost:3000/");
    });
    it("blocks a learner from administrator pages", async () => {
        const token = await session();
        const response = await proxy(
            new NextRequest("http://localhost:3000/admin", {
                headers: { cookie: `ac_session=${token}` },
            }),
        );
        expect(response.headers.get("location")).toBe("http://localhost:3000/forbidden");
    });
    it.each(["OPERATOR", "ADMIN"] as const)("allows %s into administrator pages", async (role) => {
        const token = await session(role);
        const response = await proxy(
            new NextRequest("http://localhost:3000/admin", {
                headers: { cookie: `ac_session=${token}` },
            }),
        );
        expect(response.status).toBe(200);
    });
});
