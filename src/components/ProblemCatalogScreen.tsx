"use client";

import NextLink from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Flex,
    Grid,
    Heading,
    Input,
    Link,
    NativeSelect,
    Spinner,
    Text,
    VStack,
} from "@chakra-ui/react";
import { ArrowRight, Check, LockKeyhole, Search } from "lucide-react";
import { authGet } from "@/lib/auth-client";
import { sortProblemCatalog, type GradeSortDirection } from "@/lib/problem-catalog";
import { ROUTES } from "@/lib/route-paths";
import { GradeBadge, PageHeader, Panel } from "@/components/Primitives";
import { useLocale } from "@/components/LocaleProvider";

type ProblemItem = {
    slug: string;
    title: string;
    grade: number;
    timeLimitMs: number;
    publishedAt: string | null;
    solved: boolean;
    accessible: boolean;
    solvedSubmissionId?: string | null;
    acceptanceRate: number | null;
    lastSubmittedAt?: string;
    submissionCount?: number;
};
type ProblemCatalog = {
    userGrade: number;
    accessibleRange: { from: number; to: number };
    canAccessAllGrades?: boolean;
    items: ProblemItem[];
};
type MyProblemTab = "all" | "in-progress" | "completed";

export function ProblemCatalogScreen({
    endpoint,
    defaultGrade = "all",
}: {
    endpoint: string;
    defaultGrade?: "mine" | "all";
}) {
    const [data, setData] = useState<ProblemCatalog | null>(null);
    const [error, setError] = useState("");
    const [query, setQuery] = useState("");
    const [grade, setGrade] = useState("");
    const [status, setStatus] = useState("all");
    const [gradeSort, setGradeSort] = useState<GradeSortDirection>("desc");
    const [myProblemTab, setMyProblemTab] = useState<MyProblemTab>("all");
    const { t } = useLocale();
    const isMyProblems = endpoint === "/api/my-problems";
    useEffect(() => {
        let active = true;
        void authGet<ProblemCatalog>(endpoint)
            .then((result) => {
                if (active) {
                    setData(result);
                    setGrade(
                        defaultGrade === "mine" && !result.canAccessAllGrades
                            ? String(result.userGrade)
                            : "all",
                    );
                }
            })
            .catch((value) => {
                if (active)
                    setError(
                        value instanceof Error ? value.message : "문제 목록을 불러오지 못했습니다.",
                    );
            });
        return () => {
            active = false;
        };
    }, [defaultGrade, endpoint]);
    const items = useMemo(() => {
        if (!data) return [];
        const filtered = data.items.filter((problem) => {
            const keyword = query.trim().toLocaleLowerCase();
            const matchesQuery = !keyword || problem.title.toLocaleLowerCase().includes(keyword);
            const matchesGrade = grade === "all" || problem.grade === Number(grade);
            const matchesStatus =
                status === "all" || (status === "solved" ? problem.solved : !problem.solved);
            const matchesTab =
                endpoint !== "/api/my-problems" ||
                myProblemTab === "all" ||
                (myProblemTab === "completed" ? problem.solved : !problem.solved);
            return matchesQuery && matchesGrade && matchesStatus && matchesTab;
        });
        return sortProblemCatalog(filtered, data.userGrade, gradeSort);
    }, [data, endpoint, grade, gradeSort, myProblemTab, query, status]);
    return (
        <Box
            maxW="1390px"
            mx="auto"
            px={{ base: "20px", md: "42px" }}
            py={{ base: "25px", md: "34px" }}
            pb="60px"
        >
            <PageHeader
                eyebrow={t(isMyProblems ? "catalog.myEyebrow" : "catalog.eyebrow")}
                title={t(isMyProblems ? "catalog.myTitle" : "catalog.title")}
                action={
                    data && (
                        <GradeBadge subtle>
                            {isMyProblems
                                ? t("catalog.submittedCount", { count: data.items.length })
                                : data.canAccessAllGrades
                                  ? t("catalog.adminAccess")
                                  : t("catalog.gradeAccess", { grade: data.accessibleRange.to })}
                        </GradeBadge>
                    )
                }
            />
            <Text color="muted">
                {t(isMyProblems ? "catalog.myDescription" : "catalog.description")}
            </Text>
            <Box w={{ base: "full", md: "802px" }} maxW="full">
                {isMyProblems && (
                    <Flex gap="6px" mt="18px">
                        {(
                            [
                                ["all", t("catalog.tabAll")],
                                ["in-progress", t("catalog.tabInProgress")],
                                ["completed", t("catalog.tabCompleted")],
                            ] as const
                        ).map(([value, label]) => (
                            <Button
                                key={value}
                                variant="ghost"
                                borderRadius="9px"
                                bg={myProblemTab === value ? "accentSubtle" : "transparent"}
                                color={myProblemTab === value ? "accent" : "muted"}
                                onClick={() => setMyProblemTab(value)}
                            >
                                {label}
                            </Button>
                        ))}
                    </Flex>
                )}
                <Flex gap="9px" my="18px" wrap="wrap">
                    <Box position="relative" flex={{ base: "1 1 100%", md: "0 0 320px" }}>
                        <Search
                            size={16}
                            style={{
                                position: "absolute",
                                left: 13,
                                top: 13,
                                color: "currentColor",
                                zIndex: 1,
                            }}
                        />
                        <Input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            pl="38px"
                            bg="surface"
                            borderColor="line"
                            placeholder={t("catalog.searchPlaceholder")}
                            aria-label={t("common.search")}
                        />
                    </Box>
                    <NativeSelect.Root w={{ base: "full", sm: "150px" }} flex={{ md: "0 0 150px" }}>
                        <NativeSelect.Field
                            value={grade}
                            onChange={(event) => setGrade(event.target.value)}
                            bg="surface"
                            borderColor="line"
                            aria-label={t("common.grade")}
                        >
                            <option value="all">{t("catalog.allGrades")}</option>
                            {[9, 8, 7, 6, 5, 4, 3, 2, 1].map((value) => (
                                <option value={value} key={value}>
                                    {value}급{value === data?.userGrade ? " · 내 등급" : ""}
                                </option>
                            ))}
                        </NativeSelect.Field>
                        <NativeSelect.Indicator />
                    </NativeSelect.Root>
                    <NativeSelect.Root w={{ base: "full", sm: "150px" }} flex={{ md: "0 0 150px" }}>
                        <NativeSelect.Field
                            value={status}
                            onChange={(event) => setStatus(event.target.value)}
                            bg="surface"
                            borderColor="line"
                            aria-label={t("common.status")}
                        >
                            <option value="all">{t("catalog.allStatuses")}</option>
                            <option value="unsolved">{t("catalog.unsolved")}</option>
                            <option value="solved">{t("catalog.solved")}</option>
                        </NativeSelect.Field>
                        <NativeSelect.Indicator />
                    </NativeSelect.Root>
                    <NativeSelect.Root w={{ base: "full", sm: "150px" }} flex={{ md: "0 0 150px" }}>
                        <NativeSelect.Field
                            value={gradeSort}
                            onChange={(event) =>
                                setGradeSort(event.target.value as GradeSortDirection)
                            }
                            bg="surface"
                            borderColor="line"
                            aria-label="급수 정렬"
                        >
                            <option value="desc">{t("common.sortDescending")}</option>
                            <option value="asc">{t("common.sortAscending")}</option>
                        </NativeSelect.Field>
                        <NativeSelect.Indicator />
                    </NativeSelect.Root>
                </Flex>
                {error ? (
                    <Alert.Root status="error">
                        <Alert.Indicator />
                        <Alert.Content>
                            <Alert.Title>{t("common.error")}</Alert.Title>
                            <Alert.Description>{error}</Alert.Description>
                        </Alert.Content>
                    </Alert.Root>
                ) : !data ? (
                    <Flex minH="260px" align="center" justify="center" gap="10px" color="muted">
                        <Spinner size="sm" />
                        <Text>{t("common.loading")}</Text>
                    </Flex>
                ) : items.length ? (
                    <VStack align="stretch" gap="9px" w="full">
                        {items.map((problem) => (
                            <ProblemRow
                                key={problem.slug}
                                problem={problem}
                                isMyProblems={endpoint === "/api/my-problems"}
                            />
                        ))}
                    </VStack>
                ) : (
                    <Panel textAlign="center" py="40px">
                        <Heading fontSize="17px">
                            {endpoint === "/api/my-problems"
                                ? "아직 제출한 문제가 없습니다."
                                : t("catalog.noProblems")}
                        </Heading>
                        <Text mt="7px" color="muted" fontSize="12px">
                            {endpoint === "/api/my-problems"
                                ? t("catalog.myDescription")
                                : "검색어나 필터를 바꿔 보세요."}
                        </Text>
                    </Panel>
                )}
            </Box>
        </Box>
    );
}

