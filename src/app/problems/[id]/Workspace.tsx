"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Dialog, Flex, NativeSelect, Text, Textarea } from "@chakra-ui/react";
import { CheckCircle2, Play, Send, XCircle } from "lucide-react";
import {
    authGet,
    notifySessionExpired,
    preferredLanguage,
    preferredRuntimeVersion,
    type ProgrammingLanguage,
} from "@/lib/auth-client";
import { startGlobalLoading } from "@/lib/global-loading";
import { defaultRuntime, RUNTIME_OPTIONS, runtimeVersionOrDefault } from "@/lib/runtime-versions";
import { ROUTES } from "@/lib/route-paths";
import { showAppErrorToast } from "@/components/AppToast";

const STARTERS = {
    python: `import sys\nimport heapq\n\ndef solve():\n    input = sys.stdin.readline\n    # 여기에 풀이를 작성하세요.\n    pass\n\nif __name__ == "__main__":\n    solve()`,
    java: `import java.io.*;\nimport java.util.*;\n\npublic class Main {\n  public static void main(String[] args) throws Exception {\n    // 여기에 풀이를 작성하세요.\n  }\n}`,
    javascript: `const fs = require("node:fs");\nconst input = fs.readFileSync(0, "utf8").trim();\n\n// 여기에 풀이를 작성하세요.\n`,
    cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n  ios::sync_with_stdio(false);\n  cin.tie(nullptr);\n  // 여기에 풀이를 작성하세요.\n}`,
};

const SUBMISSION_RESULT_MESSAGES: Record<string, string> = {
    WA: "테스트 결과가 정답과 일치하지 않습니다.",
    RE: "코드 실행 중 오류가 발생했습니다.",
    CE: "코드를 컴파일하지 못했습니다.",
    TLE: "실행 시간이 제한을 초과했습니다.",
    OLE: "출력량이 제한을 초과했습니다.",
    SE: "안전 제한으로 실행이 중단되었습니다.",
    IE: "채점 결과를 처리하지 못했습니다.",
};

type FunctionValueType =
    | "integer"
    | "long"
    | "number"
    | "string"
    | "boolean"
    | "integer[]"
    | "long[]"
    | "number[]"
    | "string[]"
    | "boolean[]";

export type FunctionSpec = {
    name: string;
    parameters: Array<{ name: string; type: FunctionValueType }>;
    returnType: FunctionValueType;
};

export type FunctionSampleTest = {
    arguments: Array<string | number | boolean | Array<string | number | boolean>>;
    expected: string | number | boolean | Array<string | number | boolean>;
};

type PreSubmitTest = {
    ordinal: number;
    passed: boolean;
};

type CodeWorkspaceProps = {
    problemId: string;
    executionMode: "stdio" | "function";
    functionSpec: FunctionSpec | null;
    sampleTests: FunctionSampleTest[];
    initialSubmission: {
        language: ProgrammingLanguage;
        runtimeVersion: string;
        sourceCode: string;
    } | null;
};

