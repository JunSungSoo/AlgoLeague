"use client";
import NextLink from "next/link";
import { useState } from "react";
import { Alert, Box, Button, Field, Flex, Heading, Input, Link, Text } from "@chakra-ui/react";
import { AuthFrame } from "@/components/auth-frame";
import { authRequest } from "@/lib/auth-client";

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
            <Text color="accent" fontSize="11px" fontWeight="800" letterSpacing=".14em">
                ACCOUNT RECOVERY
            </Text>
            <Heading mt="8px" fontSize="34px">
                아이디 찾기
            </Heading>
            <Text mt="10px" color="muted">
                가입 시 인증한 휴대폰 번호를 확인합니다.
            </Text>
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
                    <Field.Root required>
                        <Field.Label>
                            휴대폰 번호 <Field.RequiredIndicator />
                        </Field.Label>
                        <Flex direction={{ base: "column", sm: "row" }} gap="8px">
                            <Input
                                inputMode="tel"
                                autoComplete="tel"
                                placeholder="010-1234-5678"
                                value={phone}
                                onChange={(event) => setPhone(event.target.value)}
                                disabled={Boolean(challengeId)}
                            />
                            <Button
                                minW="96px"
                                onClick={requestCode}
                                disabled={phone.length < 10 || Boolean(challengeId)}
                                loading={busy}
                            >
                                인증 요청
                            </Button>
                        </Flex>
                    </Field.Root>
                    {challengeId && (
                        <Field.Root required mt="18px">
                            <Field.Label>
                                인증번호 <Field.RequiredIndicator />
                            </Field.Label>
                            <Flex direction={{ base: "column", sm: "row" }} gap="8px">
                                <Input
                                    inputMode="numeric"
                                    maxLength={6}
                                    value={code}
                                    onChange={(event) =>
                                        setCode(event.target.value.replace(/\D/g, ""))
                                    }
                                />
                                <Button
                                    minW="80px"
                                    bg="accent"
                                    color="accentContrast"
                                    onClick={verify}
                                    disabled={code.length !== 6}
                                    loading={busy}
                                >
                                    확인
                                </Button>
                            </Flex>
                            {devCode && (
                                <Field.HelperText color="accent">
                                    개발용 인증번호: <strong>{devCode}</strong>
                                </Field.HelperText>
                            )}
                        </Field.Root>
                    )}
                </Box>
            )}
            {error && (
                <Alert.Root status="error" mt="18px">
                    <Alert.Indicator />
                    <Alert.Description>{error}</Alert.Description>
                </Alert.Root>
            )}
            <Flex mt="28px" justify="center" gap="8px" fontSize="12px">
                <Link asChild color="accent">
                    <NextLink href="/login">로그인으로 돌아가기</NextLink>
                </Link>
                <Text color="muted">·</Text>
                <Link asChild color="muted">
                    <NextLink href="/account/reset-password">비밀번호 찾기</NextLink>
                </Link>
            </Flex>
        </AuthFrame>
    );
}
