"use client";
import NextLink from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Alert,
    Box,
    Button,
    Field,
    Flex,
    Grid,
    Heading,
    Input,
    Link,
    Text,
    VisuallyHidden,
} from "@chakra-ui/react";
import { Check, Code2 } from "lucide-react";
import { AuthFrame } from "@/components/auth-frame";
import {
    authRequest,
    rememberUser,
    type AuthUser,
    type ProgrammingLanguage,
} from "@/lib/auth-client";
import { startGlobalLoading } from "@/lib/global-loading";

const languages: [ProgrammingLanguage, string, string][] = [
    ["python", "Python", "입문부터 AI까지"],
    ["java", "Java", "안정적인 백엔드"],
    ["javascript", "JavaScript", "웹과 Node.js"],
    ["cpp", "C++", "성능 중심 알고리즘"],
];

export default function SignupPage() {
    const router = useRouter();
    const [form, setForm] = useState({
        username: "",
        password: "",
        passwordConfirm: "",
        name: "",
        phone: "",
        nickname: "",
        address: "",
        preferredLanguage: "python" as ProgrammingLanguage,
    });
    const [challengeId, setChallengeId] = useState("");
    const [code, setCode] = useState("");
    const [devCode, setDevCode] = useState("");
    const [verificationToken, setVerificationToken] = useState("");
    const [usernameChecked, setUsernameChecked] = useState(false);
    const [usernameAvailable, setUsernameAvailable] = useState(false);
    const [nicknameChecked, setNicknameChecked] = useState(false);
    const [nicknameAvailable, setNicknameAvailable] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);
    function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
        setForm((current) => ({ ...current, [key]: value }));
        if (key === "username") {
            setUsernameChecked(false);
            setUsernameAvailable(false);
        }
        if (key === "nickname") {
            setNicknameChecked(false);
            setNicknameAvailable(false);
        }
    }
    async function requestCode() {
        setBusy(true);
        setError("");
        try {
            const result = await authRequest<{ challengeId: string; devCode?: string }>(
                "/api/auth/phone/request",
                { phone: form.phone, purpose: "signup" },
            );
            setChallengeId(result.challengeId);
            setDevCode(result.devCode ?? "");
            setMessage("인증번호를 전송했습니다.");
        } catch (value) {
            setError(value instanceof Error ? value.message : "인증번호를 요청하지 못했습니다.");
        } finally {
            setBusy(false);
        }
    }
    async function verifyCode() {
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
            setMessage("휴대폰 인증이 완료되었습니다.");
        } catch (value) {
            setError(value instanceof Error ? value.message : "인증하지 못했습니다.");
        } finally {
            setBusy(false);
        }
    }
    async function checkNickname() {
        setBusy(true);
        setError("");
        try {
            const result = await authRequest<{ available: boolean; message: string }>(
                "/api/auth/nickname/check",
                { nickname: form.nickname },
            );
            setNicknameChecked(true);
            setNicknameAvailable(result.available);
            setMessage(result.message);
        } catch (value) {
            setNicknameChecked(false);
            setError(value instanceof Error ? value.message : "중복 확인에 실패했습니다.");
        } finally {
            setBusy(false);
        }
    }
    async function checkUsername() {
        setBusy(true);
        setError("");
        try {
            const result = await authRequest<{ available: boolean; message: string }>(
                "/api/auth/username/check",
                { username: form.username },
            );
            setUsernameChecked(true);
            setUsernameAvailable(result.available);
            setMessage(result.message);
        } catch (value) {
            setUsernameChecked(false);
            setError(value instanceof Error ? value.message : "중복 확인에 실패했습니다.");
        } finally {
            setBusy(false);
        }
    }
    async function submit() {
        if (form.password !== form.passwordConfirm) {
            setError("비밀번호 확인이 일치하지 않습니다.");
            return;
        }
        setBusy(true);
        setError("");
        try {
            const result = await authRequest<{ user: AuthUser }>("/api/auth/register", {
                verificationToken,
                username: form.username,
                password: form.password,
                name: form.name,
                nickname: form.nickname,
                address: form.address || undefined,
                preferredLanguage: form.preferredLanguage,
            });
            rememberUser(result.user);
            startGlobalLoading();
            router.push("/");
            router.refresh();
        } catch (value) {
            setError(value instanceof Error ? value.message : "회원가입을 완료하지 못했습니다.");
        } finally {
            setBusy(false);
        }
    }
    const passwordValid =
        form.password.length >= 8 &&
        /[A-Za-z]/.test(form.password) &&
        /\d/.test(form.password) &&
        form.password === form.passwordConfirm;
    const ready =
        form.name.trim().length >= 2 &&
        verificationToken &&
        usernameChecked &&
        usernameAvailable &&
        nicknameChecked &&
        nicknameAvailable &&
        passwordValid;
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
                        <Flex gap="8px">
                            <Input
                                autoCapitalize="none"
                                autoComplete="username"
                                placeholder="영문 소문자 4~20자"
                                value={form.username}
                                onChange={(event) =>
                                    update("username", event.target.value.toLowerCase())
                                }
                            />
                            <Button
                                type="button"
                                variant="outline"
                                minW="96px"
                                onClick={checkUsername}
                                disabled={form.username.length < 4}
                                loading={busy}
                            >
                                중복 확인
                            </Button>
                        </Flex>
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
                        <Flex gap="8px">
                            <Input
                                autoComplete="nickname"
                                placeholder="알고리즘러"
                                value={form.nickname}
                                onChange={(event) => update("nickname", event.target.value)}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                minW="96px"
                                onClick={checkNickname}
                                disabled={form.nickname.trim().length < 2}
                                loading={busy}
                            >
                                중복 확인
                            </Button>
                        </Flex>
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
                        <Input
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
                        <Input
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
                        <Input
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
                    <Flex gap="8px">
                        <Input
                            inputMode="tel"
                            autoComplete="tel"
                            placeholder="010-1234-5678"
                            value={form.phone}
                            onChange={(event) => update("phone", event.target.value)}
                            disabled={Boolean(challengeId)}
                        />
                        <Button
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
                        </Button>
                    </Flex>
                </Field.Root>
                {challengeId && !verificationToken && (
                    <Field.Root required mt="12px">
                        <Field.Label>
                            인증번호 <Field.RequiredIndicator />
                        </Field.Label>
                        <Flex gap="8px">
                            <Input
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                maxLength={6}
                                placeholder="6자리 숫자"
                                value={code}
                                onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
                            />
                            <Button
                                type="button"
                                bg="accent"
                                color="accentContrast"
                                minW="96px"
                                onClick={verifyCode}
                                disabled={code.length !== 6}
                                loading={busy}
                            >
                                인증하기
                            </Button>
                        </Flex>
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
                    <Input
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
                    <Grid
                        role="radiogroup"
                        aria-label="선호 프로그래밍 언어"
                        templateColumns={{ base: "1fr 1fr", md: "repeat(4,1fr)" }}
                        gap="10px"
                    >
                        {languages.map(([value, label, description]) => {
                            const selected = form.preferredLanguage === value;
                            return (
                                <Box
                                    key={value}
                                    as="label"
                                    position="relative"
                                    cursor="pointer"
                                    borderWidth="1px"
                                    borderColor={selected ? "accent" : "line"}
                                    bg={selected ? "accentSubtle" : "surface"}
                                    borderRadius="12px"
                                    p="14px"
                                    transition="all .15s"
                                    _hover={{ borderColor: "accent" }}
                                >
                                    <VisuallyHidden>
                                        <input
                                            type="radio"
                                            name="preferredLanguage"
                                            value={value}
                                            checked={selected}
                                            onChange={() => update("preferredLanguage", value)}
                                        />
                                    </VisuallyHidden>
                                    <Flex
                                        position="relative"
                                        pointerEvents="none"
                                        justify="space-between"
                                    >
                                        <Code2 size={17} />
                                        {selected && <Check size={16} />}
                                    </Flex>
                                    <Text
                                        position="relative"
                                        pointerEvents="none"
                                        mt="14px"
                                        fontWeight="800"
                                        fontSize="13px"
                                    >
                                        {label}
                                    </Text>
                                    <Text
                                        position="relative"
                                        pointerEvents="none"
                                        mt="3px"
                                        color="muted"
                                        fontSize="10px"
                                    >
                                        {description}
                                    </Text>
                                </Box>
                            );
                        })}
                    </Grid>
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
                <Button
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
                </Button>
            </Box>
            <Flex mt="24px" justify="center" gap="8px" fontSize="14px">
                <Text color="muted">이미 계정이 있으신가요?</Text>
                <Link asChild color="accent" fontWeight="800">
                    <NextLink href="/login">로그인</NextLink>
                </Link>
            </Flex>
        </AuthFrame>
    );
}
