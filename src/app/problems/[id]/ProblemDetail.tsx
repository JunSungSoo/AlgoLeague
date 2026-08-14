"use client";

import NextLink from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Alert,
    Badge,
    Box,
    Flex,
    Grid,
    Heading,
    Link,
    List,
    Spinner,
    Text,
} from "@chakra-ui/react";
import { authGet } from "@/lib/auth-client";
import { startGlobalLoading } from "@/lib/global-loading";
import { ROUTES } from "@/lib/route-paths";
import { CodeWorkspace, type FunctionSampleTest, type FunctionSpec } from "./Workspace";

type Problem = {
    slug: string;
    title: string;
    statement: string;
    inputDescription: string;
    outputDescription: string;
    constraints: string[];
    samples: Array<{ input: string; output: string }>;
    grade: number;
    timeLimitMs: number;
    solved: boolean;
    acceptedSubmissionId: string | null;
    attempts: number;
    submissionLimit: number;
    executionMode: "stdio" | "function";
    functionSpec: FunctionSpec | null;
    sampleTests: FunctionSampleTest[];
};
const Sample = ({ children }: { children: React.ReactNode }) => (
    <Box
        as="pre"
        bg="surfaceMuted"
        borderRadius="12px"
        p="14px"
        fontFamily="mono"
        fontSize="12px"
        lineHeight="1.5"
        whiteSpace="pre-wrap"
        overflowX="auto"
    >
        {children}
    </Box>
);

export function ProblemDetail({ id }: { id: string }) {
    const [problem, setProblem] = useState<Problem | null>(null);
    const [error, setError] = useState("");
    const router = useRouter();
    useEffect(() => {
        let active = true;
        void authGet<{ problem: Problem }>(`/api/problems/${encodeURIComponent(id)}`)
            .then((result) => {
                if (!active) return;
                if (result.problem.solved && result.problem.acceptedSubmissionId) {
                    startGlobalLoading();
                    router.replace(
                        ROUTES.PROBLEM_COMPLETION(
                            result.problem.slug,
                            result.problem.acceptedSubmissionId,
                        ),
                    );
                    return;
                }
                setProblem(result.problem);
            })
            .catch((value) => {
                if (active)
                    setError(
                        value instanceof Error ? value.message : "문제를 불러오지 못했습니다.",
                    );
            });
        return () => {
            active = false;
        };
    }, [id, router]);
    if (error)
        return (
            <Box maxW="900px" mx="auto" px="20px" py="48px">
                <Alert.Root status="error">
                    <Alert.Indicator />
                    <Alert.Content>
                        <Alert.Title>문제 화면을 열 수 없습니다.</Alert.Title>
                        <Alert.Description>{error}</Alert.Description>
                    </Alert.Content>
                </Alert.Root>
                <Link asChild color="accent" fontWeight="800" display="inline-block" mt="18px">
                    <NextLink href={ROUTES.PROBLEMS}>← 문제 목록으로 돌아가기</NextLink>
                </Link>
            </Box>
        );
    if (!problem)
        return (
            <Flex minH="70vh" align="center" justify="center" gap="10px" color="muted">
                <Spinner size="sm" />
                <Text>문제와 예제 데이터를 불러오는 중입니다.</Text>
            </Flex>
        );
    return (
        <Grid
            templateColumns={{ base: "1fr", xl: "minmax(380px,.85fr) minmax(520px,1.15fr)" }}
            minH={{ xl: "calc(100vh - 74px)" }}
            bg="surface"
        >
            <Box
                as="article"
                p={{ base: "24px 20px", md: "27px 34px" }}
                overflowY="auto"
                maxH={{ xl: "calc(100vh - 74px)" }}
                borderRightWidth={{ xl: "1px" }}
                borderColor="line"
            >
                <Link asChild color="accent" fontWeight="800" fontSize="11px" letterSpacing=".1em">
                    <NextLink href={ROUTES.PROBLEMS}>← 문제 목록</NextLink>
                </Link>
                <Flex gap="8px" mt="24px" wrap="wrap">
                    <Badge borderRadius="full" bg="brand.300" color="brand.900" px="10px" py="6px">
                        {problem.grade}급
                    </Badge>
                    <Badge borderRadius="full" px="10px">
                        시간 {problem.timeLimitMs / 1000}초
                    </Badge>
                </Flex>
                <Heading as="h1" fontSize="27px" letterSpacing="-.04em" my="20px">
                    {problem.title}
                </Heading>
                <Text fontSize="14px" lineHeight="1.72" color="muted" whiteSpace="pre-wrap">
                    {problem.statement}
                </Text>
                <Section title="입력">
                    <Text fontSize="14px" lineHeight="1.72" color="muted" whiteSpace="pre-wrap">
                        {problem.inputDescription}
                    </Text>
                </Section>
                <Section title="출력">
                    <Text fontSize="14px" lineHeight="1.72" color="muted" whiteSpace="pre-wrap">
                        {problem.outputDescription}
                    </Text>
                </Section>
                <Section title="제약">
                    <List.Root pl="20px" fontSize="14px" lineHeight="1.72" color="muted">
                        {problem.constraints.map((item) => (
                            <List.Item key={item}>{item}</List.Item>
                        ))}
                    </List.Root>
                </Section>
                {problem.samples.map((sample, index) => (
                    <Box key={`${sample.input}-${index}`}>
                        <Section title={`예제 ${index + 1} 입력`}>
                            <Sample>{sample.input}</Sample>
                        </Section>
                        <Section title={`예제 ${index + 1} 출력`}>
                            <Sample>{sample.output}</Sample>
                        </Section>
                    </Box>
                ))}
                <Box mt="28px" p="14px" borderRadius="12px" bg="accentSubtle">
                    <Text fontSize="12px">
                        효력 제출 {problem.attempts}/{problem.submissionLimit}회
                        {problem.solved ? " · 해결 완료" : ""}
                    </Text>
                </Box>
            </Box>
            <CodeWorkspace
                problemId={problem.slug}
                executionMode={problem.executionMode}
                functionSpec={problem.functionSpec}
                sampleTests={problem.sampleTests}
            />
        </Grid>
    );
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <>
            <Heading as="h2" fontSize="15px" mt="28px" mb="10px">
                {title}
            </Heading>
            {children}
        </>
    );
}
