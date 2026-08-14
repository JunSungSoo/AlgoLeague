import type { ProgrammingLanguage } from "./auth-client";

export type RuntimeOption = { value: string; label: string; stable?: boolean };

export const RUNTIME_OPTIONS: Record<ProgrammingLanguage, readonly RuntimeOption[]> = {
    javascript: [
        { value: "node24", label: "Node.js 24 LTS", stable: true },
        { value: "node22", label: "Node.js 22 LTS" },
        { value: "node20", label: "Node.js 20" },
        { value: "node18", label: "Node.js 18" },
        { value: "node16", label: "Node.js 16" },
        { value: "node14", label: "Node.js 14" },
    ],
    python: [
        { value: "python3.14", label: "Python 3.14", stable: true },
        { value: "python3.13", label: "Python 3.13" },
        { value: "python3.12", label: "Python 3.12" },
        { value: "python3.11", label: "Python 3.11" },
        { value: "python3.10", label: "Python 3.10" },
        { value: "python3.9", label: "Python 3.9" },
    ],
    java: [
        { value: "java25", label: "Java 25 LTS", stable: true },
        { value: "java21", label: "Java 21 LTS" },
        { value: "java17", label: "Java 17 LTS" },
        { value: "java11", label: "Java 11 LTS" },
        { value: "java8", label: "Java 8 LTS" },
    ],
    cpp: [
        { value: "cpp23-gcc15", label: "C++23 · GCC 15.3", stable: true },
        { value: "cpp20-gcc14", label: "C++20 · GCC 14.4" },
        { value: "cpp17-gcc13", label: "C++17 · GCC 13.4" },
        { value: "cpp14-gcc12", label: "C++14 · GCC 12.5" },
        { value: "cpp11-gcc11", label: "C++11 · GCC 11.5" },
    ],
};

export function defaultRuntime(language: ProgrammingLanguage) {
    return RUNTIME_OPTIONS[language][0]!.value;
}

export function runtimeLabel(language: ProgrammingLanguage, version: string | null | undefined) {
    return RUNTIME_OPTIONS[language].find((option) => option.value === version)?.label ?? version;
}
