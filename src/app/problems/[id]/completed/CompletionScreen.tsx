"use client";

import NextLink from "next/link";
import { useEffect, useState } from "react";
import {
    Alert,
    Avatar,
    Badge,
    Box,
    Button,
    Flex,
    Grid,
    Heading,
    Link,
    Spinner,
    Text,
} from "@chakra-ui/react";
import {
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock3,
    MessageCircle,
    ThumbsUp,
} from "lucide-react";
import { authGet, type ProgrammingLanguage } from "@/lib/auth-client";
import { dayjs } from "@/lib/dayjs-config";
import { GradeBadge, Panel } from "@/components/Primitives";
import { runtimeLabel } from "@/lib/runtime-versions";
import { ROUTES } from "@/lib/route-paths";

type Sort = "recommended" | "latest" | "comments";
type Answer = {
    id: string;
    nickname: string;
    profileImageUrl: string | null;
    language: string;
    runtimeVersion: string | null;
    sourceCode: string;
    runtimeMs: number | null;
    recommendationCount: number;
    commentCount: number;
    createdAt: string;
};
type Completion = {
    problem: { slug: string; title: string; grade: number };
    submission: Answer & {
        verdict: "AC";
        memoryKb: number | null;
        judgedAt: string | null;
    };
    answers: {
        sort: Sort;
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
        items: Answer[];
    };
};

const SORT_FILTERS: Array<{ value: Sort; label: string }> = [
    { value: "recommended", label: "추천순" },
    { value: "latest", label: "최신순" },
    { value: "comments", label: "댓글순" },
];
const LANGUAGE_LABELS: Record<string, string> = {
    python: "Python",
    java: "Java",
    javascript: "JavaScript",
    cpp: "C++",
};