export function CodeWorkspace({
    problemId,
    executionMode,
    functionSpec,
    sampleTests,
    initialSubmission,
}: CodeWorkspaceProps) {
    const [language, setLanguage] = useState<keyof typeof STARTERS>("python");
    const [runtimeVersion, setRuntimeVersion] = useState(defaultRuntime("python"));
    const [code, setCode] = useState(() => starterFor("python", executionMode, functionSpec));
    const [output, setOutput] = useState("예제를 실행하면 결과가 여기에 표시됩니다.");
    const [running, setRunning] = useState(false);
    const [sampleTestsPassed, setSampleTestsPassed] = useState(false);
    const [preSubmitOpen, setPreSubmitOpen] = useState(false);
    const [preSubmitRunning, setPreSubmitRunning] = useState(false);
    const [preSubmitTests, setPreSubmitTests] = useState<PreSubmitTest[]>([]);
    const [preSubmitPassed, setPreSubmitPassed] = useState(false);
    const router = useRouter();
    useEffect(() => {
        const frame = requestAnimationFrame(() => {
            if (initialSubmission) {
                setLanguage(initialSubmission.language);
                setRuntimeVersion(
                    runtimeVersionOrDefault(
                        initialSubmission.language,
                        initialSubmission.runtimeVersion,
                    ),
                );
                setCode(initialSubmission.sourceCode);
                setOutput(
                    "기존 정답을 불러왔습니다. 코드를 수정해 다시 실행하거나 제출할 수 있습니다.",
                );
                return;
            }
            const saved = preferredLanguage();
            setLanguage(saved);
            setRuntimeVersion(runtimeVersionOrDefault(saved, preferredRuntimeVersion()));
            setCode(starterFor(saved, executionMode, functionSpec));
        });
        return () => cancelAnimationFrame(frame);
    }, [executionMode, functionSpec, initialSubmission]);
    function switchLanguage(next: keyof typeof STARTERS) {
        setLanguage(next);
        setRuntimeVersion(defaultRuntime(next));
        setCode(starterFor(next, executionMode, functionSpec));
        setSampleTestsPassed(false);
        setOutput("언어를 변경했습니다.");
    }
    async function execute(mode: "run" | "submit") {
        if (mode === "submit" && !sampleTestsPassed) return;
        setRunning(true);
        if (mode === "run") setSampleTestsPassed(false);
        setOutput(
            mode === "run" ? "예제를 안전한 샌드박스에서 실행 중…" : "제출을 채점 큐에 등록 중…",
        );
        try {
            const response = await fetch(`/api/problems/${problemId}/${mode}`, {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ language, runtimeVersion, code }),
                credentials: "include",
            });
            notifySessionExpired(response, `/api/problems/${problemId}/${mode}`);
            const result = await response.json();
            const hasJudgeHalt =
                result.verdict === "JH" ||
                (Array.isArray(result.sampleTests) &&
                    result.sampleTests.some(
                        (sample: { verdict?: string }) => sample.verdict === "JH",
                    ));
            const sampleSummary = Array.isArray(result.sampleTests)
                ? result.sampleTests
                      .map(
                          (sample: { ordinal: number; passed: boolean }) =>
                              `Sample Test ${sample.ordinal}: ${sample.passed ? "통과" : "실패"}`,
                      )
                      .join("\n")
                : "";
            if (mode === "run") {
                setSampleTestsPassed(
                    response.ok &&
                        Array.isArray(result.sampleTests) &&
                        result.sampleTests.length > 0 &&
                        result.sampleTests.every((sample: { passed: boolean }) => sample.passed),
                );
            }
            if (hasJudgeHalt) {
                showAppErrorToast(
                    "채점 서버 오류",
                    "채점 환경에 연결되지 않아 실행하지 못했습니다. 잠시 후 다시 시도해 주세요.",
                );
                setOutput(
                    `채점 서버 오류\n${result.message ?? "채점 환경에 연결되지 않았습니다."}${sampleSummary ? `\n${sampleSummary}` : ""}`,
                );
            } else {
                setOutput(
                    response.ok
                        ? `${result.message ?? "테스트 결과를 확인했습니다."}${sampleSummary ? `\n${sampleSummary}` : ""}`
                        : (result.error ?? "요청 처리 중 오류가 발생했습니다."),
                );
            }
            if (mode === "submit" && response.ok && typeof result.id === "string") {
                const verdict = await waitForVerdict(result.id, setOutput);
                if (verdict === "AC") {
                    startGlobalLoading();
                    router.push(ROUTES.PROBLEM_COMPLETION(problemId, result.id));
                }
            }
        } catch {
            showAppErrorToast(
                "문제 실행 오류",
                "문제를 실행하는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
            );
            setOutput("네트워크 연결을 확인한 뒤 다시 시도하세요.");
        } finally {
            setRunning(false);
        }
    }
    async function prepareSubmission() {
        if (!sampleTestsPassed || running || preSubmitRunning) return;
        setPreSubmitOpen(true);
        setPreSubmitRunning(true);
        setPreSubmitTests([]);
        setPreSubmitPassed(false);
        try {
            const response = await fetch(`/api/problems/${problemId}/pre-submit`, {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ language, runtimeVersion, code }),
                credentials: "include",
            });
            notifySessionExpired(response, `/api/problems/${problemId}/pre-submit`);
            const result = await response.json();
            if (!response.ok)
                throw new Error(result.error ?? "제출 전 테스트를 실행하지 못했습니다.");
            setPreSubmitTests(Array.isArray(result.tests) ? result.tests : []);
            setPreSubmitPassed(result.passed === true);
        } catch (error) {
            setPreSubmitOpen(false);
            showAppErrorToast(
                "제출 전 테스트 오류",
                error instanceof Error
                    ? error.message
                    : "제출 전 테스트를 실행하지 못했습니다. 잠시 후 다시 시도해 주세요.",
            );
        } finally {
            setPreSubmitRunning(false);
        }
    }
    function confirmSubmission() {
        if (!preSubmitPassed || preSubmitRunning) return;
        setPreSubmitOpen(false);
        void execute("submit");
    }
    return (
        <GridEditor showSampleTests={executionMode === "function"}>
            <Flex
                px="18px"
                py="14px"
                borderBottomWidth="1px"
                borderColor="whiteAlpha.200"
                justify="space-between"
                align="center"
            >
                <Flex gap="8px" align="center" wrap="wrap">
                    <NativeSelect.Root w="170px">
                        <NativeSelect.Field
                            value={language}
                            onChange={(event) =>
                                switchLanguage(event.target.value as keyof typeof STARTERS)
                            }
                            bg="whiteAlpha.100"
                            color="white"
                            borderColor="whiteAlpha.300"
                        >
                            <option style={{ color: "#34251e" }} value="python">
                                Python
                            </option>
                            <option style={{ color: "#34251e" }} value="java">
                                Java
                            </option>
                            <option style={{ color: "#34251e" }} value="javascript">
                                JavaScript
                            </option>
                            <option style={{ color: "#34251e" }} value="cpp">
                                C++
                            </option>
                        </NativeSelect.Field>
                        <NativeSelect.Indicator color="white" />
                    </NativeSelect.Root>
                    <NativeSelect.Root w="190px">
                        <NativeSelect.Field
                            aria-label="실행 버전"
                            value={runtimeVersion}
                            onChange={(event) => {
                                setRuntimeVersion(event.target.value);
                                setSampleTestsPassed(false);
                                setOutput("실행 버전을 변경했습니다.");
                            }}
                            bg="whiteAlpha.100"
                            color="white"
                            borderColor="whiteAlpha.300"
                        >
                            {RUNTIME_OPTIONS[language].map((option) => (
                                <option
                                    style={{ color: "#34251e" }}
                                    value={option.value}
                                    key={option.value}
                                >
                                    {option.label}
                                    {option.stable ? " · 기본" : ""}
                                </option>
                            ))}
                        </NativeSelect.Field>
                        <NativeSelect.Indicator color="white" />
                    </NativeSelect.Root>
                </Flex>
                <Text fontSize="11px" color="whiteAlpha.600">
                    ● 자동 저장됨
                </Text>
            </Flex>
            <Textarea
                aria-label="코드 편집기"
                spellCheck={false}
                value={code}
                onChange={(event) => {
                    setCode(event.target.value);
                    setSampleTestsPassed(false);
                }}
                resize="none"
                border="0"
                borderRadius="0"
                outline="0"
                minH={executionMode === "function" ? "330px" : "430px"}
                h="full"
                bg="brand.950"
                color="#fff3df"
                p="24px"
                fontFamily="mono"
                fontSize="14px"
                lineHeight="1.65"
                _focus={{ boxShadow: "none", border: "0" }}
            />
            {executionMode === "function" && functionSpec ? (
                <SampleTests
                    language={language}
                    functionSpec={functionSpec}
                    sampleTests={sampleTests.slice(0, 3)}
                />
            ) : null}
            <Box borderTopWidth="1px" borderColor="whiteAlpha.200" p="17px 20px" bg="#1f1713">
                <Flex justify="space-between" align="center">
                    <Text fontWeight="800">콘솔</Text>
                    <Flex gap="8px">
                        <Button
                            disabled={running}
                            onClick={() => execute("run")}
                            bg="whiteAlpha.100"
                            color="white"
                            borderWidth="1px"
                            borderColor="whiteAlpha.200"
                            _hover={{ bg: "whiteAlpha.200" }}
                        >
                            <Play size={15} /> 실행
                        </Button>
                        <Button
                            disabled={running || preSubmitRunning || !sampleTestsPassed}
                            onClick={() => void prepareSubmission()}
                            bg="brand.300"
                            color="brand.900"
                            _hover={{ bg: "brand.100" }}
                        >
                            <Send size={15} /> 제출
                        </Button>
                    </Flex>
                </Flex>
                <Text
                    as="pre"
                    aria-live="polite"
                    mt="10px"
                    fontFamily="mono"
                    fontSize="12px"
                    lineHeight="1.5"
                    color="whiteAlpha.600"
                    whiteSpace="pre-wrap"
                >
                    {output}
                </Text>
            </Box>
            <Dialog.Root
                open={preSubmitOpen}
                onOpenChange={(details) => setPreSubmitOpen(details.open)}
                placement="center"
            >
                <Dialog.Backdrop bg="blackAlpha.800" backdropFilter="blur(4px)" />
                <Dialog.Positioner p={{ base: "16px", md: "24px" }}>
                    <Dialog.Content
                        maxW="460px"
                        bg="surface"
                        borderWidth="1px"
                        borderColor="line"
                        borderRadius="18px"
                        boxShadow="2xl"
                    >
                        <Dialog.Header>
                            <Dialog.Title fontSize="20px">제출 전 테스트</Dialog.Title>
                            <Dialog.Description mt="6px" color="muted" fontSize="13px">
                                모든 테스트를 통과한 뒤 제출할 수 있습니다.
                            </Dialog.Description>
                        </Dialog.Header>
                        <Dialog.Body>
                            {preSubmitRunning ? (
                                <Text color="muted" fontSize="13px">
                                    숨겨진 테스트를 포함해 테스트를 실행 중입니다…
                                </Text>
                            ) : (
                                <Flex direction="column" gap="8px">
                                    {preSubmitTests.map((test) => (
                                        <Flex
                                            key={test.ordinal}
                                            align="center"
                                            justify="space-between"
                                            px="12px"
                                            py="9px"
                                            borderWidth="1px"
                                            borderColor="line"
                                            borderRadius="10px"
                                            bg="surfaceMuted"
                                        >
                                            <Text fontSize="13px" fontWeight="700">
                                                테스트 {test.ordinal}
                                            </Text>
                                            <Flex
                                                align="center"
                                                gap="5px"
                                                color={test.passed ? "green.600" : "red.500"}
                                                fontSize="12px"
                                                fontWeight="800"
                                            >
                                                {test.passed ? (
                                                    <CheckCircle2 size={16} />
                                                ) : (
                                                    <XCircle size={16} />
                                                )}
                                                {test.passed ? "성공" : "실패"}
                                            </Flex>
                                        </Flex>
                                    ))}
                                    {!preSubmitTests.length && (
                                        <Text color="muted" fontSize="13px">
                                            테스트 결과를 확인할 수 없습니다.
                                        </Text>
                                    )}
                                </Flex>
                            )}
                        </Dialog.Body>
                        <Dialog.Footer>
                            <Button variant="ghost" onClick={() => setPreSubmitOpen(false)}>
                                취소
                            </Button>
                            <Button
                                bg="brand.300"
                                color="brand.900"
                                onClick={confirmSubmission}
                                disabled={preSubmitRunning || !preSubmitPassed}
                                _hover={{ bg: "brand.100" }}
                            >
                                확인
                            </Button>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Dialog.Root>
        </GridEditor>
    );
}

