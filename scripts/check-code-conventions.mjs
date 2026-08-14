import { readdirSync, readFileSync, statSync } from "node:fs";
import { basename, extname, join } from "node:path";

const SOURCE_ROOT = new URL("../src", import.meta.url).pathname;
const NEXT_RESERVED_FILES = new Set([
    "page.tsx",
    "layout.tsx",
    "not-found.tsx",
    "loading.tsx",
    "error.tsx",
    "global-error.tsx",
    "template.tsx",
    "default.tsx",
]);
const NEXT_RESERVED_EXPORTS = new Set(["metadata", "config"]);
const violations = [];

function collectFiles(directory) {
    return readdirSync(directory).flatMap((entry) => {
        const path = join(directory, entry);
        return statSync(path).isDirectory() ? collectFiles(path) : [path];
    });
}

for (const path of collectFiles(SOURCE_ROOT)) {
    const filename = basename(path);
    if (
        extname(path) === ".tsx" &&
        !filename.includes(".test.") &&
        !NEXT_RESERVED_FILES.has(filename) &&
        !/^[A-Z][A-Za-z0-9]*\.tsx$/.test(filename)
    ) {
        violations.push(`${path}: UI 컴포넌트 파일은 PascalCase.tsx를 사용해야 합니다.`);
    }

    if (!/\.(ts|tsx)$/.test(filename) || filename.includes(".test.")) continue;
    const source = readFileSync(path, "utf8");
    for (const match of source.matchAll(
        /^(?:export\s+)?const\s+([A-Za-z][A-Za-z0-9_]*)\s*(?=[:=])/gm,
    )) {
        const name = match[1];
        if (
            NEXT_RESERVED_EXPORTS.has(name) ||
            /^[A-Z][A-Z0-9_]*$/.test(name) ||
            /^[A-Z][A-Za-z0-9]*$/.test(name)
        )
            continue;
        violations.push(`${path}: 모듈 상수 ${name}은 UPPER_SNAKE_CASE를 사용해야 합니다.`);
    }
}

if (violations.length) {
    console.error(violations.join("\n"));
    process.exitCode = 1;
} else {
    console.log("Code conventions passed.");
}
