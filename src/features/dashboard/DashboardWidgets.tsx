import { Box, Text } from "@chakra-ui/react";
import { Panel } from "@/components/Primitives";

export function DashboardStat({
    label,
    value,
    hint,
}: {
    label: string;
    value: string;
    hint: string;
}) {
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

export function DataCollectionGuide() {
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
