import { describe, expect, it } from "vitest";
import { DICTIONARIES, isAppLocale, SUPPORTED_LOCALES, translate } from "./i18n";

describe("service translations", () => {
    it("keeps every locale dictionary complete", () => {
        const koreanKeys = Object.keys(DICTIONARIES.ko).sort();
        for (const locale of SUPPORTED_LOCALES)
            expect(Object.keys(DICTIONARIES[locale]).sort()).toEqual(koreanKeys);
    });

    it("interpolates dynamic values for every language", () => {
        expect(translate("ko", "account.verifiedSolves", { grade: 9, count: 3 })).toContain("9급");
        expect(translate("en", "account.verifiedSolves", { grade: 9, count: 3 })).toContain(
            "3 verified solves",
        );
        expect(translate("ja", "account.verifiedSolves", { grade: 9, count: 3 })).toContain("9級");
    });

    it("accepts only supported locale values", () => {
        expect(isAppLocale("ko")).toBe(true);
        expect(isAppLocale("en")).toBe(true);
        expect(isAppLocale("ja")).toBe(true);
        expect(isAppLocale("fr")).toBe(false);
    });
});