export function CompletionScreen({
    problemSlug,
    submissionId,
}: {
    problemSlug: string;
    submissionId: string;
}) {
    const [sort, setSort] = useState<Sort>("recommended");
    const [page, setPage] = useState(1);
    const [data, setData] = useState<Completion | null>(null);
    const [error, setError] = useState(submissionId ? "" : "제출 ID가 없습니다.");
    const [loading, setLoading] = useState(Boolean(submissionId));

    useEffect(() => {
        if (!submissionId) return;
        let active = true;
        void authGet<Completion>(
            `/api/submissions/${encodeURIComponent(submissionId)}/completion?sort=${sort}&page=${page}`,
        )
            .then((result) => {
                if (!active) return;
                setData(result);
                setError("");
            })
            .catch((value) => {
                if (!active) return;
                setError(
                    value instanceof Error ? value.message : "완료된 답안을 불러오지 못했습니다.",
                );
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
    }, [page, sort, submissionId]);

    function changeSort(next: Sort) {
        setLoading(true);
        setSort(next);
        setPage(1);
    }

    function changePage(next: number) {
        setLoading(true);
        setPage(next);
    }

    if (loading && !data)
        return (
            <Flex minH="72vh" align="center" justify="center" gap="10px" color="muted">
                <Spinner size="sm" />
                <Text>정답과 다른 풀이를 불러오는 중입니다.</Text>
            </Flex>
        );

    if (error && !data)
        return (
            <Box maxW="900px" mx="auto" px="20px" py="48px">
                <Alert.Root status="error">
                    <Alert.Indicator />
                    <Alert.Content>
                        <Alert.Title>문제풀이 완료 화면을 열 수 없습니다.</Alert.Title>
                        <Alert.Description>{error}</Alert.Description>
                    </Alert.Content>
                </Alert.Root>
                <Link asChild color="accent" fontWeight="800" display="inline-block" mt="18px">
                    <NextLink href={ROUTES.PROBLEM(problemSlug)}>← 문제로 돌아가기</NextLink>
                </Link>
            </Box>
        );

    if (!data) return null;

    return (
        <Box
            maxW="1240px"
            mx="auto"
            px={{ base: "18px", md: "28px" }}
            py={{ base: "28px", md: "42px" }}
        >
            <Flex
                justify="space-between"
                align={{ base: "start", md: "center" }}
                gap="18px"
                direction={{ base: "column", md: "row" }}
                mb="24px"
            >
                <Box>
                    <Flex align="center" gap="8px" color="accent" fontWeight="900" fontSize="12px">
                        <CheckCircle2 size={17} /> 문제풀이 완료
                    </Flex>
                    <Heading
                        as="h1"
                        mt="9px"
                        fontSize={{ base: "25px", md: "32px" }}
                        letterSpacing="-.04em"
                    >
                        {data.problem.title}
                    </Heading>
                </Box>
                <Flex gap="8px" align="center">
                    <GradeBadge>{data.problem.grade}급</GradeBadge>
                    <Button asChild variant="outline" borderColor="line" color="accent">
                        <NextLink href={ROUTES.PROBLEMS}>다른 문제 풀기</NextLink>
                    </Button>
                </Flex>
            </Flex>

            <Panel p="0" overflow="hidden">
                <Flex
                    px={{ base: "18px", md: "24px" }}
                    py="17px"
                    align="center"
                    justify="space-between"
                    gap="12px"
                    wrap="wrap"
                >
                    <Flex align="center" gap="10px">
                        <UserAvatar answer={data.submission} />
                        <Box>
                            <Text fontSize="11px" color="muted" fontWeight="800">
                                내가 제출한 답안
                            </Text>
                            <Text fontWeight="900">{data.submission.nickname}</Text>
                        </Box>
                    </Flex>
                    <Flex gap="7px" wrap="wrap" justify="end">
                        <Badge colorPalette="green" borderRadius="full" px="10px">
                            정답
                        </Badge>
                        <Badge borderRadius="full" px="10px">
                            {LANGUAGE_LABELS[data.submission.language] ?? data.submission.language}
                        </Badge>
                        <Badge borderRadius="full" px="10px">
                            {runtimeLabel(
                                data.submission.language as ProgrammingLanguage,
                                data.submission.runtimeVersion,
                            )}
                        </Badge>
                        {data.submission.runtimeMs !== null && (
                            <Badge borderRadius="full" px="10px">
                                {data.submission.runtimeMs}ms
                            </Badge>
                        )}
                        {data.submission.memoryKb !== null && (
                            <Badge borderRadius="full" px="10px">
                                {Math.round(data.submission.memoryKb / 1024)}MB
                            </Badge>
                        )}
                    </Flex>
                </Flex>
                <Box px={{ base: "18px", md: "24px" }} py="14px" bg="accentSubtle">
                    <Text fontWeight="900" fontSize="12px">
                        제출 검수 결과 · 정답
                    </Text>
                    <Text mt="4px" color="muted" fontSize="12px">
                        모든 공개·비공개 테스트를 통과했습니다.
                        {data.submission.runtimeMs !== null
                            ? ` 실행 시간 ${data.submission.runtimeMs}ms.`
                            : ""}
                        {data.submission.judgedAt
                            ? ` 검수 완료 ${formatDate(data.submission.judgedAt)}.`
                            : ""}
                    </Text>
                </Box>
                <Box
                    as="pre"
                    m="0"
                    minH={{ base: "360px", md: "470px" }}
                    maxH="620px"
                    overflow="auto"
                    p={{ base: "20px", md: "28px" }}
                    bg="brand.950"
                    color="#fff3df"
                    fontFamily="mono"
                    fontSize={{ base: "12px", md: "14px" }}
                    lineHeight="1.72"
                    whiteSpace="pre-wrap"
                    tabSize={4}
                >
                    {data.submission.sourceCode}
                </Box>
                <Flex
                    px={{ base: "18px", md: "24px" }}
                    py="14px"
                    gap="18px"
                    color="muted"
                    fontSize="12px"
                >
                    <Stat
                        icon={<ThumbsUp size={14} />}
                        value={data.submission.recommendationCount}
                        label="추천"
                    />
                    <Stat
                        icon={<MessageCircle size={14} />}
                        value={data.submission.commentCount}
                        label="댓글"
                    />
                    <Stat
                        icon={<Clock3 size={14} />}
                        value={formatDate(data.submission.judgedAt ?? data.submission.createdAt)}
                    />
                </Flex>
            </Panel>

            <Flex
                mt="38px"
                mb="15px"
                justify="space-between"
                align={{ base: "start", md: "end" }}
                gap="14px"
                direction={{ base: "column", md: "row" }}
            >
                <Box>
                    <Heading as="h2" fontSize="21px">
                        같은 문제를 풀어낸 답안
                    </Heading>
                    <Text mt="5px" fontSize="12px" color="muted">
                        정답으로 검증된 제출만 표시합니다. 총 {data.answers.total}개
                    </Text>
                </Box>
                <Flex p="4px" borderWidth="1px" borderColor="line" borderRadius="12px" bg="surface">
                    {SORT_FILTERS.map((filter) => (
                        <Button
                            key={filter.value}
                            size="sm"
                            px="16px"
                            bg={sort === filter.value ? "brand.300" : "transparent"}
                            color={sort === filter.value ? "brand.900" : "muted"}
                            onClick={() => changeSort(filter.value)}
                            _hover={{ bg: sort === filter.value ? "brand.300" : "surfaceMuted" }}
                        >
                            {filter.label}
                        </Button>
                    ))}
                </Flex>
            </Flex>

            {error && (
                <Alert.Root status="error" mb="14px">
                    <Alert.Indicator />
                    <Alert.Title>{error}</Alert.Title>
                </Alert.Root>
            )}
            {loading && data && (
                <Flex py="8px" gap="8px" align="center" color="muted" fontSize="12px">
                    <Spinner size="xs" /> 답안을 정렬하는 중입니다.
                </Flex>
            )}
            {data.answers.items.length ? (
                <Grid
                    templateColumns={{
                        base: "1fr",
                        md: "repeat(2,minmax(0,1fr))",
                        lg: "repeat(3,minmax(0,1fr))",
                    }}
                    gap="14px"
                >
                    {data.answers.items.map((answer) => (
                        <AnswerCard key={answer.id} answer={answer} />
                    ))}
                </Grid>
            ) : (
                <Panel textAlign="center" py="46px">
                    <Text fontWeight="800">아직 공개된 다른 정답이 없습니다.</Text>
                    <Text mt="6px" fontSize="12px" color="muted">
                        다른 학습자가 문제를 해결하면 이곳에 답안이 표시됩니다.
                    </Text>
                </Panel>
            )}

            {data.answers.totalPages > 1 && (
                <Flex mt="22px" justify="center" align="center" gap="9px">
                    <Button
                        size="sm"
                        variant="outline"
                        disabled={page <= 1 || loading}
                        onClick={() => changePage(Math.max(1, page - 1))}
                        aria-label="이전 페이지"
                    >
                        <ChevronLeft size={16} />
                    </Button>
                    <Text minW="64px" textAlign="center" fontSize="12px" fontWeight="800">
                        {data.answers.page} / {data.answers.totalPages}
                    </Text>
                    <Button
                        size="sm"
                        variant="outline"
                        disabled={page >= data.answers.totalPages || loading}
                        onClick={() => changePage(Math.min(data.answers.totalPages, page + 1))}
                        aria-label="다음 페이지"
                    >
                        <ChevronRight size={16} />
                    </Button>
                </Flex>
            )}
        </Box>
    );
}

function AnswerCard({ answer }: { answer: Answer }) {
    return (
        <Panel p="0" overflow="hidden" minW="0">
            <Flex px="15px" py="13px" align="center" justify="space-between" gap="10px">
                <Flex align="center" gap="9px" minW="0">
                    <UserAvatar answer={answer} />
                    <Text fontSize="13px" fontWeight="900" truncate>
                        {answer.nickname}
                    </Text>
                </Flex>
                <Badge flex="none" borderRadius="full">
                    {LANGUAGE_LABELS[answer.language] ?? answer.language}
                </Badge>
            </Flex>
            <Box
                as="pre"
                m="0"
                h="168px"
                overflow="hidden"
                p="15px"
                bg="brand.950"
                color="#fff3df"
                fontFamily="mono"
                fontSize="10px"
                lineHeight="1.55"
                whiteSpace="pre-wrap"
                tabSize={4}
            >
                {answer.sourceCode}
            </Box>
            <Flex
                px="15px"
                py="12px"
                justify="space-between"
                gap="10px"
                color="muted"
                fontSize="11px"
            >
                <Flex gap="12px">
                    <Stat icon={<ThumbsUp size={13} />} value={answer.recommendationCount} />
                    <Stat icon={<MessageCircle size={13} />} value={answer.commentCount} />
                </Flex>
                <Text>{formatDate(answer.createdAt)}</Text>
            </Flex>
        </Panel>
    );
}

function UserAvatar({ answer }: { answer: Pick<Answer, "nickname" | "profileImageUrl"> }) {
    return (
        <Avatar.Root size="sm" bg="accentSubtle" color="accent">
            <Avatar.Fallback name={answer.nickname} />
            {answer.profileImageUrl && <Avatar.Image src={answer.profileImageUrl} alt="" />}
        </Avatar.Root>
    );
}

function Stat({
    icon,
    value,
    label,
}: {
    icon: React.ReactNode;
    value: React.ReactNode;
    label?: string;
}) {
    return (
        <Flex align="center" gap="5px">
            {icon}
            <Text>
                {value}
                {label ? ` ${label}` : ""}
            </Text>
        </Flex>
    );
}

function formatDate(value: string) {
    return dayjs(value).tz().format("M월 D일 HH:mm");
}