function ProblemRow({ problem, isMyProblems }: { problem: ProblemItem; isMyProblems: boolean }) {
    const card = (
        <Grid
            w="full"
            bg="surface"
            borderWidth="1px"
            borderColor="line"
            borderRadius="13px"
            p="17px"
            opacity={problem.accessible ? 1 : 0.58}
            templateColumns={{
                base: "46px minmax(0,1fr) auto",
                md: "52px minmax(0,1fr) 120px 90px 30px",
            }}
            alignItems="center"
            gap="14px"
        >
            <Flex
                w="44px"
                h="44px"
                bg="accentSubtle"
                borderRadius="11px"
                align="center"
                justify="center"
                fontWeight="900"
                color="accent"
            >
                {problem.grade}급
            </Flex>
            <Box>
                <Heading as="h2" fontSize="15px">
                    {problem.title}
                </Heading>
            </Box>
            <Box display={{ base: "none", md: "block" }}>
                <Text fontSize="12px" fontWeight="800">
                    {(problem.timeLimitMs / 1000).toFixed(problem.timeLimitMs % 1000 ? 1 : 0)}초
                </Text>
                <Text fontSize="11px" color="muted">
                    시간 제한
                </Text>
            </Box>
            <Box display={{ base: "none", md: "block" }}>
                <Text fontSize="12px" fontWeight="800">
                    {problem.acceptanceRate == null ? "집계 전" : `${problem.acceptanceRate}%`}
                </Text>
                <Text fontSize="11px" color="muted">
                    정답률
                </Text>
            </Box>
            <Flex color={problem.solved ? "accent" : "muted"}>
                {problem.solved ? (
                    <Check size={18} />
                ) : problem.accessible ? (
                    <ArrowRight size={18} />
                ) : (
                    <LockKeyhole size={17} />
                )}
            </Flex>
        </Grid>
    );
    return problem.accessible ? (
        <Link
            asChild
            display="block"
            w="full"
            _hover={{
                textDecoration: "none",
                borderColor: "accent",
                transform: "translateY(-1px)",
            }}
            transition="all .15s"
        >
            <NextLink
                href={
                    isMyProblems && problem.solved && problem.solvedSubmissionId
                        ? ROUTES.PROBLEM_COMPLETION(problem.slug, problem.solvedSubmissionId)
                        : ROUTES.PROBLEM(problem.slug)
                }
            >
                {card}
            </NextLink>
        </Link>
    ) : (
        <Box w="full" title="현재 등급에서는 아직 접근할 수 없습니다.">
            {card}
        </Box>
    );
}
