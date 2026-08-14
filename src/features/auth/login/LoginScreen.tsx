"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Separator, Text } from "@chakra-ui/react";
import { ArrowRight } from "lucide-react";
import { AuthFrame } from "@/components/AuthFrame";
import {
    AppButton,
    AppInput,
    AuthHeading,
    FlexLayout,
    FormField,
    StatusAlert,
} from "@/components/ui";
import { authRequest, rememberUser, type AuthUser } from "@/lib/auth-client";
import { startGlobalLoading } from "@/lib/global-loading";
import { ROUTES } from "@/lib/route-paths";
import { LoginNavigation } from "./LoginNavigation";
import { SocialLoginPreview } from "./SocialLoginPreview";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);
    const router = useRouter();
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
                    : ROUTES.HOME;
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
            <AuthHeading
                eyebrow="WELCOME BACK"
                title="로그인"
                description="가입한 아이디와 비밀번호를 입력하세요."
            />
            <Box
                mt="36px"
                as="form"
                onSubmit={(event) => {
                    event.preventDefault();
                    void login();
                }}
            >
                <FormField label="아이디" required>
                    <AppInput
                        autoFocus
                        autoCapitalize="none"
                        autoComplete="username"
                        placeholder="아이디"
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                    />
                </FormField>
                <FormField label="비밀번호" required mt="18px">
                    <AppInput
                        type="password"
                        autoComplete="current-password"
                        placeholder="비밀번호"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                    />
                </FormField>
                {error ? <StatusAlert status="error" mt="20px" message={error} /> : null}
                <AppButton
                    tone="primary"
                    type="submit"
                    w="full"
                    mt="26px"
                    size="lg"
                    loading={busy}
                    disabled={!username || !password}
                >
                    로그인
                    <ArrowRight />
                </AppButton>
            </Box>
            <FlexLayout my="28px" align="center" gap="12px">
                <Separator flex="1" />
                <Text color="muted" fontSize="11px">
                    간편 로그인 · 준비 중
                </Text>
                <Separator flex="1" />
            </FlexLayout>
            <SocialLoginPreview />
            <LoginNavigation />
        </AuthFrame>
    );
}
