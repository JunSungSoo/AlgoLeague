import { Box, Grid, Heading, Text } from "@chakra-ui/react";
import { GradeBadge, Panel } from "@/components/Primitives";
import type { AuthUser, ProgrammingLanguage } from "@/lib/auth-client";
import { PROFILE_LANGUAGES, type GradeProgress } from "./profile-types";

export function ProfileSummary({
    progress,
    user,
    language,
}: {
    progress: GradeProgress | null;
    user?: AuthUser;
    language: ProgrammingLanguage;
}) {
    const completed = progress?.progress.current ?? 0;
    const required = progress?.progress.required ?? 1;
    return (
        <Grid
            templateColumns={{ base: "1fr", lg: "minmax(0,1.55fr) minmax(280px,.75fr)" }}
            gap="18px"
        >
            <Panel>
                <GradeBadge>현재 {progress?.grade ?? user?.grade ?? "-"}급</GradeBadge>
                <Heading as="h2" fontSize="20px" mt="18px">
                    누적 정답 {progress?.verifiedSolves ?? user?.verifiedSolves ?? 0}개
                </Heading>
                <Text color="muted" my="10px">
                    {progress
                        ? progress.championsEligible
                            ? progress.progress.label
                            : progress.progress.next
                              ? `다음 ${progress.progress.next}급까지 ${Math.max(0, required - completed)}문제가 남았습니다.`
                              : `리그 참가권까지 ${Math.max(0, required - completed)}문제가 남았습니다.`
                        : "등급 데이터를 불러오는 중입니다."}
                </Text>
                <Box h="8px" borderRadius="full" bg="surfaceMuted">
                    <Box
                        w={`${Math.min(100, Math.round((completed / required) * 100))}%`}
                        h="full"
                        bg="accent"
                        borderRadius="full"
                    />
                </Box>
            </Panel>
            <Panel>
                <Text
                    textTransform="uppercase"
                    letterSpacing=".16em"
                    fontWeight="800"
                    fontSize="10px"
                    color="accent"
                >
                    DEFAULT LANGUAGE
                </Text>
                <Heading as="h2" fontSize="20px" mt="12px">
                    {
                        PROFILE_LANGUAGES.find(
                            ([value]) => value === (user?.preferredLanguage ?? language),
                        )?.[1]
                    }
                </Heading>
                <Text color="muted" fontSize="13px" mt="5px">
                    새 문제를 열 때 먼저 선택됩니다.
                </Text>
            </Panel>
        </Grid>
    );
}
