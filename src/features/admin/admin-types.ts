export type ReviewSummary = {
    id: string;
    title: string;
    grade: number;
    primaryTag: string;
    secondaryTags: string[];
    mutationScore: number | null;
    duplicateScore: number | null;
    ambiguityScore: number | null;
    model: string;
    createdAt: string;
    updatedAt: string;
    valid: boolean;
};

export type ReviewTest = {
    input: string;
    output: string;
    arguments: unknown[];
    expected: unknown;
};

type ReviewMetadata = {
    id: string;
    state: string;
    model: string;
    blueprintVersion: string;
    promptVersion: string;
    attempts: number;
    createdAt: string;
    updatedAt: string;
};

type ValidProblemReview = ReviewMetadata & {
    valid: true;
    problem: {
        title: string;
        statement: string;
        input: string;
        output: string;
        constraints: string[];
        grade: number;
        primaryTag: string;
        secondaryTags: string[];
        functionSpec: {
            name: string;
            parameters: Array<{ name: string; type: string }>;
            returnType: string;
        };
        samples: ReviewTest[];
        hiddenTests: ReviewTest[];
        explanation: string;
        solutions: Record<"python" | "java" | "javascript" | "cpp", string>;
    };
    report: {
        schema: boolean;
        samples: boolean;
        crossLanguage: boolean;
        mutationScore: number;
        duplicateScore: number;
        ambiguityScore: number;
        failures: string[];
    };
};

type InvalidProblemReview = ReviewMetadata & {
    valid: false;
    validationError: string;
    problem: null;
    report: null;
};

export type ProblemReview = ValidProblemReview | InvalidProblemReview;
