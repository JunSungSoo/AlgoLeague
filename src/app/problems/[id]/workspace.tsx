"use client";
import { useEffect, useState } from "react";
import { Box, Button, Flex, NativeSelect, Text, Textarea } from "@chakra-ui/react";
import { Play, Send } from "lucide-react";
import { preferredLanguage } from "@/lib/auth-client";

const starters = {
    python: `import sys\nimport heapq\n\ndef solve():\n    input = sys.stdin.readline\n    # 여기에 풀이를 작성하세요.\n    pass\n\nif __name__ == "__main__":\n    solve()`,
    java: `import java.io.*;\nimport java.util.*;\n\npublic class Main {\n  public static void main(String[] args) throws Exception {\n    // 여기에 풀이를 작성하세요.\n  }\n}`,
    javascript: `const fs = require("node:fs");\nconst input = fs.readFileSync(0, "utf8").trim();\n\n// 여기에 풀이를 작성하세요.\n`,
    cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n  ios::sync_with_stdio(false);\n  cin.tie(nullptr);\n  // 여기에 풀이를 작성하세요.\n}`,
};

export function CodeWorkspace({ problemId }: { problemId: string }) {
    const [language, setLanguage] = useState<keyof typeof starters>("python");
    const [code, setCode] = useState(starters.python);
    const [output, setOutput] = useState("예제를 실행하면 결과가 여기에 표시됩니다.");
    const [running, setRunning] = useState(false);
    useEffect(() => {
        const frame = requestAnimationFrame(() => {
            const saved = preferredLanguage();
            setLanguage(saved);
            setCode(starters[saved]);
        });
        return () => cancelAnimationFrame(frame);
    }, []);
    function switchLanguage(next: keyof typeof starters) {
        setLanguage(next);
        setCode(starters[next]);
        setOutput("언어를 변경했습니다.");
    }
    async function execute(mode: "run" | "submit") {
        setRunning(true);
        setOutput(
            mode === "run" ? "예제를 안전한 샌드박스에서 실행 중…" : "제출을 채점 큐에 등록 중…",
        );
        try {
            const response = await fetch(`/api/problems/${problemId}/${mode}`, {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ language, code }),
                credentials: "include",
            });
            const result = await response.json();
            setOutput(
                response.ok
                    ? `${result.verdict ?? result.status}\n${result.message}`
                    : result.error,
            );
        } catch {
            setOutput("네트워크 연결을 확인한 뒤 다시 시도하세요.");
        } finally {
            setRunning(false);
        }
    }
    return (
        <GridEditor>
            <Flex
                px="18px"
                py="14px"
                borderBottomWidth="1px"
                borderColor="whiteAlpha.200"
                justify="space-between"
                align="center"
            >
                <NativeSelect.Root w="194px">
                    <NativeSelect.Field
                        value={language}
                        onChange={(event) =>
                            switchLanguage(event.target.value as keyof typeof starters)
                        }
                        bg="whiteAlpha.100"
                        color="white"
                        borderColor="whiteAlpha.300"
                    >
                        <option style={{ color: "#34251e" }} value="python">
                            Python 3.14
                        </option>
                        <option style={{ color: "#34251e" }} value="java">
                            Java 25
                        </option>
                        <option style={{ color: "#34251e" }} value="javascript">
                            JavaScript (Node 24)
                        </option>
                        <option style={{ color: "#34251e" }} value="cpp">
                            C++23
                        </option>
                    </NativeSelect.Field>
                    <NativeSelect.Indicator color="white" />
                </NativeSelect.Root>
                <Text fontSize="11px" color="whiteAlpha.600">
                    ● 자동 저장됨
                </Text>
            </Flex>
            <Textarea
                aria-label="코드 편집기"
                spellCheck={false}
                value={code}
                onChange={(event) => setCode(event.target.value)}
                resize="none"
                border="0"
                borderRadius="0"
                outline="0"
                minH="430px"
                h="full"
                bg="brand.950"
                color="#fff3df"
                p="24px"
                fontFamily="mono"
                fontSize="14px"
                lineHeight="1.65"
                _focus={{ boxShadow: "none", border: "0" }}
            />
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
                            disabled={running}
                            onClick={() => execute("submit")}
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
        </GridEditor>
    );
}

function GridEditor({ children }: { children: React.ReactNode }) {
    return (
        <Box
            display="grid"
            gridTemplateRows="auto minmax(430px,1fr) 190px"
            minH={{ base: "720px", xl: "calc(100vh - 74px)" }}
            bg="brand.950"
            color="white"
        >
            {children}
        </Box>
    );
}
