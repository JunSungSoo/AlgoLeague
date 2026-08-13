"use client";
import NextLink from "next/link";
import { useState } from "react";
import { Alert, Box, Button, Field, Flex, Heading, Input, Link, Text } from "@chakra-ui/react";
import { AuthFrame } from "@/components/auth-frame";
import { authRequest } from "@/lib/auth-client";

export default function ResetPasswordPage() {
    const [username, setUsername] = useState("");
    const [phone, setPhone] = useState("");
    const [challengeId, setChallengeId] = useState("");
    const [code, setCode] = useState("");
    const [devCode, setDevCode] = useState("");
    const [verificationToken, setVerificationToken] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [done, setDone] = useState(false);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);
    async function requestCode() {
        setBusy(true);
        setError("");
        try {
            const result = await authRequest<{ challengeId: string; devCode?: string }>(
                "/api/auth/phone/request",
                { username, phone, purpose: "reset-password" },
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
            const result = await authRequest<{ verificationToken: string }>(
                "/api/auth/phone/verify",
                {
                    challengeId,
                    code,
                },
            );
            setVerificationToken(result.verificationToken);
        } catch (value) {
            setError(value instanceof Error ? value.message : "인증하지 못했습니다.");
        } finally {
            setBusy(false);
        }
    }
    async function reset() {
        if (password !== confirm) {
            setError("비밀번호 확인이 일치하지 않습니다.");
            return;
        }
        setBusy(true);
        setError("");
        try {
            await authRequest("/api/auth/password/reset", {
                username,
                verificationToken,
                newPassword: password,
            });
            setDone(true);
        } catch (value) {
            setError(value instanceof Error ? value.message : "비밀번호를 변경하지 못했습니다.");
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
                비밀번호 찾기
            </Heading>
            <Text mt="10px" color="muted">
                아이디와 인증된 휴대폰 번호를 확인한 뒤 새 비밀번호를 설정합니다.
            </Text>
            {done ? (
                <Alert.Root status="success" mt="32px">
                    <Alert.Indicator />
                    <Alert.Content>
                        <Alert.Title>비밀번호가 변경되었습니다.</Alert.Title>
                        <Alert.Description>
                            <Link asChild color="accent">
                                <NextLink href="/login">새 비밀번호로 로그인하기</NextLink>
                            </Link>
                        </Alert.Description>
                    </Alert.Content>
                </Alert.Root>
            ) : (
                <Box mt="32px">
                    <Field.Root required>
                        <Field.Label>
                            아이디 <Field.RequiredIndicator />
                        </Field.Label>
                        <Input
                            autoComplete="username"
                            value={username}
                            onChange={(event) => setUsername(event.target.value.toLowerCase())}
                            disabled={Boolean(challengeId)}
                        />
                    </Field.Root>
                    <Field.Root required mt="18px">
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
                                disabled={
                                    username.length < 4 || phone.length < 10 || Boolean(challengeId)
                                }
                                loading={busy}
                            >
                                인증 요청
                            </Button>
                        </Flex>
                    </Field.Root>
                    {challengeId && !verificationToken && (
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
                                    인증
                                </Button>
                            </Flex>
                            {devCode && (
                                <Field.HelperText color="accent">
                                    개발용 인증번호: <strong>{devCode}</strong>
                                </Field.HelperText>
                            )}
                        </Field.Root>
                    )}
                    {verificationToken && (
                        <>
                            <Field.Root required mt="18px">
                                <Field.Label>
                                    새 비밀번호 <Field.RequiredIndicator />
                                </Field.Label>
                                <Input
                                    type="password"
                                    autoComplete="new-password"
                                    placeholder="영문·숫자 포함 8자 이상"
                                    value={password}
                                    onChange={(event) => setPassword(event.target.value)}
                                />
                            </Field.Root>
                            <Field.Root
                                required
                                mt="18px"
                                invalid={Boolean(confirm) && password !== confirm}
                            >
                                <Field.Label>
                                    새 비밀번호 확인 <Field.RequiredIndicator />
                                </Field.Label>
                                <Input
                                    type="password"
                                    autoComplete="new-password"
                                    value={confirm}
                                    onChange={(event) => setConfirm(event.target.value)}
                                />
                                <Field.ErrorText>비밀번호가 일치하지 않습니다.</Field.ErrorText>
                            </Field.Root>
                            <Button
                                w="full"
                                mt="24px"
                                bg="accent"
                                color="accentContrast"
                                onClick={reset}
                                disabled={password.length < 8 || password !== confirm}
                                loading={busy}
                            >
                                비밀번호 변경
                            </Button>
                        </>
                    )}
                </Box>
            )}
            {error && (
                <Alert.Root status="error" mt="18px">
                    <Alert.Indicator />
                    <Alert.Description>{error}</Alert.Description>
                </Alert.Root>
            )}
            <Flex mt="28px" justify="center" fontSize="12px">
                <Link asChild color="accent">
                    <NextLink href="/login">로그인으로 돌아가기</NextLink>
                </Link>
            </Flex>
        </AuthFrame>
    );
}
