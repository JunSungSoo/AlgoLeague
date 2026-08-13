"use client";

import NextLink from "next/link";
import { useEffect, useState } from "react";
import {
    Alert,
    Badge,
    Box,
    Button,
    Flex,
    Grid,
    Heading,
    SimpleGrid,
    Spinner,
    Text,
    VStack,
} from "@chakra-ui/react";
import {
    ArrowRight,
    Bell,
    Check,
    ClipboardList,
    Database,
    Diamond,
    TrendingDown,
    TrendingUp,
} from "lucide-react";
import { authGet } from "@/lib/auth-client";
import { Eyebrow, Panel, PrimaryLink, SectionHeader } from "@/components/primitives";

type DashboardData = {
    generatedAt: string;
    kstDay: string;
    user: { nickname: string; grade: number; verifiedSolves: number; championsEligible: boolean };
    todayProblem: {
        slug: string;
        title: string;
        grade: number;
        primaryTag: string;
        secondaryTags: string[];
    } | null;
    progress: { current: number; required: number; label: string; next: number | null };
    stats: {
        streakDays: number;
        weeklyAccepted: number;
        gradeRank: number;
        gradePopulation: number;
    };
    activities: Array<{
        id: string;
        type: "submission" | "grade" | "assignment";
        title: string;
        detail: string;
        occurredAt: string;
    }>;
    dataAvailability: {
        hasPublishedProblem: boolean;
        hasSolvedHistory: boolean;
        hasActivity: boolean;
    };
};

