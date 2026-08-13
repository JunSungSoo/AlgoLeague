import { describe, expect, it } from "vitest";

describe("global loading assets", () => {
    it("cycles the loading dots from one through five", () => {
        const nextDotCount = (current: number) => (current === 5 ? 1 : current + 1);
        const sequence = Array.from({ length: 7 }, (_, index) => index).reduce<number[]>(
            (values) => [...values, nextDotCount(values.at(-1) ?? 1)],
            [1],
        );

        expect(sequence).toEqual([1, 2, 3, 4, 5, 1, 2, 3]);
    });
});
