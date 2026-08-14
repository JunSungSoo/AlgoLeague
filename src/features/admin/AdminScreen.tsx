"use client";

import { useEffect, useState } from "react";
import {
    Alert,
    Badge,
    Box,
    Grid,
    Heading,
    SimpleGrid,
    Spinner,
    Table,
    Text,
} from "@chakra-ui/react";
import { ShieldCheck } from "lucide-react";
import { authGet } from "@/lib/auth-client";
import { dayjs } from "@/lib/dayjs-config";
import { GradeBadge, PageHeader, Panel, SectionHeader } from "@/components/Primitives";
import { FlexLayout } from "@/components/ui";
import { ProblemReviewSection } from "./ProblemReviewSection";

type Overview = {
    generatedAt: string;
    metrics: {
        published: number;
        inProgress: number;
        reviewRequired: number;
        failureRate24h: number;
    };
    jobs: Array<{
        id: string;
        title: string;
        grade: number;
        state: string;
        blueprint: string;
        model: string;
        score: number | null;
        attempts: number;
        failureReason: string | null;
        updatedAt: string;
    }>;
};
function statePalette(state: string) {
    return state.startsWith("REJECTED")
        ? { bg: "red.50", color: "red.700" }
        : state.includes("REVIEW")
          ? { bg: "orange.50", color: "orange.700" }
          : state === "PUBLISHED"
            ? { bg: "green.50", color: "green.700" }
            : { bg: "blue.50", color: "blue.700" };
}
export default function AdminPage() {
    const [data, setData] = useState<Overview | null>(null);
    const [error, setError] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);
    useEffect(() => {
        let active = true;
        void authGet<Overview>("/api/admin/overview")
            .then((result) => {
                if (active) setData(result);
            })
            .catch((value) => {
                if (active)
                    setError(
                        value instanceof Error ? value.message : "운영 현황을 불러오지 못했습니다.",
                    );
            });
        return () => {
            active = false;
        };
    }, [refreshKey]);
    return (
        <Box
            maxW="1390px"
            mx="auto"
            px={{ base: "20px", md: "42px" }}
            py={{ base: "25px", md: "34px" }}
            pb="60px"
        >
            <PageHeader
                eyebrow="OPERATIONS CONTROL"
                title="문제 생성 운영"
                action={
                    data && (
                        <GradeBadge subtle>
                            DB 기준 · {dayjs(data.generatedAt).tz().format("HH:mm")}
                        </GradeBadge>
                    )
                }
            />
            {error ? (
                <Alert.Root status="error">
                    <Alert.Indicator />
                    <Alert.Content>
                        <Alert.Description>{error}</Alert.Description>
                    </Alert.Content>
                </Alert.Root>
            ) : !data ? (
                <FlexLayout minH="300px" align="center" justify="center" gap="10px" color="muted">
                    <Spinner size="sm" />
                    <Text>생성 파이프라인 현황을 집계하는 중입니다.</Text>
                </FlexLayout>
            ) : (
                <>
                    <SimpleGrid columns={{ base: 2, lg: 4 }} gap="18px">
                        {[
                            ["게시 문제", data.metrics.published],
                            ["진행 중", data.metrics.inProgress],
                            ["검수 필요", data.metrics.reviewRequired],
                            ["24시간 실패율", `${data.metrics.failureRate24h}%`],
                        ].map(([label, value]) => (
                            <Panel key={label}>
                                <Text fontSize="12px" color="muted">
                                    {label}
                                </Text>
                                <Text fontSize="25px" fontWeight="900">
                                    {value}
                                </Text>
                            </Panel>
                        ))}
                    </SimpleGrid>
                    <ProblemReviewSection
                        onReviewCompleted={() => setRefreshKey((current) => current + 1)}
                    />
                    <FlexLayout justify="space-between" align="end" mt="29px" mb="13px">
                        <Box>
                            <Heading as="h2" fontSize="20px">
                                생성 파이프라인
                            </Heading>
                            <Text color="muted" fontSize="12px" mt="6px">
                                실제 generation_jobs 최근 30건
                            </Text>
                        </Box>
                    </FlexLayout>
                    <Panel p={{ base: "12px", md: "22px" }}>
                        <Table.ScrollArea>
                            <Table.Root minW="900px" size="md">
                                <Table.Header>
                                    <Table.Row>
                                        {[
                                            "작업",
                                            "문제 후보",
                                            "등급",
                                            "청사진",
                                            "모델",
                                            "점수",
                                            "시도",
                                            "상태",
                                            "갱신",
                                        ].map((label) => (
                                            <Table.ColumnHeader
                                                key={label}
                                                color="muted"
                                                fontSize="11px"
                                            >
                                                {label}
                                            </Table.ColumnHeader>
                                        ))}
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {data.jobs.map((job) => (
                                        <Table.Row key={job.id}>
                                            <Table.Cell fontWeight="800" title={job.id}>
                                                {job.id.slice(0, 8)}
                                            </Table.Cell>
                                            <Table.Cell maxW="240px">
                                                {job.title}
                                                {job.failureReason && (
                                                    <Text color="red.600" fontSize="10px" mt="3px">
                                                        {job.failureReason}
                                                    </Text>
                                                )}
                                            </Table.Cell>
                                            <Table.Cell>{job.grade}급</Table.Cell>
                                            <Table.Cell>{job.blueprint}</Table.Cell>
                                            <Table.Cell>{job.model}</Table.Cell>
                                            <Table.Cell>{job.score ?? "-"}</Table.Cell>
                                            <Table.Cell>{job.attempts}</Table.Cell>
                                            <Table.Cell>
                                                <Badge {...statePalette(job.state)}>
                                                    {job.state}
                                                </Badge>
                                            </Table.Cell>
                                            <Table.Cell>
                                                {dayjs(job.updatedAt).tz().format("M. D. HH:mm")}
                                            </Table.Cell>
                                        </Table.Row>
                                    ))}
                                </Table.Body>
                            </Table.Root>
                        </Table.ScrollArea>
                        {!data.jobs.length && (
                            <Text py="30px" textAlign="center" color="muted">
                                아직 생성 작업이 없습니다.
                            </Text>
                        )}
                    </Panel>
                </>
            )}
            <SectionHeader title="운영 안전장치" />
            <Grid templateColumns={{ base: "1fr", md: "repeat(3,1fr)" }} gap="18px">
                {[
                    [
                        "9–2급 자동 승인",
                        "전 검증 게이트와 유사도 기준을 통과한 승인 청사진만 게시합니다.",
                    ],
                    [
                        "1급 사람 검수",
                        "독립 풀이 2개, 성능 경계, 저작권 유사도를 운영자가 확인합니다.",
                    ],
                    [
                        "감사 로그",
                        "승인, 폐기, 재실행, 게시 변경은 모두 행위자와 이유를 보존합니다.",
                    ],
                ].map(([title, detail]) => (
                    <Panel key={title}>
                        <FlexLayout align="center" gap="8px" mb="8px">
                            <ShieldCheck size={17} color="#8d5637" />
                            <Text fontWeight="800">{title}</Text>
                        </FlexLayout>
                        <Text color="muted" fontSize="12px" lineHeight="1.6">
                            {detail}
                        </Text>
                    </Panel>
                ))}
            </Grid>
        </Box>
    );
}