function starterFor(
    language: keyof typeof STARTERS,
    executionMode: "stdio" | "function",
    functionSpec: FunctionSpec | null,
) {
    if (executionMode !== "function" || !functionSpec) return STARTERS[language];

    const parameterNames = functionSpec.parameters.map(({ name }) => name).join(", ");
    if (language === "python") {
        return `def ${functionSpec.name}(${parameterNames}):\n    # 여기에 풀이를 작성하세요.\n    pass`;
    }
    if (language === "javascript") {
        return `const ${functionSpec.name} = (${parameterNames}) => {\n    // 여기에 풀이를 작성하세요.\n};`;
    }
    if (language === "java") {
        const parameters = functionSpec.parameters
            .map(({ name, type }) => `${javaType(type)} ${name}`)
            .join(", ");
        return `static ${javaType(functionSpec.returnType)} ${functionSpec.name}(${parameters}) {\n    // 여기에 풀이를 작성하세요.\n}`;
    }
    const parameters = functionSpec.parameters
        .map(({ name, type }) => `${cppType(type)} ${name}`)
        .join(", ");
    return `${cppType(functionSpec.returnType)} ${functionSpec.name}(${parameters}) {\n    // 여기에 풀이를 작성하세요.\n}`;
}

function SampleTests({
    language,
    functionSpec,
    sampleTests,
}: {
    language: keyof typeof STARTERS;
    functionSpec: FunctionSpec;
    sampleTests: FunctionSampleTest[];
}) {
    return (
        <Box borderTopWidth="1px" borderColor="whiteAlpha.200" bg="#171310">
            <Box px="20px" py="10px" bg="whiteAlpha.50" fontSize="13px" fontWeight="800">
                Sample Tests
            </Box>
            <Box
                as="pre"
                px="20px"
                py="14px"
                fontFamily="mono"
                fontSize="12px"
                lineHeight="1.8"
                color="#fff3df"
                whiteSpace="pre-wrap"
                overflowX="auto"
            >
                {sampleTests
                    .map((sample) => formatSampleTest(language, functionSpec.name, sample))
                    .join("\n")}
            </Box>
        </Box>
    );
}