export default function Dashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [error, setError] = useState("");
    useEffect(() => {
        let active = true;
        void authGet<DashboardData>("/api/dashboard")
            .then((result) => {
                if (active) setData(result);
            })
            .catch((value) => {
                if (active)
                    setError(
                        value instanceof Error ? value.message : "홈 데이터를 불러오지 못했습니다.",
                    );
            });
        return () => {
            active = false;
        };
    }, []);
    if (error)
        return (
            <Box maxW="900px" mx="auto" px="20px" py="48px">
                <Alert.Root status="error">
                    <Alert.Indicator />
                    <Alert.Content>
                        <Alert.Title>실제 데이터를 불러오지 못했습니다.</Alert.Title>
                        <Alert.Description>{error}</Alert.Description>
                    </Alert.Content>
                </Alert.Root>
                <CollectionGuide />
            </Box>
        );
    if (!data)
        return (
            <Flex minH="65vh" align="center" justify="center" gap="10px" color="muted">
                <Spinner size="sm" />
                <Text>등급과 오늘의 학습 데이터를 불러오는 중입니다.</Text>
            </Flex>
        );
    const problem = data.todayProblem;
    const ratio = Math.min(100, Math.round((data.progress.current / data.progress.required) * 100));
    const dateLabel = new Intl.DateTimeFormat("ko-KR", {
        dateStyle: "full",
        timeZone: "Asia/Seoul",
    }).format(new Date(`${data.kstDay}T00:00:00+09:00`));
    return (
        <Box
            maxW="1390px"
            mx="auto"
            px={{ base: "20px", md: "42px" }}
            py={{ base: "25px", md: "34px" }}
            pb="60px"
        >
            <Flex justify="space-between" align="center" mb="34px" gap="4">
                <Box>
                    <Eyebrow>{dateLabel}</Eyebrow>
                    <Heading
                        as="h1"
                        fontSize={{ base: "26px", md: "32px" }}
                        letterSpacing="-.04em"
                        mt="7px"
                    >
                        {greeting()}, {data.user.nickname}님.
                    </Heading>
                </Box>
                <Flex align="center" gap="10px">
                    <Flex display={{ base: "none", md: "flex" }} align="center" fontSize="13px">
                        <Box w="8px" h="8px" bg="green.400" borderRadius="full" mr="7px" />
                        실시간 데이터 연결됨
                    </Flex>
                    <Button
                        variant="outline"
                        bg="surface"
                        borderColor="line"
                        w="40px"
                        h="40px"
                        p="0"
                        aria-label="알림"
                    >
                        <Bell size={17} />
                    </Button>
                </Flex>
            </Flex>
            <Grid
                templateColumns={{ base: "1fr", xl: "minmax(0,1.55fr) minmax(280px,.75fr)" }}
                gap="18px"
            >
                {problem ? (
                    <Box
                        minH="288px"
                        position="relative"
                        overflow="hidden"
                        borderRadius="panel"
                        p={{ base: "24px", md: "31px" }}
                        bg="linear-gradient(125deg, #5f3b28 0%, #9b6947 100%)"
                        color="white"
                        _after={{
                            content: '""',
                            position: "absolute",
                            w: "320px",
                            h: "320px",
                            borderRadius: "full",
                            border: "68px solid rgba(255,250,241,.14)",
                            right: "-100px",
                            top: "-150px",
                        }}
                    >
                        <Flex gap="8px">
                            <Badge
                                borderRadius="full"
                                px="10px"
                                py="6px"
                                bg="brand.300"
                                color="brand.900"
                                fontWeight="800"
                            >
                                오늘의 문제 · {problem.grade}급
                            </Badge>
                            <Badge
                                borderRadius="full"
                                px="10px"
                                py="6px"
                                bg="whiteAlpha.100"
                                color="whiteAlpha.800"
                            >
                                자동 배정
                            </Badge>
                        </Flex>
                        <Heading
                            as="h2"
                            fontSize={{ base: "26px", md: "32px" }}
                            maxW="540px"
                            mt="26px"
                            mb="10px"
                            lineHeight="1.25"
                            letterSpacing="-.04em"
                        >
                            {problem.title}
                        </Heading>
                        <Text color="whiteAlpha.700">
                            {[problem.primaryTag, ...problem.secondaryTags].join(" · ")}
                        </Text>
                        <Flex
                            position="absolute"
                            bottom="28px"
                            left={{ base: "24px", md: "31px" }}
                            gap="10px"
                            zIndex="1"
                        >
                            <PrimaryLink href={`/problems/${problem.slug}`}>
                                문제 풀기 <ArrowRight size={16} />
                            </PrimaryLink>
                            <Button
                                asChild
                                bg="whiteAlpha.100"
                                color="white"
                                borderWidth="1px"
                                borderColor="whiteAlpha.200"
                                _hover={{ bg: "whiteAlpha.200" }}
                            >
                                <NextLink href="/problems">다른 문제 보기</NextLink>
                            </Button>
                        </Flex>
                    </Box>
                ) : (
                    <Panel
                        minH="288px"
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="center"
                        textAlign="center"
                    >
                        <Database size={28} />
                        <Heading mt="14px" fontSize="19px">
                            배정 가능한 문제가 없습니다.
                        </Heading>
                        <Text mt="8px" color="muted" fontSize="13px">
                            관리자가 사용자 등급에 맞는 문제를 게시하면 오늘의 문제가 자동
                            배정됩니다.
                        </Text>
                    </Panel>
                )}
                <Panel display="flex" flexDirection="column" justifyContent="space-between">
                    <Box>
                        <Eyebrow>GRADE PROGRESS</Eyebrow>
                        <Flex
                            w="92px"
                            h="92px"
                            my="14px"
                            borderRadius="full"
                            align="center"
                            justify="center"
                            bg={`conic-gradient(var(--chakra-colors-accent) 0 ${ratio}%, var(--chakra-colors-surface-muted) ${ratio}%)`}
                        >
                            <Flex
                                w="70px"
                                h="70px"
                                bg="surface"
                                borderRadius="full"
                                align="center"
                                justify="center"
                                fontSize="20px"
                                fontWeight="900"
                            >
                                {data.user.grade}급
                            </Flex>
                        </Flex>
                        <Heading as="h2" fontSize="20px">
                            {data.progress.next
                                ? `다음은 ${data.progress.next}급`
                                : data.progress.label}
                        </Heading>
                    </Box>
                    <Box>
                        <Flex justify="space-between" fontSize="12px" color="muted" mb="8px">
                            <Text>검증 정답 {data.user.verifiedSolves}문제</Text>
                            <Text fontWeight="800" color="ink">
                                {data.progress.current}/{data.progress.required}
                            </Text>
                        </Flex>
                        <Box h="8px" borderRadius="full" bg="surfaceMuted" overflow="hidden">
                            <Box w={`${ratio}%`} h="full" bg="accent" />
                        </Box>
                    </Box>
                </Panel>
            </Grid>
            <SimpleGrid columns={{ base: 1, md: 3 }} gap="18px" mt="18px">
                <Stat
                    label="연속 학습"
                    value={`${data.stats.streakDays}일`}
                    hint={
                        data.dataAvailability.hasSolvedHistory
                            ? "AC가 기록된 날짜 기준"
                            : "첫 정답부터 집계"
                    }
                />
                <Stat
                    label="이번 주 정답"
                    value={`${data.stats.weeklyAccepted}문제`}
                    hint="중복 문제 제외"
                />
                <Stat
                    label={`${data.user.grade}급 내 순위`}
                    value={`${data.stats.gradeRank}위`}
                    hint={`동급 ${data.stats.gradePopulation}명 · 검증 정답 기준`}
                />
            </SimpleGrid>
            <SectionHeader title="최근 활동" href="/profile" label="전체 기록" />
            {data.activities.length ? (
                <VStack
                    align="stretch"
                    gap="1px"
                    bg="line"
                    borderWidth="1px"
                    borderColor="line"
                    borderRadius="15px"
                    overflow="hidden"
                >
                    {data.activities.map((item) => {
                        const ActivityIcon =
                            item.type === "submission"
                                ? Check
                                : item.type === "grade"
                                  ? item.title.includes("조정")
                                      ? TrendingDown
                                      : TrendingUp
                                  : Diamond;
                        return (
                            <Grid
                                key={item.id}
                                templateColumns="45px minmax(0,1fr) auto"
                                alignItems="center"
                                gap="12px"
                                bg="surface"
                                px="18px"
                                py="15px"
                            >
                                <Flex
                                    w="34px"
                                    h="34px"
                                    borderRadius="10px"
                                    bg="accentSubtle"
                                    color="accent"
                                    align="center"
                                    justify="center"
                                >
                                    <ActivityIcon size={16} />
                                </Flex>
                                <Box>
                                    <Text fontSize="13px" fontWeight="800">
                                        {item.title}
                                    </Text>
                                    <Text fontSize="11px" color="muted" mt="4px">
                                        {item.detail}
                                    </Text>
                                </Box>
                                <Text fontSize="11px" color="muted">
                                    {relativeTime(item.occurredAt)}
                                </Text>
                            </Grid>
                        );
                    })}
                </VStack>
            ) : (
                <Panel textAlign="center" py="34px">
                    <ClipboardList size={25} />
                    <Heading mt="12px" fontSize="17px">
                        아직 활동 기록이 없습니다.
                    </Heading>
                    <Text mt="7px" color="muted" fontSize="12px">
                        오늘의 문제를 제출하면 채점 결과와 학습 기록이 여기에 쌓입니다.
                    </Text>
                </Panel>
            )}
            {(!data.dataAvailability.hasPublishedProblem ||
                !data.dataAvailability.hasSolvedHistory) && <CollectionGuide />}
        </Box>
    );
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
    return (
        <Panel>
            <Text fontSize="12px" color="muted">
                {label}
            </Text>
            <Text fontSize="25px" fontWeight="900">
                {value}
            </Text>
            <Text mt="4px" fontSize="10px" color="muted">
                {hint}
            </Text>
        </Panel>
    );
}
function CollectionGuide() {
    return (
        <Box
            mt="24px"
            p="18px"
            borderWidth="1px"
            borderColor="line"
            borderRadius="15px"
            bg="accentSubtle"
        >
            <Text fontWeight="900" fontSize="13px">
                데이터 수집 방법
            </Text>
            <Text mt="7px" color="muted" fontSize="12px" lineHeight="1.7">
                오늘의 문제는 관리자가 PUBLISHED 상태의 문제를 등록하면 자동 배정됩니다. 최근
                활동·연속 학습·주간 정답은 실제 코드 제출이 채점되어 AC로 확정될 때 수집되며, 승급
                기록은 정책 워커가 grade_events에 기록할 때 표시됩니다.
            </Text>
        </Box>
    );
}
function greeting() {
    const hour = new Date().getHours();
    return hour < 12 ? "좋은 아침이에요" : hour < 18 ? "좋은 오후예요" : "좋은 저녁이에요";
}
function relativeTime(value: string) {
    const elapsed = Date.now() - new Date(value).getTime();
    const minutes = Math.max(0, Math.floor(elapsed / 60_000));
    if (minutes < 1) return "방금";
    if (minutes < 60) return `${minutes}분 전`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}시간 전`;
    return `${Math.floor(hours / 24)}일 전`;
}
