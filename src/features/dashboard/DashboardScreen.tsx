"use client";

import NextLink from "next/link";
import { useEffect, useState } from "react";
import {
    Alert,
    Badge,
    Box,
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
import { dayjs } from "@/lib/dayjs-config";
import { Eyebrow, Panel, PrimaryLink, SectionHeader } from "@/components/Primitives";
import { AppButton, FlexLayout } from "@/components/ui";
import { dashboardGreeting, relativeActivityTime } from "./dashboard-formatters";
import { DashboardStat, DataCollectionGuide } from "./DashboardWidgets";
import { ROUTES } from "@/lib/route-paths";
import { useLocale } from "@/components/LocaleProvider";
import { translateContent } from "@/lib/i18n";

type DashboardData = {
    generatedAt: string;
    kstDay: string;
    user: { nickname: string; grade: number; verifiedSolves: number; championsEligible: boolean };
    todayProblem: {
        slug: string;
        title: string;
        grade: number;
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
    const { t, locale } = useLocale();
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
                        <Alert.Title>{t("dashboard.errorTitle")}</Alert.Title>
                        <Alert.Description>{error}</Alert.Description>
                    </Alert.Content>
                </Alert.Root>
                <DataCollectionGuide />
            </Box>
        );
    if (!data)
        return (
            <FlexLayout minH="65vh" align="center" justify="center" gap="10px" color="muted">
                <Spinner size="sm" />
                <Text>{t("dashboard.loading")}</Text>
            </FlexLayout>
        );
    const problem = data.todayProblem;
    const ratio = Math.min(100, Math.round((data.progress.current / data.progress.required) * 100));
    const dateLabel = dayjs
        .tz(data.kstDay)
        .locale(locale)
        .format(
            locale === "ko"
                ? "YYYY년 M월 D일 dddd"
                : locale === "ja"
                  ? "YYYY年M月D日 dddd"
                  : "MMM D, YYYY dddd",
        );
    return (
        <Box
            maxW="1390px"
            mx="auto"
            px={{ base: "20px", md: "42px" }}
            py={{ base: "25px", md: "34px" }}
            pb="60px"
        >
            <FlexLayout justify="space-between" align="center" mb="34px" gap="4">
                <Box>
                    <Eyebrow>{dateLabel}</Eyebrow>
                    <Heading
                        as="h1"
                        fontSize={{ base: "26px", md: "32px" }}
                        letterSpacing="-.04em"
                        mt="7px"
                    >
                        {dashboardGreeting(t)}, {data.user.nickname}.
                    </Heading>
                </Box>
                <FlexLayout align="center" gap="10px">
                    <FlexLayout
                        display={{ base: "none", md: "flex" }}
                        align="center"
                        fontSize="13px"
                    >
                        <Box w="8px" h="8px" bg="green.400" borderRadius="full" mr="7px" />
                        {t("dashboard.live")}
                    </FlexLayout>
                    <AppButton
                        variant="outline"
                        bg="surface"
                        borderColor="line"
                        w="40px"
                        h="40px"
                        p="0"
                        aria-label={t("header.notifications")}
                    >
                        <Bell size={17} />
                    </AppButton>
                </FlexLayout>
            </FlexLayout>
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
                        <FlexLayout gap="8px">
                            <Badge
                                borderRadius="full"
                                px="10px"
                                py="6px"
                                bg="brand.300"
                                color="brand.900"
                                fontWeight="800"
                            >
                                {t("dashboard.todayProblem")} · {problem.grade}
                            </Badge>
                            <Badge
                                borderRadius="full"
                                px="10px"
                                py="6px"
                                bg="whiteAlpha.100"
                                color="whiteAlpha.800"
                            >
                                {t("dashboard.autoAssigned")}
                            </Badge>
                        </FlexLayout>
                        <Heading
                            as="h2"
                            fontSize={{ base: "26px", md: "32px" }}
                            maxW="540px"
                            mt="26px"
                            mb="10px"
                            lineHeight="1.25"
                            letterSpacing="-.04em"
                        >
                            {translateContent(locale, problem.title)}
                        </Heading>
                        <FlexLayout
                            position="absolute"
                            bottom="28px"
                            left={{ base: "24px", md: "31px" }}
                            gap="10px"
                            zIndex="1"
                        >
                            <PrimaryLink href={ROUTES.PROBLEM(problem.slug)}>
                                {t("dashboard.solve")} <ArrowRight size={16} />
                            </PrimaryLink>
                            <AppButton
                                asChild
                                bg="whiteAlpha.100"
                                color="white"
                                borderWidth="1px"
                                borderColor="whiteAlpha.200"
                                _hover={{ bg: "whiteAlpha.200" }}
                            >
                                <NextLink href={ROUTES.PROBLEMS}>
                                    {t("dashboard.otherProblems")}
                                </NextLink>
                            </AppButton>
                        </FlexLayout>
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
                            {t("dashboard.noProblem")}
                        </Heading>
                        <Text mt="8px" color="muted" fontSize="13px">
                            {t("dashboard.noProblemDescription")}
                        </Text>
                    </Panel>
                )}
                <Panel display="flex" flexDirection="column" justifyContent="space-between">
                    <Box>
                        <Eyebrow>{t("dashboard.gradeProgress")}</Eyebrow>
                        <FlexLayout
                            w="92px"
                            h="92px"
                            my="14px"
                            borderRadius="full"
                            align="center"
                            justify="center"
                            bg={`conic-gradient(var(--chakra-colors-accent) 0 ${ratio}%, var(--chakra-colors-surface-muted) ${ratio}%)`}
                        >
                            <FlexLayout
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
                            </FlexLayout>
                        </FlexLayout>
                        <Heading as="h2" fontSize="20px">
                            {data.progress.next
                                ? t("dashboard.nextGrade", { grade: data.progress.next })
                                : translateContent(locale, data.progress.label)}
                        </Heading>
                    </Box>
                    <Box>
                        <FlexLayout justify="space-between" fontSize="12px" color="muted" mb="8px">
                            <Text>
                                {t("dashboard.verifiedSolves", { count: data.user.verifiedSolves })}
                            </Text>
                            <Text fontWeight="800" color="ink">
                                {data.progress.current}/{data.progress.required}
                            </Text>
                        </FlexLayout>
                        <Box h="8px" borderRadius="full" bg="surfaceMuted" overflow="hidden">
                            <Box w={`${ratio}%`} h="full" bg="accent" />
                        </Box>
                    </Box>
                </Panel>
            </Grid>
            <SimpleGrid columns={{ base: 1, md: 3 }} gap="18px" mt="18px">
                <DashboardStat
                    label={t("dashboard.streak")}
                    value={t("dashboard.days", { count: data.stats.streakDays })}
                    hint={
                        data.dataAvailability.hasSolvedHistory
                            ? t("dashboard.recordedDays")
                            : t("dashboard.firstSolve")
                    }
                />
                <DashboardStat
                    label={t("dashboard.weeklyAccepted")}
                    value={t("dashboard.problems", { count: data.stats.weeklyAccepted })}
                    hint={t("dashboard.duplicatesExcluded")}
                />
                <DashboardStat
                    label={t("dashboard.myRank", { grade: data.user.grade })}
                    value={t("dashboard.rank", { count: data.stats.gradeRank })}
                    hint={t("dashboard.populationHint", { count: data.stats.gradePopulation })}
                />
            </SimpleGrid>
            <SectionHeader
                title={t("dashboard.recentActivity")}
                href={ROUTES.PROFILE}
                label={t("dashboard.allRecords")}
            />
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
                                <FlexLayout
                                    w="34px"
                                    h="34px"
                                    borderRadius="10px"
                                    bg="accentSubtle"
                                    color="accent"
                                    align="center"
                                    justify="center"
                                >
                                    <ActivityIcon size={16} />
                                </FlexLayout>
                                <Box>
                                    <Text fontSize="13px" fontWeight="800">
                                        {translateContent(locale, item.title)}
                                    </Text>
                                    <Text fontSize="11px" color="muted" mt="4px">
                                        {translateContent(locale, item.detail)}
                                    </Text>
                                </Box>
                                <Text fontSize="11px" color="muted">
                                    {relativeActivityTime(item.occurredAt, t)}
                                </Text>
                            </Grid>
                        );
                    })}
                </VStack>
            ) : (
                <Panel textAlign="center" py="34px">
                    <ClipboardList size={25} />
                    <Heading mt="12px" fontSize="17px">
                        {t("dashboard.noActivity")}
                    </Heading>
                    <Text mt="7px" color="muted" fontSize="12px">
                        {t("dashboard.noActivityDescription")}
                    </Text>
                </Panel>
            )}
            {(!data.dataAvailability.hasPublishedProblem ||
                !data.dataAvailability.hasSolvedHistory) && <DataCollectionGuide />}
        </Box>
    );
}
