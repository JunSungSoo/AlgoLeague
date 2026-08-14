"use client";
import NextLink from "next/link";
import { Alert, Box, Field, Grid, Heading, Link, Text } from "@chakra-ui/react";
import { Check } from "lucide-react";
import { AuthFrame } from "@/components/AuthFrame";
import {
    AppButton,
    AppInput,
    FlexLayout,
    LanguageSelector,
    type LanguageOption,
} from "@/components/ui";
import { useSignupForm } from "./use-signup-form";
import { ROUTES } from "@/lib/route-paths";

const LANGUAGE_OPTIONS: LanguageOption[] = [
    { value: "python", label: "Python", description: "입문부터 AI까지" },
    { value: "java", label: "Java", description: "안정적인 백엔드" },
    { value: "javascript", label: "JavaScript", description: "웹과 Node.js" },
    { value: "cpp", label: "C++", description: "성능 중심 알고리즘" },
];

export default function SignupPage() {
    const {
        form,
        update,
        challengeId,
        code,
        setCode,
        devCode,
        verificationToken,
        usernameChecked,
        usernameAvailable,
        nicknameChecked,
        nicknameAvailable,
        message,
        error,
        busy,
        ready,
        requestCode,
        verifyCode,
        checkNickname,
        checkUsername,
        submit,
    } = useSignupForm();
    return (
        <AuthFrame mode="signup">
            <Text color="accent" fontSize="11px" fontWeight="800" letterSpacing=".14em">
                JOIN THE LEAGUE
            </Text>
            <Heading mt="8px" fontSize="34px" letterSpacing="-.05em">
                회원가입
            </Heading>
            <Text mt="10px" color="muted">
                나에게 맞는 문제를 배정받기 위한 기본 정보를 입력해 주세요.
            </Text>
            <Box
                as="form"
                mt="32px"
                onSubmit={(event) => {
                    event.preventDefault();
                    void submit();
                }}
            >
                <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap="20px">
                    <Field.Root required>
                        <Field.Label>
                            아이디 <Field.RequiredIndicator />
                        </Field.Label>
                        <FlexLayout gap="8px">
                            <AppInput
                                autoCapitalize="none"
                                autoComplete="username"
                                placeholder="영문 소문자 4~20자"
                                value={form.username}
                                onChange={(event) =>
                                    update("username", event.target.value.toLowerCase())
                                }
                            />
                            <AppButton
                                type="button"
                                variant="outline"
                                minW="96px"
                                onClick={checkUsername}
                                disabled={form.username.length < 4}
                                loading={busy}
                            >
                                중복 확인
                            </AppButton>
                        </FlexLayout>
                        {usernameChecked && (
                            <Field.HelperText color={usernameAvailable ? "green.500" : "red.500"}>
                                {usernameAvailable
                                    ? "사용 가능한 아이디입니다."
                                    : "이미 사용 중인 아이디입니다."}
                            </Field.HelperText>
                        )}
                    </Field.Root>
                    <Field.Root required>
                        <Field.Label>
                            닉네임 <Field.RequiredIndicator />
                        </Field.Label>
                        <FlexLayout gap="8px">
                            <AppInput
                                autoComplete="nickname"
                                placeholder="알고리즘러"
                                value={form.nickname}
                                onChange={(event) => update("nickname", event.target.value)}
                            />
                            <AppButton
                                type="button"
                                variant="outline"
                                minW="96px"
                                onClick={checkNickname}
                                disabled={form.nickname.trim().length < 2}
                                loading={busy}
                            >
                                중복 확인
                            </AppButton>
                        </FlexLayout>
                        {nicknameChecked && (
                            <Field.HelperText color={nicknameAvailable ? "green.500" : "red.500"}>
                                {nicknameAvailable
                                    ? "사용 가능한 닉네임입니다."
                                    : "이미 사용 중인 닉네임입니다."}
                            </Field.HelperText>
                        )}
                    </Field.Root>
                    <Field.Root required>
                        <Field.Label>
                            비밀번호 <Field.RequiredIndicator />
                        </Field.Label>
                        <AppInput
                            type="password"
                            autoComplete="new-password"
                            placeholder="영문·숫자 포함 8자 이상"
                            value={form.password}
                            onChange={(event) => update("password", event.target.value)}
                        />
                    </Field.Root>
                    <Field.Root
                        required
                        invalid={
                            Boolean(form.passwordConfirm) && form.password !== form.passwordConfirm
                        }
                    >
                        <Field.Label>
                            비밀번호 확인 <Field.RequiredIndicator />
                        </Field.Label>
                        <AppInput
                            type="password"
                            autoComplete="new-password"
                            placeholder="비밀번호 다시 입력"
                            value={form.passwordConfirm}
                            onChange={(event) => update("passwordConfirm", event.target.value)}
                        />
                        <Field.ErrorText>비밀번호가 일치하지 않습니다.</Field.ErrorText>
                    </Field.Root>
                    <Field.Root required>
                        <Field.Label>
                            이름 <Field.RequiredIndicator />
                        </Field.Label>
                        <AppInput
                            autoComplete="name"
                            placeholder="홍길동"
                            value={form.name}
                            onChange={(event) => update("name", event.target.value)}
                        />
                    </Field.Root>
                </Grid>
                <Field.Root required mt="20px">
                    <Field.Label>
                        휴대폰 번호 <Field.RequiredIndicator />
                    </Field.Label>
                    <FlexLayout gap="8px">
                        <AppInput
                            inputMode="tel"
                            autoComplete="tel"
                            placeholder="010-1234-5678"
                            value={form.phone}
                            onChange={(event) => update("phone", event.target.value)}
                            disabled={Boolean(challengeId)}
                        />
                        <AppButton
                            type="button"
                            variant="outline"
                            minW="112px"
                            onClick={requestCode}
                            disabled={Boolean(challengeId) || form.phone.length < 10}
                            loading={busy}
                        >
                            {verificationToken ? (
                                <>
                                    <Check />
                                    인증 완료
                                </>
                            ) : (
                                "인증 요청"
                            )}
                        </AppButton>
                    </FlexLayout>
                </Field.Root>
                {challengeId && !verificationToken && (
                    <Field.Root required mt="12px">
                        <Field.Label>
                            인증번호 <Field.RequiredIndicator />
                        </Field.Label>
                        <FlexLayout gap="8px">
                            <AppInput
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                maxLength={6}
                                placeholder="6자리 숫자"
                                value={code}
                                onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
                            />
                            <AppButton
                                type="button"
                                bg="accent"
                                color="accentContrast"
                                minW="96px"
                                onClick={verifyCode}
                                disabled={code.length !== 6}
                                loading={busy}
                            >
                                인증하기
                            </AppButton>
                        </FlexLayout>
                        {devCode && (
                            <Field.HelperText color="accent">
                                개발용 인증번호: <strong>{devCode}</strong>
                            </Field.HelperText>
                        )}
                    </Field.Root>
                )}
                <Field.Root mt="20px">
                    <Field.Label>
                        주소{" "}
                        <Text as="span" color="muted" fontWeight="400">
                            (선택)
                        </Text>
                    </Field.Label>
                    <AppInput
                        autoComplete="street-address"
                        placeholder="주소를 입력해 주세요"
                        value={form.address}
                        onChange={(event) => update("address", event.target.value)}
                    />
                </Field.Root>
                <Field.Root required mt="24px">
                    <Field.Label>
                        선호 프로그래밍 언어 <Field.RequiredIndicator />
                    </Field.Label>
                    <Field.HelperText mb="10px">
                        문제 풀이 화면에서 기본으로 선택됩니다.
                    </Field.HelperText>
                    <LanguageSelector
                        name="preferredLanguage"
                        value={form.preferredLanguage}
                        options={LANGUAGE_OPTIONS}
                        onChange={(value) => update("preferredLanguage", value)}
                    />
                </Field.Root>
                {error && (
                    <Alert.Root status="error" mt="20px">
                        <Alert.Indicator />
                        <Alert.Content>
                            <Alert.Description>{error}</Alert.Description>
                        </Alert.Content>
                    </Alert.Root>
                )}
                {message && !error && (
                    <Alert.Root status="success" mt="20px">
                        <Alert.Indicator />
                        <Alert.Content>
                            <Alert.Description>{message}</Alert.Description>
                        </Alert.Content>
                    </Alert.Root>
                )}
                <AppButton
                    type="submit"
                    w="full"
                    mt="26px"
                    size="lg"
                    bg="accent"
                    color="accentContrast"
                    _hover={{ opacity: 0.88 }}
                    disabled={!ready}
                    loading={busy}
                >
                    회원가입 완료
                </AppButton>
            </Box>
            <FlexLayout mt="24px" justify="center" gap="8px" fontSize="14px">
                <Text color="muted">이미 계정이 있으신가요?</Text>
                <Link asChild color="accent" fontWeight="800">
                    <NextLink href={ROUTES.LOGIN}>로그인</NextLink>
                </Link>
            </FlexLayout>
        </AuthFrame>
    );
}
