"use client";
import NextLink from "next/link";
import { useState } from "react";
import { Alert, Box, Link, Text } from "@chakra-ui/react";
import { AuthFrame } from "@/components/AuthFrame";
import {
    AppButton,
    AppInput,
    AuthHeading,
    FlexLayout,
    FormField,
    StatusAlert,
} from "@/components/ui";
import { authRequest } from "@/lib/auth-client";
import { ROUTES } from "@/lib/route-paths";

export default function FindIdPage() {
    const [phone, setPhone] = useState("");
    const [challengeId, setChallengeId] = useState("");
    const [code, setCode] = useState("");
    const [devCode, setDevCode] = useState("");
    const [username, setUsername] = useState("");
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);
    async function requestCode() {
        setBusy(true);
        setError("");
        try {
            const result = await authRequest<{ challengeId: string; devCode?: string }>(
                "/api/auth/phone/request",
                { phone, purpose: "find-id" },
            );
            setChallengeId(result.challengeId);
            setDevCode(result.devCode ?? "");
        } catch (value) {
            setError(value instanceof Error ? value.message : "인증번호를 요청하지 못했습니다.");
        } finally {
            setBusy(false);
        }
    }
    async function verify() {
        setBusy(true);
        setError("");
        try {
            const result = await authRequest<{ username: string }>("/api/auth/phone/verify", {
                challengeId,
                code,
            });
            setUsername(result.username);
        } catch (value) {
            setError(value instanceof Error ? value.message : "인증하지 못했습니다.");
        } finally {
            setBusy(false);
        }
    }
    return (
        <AuthFrame mode="login">
            <AuthHeading
                eyebrow="ACCOUNT RECOVERY"
                title="아이디 찾기"
                description="가입 시 인증한 휴대폰 번호를 확인합니다."
            />
            {username ? (
                <Alert.Root status="success" mt="32px">
                    <Alert.Indicator />
                    <Alert.Content>
                        <Alert.Title>회원님의 아이디</Alert.Title>
                        <Alert.Description fontSize="20px" fontWeight="900">
                            {username}
                        </Alert.Description>
                    </Alert.Content>
                </Alert.Root>
            ) : (
                <Box mt="32px">
                    <FormField label="휴대폰 번호" required>
                        <FlexLayout layout="responsive">
                            <AppInput
                                inputMode="tel"
                                autoComplete="tel"
                                placeholder="010-1234-5678"
                                value={phone}
                                onChange={(event) => setPhone(event.target.value)}
                                disabled={Boolean(challengeId)}
                            />
                            <AppButton
                                minW="96px"
                                onClick={requestCode}
                                disabled={phone.length < 10 || Boolean(challengeId)}
                                loading={busy}
                            >
                                인증 요청
                            </AppButton>
                        </FlexLayout>
                    </FormField>
                    {challengeId && (
                        <FormField
                            label="인증번호"
                            required
                            mt="18px"
                            helperText={
                                devCode ? (
                                    <Text color="accent">
                                        개발용 인증번호: <strong>{devCode}</strong>
                                    </Text>
                                ) : null
                            }
                        >
                            <FlexLayout layout="responsive">
                                <AppInput
                                    inputMode="numeric"
                                    maxLength={6}
                                    value={code}
                                    onChange={(event) =>
                                        setCode(event.target.value.replace(/\D/g, ""))
                                    }
                                />
                                <AppButton
                                    tone="primary"
                                    minW="80px"
                                    onClick={verify}
                                    disabled={code.length !== 6}
                                    loading={busy}
                                >
                                    확인
                                </AppButton>
                            </FlexLayout>
                        </FormField>
                    )}
                </Box>
            )}
            {error ? <StatusAlert status="error" mt="18px" message={error} /> : null}
            <FlexLayout mt="28px" layout="center" gap="8px" fontSize="12px">
                <Link asChild color="accent">
                    <NextLink href={ROUTES.LOGIN}>로그인으로 돌아가기</NextLink>
                </Link>
                <Text color="muted">·</Text>
                <Link asChild color="muted">
                    <NextLink href={ROUTES.RESET_PASSWORD}>비밀번호 찾기</NextLink>
                </Link>
            </FlexLayout>
        </AuthFrame>
    );
}
