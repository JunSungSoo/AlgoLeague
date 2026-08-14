"use client";

import { useEffect, useState } from "react";
import { Alert, Box, NativeSelect, Spinner, Table, Text } from "@chakra-ui/react";
import { authGet } from "@/lib/auth-client";
import { dayjs } from "@/lib/dayjs-config";
import { GradeBadge, PageHeader, Panel } from "@/components/Primitives";
import { FlexLayout } from "@/components/ui";

type Ranking = {
    grade: number;
    generatedAt: string;
    currentUserId: string;
    items: Array<{
        rank: number;
        userId: string;
        nickname: string;
        verifiedSolves: number;
        acceptanceRate: number | null;
        lastActivityAt: string | null;
    }>;
};
export default function RankingPage() {
    const [grade, setGrade] = useState<number | null>(null);
    const [data, setData] = useState<Ranking | null>(null);
    const [error, setError] = useState("");
    useEffect(() => {
        let active = true;
        void authGet<{ grade: number }>("/api/grade-progress")
            .then((result) => {
                if (active) setGrade(result.grade);
            })
            .catch((value) => {
                if (active)
                    setError(
                        value instanceof Error ? value.message : "등급 정보를 불러오지 못했습니다.",
                    );
            });
        return () => {
            active = false;
        };
    }, []);
    useEffect(() => {
        if (!grade) return;
        let active = true;
        void authGet<Ranking>(`/api/rankings/${grade}`)
            .then((result) => {
                if (active) {
                    setData(result);
                    setError("");
                }
            })
            .catch((value) => {
                if (active)
                    setError(
                        value instanceof Error ? value.message : "랭킹을 불러오지 못했습니다.",
                    );
            });
        return () => {
            active = false;
        };
    }, [grade]);
    const currentData = data?.grade === grade ? data : null;
    function changeGrade(next: number) {
        setGrade(next);
        setError("");
    }
    return (
        <Box
            maxW="1390px"
            mx="auto"
            px={{ base: "20px", md: "42px" }}
            py={{ base: "25px", md: "34px" }}
            pb="60px"
        >
            <PageHeader
                eyebrow="GRADE RANKING"
                title={`${grade ?? "-"}급 랭킹`}
                action={
                    <FlexLayout align="center" gap="9px">
                        <NativeSelect.Root w="110px">
                            <NativeSelect.Field
                                aria-label="랭킹 등급"
                                value={grade ?? ""}
                                onChange={(event) => changeGrade(Number(event.target.value))}
                            >
                                {[9, 8, 7, 6, 5, 4, 3, 2, 1].map((value) => (
                                    <option value={value} key={value}>
                                        {value}급
                                    </option>
                                ))}
                            </NativeSelect.Field>
                            <NativeSelect.Indicator />
                        </NativeSelect.Root>
                        {currentData && (
                            <GradeBadge subtle>
                                {relativeTime(currentData.generatedAt)} 집계
                            </GradeBadge>
                        )}
                    </FlexLayout>
                }
            />
            {error ? (
                <Alert.Root status="error">
                    <Alert.Indicator />
                    <Alert.Content>
                        <Alert.Description>{error}</Alert.Description>
                    </Alert.Content>
                </Alert.Root>
            ) : !currentData ? (
                <FlexLayout
                    minH="260px"
                    maxW="850px"
                    align="center"
                    justify="center"
                    gap="10px"
                    color="muted"
                >
                    <Spinner size="sm" />
                    <Text>등급별 순위를 계산하는 중입니다.</Text>
                </FlexLayout>
            ) : (
                <Panel maxW="850px" p="0" overflow="hidden">
                    <Table.ScrollArea>
                        <Table.Root size="md">
                            <Table.Header>
                                <Table.Row>
                                    {["순위", "학습자", "검증 정답", "정답률", "최근 활동"].map(
                                        (label) => (
                                            <Table.ColumnHeader
                                                key={label}
                                                color="muted"
                                                fontSize="11px"
                                            >
                                                {label}
                                            </Table.ColumnHeader>
                                        ),
                                    )}
                                </Table.Row>
                            </Table.Header>
                            <Table.Body>
                                {currentData.items.map((row) => (
                                    <Table.Row
                                        key={row.userId}
                                        bg={
                                            row.userId === currentData.currentUserId
                                                ? "accentSubtle"
                                                : "surface"
                                        }
                                    >
                                        <Table.Cell fontSize="19px" fontWeight="900">
                                            {row.rank}
                                        </Table.Cell>
                                        <Table.Cell fontWeight="800">
                                            {row.nickname}
                                            {row.userId === currentData.currentUserId && " · 나"}
                                        </Table.Cell>
                                        <Table.Cell>{row.verifiedSolves}</Table.Cell>
                                        <Table.Cell>
                                            {row.acceptanceRate == null
                                                ? "집계 전"
                                                : `${row.acceptanceRate}%`}
                                        </Table.Cell>
                                        <Table.Cell>
                                            {row.lastActivityAt
                                                ? relativeTime(row.lastActivityAt)
                                                : "활동 없음"}
                                        </Table.Cell>
                                    </Table.Row>
                                ))}
                            </Table.Body>
                        </Table.Root>
                    </Table.ScrollArea>
                    {!currentData.items.length && (
                        <Text p="30px" textAlign="center" color="muted">
                            이 등급의 학습자가 아직 없습니다.
                        </Text>
                    )}
                </Panel>
            )}
            <Box maxW="850px" mt="18px" p="14px" borderRadius="12px" bg="accentSubtle">
                <Text fontSize="12px">
                    동급 학습자를 검증 정답 수 기준으로 정렬하고 실제 채점 완료 제출에서 정답률과
                    최근 활동을 집계합니다.
                </Text>
            </Box>
        </Box>
    );
}
function relativeTime(value: string) {
    const minutes = Math.max(0, dayjs().diff(dayjs(value), "minute"));
    if (minutes < 1) return "방금";
    return dayjs(value).fromNow();
}
