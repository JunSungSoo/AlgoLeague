"use client";

import { useEffect, useRef, useState } from "react";
import { Alert, Avatar, Box, Field, Grid, Heading, Text, VisuallyHidden } from "@chakra-ui/react";
import {
    ArrowUpRight,
    Camera,
    Code2,
    KeyRound,
    PencilLine,
    ShieldCheck,
    Trash2,
} from "lucide-react";
import { PageHeader, Panel, SectionHeader } from "@/components/Primitives";
import { AppButton, AppInput, FlexLayout, LanguageSelector, LoadingState } from "@/components/ui";
import {
    authGet,
    authRequest,
    currentUser,
    rememberUser,
    type AuthUser,
    type ProgrammingLanguage,
} from "@/lib/auth-client";
import { dayjs } from "@/lib/dayjs-config";
import { GrowthHistory } from "./GrowthHistory";
import { PasswordChangeDialog } from "./PasswordChangeDialog";
import { ProfileSummary } from "./ProfileSummary";
import {
    PROFILE_LANGUAGES,
    type GradeProgress,
    type ProfileBusy,
    type ProfileResponse,
} from "./profile-types";
import { resizeProfileImage } from "./profile-utils";

export default function ProfilePage() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [profile, setProfile] = useState<ProfileResponse | null>(null);
    const [gradeProgress, setGradeProgress] = useState<GradeProgress | null>(null);
    const [loading, setLoading] = useState(true);
    const [nickname, setNickname] = useState("");
    const [language, setLanguage] = useState<ProgrammingLanguage>("python");
    const [passwordOpen, setPasswordOpen] = useState(false);
    const [passwordFlow, setPasswordFlow] = useState({
        challengeId: "",
        code: "",
        devCode: "",
        verificationToken: "",
        next: "",
        confirm: "",
    });
    const [passwordError, setPasswordError] = useState("");
    const [passwordMessage, setPasswordMessage] = useState("");
    const [busy, setBusy] = useState<ProfileBusy>(null);
    const [notice, setNotice] = useState<{ kind: "success" | "error"; text: string } | null>(null);
    useEffect(() => {
        let active = true;
        void Promise.all([
            authGet<ProfileResponse>("/api/profile"),
            authGet<GradeProgress>("/api/grade-progress"),
        ])
            .then(([result, progress]) => {
                if (!active) return;
                setProfile(result);
                setGradeProgress(progress);
                setNickname(result.user.nickname);
                setLanguage(result.user.preferredLanguage);
                rememberUser(result.user);
            })
            .catch((value) => {
                const user = currentUser();
                if (user && active) {
                    setProfile({
                        user,
                        nicknameChangedAt: null,
                        nicknameChangeAvailableAt: null,
                        canChangeNickname: true,
                    });
                    setNickname(user.nickname);
                    setLanguage(user.preferredLanguage);
                }
                if (active)
                    setNotice({
                        kind: "error",
                        text:
                            value instanceof Error
                                ? value.message
                                : "프로필을 불러오지 못했습니다.",
                    });
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
    }, []);
    function updateProfile(result: ProfileResponse) {
        setProfile(result);
        setNickname(result.user.nickname);
        setLanguage(result.user.preferredLanguage);
        rememberUser(result.user);
    }
    async function changeNickname() {
        setBusy("nickname");
        setNotice(null);
        try {
            const result = await authRequest<ProfileResponse & { message: string }>(
                "/api/profile/nickname",
                { nickname },
            );
            updateProfile(result);
            setNotice({ kind: "success", text: result.message });
        } catch (value) {
            setNotice({
                kind: "error",
                text: value instanceof Error ? value.message : "닉네임을 변경하지 못했습니다.",
            });
        } finally {
            setBusy(null);
        }
    }
    function resetPasswordFlow() {
        setPasswordFlow({
            challengeId: "",
            code: "",
            devCode: "",
            verificationToken: "",
            next: "",
            confirm: "",
        });
        setPasswordError("");
        setPasswordMessage("");
    }
    async function requestPasswordCode() {
        if (!user) return;
        setBusy("password-code");
        setPasswordError("");
        setPasswordMessage("");
        try {
            const result = await authRequest<{ challengeId: string; devCode?: string }>(
                "/api/auth/phone/request",
                { phone: user.phone, purpose: "change-password" },
            );
            setPasswordFlow((value) => ({
                ...value,
                challengeId: result.challengeId,
                devCode: result.devCode ?? "",
            }));
            setPasswordMessage("인증번호를 전송했습니다. 5분 안에 입력해 주세요.");
        } catch (value) {
            setPasswordError(
                value instanceof Error ? value.message : "인증번호를 요청하지 못했습니다.",
            );
        } finally {
            setBusy(null);
        }
    }
    async function verifyPasswordCode() {
        setBusy("password-verify");
        setPasswordError("");
        try {
            const result = await authRequest<{ verificationToken: string }>(
                "/api/auth/phone/verify",
                {
                    challengeId: passwordFlow.challengeId,
                    code: passwordFlow.code,
                },
            );
            setPasswordFlow((value) => ({ ...value, verificationToken: result.verificationToken }));
            setPasswordMessage("휴대폰 인증이 완료되었습니다. 새 비밀번호를 설정해 주세요.");
        } catch (value) {
            setPasswordError(
                value instanceof Error ? value.message : "인증번호를 확인하지 못했습니다.",
            );
        } finally {
            setBusy(null);
        }
    }
    async function changePassword() {
        if (passwordFlow.next !== passwordFlow.confirm) {
            setPasswordError("새 비밀번호 확인이 일치하지 않습니다.");
            return;
        }
        setBusy("password");
        setPasswordError("");
        try {
            const result = await authRequest<{ message: string }>("/api/profile/password", {
                verificationToken: passwordFlow.verificationToken,
                newPassword: passwordFlow.next,
            });
            setPasswordOpen(false);
            resetPasswordFlow();
            setNotice({ kind: "success", text: result.message });
        } catch (value) {
            setPasswordError(
                value instanceof Error ? value.message : "비밀번호를 변경하지 못했습니다.",
            );
        } finally {
            setBusy(null);
        }
    }
    async function changeLanguage() {
        setBusy("language");
        setNotice(null);
        try {
            const result = await authRequest<{ user: AuthUser; message: string }>(
                "/api/profile/preferred-language",
                { preferredLanguage: language },
            );
            if (profile) updateProfile({ ...profile, user: result.user });
            setNotice({ kind: "success", text: result.message });
        } catch (value) {
            setNotice({
                kind: "error",
                text: value instanceof Error ? value.message : "선호 언어를 변경하지 못했습니다.",
            });
        } finally {
            setBusy(null);
        }
    }
    async function changeProfileImage(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) return;
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
            setNotice({ kind: "error", text: "JPG, PNG 또는 WebP 이미지를 선택해 주세요." });
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setNotice({ kind: "error", text: "원본 이미지는 5MB 이하여야 합니다." });
            return;
        }
        setBusy("image");
        setNotice(null);
        try {
            const imageDataUrl = await resizeProfileImage(file);
            const result = await authRequest<{ user: AuthUser; message: string }>(
                "/api/profile/image",
                {
                    imageDataUrl,
                },
            );
            if (profile) updateProfile({ ...profile, user: result.user });
            setNotice({ kind: "success", text: result.message });
        } catch (value) {
            setNotice({
                kind: "error",
                text: value instanceof Error ? value.message : "프로필 사진을 등록하지 못했습니다.",
            });
        } finally {
            setBusy(null);
        }
    }
    async function removeProfileImage() {
        setBusy("image");
        setNotice(null);
        try {
            const result = await authRequest<{ user: AuthUser; message: string }>(
                "/api/profile/image",
                {
                    imageDataUrl: null,
                },
            );
            if (profile) updateProfile({ ...profile, user: result.user });
            setNotice({ kind: "success", text: result.message });
        } catch (value) {
            setNotice({
                kind: "error",
                text: value instanceof Error ? value.message : "프로필 사진을 삭제하지 못했습니다.",
            });
        } finally {
            setBusy(null);
        }
    }
    if (loading) return <LoadingState minH="55vh" label="프로필을 불러오는 중입니다." />;
    const user = profile?.user;
    const availableLabel = profile?.nicknameChangeAvailableAt
        ? dayjs(profile.nicknameChangeAvailableAt).tz().format("YYYY년 M월 D일")
        : null;
    return (
        <Box
            maxW="1390px"
            mx="auto"
            px={{ base: "20px", md: "42px" }}
            py={{ base: "25px", md: "34px" }}
            pb="70px"
        >
            <PageHeader
                eyebrow="LEARNER PROFILE"
                title={user?.nickname ?? "학습자"}
                action={
                    <FlexLayout align="center" gap="8px" color="muted" fontSize="12px">
                        <ShieldCheck size={16} />
                        <Text display={{ base: "none", sm: "block" }}>
                            계정 정보는 안전하게 보호됩니다.
                        </Text>
                    </FlexLayout>
                }
            />
            {notice && (
                <Alert.Root status={notice.kind} mb="18px">
                    <Alert.Indicator />
                    <Alert.Content>
                        <Alert.Description>{notice.text}</Alert.Description>
                    </Alert.Content>
                </Alert.Root>
            )}
            <ProfileSummary progress={gradeProgress} user={user} language={language} />
            <SectionHeader title="계정 설정" />
            <Grid
                templateColumns={{ base: "1fr", xl: "minmax(300px,.8fr) minmax(0,1.2fr)" }}
                gap="18px"
                alignItems="start"
            >
                <Grid gap="18px">
                    <Panel>
                        <FlexLayout align="center" gap="16px">
                            <Avatar.Root size="2xl" bg="accentSubtle" color="accent">
                                <Avatar.Fallback name={user?.nickname ?? "학습자"} />
                                {user?.profileImageUrl && (
                                    <Avatar.Image
                                        src={user.profileImageUrl}
                                        alt={`${user.nickname} 프로필 사진`}
                                    />
                                )}
                            </Avatar.Root>
                            <Box flex="1">
                                <Heading as="h3" fontSize="16px">
                                    프로필 사진
                                </Heading>
                                <Text color="muted" fontSize="11px" mt="4px">
                                    JPG, PNG, WebP · 최대 5MB
                                </Text>
                                <FlexLayout gap="8px" mt="13px" wrap="wrap">
                                    <AppButton
                                        size="sm"
                                        variant="outline"
                                        onClick={() => fileInputRef.current?.click()}
                                        loading={busy === "image"}
                                    >
                                        <Camera size={15} />
                                        {user?.profileImageUrl ? "사진 변경" : "사진 등록"}
                                    </AppButton>
                                    {user?.profileImageUrl && (
                                        <AppButton
                                            size="sm"
                                            variant="plain"
                                            color="red.600"
                                            onClick={removeProfileImage}
                                            disabled={busy === "image"}
                                        >
                                            <Trash2 size={14} />
                                            삭제
                                        </AppButton>
                                    )}
                                </FlexLayout>
                                <VisuallyHidden>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={changeProfileImage}
                                    />
                                </VisuallyHidden>
                            </Box>
                        </FlexLayout>
                    </Panel>
                    <Panel>
                        <FlexLayout align="center" gap="10px">
                            <FlexLayout
                                w="36px"
                                h="36px"
                                borderRadius="11px"
                                bg="accentSubtle"
                                color="accent"
                                align="center"
                                justify="center"
                            >
                                <PencilLine size={17} />
                            </FlexLayout>
                            <Box>
                                <Heading as="h3" fontSize="16px">
                                    닉네임 변경
                                </Heading>
                                <Text color="muted" fontSize="11px">
                                    마지막 변경일로부터 1개월마다 1회
                                </Text>
                            </Box>
                        </FlexLayout>
                        <Field.Root mt="22px" required>
                            <Field.Label>새 닉네임</Field.Label>
                            <AppInput
                                value={nickname}
                                onChange={(event) => setNickname(event.target.value)}
                                maxLength={16}
                                disabled={!profile?.canChangeNickname}
                            />
                            <Field.HelperText>
                                {!profile
                                    ? "프로필 정보를 불러온 뒤 변경할 수 있습니다."
                                    : profile.canChangeNickname
                                      ? "문자, 숫자, 밑줄을 사용해 2~16자로 입력하세요."
                                      : `${availableLabel}부터 다시 변경할 수 있습니다.`}
                            </Field.HelperText>
                        </Field.Root>
                        <AppButton
                            mt="18px"
                            w="full"
                            bg="accent"
                            color="accentContrast"
                            onClick={changeNickname}
                            loading={busy === "nickname"}
                            disabled={
                                !profile?.canChangeNickname ||
                                nickname.trim().length < 2 ||
                                nickname === user?.nickname
                            }
                        >
                            닉네임 변경
                        </AppButton>
                    </Panel>
                    <Panel py="17px">
                        <FlexLayout align="center" justify="space-between" gap="14px">
                            <FlexLayout align="center" gap="10px">
                                <FlexLayout
                                    w="36px"
                                    h="36px"
                                    borderRadius="11px"
                                    bg="surfaceMuted"
                                    color="accent"
                                    align="center"
                                    justify="center"
                                >
                                    <KeyRound size={17} />
                                </FlexLayout>
                                <Box>
                                    <Heading as="h3" fontSize="14px">
                                        계정 보안
                                    </Heading>
                                    <Text color="muted" fontSize="11px">
                                        휴대폰 인증 후 비밀번호를 변경합니다.
                                    </Text>
                                </Box>
                            </FlexLayout>
                            <AppButton
                                variant="plain"
                                size="sm"
                                color="accent"
                                textDecoration="underline"
                                textUnderlineOffset="4px"
                                px="4px"
                                onClick={() => setPasswordOpen(true)}
                            >
                                비밀번호 변경
                                <ArrowUpRight size={14} />
                            </AppButton>
                        </FlexLayout>
                    </Panel>
                </Grid>
                <Panel position={{ xl: "sticky" }} top={{ xl: "92px" }}>
                    <FlexLayout align="center" gap="10px">
                        <FlexLayout
                            w="36px"
                            h="36px"
                            borderRadius="11px"
                            bg="accentSubtle"
                            color="accent"
                            align="center"
                            justify="center"
                        >
                            <Code2 size={17} />
                        </FlexLayout>
                        <Box>
                            <Heading as="h3" fontSize="16px">
                                선호 프로그래밍 언어
                            </Heading>
                            <Text color="muted" fontSize="11px">
                                문제 풀이 에디터의 기본 언어를 정합니다.
                            </Text>
                        </Box>
                    </FlexLayout>
                    <LanguageSelector
                        name="profilePreferredLanguage"
                        value={language}
                        options={PROFILE_LANGUAGES.map(([value, label]) => ({ value, label }))}
                        onChange={setLanguage}
                        columns={{ base: "1fr", sm: "1fr 1fr" }}
                    />
                    <AppButton
                        mt="20px"
                        w="full"
                        bg="accent"
                        color="accentContrast"
                        onClick={changeLanguage}
                        loading={busy === "language"}
                        disabled={language === user?.preferredLanguage}
                    >
                        기본 언어 저장
                    </AppButton>
                    <Box mt="18px" pt="17px" borderTopWidth="1px" borderColor="line">
                        <Text fontSize="11px" color="muted">
                            변경 즉시 문제 풀이 화면과 이 기기의 기본 선택값에 반영됩니다.
                        </Text>
                    </Box>
                </Panel>
            </Grid>
            <GrowthHistory events={gradeProgress?.events ?? []} />
            <PasswordChangeDialog
                open={passwordOpen}
                phone={user?.phone}
                flow={passwordFlow}
                setFlow={setPasswordFlow}
                busy={busy}
                error={passwordError}
                message={passwordMessage}
                onOpenChange={(open) => {
                    setPasswordOpen(open);
                    if (!open) resetPasswordFlow();
                }}
                onRequestCode={() => void requestPasswordCode()}
                onVerifyCode={() => void verifyPasswordCode()}
                onSave={() => void changePassword()}
            />
        </Box>
    );
}