function formatSampleTest(
    language: keyof typeof STARTERS,
    functionName: string,
    sample: FunctionSampleTest,
) {
    const args = sample.arguments.map(formatValue).join(", ");
    const expected = formatValue(sample.expected);
    if (language === "python") return `assert ${functionName}(${args}) == ${expected}`;
    if (language === "java") return `assertEquals(${expected}, ${functionName}(${args}));`;
    if (language === "cpp") return `assert(${functionName}(${args}) == ${expected});`;
    return `Test.assertEquals(${functionName}(${args}), ${expected});`;
}

function formatValue(
    value: FunctionSampleTest["expected"] | FunctionSampleTest["arguments"][number],
) {
    return JSON.stringify(value);
}

function javaType(type: FunctionValueType) {
    const types: Record<FunctionValueType, string> = {
        integer: "int",
        long: "long",
        number: "double",
        string: "String",
        boolean: "boolean",
        "integer[]": "int[]",
        "long[]": "long[]",
        "number[]": "double[]",
        "string[]": "String[]",
        "boolean[]": "boolean[]",
    };
    return types[type];
}

function cppType(type: FunctionValueType) {
    const types: Record<FunctionValueType, string> = {
        integer: "int",
        long: "long long",
        number: "double",
        string: "string",
        boolean: "bool",
        "integer[]": "vector<int>",
        "long[]": "vector<long long>",
        "number[]": "vector<double>",
        "string[]": "vector<string>",
        "boolean[]": "vector<bool>",
    };
    return types[type];
}

