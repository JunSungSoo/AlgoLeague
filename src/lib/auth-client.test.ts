import { afterEach, describe, expect, it, vi } from "vitest";
import { authGet, authRequest } from "./auth-client";

afterEach(() => vi.unstubAllGlobals());

describe("authentication API client", () => {
    it("uses the same-origin API proxy for login", async () => {
        const fetchMock = vi.fn().mockResolvedValue(
            new Response(JSON.stringify({ ok: true }), {
                status: 200,
                headers: { "content-type": "application/json" },
            }),
        );
        vi.stubGlobal("fetch", fetchMock);
        await authRequest("/api/auth/login", { username: "tester", password: "Password123" });
        expect(fetchMock).toHaveBeenCalledWith(
            "/api/auth/login",
            expect.objectContaining({ method: "POST", credentials: "include" }),
        );
    });
    it("uses the same-origin API proxy for authenticated reads", async () => {
        const fetchMock = vi.fn().mockResolvedValue(
            new Response(JSON.stringify({ user: {} }), {
                status: 200,
                headers: { "content-type": "application/json" },
            }),
        );
        vi.stubGlobal("fetch", fetchMock);
        await authGet("/api/profile");
        expect(fetchMock).toHaveBeenCalledWith(
            "/api/profile",
            expect.objectContaining({ credentials: "include", cache: "no-store" }),
        );
    });
});
