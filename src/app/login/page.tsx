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
    Heading,
    Input,
    Link,
    Separator,
    SimpleGrid,
    Text,
} from "@chakra-ui/react";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { AuthFrame } from "@/components/auth-frame";
import { authRequest, rememberUser, type AuthUser } from "@/lib/auth-client";
import { startGlobalLoading } from "@/lib/global-loading";

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);
    async function login() {
        setBusy(true);
        setError("");
        try {
            const result = await authRequest<{ user: AuthUser }>("/api/auth/login", {
                username,
                password,
            });
            rememberUser(result.user);
            const requestedPath = new URLSearchParams(window.location.search).get("next");
            const destination =
                requestedPath?.startsWith("/") && !requestedPath.startsWith("//")
                    ? requestedPath
                    : "/";
            startGlobalLoading();
            router.push(destination);
            router.refresh();
        } catch (value) {
            setError(value instanceof Error ? value.message : "로그인하지 못했습니다.");
        } finally {
            setBusy(false);
        }
    }
    return (
        <AuthFrame mode="login">
            <Text color="accent" fontSize="11px" fontWeight="800" letterSpacing=".14em">
                WELCOME BACK
            </Text>
            <Heading mt="8px" fontSize="34px" letterSpacing="-.05em">
                로그인
            </Heading>
            <Text mt="10px" color="muted">
                가입한 아이디와 비밀번호를 입력하세요.
            </Text>
            <Box
                mt="36px"
                as="form"
                onSubmit={(event) => {
                    event.preventDefault();
                    void login();
                }}
            >
                <Field.Root required>
                    <Field.Label>
                        아이디 <Field.RequiredIndicator />
                    </Field.Label>
                    <Input
                        autoFocus
                        autoCapitalize="none"
                        autoComplete="username"
                        placeholder="아이디"
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                    />
                </Field.Root>
                <Field.Root required mt="18px">
                    <Field.Label>
                        비밀번호 <Field.RequiredIndicator />
                    </Field.Label>
                    <Input
                        type="password"
                        autoComplete="current-password"
                        placeholder="비밀번호"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
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
                <Button
                    type="submit"
                    w="full"
                    mt="26px"
                    size="lg"
                    bg="accent"
                    color="accentContrast"
                    _hover={{ opacity: 0.88 }}
                    loading={busy}
                    disabled={!username || !password}
                >
                    로그인
                    <ArrowRight />
                </Button>
            </Box>
            <Flex my="28px" align="center" gap="12px">
                <Separator flex="1" />
                <Text color="muted" fontSize="11px">
                    간편 로그인 · 준비 중
                </Text>
                <Separator flex="1" />
            </Flex>
            <SimpleGrid columns={3} gap="8px">
                <SocialPreview mark="G" label="Google" />
                <SocialPreview mark="N" label="네이버" tone="green.500" />
                <SocialPreview mark="K" label="카카오" tone="yellow.400" />
            </SimpleGrid>
            <Flex
                mt="28px"
                pt="22px"
                borderTopWidth="1px"
                borderColor="line"
                justify="center"
                gap="8px"
                fontSize="14px"
            >
                <Text color="muted">아직 회원이 아니신가요?</Text>
                <Link asChild color="accent" fontWeight="800">
                    <NextLink href="/signup">회원가입</NextLink>
                </Link>
            </Flex>
            <Flex mt="10px" justify="center" gap="10px" color="muted" fontSize="11px">
                <Link asChild color="muted">
                    <NextLink href="/account/find-id">아이디 찾기</NextLink>
                </Link>
                <Text>·</Text>
                <Link asChild color="muted">
                    <NextLink href="/account/reset-password">비밀번호 찾기</NextLink>
                </Link>
            </Flex>
            <Flex mt="20px" justify="center" color="muted" align="center" gap="6px" fontSize="11px">
                <LockKeyhole size={13} />
                비밀번호는 암호화되어 안전하게 보관됩니다.
            </Flex>
        </AuthFrame>
    );
}

function SocialPreview({
    mark,
    label,
    tone = "surfaceMuted",
}: {
    mark: string;
    label: string;
    tone?: string;
}) {
    return (
        <Button
            disabled
            aria-label={`${label} 로그인 (준비 중)`}
            variant="outline"
            h="46px"
            px="8px"
            borderColor="line"
            title={`${label} 로그인은 추후 제공됩니다.`}
        >
            <Flex
                w="22px"
                h="22px"
                borderRadius="full"
                bg={tone}
                color={tone === "yellow.400" ? "black" : "white"}
                align="center"
                justify="center"
                fontSize="10px"
                fontWeight="900"
            >
                {mark}
            </Flex>
            <Text display={{ base: "none", sm: "block" }} fontSize="11px">
                {label}
            </Text>
        </Button>
    );
}
