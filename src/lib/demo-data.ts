export const DEMO_USER = {
    nickname: "알고리즘러",
    grade: 6,
    solved: 12,
    streak: 8,
    rank: 24,
    progress: { current: 3, required: 6, next: 5 },
};

export const DEMO_PROBLEMS = [
    {
        id: "minimum-route",
        title: "별빛 정거장의 최소 비용",
        grade: 6,
        tag: "그래프",
        secondary: "다익스트라",
        time: 35,
        solved: false,
        acceptance: 47,
    },
    {
        id: "balanced-string",
        title: "균형 잡힌 괄호 문자열",
        grade: 7,
        tag: "스택",
        secondary: "문자열",
        time: 20,
        solved: true,
        acceptance: 64,
    },
    {
        id: "island-bridge",
        title: "섬을 잇는 가장 짧은 다리",
        grade: 5,
        tag: "그래프",
        secondary: "최소 신장 트리",
        time: 45,
        solved: false,
        acceptance: 32,
    },
    {
        id: "interval-studio",
        title: "겹치지 않는 촬영 일정",
        grade: 8,
        tag: "그리디",
        secondary: "정렬",
        time: 15,
        solved: true,
        acceptance: 72,
    },
    {
        id: "number-orbit",
        title: "수열 궤도의 반복 구간",
        grade: 6,
        tag: "해시",
        secondary: "시뮬레이션",
        time: 30,
        solved: false,
        acceptance: 51,
    },
];

export const DAILY_PROBLEM = DEMO_PROBLEMS[0];

export const GENERATION_JOBS = [
    {
        id: "GEN-1842",
        title: "격자 위의 택배 로봇",
        grade: 5,
        state: "FUZZ_VALIDATED",
        blueprint: "shortest-path/v4",
        score: 92,
    },
    {
        id: "GEN-1841",
        title: "회전하는 문자열 창",
        grade: 7,
        state: "APPROVED",
        blueprint: "sliding-window/v3",
        score: 96,
    },
    {
        id: "GEN-1840",
        title: "무너지는 얼음 다리",
        grade: 2,
        state: "REVIEW_REQUIRED",
        blueprint: "offline-query/v2",
        score: 87,
    },
    {
        id: "GEN-1839",
        title: "동전 탑의 균형",
        grade: 8,
        state: "REJECTED_WEAK_TESTS",
        blueprint: "greedy/v5",
        score: 61,
    },
];

export const RANKINGS = [
    [1, "코드바람", 18, "91%", "2일"],
    [2, "새벽컴파일", 17, "88%", "오늘"],
    [3, "초록커서", 16, "94%", "오늘"],
    [24, "알고리즘러", 12, "83%", "오늘"],
    [25, "정렬요정", 12, "81%", "1일"],
] as const;
