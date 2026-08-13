import { describe, expect, it } from "vitest";
import { sortProblemCatalog } from "./problem-catalog";

const problems = [9, 4, 6, 8, 5, 3, 7].map((grade) => ({
    grade,
    accessible: grade >= 5,
    title: `${grade}급`,
}));

describe("problem catalog grade ordering", () => {
    it("shows my grade, accessible grades, then locked grades in descending order", () => {
        expect(sortProblemCatalog(problems, 6, "desc").map((item) => item.grade)).toEqual([
            6, 9, 8, 7, 5, 4, 3,
        ]);
    });
    it("keeps priority groups and reverses grade order when ascending", () => {
        expect(sortProblemCatalog(problems, 6, "asc").map((item) => item.grade)).toEqual([
            6, 5, 7, 8, 9, 3, 4,
        ]);
    });
});
