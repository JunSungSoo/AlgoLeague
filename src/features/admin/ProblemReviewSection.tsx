"use client";

import { useEffect, useState } from "react";
import {
    Badge,
    Box,
    Button,
    Checkbox,
    Code,
    Grid,
    Heading,
    NativeSelect,
    Spinner,
    Text,
    Textarea,
    VStack,
} from "@chakra-ui/react";
import { CheckCircle2, ClipboardCheck, XCircle } from "lucide-react";
import { Panel, SectionHeader } from "@/components/Primitives";
import { AppButton, FlexLayout, StatusAlert } from "@/components/ui";
import { authGet, authRequest } from "@/lib/auth-client";
import { dayjs } from "@/lib/dayjs-config";
import type { ProblemReview, ReviewSummary } from "./admin-types";

const SOLUTION_LANGUAGES = ["python", "java", "javascript", "cpp"] as const;
type SolutionLanguage = (typeof SOLUTION_LANGUAGES)[number];

export function ProblemReviewSection({ onReviewCompleted }: { onReviewCompleted: () => void }) {
    const [items, setItems] = useState<ReviewSummary[]>([]);
    const [selectedId, setSelectedId] = useState("");
    const [review, setReview] = useState<ProblemReview | null>(null);
    const [solutionLanguage, setSolutionLanguage] = useState<SolutionLanguage>("javascript");
    const [rejectionReason, setRejectionReason] = useState("");
    const [confirmed, setConfirmed] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const detailLoading = Boolean(selectedId && review?.id !== selectedId);

    useEffect(() => {
        let active = true;
        void authGet<{ items: ReviewSummary[] }>("/api/admin/problem-reviews")
            .then((result) => {
                if (!active) return;
                setItems(result.items);
                setSelectedId((current) =>
                    result.items.some((item) => item.id === current)
                        ? current
                        : (result.items[0]?.id ?? ""),
                );
                if (!result.items.length) setReview(null);
                setError("");
            })
            .catch((value) => {
                if (active)
                    setError(
                        value instanceof Error ? value.message : "검수 목록을 불러오지 못했습니다.",
                    );
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
    }, [refreshKey]);

    useEffect(() => {
        let active = true;
        if (!selectedId) {
            return () => {
                active = false;
            };
        }
        void authGet<{ review: ProblemReview }>(`/api/admin/problem-reviews/${selectedId}`)
            .then((result) => {
                if (active) {
                    setReview(result.review);
                    setError("");
                }
            })
            .catch((value) => {
                if (active)
                    setError(
                        value instanceof Error ? value.message : "검수 문제를 불러오지 못했습니다.",
                    );
            });
        return () => {
            active = false;
        };
    }, [selectedId]);

    const completeReview = async (decision: "approve" | "reject") => {
        if (!review || submitting) return;
        setSubmitting(true);
        setError("");
        setMessage("");
        try {
            const result = await authRequest<{ message: string }>(
                `/api/admin/problem-reviews/${review.id}/${decision}`,
                decision === "approve" ? { confirmed } : { reason: rejectionReason },
            );
            setReview(null);
            setSelectedId("");
            setMessage(result.message);
            setLoading(true);
            setRefreshKey((current) => current + 1);
            onReviewCompleted();
        } catch (value) {
            setError(value instanceof Error ? value.message : "검수 결정을 처리하지 못했습니다.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Box>
            <SectionHeader title="문제 검수" />
            <Text color="muted" fontSize="12px" mt="-6px" mb="13px">
                자동 검증을 통과했지만 사람의 판단이 필요한 문제를 확인하고 게시 여부를 결정합니다.
            </Text>
            {message && <StatusAlert status="success" message={message} mb="12px" />}
            {error && <StatusAlert status="error" message={error} mb="12px" />}
            <Grid templateColumns={{ base: "1fr", xl: "330px minmax(0, 1fr)" }} gap="16px">
                <Panel p="12px" minH="320px">
                    <FlexLayout align="center" justify="space-between" px="6px" pb="10px">
                        <FlexLayout align="center" gap="7px">
                            <ClipboardCheck size={17} />
                            <Text fontWeight="900">검수 대기</Text>
                        </FlexLayout>
                        <Badge bg="accentSubtle" color="accent">
                            {items.length}건
                        </Badge>
                    </FlexLayout>
                    {loading ? (
                        <FlexLayout minH="220px" align="center" justify="center" gap="8px">
                            <Spinner size="sm" />
                            <Text color="muted" fontSize="12px">
                                목록을 불러오는 중입니다.
                            </Text>
                        </FlexLayout>
                    ) : items.length ? (
                        <VStack align="stretch" gap="8px">
                            {items.map((item) => (
                                <Button
                                    type="button"
                                    key={item.id}
                                    variant="plain"
                                    display="block"
                                    w="full"
                                    h="auto"
                                    whiteSpace="normal"
                                    textAlign="left"
                                    borderWidth="1px"
                                    borderColor={selectedId === item.id ? "accent" : "line"}
                                    bg={selectedId === item.id ? "accentSubtle" : "surfaceMuted"}
                                    borderRadius="12px"
                                    p="12px"
                                    onClick={() => {
                                        setSelectedId(item.id);
                                        setConfirmed(false);
                                        setRejectionReason("");
                                    }}
                                >
                                    <FlexLayout justify="space-between" gap="8px" align="start">
                                        <Text fontWeight="900" fontSize="13px" lineClamp={2}>
                                            {item.title}
                                        </Text>
                                        <Badge flexShrink={0}>{item.grade}급</Badge>
                                    </FlexLayout>
                                    {!item.valid && (
                                        <Badge bg="red.50" color="red.700" mt="7px">
                                            데이터 오류 · 반려 필요
                                        </Badge>
                                    )}
                                    <Text color="muted" fontSize="11px" mt="6px">
                                        {item.primaryTag} · 변이 점수{" "}
                                        {formatScore(item.mutationScore)}
                                    </Text>
                                    <Text color="muted" fontSize="10px" mt="4px">
                                        {dayjs(item.updatedAt).tz().format("M월 D일 HH:mm")}
                                    </Text>
                                </Button>
                            ))}
                        </VStack>
                    ) : (
                        <FlexLayout minH="220px" align="center" justify="center" direction="column">
                            <CheckCircle2 size={28} color="#8d5637" />
                            <Text fontWeight="800" mt="8px">
                                검수 대기 문제가 없습니다.
                            </Text>
                        </FlexLayout>
                    )}
                </Panel>
                <Panel minH="520px">
                    {detailLoading ? (
                        <FlexLayout minH="440px" align="center" justify="center" gap="8px">
                            <Spinner size="sm" />
                            <Text color="muted">문제 상세를 불러오는 중입니다.</Text>
                        </FlexLayout>
                    ) : review?.valid ? (
                        <ReviewDetail
                            review={review}
                            solutionLanguage={solutionLanguage}
                            rejectionReason={rejectionReason}
                            confirmed={confirmed}
                            submitting={submitting}
                            onSolutionLanguageChange={setSolutionLanguage}
                            onRejectionReasonChange={setRejectionReason}
                            onConfirmedChange={setConfirmed}
                            onApprove={() => void completeReview("approve")}
                            onReject={() => void completeReview("reject")}
                        />
                    ) : review ? (
                        <InvalidReviewDetail
                            review={review}
                            rejectionReason={rejectionReason}
                            submitting={submitting}
                            onRejectionReasonChange={setRejectionReason}
                            onReject={() => void completeReview("reject")}
                        />
                    ) : (
                        <FlexLayout minH="440px" align="center" justify="center">
                            <Text color="muted">왼쪽에서 검수할 문제를 선택해 주세요.</Text>
                        </FlexLayout>
                    )}
                </Panel>
            </Grid>
        </Box>
    );
}

function InvalidReviewDetail({
    review,
    rejectionReason,
    submitting,
    onRejectionReasonChange,
    onReject,
}: {
    review: Extract<ProblemReview, { valid: false }>;
    rejectionReason: string;
    submitting: boolean;
    onRejectionReasonChange: (reason: string) => void;
    onReject: () => void;
}) {
    return (
        <VStack align="stretch" gap="18px">
            <Box>
                <Badge bg="red.50" color="red.700">
                    검수 데이터 오류
                </Badge>
                <Heading as="h3" fontSize="22px" mt="10px">
                    문제 내용을 표시할 수 없습니다.
                </Heading>
                <Text color="muted" fontSize="11px" mt="6px">
                    작업 {review.id.slice(0, 8)} · {review.model}
                </Text>
            </Box>
            <StatusAlert
                status="error"
                title="승인할 수 없는 검수 데이터"
                message={review.validationError}
            />
            <Text fontSize="13px" lineHeight="1.7">
                문제 패키지와 검증 결과가 모두 있어야 승인할 수 있습니다. 누락 원인을 반려 사유에
                기록하면 생성 작업 이력과 감사 로그에 함께 보존됩니다.
            </Text>
            <Box>
                <Text fontWeight="800" fontSize="12px" mb="7px">
                    반려 사유
                </Text>
                <Textarea
                    value={rejectionReason}
                    onChange={(event) => onRejectionReasonChange(event.target.value)}
                    placeholder="예: 생성된 문제 패키지와 검증 결과가 누락됨"
                    minH="100px"
                />
                <AppButton
                    tone="danger"
                    mt="8px"
                    disabled={rejectionReason.trim().length < 5 || submitting}
                    onClick={onReject}
                >
                    <XCircle size={16} /> 오류 작업 반려
                </AppButton>
            </Box>
        </VStack>
    );
}

function ReviewDetail({
    review,
    solutionLanguage,
    rejectionReason,
    confirmed,
    submitting,
    onSolutionLanguageChange,
    onRejectionReasonChange,
    onConfirmedChange,
    onApprove,
    onReject,
}: {
    review: Extract<ProblemReview, { valid: true }>;
    solutionLanguage: SolutionLanguage;
    rejectionReason: string;
    confirmed: boolean;
    submitting: boolean;
    onSolutionLanguageChange: (language: SolutionLanguage) => void;
    onRejectionReasonChange: (reason: string) => void;
    onConfirmedChange: (confirmed: boolean) => void;
    onApprove: () => void;
    onReject: () => void;
}) {
    const problem = review.problem;
    return (
        <VStack align="stretch" gap="20px">
            <Box>
                <FlexLayout align="center" gap="7px" wrap="wrap">
                    <Badge bg="accentSubtle" color="accent">
                        {problem.grade}급
                    </Badge>
                    <Badge>{problem.primaryTag}</Badge>
                    {problem.secondaryTags.map((tag) => (
                        <Badge key={tag}>{tag}</Badge>
                    ))}
                </FlexLayout>
                <Heading as="h3" fontSize="24px" mt="10px">
                    {problem.title}
                </Heading>
                <Text color="muted" fontSize="11px" mt="6px">
                    {review.model} · 생성 시도 {review.attempts}회 · {review.blueprintVersion}
                </Text>
            </Box>
            <ReportSummary review={review} />
            <ReviewBlock title="문제 설명">
                <Text whiteSpace="pre-wrap" lineHeight="1.8">
                    {problem.statement}
                </Text>
            </ReviewBlock>
            <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap="12px">
                <ReviewBlock title="입력">{problem.input}</ReviewBlock>
                <ReviewBlock title="출력">{problem.output}</ReviewBlock>
            </Grid>
            <ReviewBlock title="제약 조건">
                {problem.constraints.map((constraint) => (
                    <Text key={constraint}>• {constraint}</Text>
                ))}
            </ReviewBlock>
            <ReviewBlock title="함수 명세">
                <Code p="8px">
                    {problem.functionSpec.name}(
                    {problem.functionSpec.parameters
                        .map((parameter) => `${parameter.name}: ${parameter.type}`)
                        .join(", ")}
                    ): {problem.functionSpec.returnType}
                </Code>
                <Text color="muted" fontSize="11px" mt="8px">
                    공개 테스트 {problem.samples.length}개 · 비공개 테스트{" "}
                    {problem.hiddenTests.length}개
                </Text>
            </ReviewBlock>
            <ReviewBlock title="공개 Sample Tests">
                <VStack align="stretch" gap="10px">
                    {problem.samples.map((sample, index) => (
                        <Grid
                            key={`${index}-${JSON.stringify(sample.arguments)}`}
                            templateColumns={{ base: "1fr", md: "50px 1fr 1fr" }}
                            gap="8px"
                        >
                            <Text fontWeight="900">#{index + 1}</Text>
                            <Code p="8px">인자 {JSON.stringify(sample.arguments)}</Code>
                            <Code p="8px">기대값 {JSON.stringify(sample.expected)}</Code>
                        </Grid>
                    ))}
                </VStack>
            </ReviewBlock>
            <ReviewBlock title="풀이 설명">
                <Text whiteSpace="pre-wrap" lineHeight="1.8">
                    {problem.explanation}
                </Text>
            </ReviewBlock>
            <ReviewBlock title="공식 답안">
                <NativeSelect.Root maxW="210px" mb="10px">
                    <NativeSelect.Field
                        value={solutionLanguage}
                        onChange={(event) =>
                            onSolutionLanguageChange(event.target.value as SolutionLanguage)
                        }
                    >
                        {SOLUTION_LANGUAGES.map((language) => (
                            <option value={language} key={language}>
                                {language}
                            </option>
                        ))}
                    </NativeSelect.Field>
                    <NativeSelect.Indicator />
                </NativeSelect.Root>
                <Box
                    as="pre"
                    overflowX="auto"
                    p="14px"
                    bg="#171717"
                    color="#f7ead8"
                    borderRadius="10px"
                    fontSize="12px"
                    lineHeight="1.7"
                >
                    {problem.solutions[solutionLanguage]}
                </Box>
            </ReviewBlock>
            <Box borderTopWidth="1px" borderColor="line" pt="18px">
                <Checkbox.Root
                    checked={confirmed}
                    onCheckedChange={(details) => onConfirmedChange(Boolean(details.checked))}
                >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control />
                    <Checkbox.Label fontSize="12px">
                        문제 설명, 제약 조건, 샘플, 공식 답안과 검증 결과를 모두 확인했습니다.
                    </Checkbox.Label>
                </Checkbox.Root>
                <FlexLayout gap="8px" mt="12px" wrap="wrap">
                    <AppButton
                        tone="primary"
                        disabled={!confirmed || submitting}
                        loading={submitting}
                        onClick={onApprove}
                    >
                        <CheckCircle2 size={16} /> 검수 승인 및 게시
                    </AppButton>
                </FlexLayout>
                <Box mt="18px">
                    <Text fontWeight="800" fontSize="12px" mb="7px">
                        반려 사유
                    </Text>
                    <Textarea
                        value={rejectionReason}
                        onChange={(event) => onRejectionReasonChange(event.target.value)}
                        placeholder="수정이 필요한 내용을 5자 이상 입력해 주세요."
                        minH="90px"
                    />
                    <AppButton
                        tone="danger"
                        mt="8px"
                        disabled={rejectionReason.trim().length < 5 || submitting}
                        onClick={onReject}
                    >
                        <XCircle size={16} /> 문제 반려
                    </AppButton>
                </Box>
            </Box>
        </VStack>
    );
}

function ReportSummary({ review }: { review: Extract<ProblemReview, { valid: true }> }) {
    const report = review.report;
    return (
        <SimpleReportGrid>
            <ReportValue label="스키마" value={report.schema ? "통과" : "실패"} />
            <ReportValue label="샘플" value={report.samples ? "통과" : "실패"} />
            <ReportValue label="언어 교차검증" value={report.crossLanguage ? "통과" : "실패"} />
            <ReportValue label="변이 점수" value={formatScore(report.mutationScore)} />
            <ReportValue label="중복 위험" value={formatScore(report.duplicateScore)} />
            <ReportValue label="모호성 위험" value={formatScore(report.ambiguityScore)} />
        </SimpleReportGrid>
    );
}

function SimpleReportGrid({ children }: { children: React.ReactNode }) {
    return (
        <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }} gap="8px">
            {children}
        </Grid>
    );
}

function ReportValue({ label, value }: { label: string; value: string }) {
    return (
        <Box bg="surfaceMuted" borderRadius="10px" p="10px">
            <Text color="muted" fontSize="10px">
                {label}
            </Text>
            <Text fontWeight="900" fontSize="13px" mt="2px">
                {value}
            </Text>
        </Box>
    );
}

function ReviewBlock({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <Box>
            <Heading as="h4" fontSize="14px" mb="8px">
                {title}
            </Heading>
            <Box bg="surfaceMuted" borderRadius="10px" p="14px" fontSize="13px">
                {children}
            </Box>
        </Box>
    );
}

function formatScore(score: number | null) {
    return score == null ? "-" : `${Math.round(score * 100)}%`;
}