async function waitForVerdict(submissionId: string, report: (message: string) => void) {
    for (let attempt = 0; attempt < 120; attempt += 1) {
        await new Promise((resolve) => window.setTimeout(resolve, 750));
        const result = await authGet<{
            submission: { verdict: string; errorMessage: string | null };
        }>(`/api/submissions/${encodeURIComponent(submissionId)}/status`);
        const { verdict, errorMessage } = result.submission;
        if (verdict === "QU" || verdict === "RN") {
            report(verdict === "RN" ? "채점 중…" : "채점 순서를 기다리는 중…");
            continue;
        }
        if (verdict === "AC") {
            report("정답입니다. 완료 화면으로 이동합니다.");
            return verdict;
        }
        if (verdict === "JH") {
            showAppErrorToast(
                "채점 서버 오류",
                "채점 환경에 연결되지 않아 제출을 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.",
            );
            report("채점 서버 오류\n채점 환경에 연결되지 않았습니다.");
            return verdict;
        }
        report(
            SUBMISSION_RESULT_MESSAGES[verdict] ??
                errorMessage ??
                "테스트 결과를 통과하지 못했습니다.",
        );
        return verdict;
    }
    report("채점이 계속 진행 중입니다. 잠시 후 다시 제출 기록을 확인해 주세요.");
    return "TIMEOUT";
}

function GridEditor({
    children,
    showSampleTests,
}: {
    children: React.ReactNode;
    showSampleTests: boolean;
}) {
    return (
        <Box
            display="grid"
            gridTemplateRows={
                showSampleTests
                    ? "auto minmax(330px,1fr) minmax(130px,auto) 190px"
                    : "auto minmax(430px,1fr) 190px"
            }
            minH={{ base: showSampleTests ? "810px" : "720px", xl: "calc(100vh - 74px)" }}
            bg="brand.950"
            color="white"
        >
            {children}
        </Box>
    );
}
