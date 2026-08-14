import { Box, Grid, Text } from "@chakra-ui/react";
import { SectionHeader } from "@/components/Primitives";
import { FlexLayout } from "@/components/ui";
import { dayjs } from "@/lib/dayjs-config";
import type { GradeEvent } from "./profile-types";

export function GrowthHistory({ events }: { events: GradeEvent[] }) {
    return (
        <>
            <SectionHeader title="성장 기록" />
            {events.length ? (
                <Grid
                    gap="1px"
                    bg="line"
                    borderWidth="1px"
                    borderColor="line"
                    borderRadius="15px"
                    overflow="hidden"
                >
                    {events.map((event) => (
                        <FlexLayout
                            key={event.id}
                            bg="surface"
                            p="15px 18px"
                            align="center"
                            justify="space-between"
                        >
                            <Box>
                                <Text fontWeight="800" fontSize="13px">
                                    {event.kind === "PROMOTED"
                                        ? `${event.toGrade}급으로 승급`
                                        : event.kind === "DEMOTED"
                                          ? `${event.toGrade}급으로 강등`
                                          : event.kind}
                                </Text>
                                <Text mt="4px" color="muted" fontSize="11px">
                                    {event.fromGrade}급 → {event.toGrade}급 · 검증 정답{" "}
                                    {event.checkpoint}개
                                </Text>
                            </Box>
                            <Text color="muted" fontSize="11px">
                                {dayjs(event.createdAt).tz().format("YYYY. M. D.")}
                            </Text>
                        </FlexLayout>
                    ))}
                </Grid>
            ) : (
                <Box
                    borderWidth="1px"
                    borderStyle="dashed"
                    borderColor="line"
                    p="28px"
                    borderRadius="15px"
                    color="muted"
                    textAlign="center"
                >
                    아직 승급·강등 기록이 없습니다. 문제를 해결하면 실제 성장 기록이 쌓입니다.
                </Box>
            )}
        </>
    );
}
