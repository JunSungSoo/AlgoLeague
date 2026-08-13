"use client";

import { useEffect, useRef, useState } from "react";
import {
    Alert,
    Avatar,
    Box,
    Button,
    Dialog,
    Field,
    Flex,
    Grid,
    Heading,
    Input,
    Spinner,
    Text,
    VisuallyHidden,
} from "@chakra-ui/react";
import {
    ArrowUpRight,
    Camera,
    Check,
    Code2,
    KeyRound,
    PencilLine,
    ShieldCheck,
    Trash2,
    X,
} from "lucide-react";
import { GradeBadge, PageHeader, Panel, SectionHeader } from "@/components/primitives";
import {
    authGet,
    authRequest,
    currentUser,
    rememberUser,
    type AuthUser,
    type ProgrammingLanguage,
} from "@/lib/auth-client";

const languages: [ProgrammingLanguage, string][] = [
    ["python", "Python"],
    ["java", "Java"],
    ["javascript", "JavaScript"],
    ["cpp", "C++"],
];
type ProfileResponse = {
    user: AuthUser;
    nicknameChangedAt: string | null;
    nicknameChangeAvailableAt: string | null;
    canChangeNickname: boolean;
};
type GradeProgress = {
    grade: number;
    verifiedSolves: number;
    progress: { current: number; required: number; label: string; next: number | null };
    championsEligible: boolean;
    acceptedDates: string[];
    events: Array<{
        id: string;
        kind: string;
        fromGrade: number;
        toGrade: number;
        checkpoint: number;
        createdAt: string;
    }>;
};

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
    const [busy, setBusy] = useState<
        "nickname" | "password-code" | "password-verify" | "password" | "language" | "image" | null
    >(null);
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
    if (loading)
        return (
            <Flex minH="55vh" align="center" justify="center" color="muted" gap="10px">
                <Spinner size="sm" />
                <Text>프로필을 불러오는 중입니다.</Text>
            </Flex>
        );
    const user = profile?.user;
    const availableLabel = profile?.nicknameChangeAvailableAt
        ? new Intl.DateTimeFormat("ko-KR", { dateStyle: "long", timeZone: "Asia/Seoul" }).format(
              new Date(profile.nicknameChangeAvailableAt),
          )
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
                    <Flex align="center" gap="8px" color="muted" fontSize="12px">
                        <ShieldCheck size={16} />
                        <Text display={{ base: "none", sm: "block" }}>
                            계정 정보는 안전하게 보호됩니다.
                        </Text>
                    </Flex>
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
            <Grid
                templateColumns={{ base: "1fr", lg: "minmax(0,1.55fr) minmax(280px,.75fr)" }}
                gap="18px"
            >
                <Panel>
                    <GradeBadge>현재 {gradeProgress?.grade ?? user?.grade ?? "-"}급</GradeBadge>
                    <Heading as="h2" fontSize="20px" mt="18px">
                        누적 정답 {gradeProgress?.verifiedSolves ?? user?.verifiedSolves ?? 0}개
                    </Heading>
                    <Text color="muted" my="10px">
                        {gradeProgress?.progress.next
                            ? `다음 ${gradeProgress.progress.next}급까지 ${Math.max(0, gradeProgress.progress.required - gradeProgress.progress.current)}문제가 남았습니다.`
                            : (gradeProgress?.progress.label ?? "등급 데이터를 불러오는 중입니다.")}
                    </Text>
                    <Box h="8px" borderRadius="full" bg="surfaceMuted">
                        <Box
                            w={`${gradeProgress ? Math.min(100, Math.round((gradeProgress.progress.current / gradeProgress.progress.required) * 100)) : 0}%`}
                            h="full"
                            bg="accent"
                            borderRadius="full"
                        />
                    </Box>
                </Panel>
                <Panel>
                    <Text
                        textTransform="uppercase"
                        letterSpacing=".16em"
                        fontWeight="800"
                        fontSize="10px"
                        color="accent"
                    >
                        DEFAULT LANGUAGE
                    </Text>
                    <Heading as="h2" fontSize="20px" mt="12px">
                        {
                            languages.find(
                                ([value]) => value === (user?.preferredLanguage ?? language),
                            )?.[1]
                        }
                    </Heading>
                    <Text color="muted" fontSize="13px" mt="5px">
                        새 문제를 열 때 먼저 선택됩니다.
                    </Text>
                </Panel>
            </Grid>
            <SectionHeader title="계정 설정" />
            <Grid
                templateColumns={{ base: "1fr", xl: "minmax(300px,.8fr) minmax(0,1.2fr)" }}
                gap="18px"
                alignItems="start"
            >
                <Grid gap="18px">
                    <Panel>
                        <Flex align="center" gap="16px">
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
                                <Flex gap="8px" mt="13px" wrap="wrap">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => fileInputRef.current?.click()}
                                        loading={busy === "image"}
                                    >
                                        <Camera size={15} />
                                        {user?.profileImageUrl ? "사진 변경" : "사진 등록"}
                                    </Button>
                                    {user?.profileImageUrl && (
                                        <Button
                                            size="sm"
                                            variant="plain"
                                            color="red.600"
                                            onClick={removeProfileImage}
                                            disabled={busy === "image"}
                                        >
                                            <Trash2 size={14} />
                                            삭제
                                        </Button>
                                    )}
                                </Flex>
                                <VisuallyHidden>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={changeProfileImage}
                                    />
                                </VisuallyHidden>
                            </Box>
                        </Flex>
                    </Panel>
                    <Panel>
                        <Flex align="center" gap="10px">
                            <Flex
                                w="36px"
                                h="36px"
                                borderRadius="11px"
                                bg="accentSubtle"
                                color="accent"
                                align="center"
                                justify="center"
                            >
                                <PencilLine size={17} />
                            </Flex>
                            <Box>
                                <Heading as="h3" fontSize="16px">
                                    닉네임 변경
                                </Heading>
                                <Text color="muted" fontSize="11px">
                                    마지막 변경일로부터 1개월마다 1회
                                </Text>
                            </Box>
                        </Flex>
                        <Field.Root mt="22px" required>
                            <Field.Label>새 닉네임</Field.Label>
                            <Input
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
                        <Button
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
                        </Button>
                    </Panel>
                    <Panel py="17px">
                        <Flex align="center" justify="space-between" gap="14px">
                            <Flex align="center" gap="10px">
                                <Flex
                                    w="36px"
                                    h="36px"
                                    borderRadius="11px"
                                    bg="surfaceMuted"
                                    color="accent"
                                    align="center"
                                    justify="center"
                                >
                                    <KeyRound size={17} />
                                </Flex>
                                <Box>
                                    <Heading as="h3" fontSize="14px">
                                        계정 보안
                                    </Heading>
                                    <Text color="muted" fontSize="11px">
                                        휴대폰 인증 후 비밀번호를 변경합니다.
                                    </Text>
                                </Box>
                            </Flex>
                            <Button
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
                            </Button>
                        </Flex>
                    </Panel>
                </Grid>
                <Panel position={{ xl: "sticky" }} top={{ xl: "92px" }}>
                    <Flex align="center" gap="10px">
                        <Flex
                            w="36px"
                            h="36px"
                            borderRadius="11px"
                            bg="accentSubtle"
                            color="accent"
                            align="center"
                            justify="center"
                        >
                            <Code2 size={17} />
                        </Flex>
                        <Box>
                            <Heading as="h3" fontSize="16px">
                                선호 프로그래밍 언어
                            </Heading>
                            <Text color="muted" fontSize="11px">
                                문제 풀이 에디터의 기본 언어를 정합니다.
                            </Text>
                        </Box>
                    </Flex>
                    <Grid
                        role="radiogroup"
                        aria-label="선호 프로그래밍 언어"
                        templateColumns={{ base: "1fr", sm: "1fr 1fr" }}
                        gap="10px"
                        mt="22px"
                    >
                        {languages.map(([value, label]) => {
                            const selected = language === value;
                            return (
                                <Box
                                    key={value}
                                    as="label"
                                    position="relative"
                                    cursor="pointer"
                                    minH="88px"
                                    borderWidth="1px"
                                    borderColor={selected ? "accent" : "line"}
                                    bg={selected ? "accentSubtle" : "surface"}
                                    borderRadius="13px"
                                    p="15px"
                                    transition="all .15s"
                                    _hover={{ borderColor: "accent" }}
                                >
                                    <VisuallyHidden>
                                        <input
                                            type="radio"
                                            name="profilePreferredLanguage"
                                            value={value}
                                            checked={selected}
                                            onChange={() => setLanguage(value)}
                                        />
                                    </VisuallyHidden>
                                    <Flex
                                        pointerEvents="none"
                                        justify="space-between"
                                        color={selected ? "accent" : "fg"}
                                    >
                                        <Code2 size={17} />
                                        {selected && <Check size={16} />}
                                    </Flex>
                                    <Text
                                        pointerEvents="none"
                                        mt="16px"
                                        fontWeight="800"
                                        fontSize="13px"
                                    >
                                        {label}
                                    </Text>
                                </Box>
                            );
                        })}
                    </Grid>
                    <Button
                        mt="20px"
                        w="full"
                        bg="accent"
                        color="accentContrast"
                        onClick={changeLanguage}
                        loading={busy === "language"}
                        disabled={language === user?.preferredLanguage}
                    >
                        기본 언어 저장
                    </Button>
                    <Box mt="18px" pt="17px" borderTopWidth="1px" borderColor="line">
                        <Text fontSize="11px" color="muted">
                            변경 즉시 문제 풀이 화면과 이 기기의 기본 선택값에 반영됩니다.
                        </Text>
                    </Box>
                </Panel>
            </Grid>
            <SectionHeader title="성장 기록" />
            {gradeProgress?.events.length ? (
                <Grid
                    gap="1px"
                    bg="line"
                    borderWidth="1px"
                    borderColor="line"
                    borderRadius="15px"
                    overflow="hidden"
                >
                    {gradeProgress.events.map((event) => (
                        <Flex
                            key={event.id}
                            bg="surface"
                            p="15px 18px"
                            align="center"
                            justify="space-between"
                        >
                            <Box>
                                <Text fontWeight="800" fontSize="13px">
                                    {event.kind === "PROMOTED"
                                        ? `${event.toGrade}급으로 승급`
                                        : event.kind === "DEMOTED"
                                          ? `${event.toGrade}급으로 강등`
                                          : event.kind}
                                </Text>
                                <Text mt="4px" color="muted" fontSize="11px">
                                    {event.fromGrade}급 → {event.toGrade}급 · 검증 정답{" "}
                                    {event.checkpoint}개
                                </Text>
                            </Box>
                            <Text color="muted" fontSize="11px">
                                {new Intl.DateTimeFormat("ko-KR", {
                                    dateStyle: "medium",
                                    timeZone: "Asia/Seoul",
                                }).format(new Date(event.createdAt))}
                            </Text>
                        </Flex>
                    ))}
                </Grid>
            ) : (
                <Box
                    borderWidth="1px"
                    borderStyle="dashed"
                    borderColor="line"
                    p="28px"
                    borderRadius="15px"
                    color="muted"
                    textAlign="center"
                >
                    아직 승급·강등 기록이 없습니다. 문제를 해결하면 실제 성장 기록이 쌓입니다.
                </Box>
            )}
            <Dialog.Root
                open={passwordOpen}
                onOpenChange={(details) => {
                    setPasswordOpen(details.open);
                    if (!details.open) resetPasswordFlow();
                }}
                placement="center"
                motionPreset="slide-in-bottom"
            >
                <Dialog.Backdrop bg="blackAlpha.700" backdropFilter="blur(5px)" />
                <Dialog.Positioner p={{ base: "14px", md: "24px" }}>
                    <Dialog.Content
                        maxW="500px"
                        bg="surface"
                        borderWidth="1px"
                        borderColor="line"
                        borderRadius="18px"
                        boxShadow="2xl"
                    >
                        <Dialog.Header display="block" pr="52px" pt="25px">
                            <Flex
                                w="40px"
                                h="40px"
                                borderRadius="12px"
                                bg="accentSubtle"
                                color="accent"
                                align="center"
                                justify="center"
                                mb="16px"
                            >
                                <KeyRound size={19} />
                            </Flex>
                            <Dialog.Title fontSize="22px" letterSpacing="-.03em">
                                비밀번호 변경
                            </Dialog.Title>
                            <Dialog.Description mt="7px" color="muted" fontSize="13px">
                                등록된 휴대폰 {maskPhone(user?.phone)}로 본인 인증을 진행합니다.
                            </Dialog.Description>
                        </Dialog.Header>
                        <Dialog.CloseTrigger asChild>
                            <Button
                                aria-label="닫기"
                                variant="ghost"
                                size="sm"
                                position="absolute"
                                top="15px"
                                right="15px"
                            >
                                <X size={18} />
                            </Button>
                        </Dialog.CloseTrigger>
                        <Dialog.Body pb="6px">
                            {!passwordFlow.challengeId && (
                                <Box
                                    borderWidth="1px"
                                    borderColor="line"
                                    borderRadius="13px"
                                    p="16px"
                                    bg="surfaceMuted"
                                >
                                    <Text fontSize="12px" color="muted">
                                        인증번호를 요청하면 6자리 번호가 전송됩니다.
                                    </Text>
                                    <Button
                                        mt="14px"
                                        w="full"
                                        variant="outline"
                                        onClick={requestPasswordCode}
                                        loading={busy === "password-code"}
                                    >
                                        인증번호 받기
                                    </Button>
                                </Box>
                            )}
                            {passwordFlow.challengeId && !passwordFlow.verificationToken && (
                                <Field.Root required>
                                    <Field.Label>휴대폰 인증번호</Field.Label>
                                    <Flex gap="8px">
                                        <Input
                                            inputMode="numeric"
                                            autoComplete="one-time-code"
                                            maxLength={6}
                                            placeholder="6자리 숫자"
                                            value={passwordFlow.code}
                                            onChange={(event) =>
                                                setPasswordFlow((value) => ({
                                                    ...value,
                                                    code: event.target.value.replace(/\D/g, ""),
                                                }))
                                            }
                                        />
                                        <Button
                                            minW="88px"
                                            bg="accent"
                                            color="accentContrast"
                                            onClick={verifyPasswordCode}
                                            disabled={passwordFlow.code.length !== 6}
                                            loading={busy === "password-verify"}
                                        >
                                            인증
                                        </Button>
                                    </Flex>
                                    {passwordFlow.devCode && (
                                        <Field.HelperText color="accent">
                                            개발용 인증번호: <strong>{passwordFlow.devCode}</strong>
                                        </Field.HelperText>
                                    )}
                                </Field.Root>
                            )}
                            {passwordFlow.verificationToken && (
                                <>
                                    <Field.Root required>
                                        <Field.Label>새 비밀번호</Field.Label>
                                        <Input
                                            type="password"
                                            autoComplete="new-password"
                                            placeholder="영문·숫자 포함 8자 이상"
                                            value={passwordFlow.next}
                                            onChange={(event) =>
                                                setPasswordFlow((value) => ({
                                                    ...value,
                                                    next: event.target.value,
                                                }))
                                            }
                                        />
                                    </Field.Root>
                                    <Field.Root
                                        required
                                        mt="16px"
                                        invalid={
                                            Boolean(passwordFlow.confirm) &&
                                            passwordFlow.next !== passwordFlow.confirm
                                        }
                                    >
                                        <Field.Label>새 비밀번호 확인</Field.Label>
                                        <Input
                                            type="password"
                                            autoComplete="new-password"
                                            value={passwordFlow.confirm}
                                            onChange={(event) =>
                                                setPasswordFlow((value) => ({
                                                    ...value,
                                                    confirm: event.target.value,
                                                }))
                                            }
                                        />
                                        <Field.ErrorText>
                                            비밀번호가 일치하지 않습니다.
                                        </Field.ErrorText>
                                    </Field.Root>
                                </>
                            )}
                            {passwordError && (
                                <Alert.Root status="error" mt="18px">
                                    <Alert.Indicator />
                                    <Alert.Content>
                                        <Alert.Description>{passwordError}</Alert.Description>
                                    </Alert.Content>
                                </Alert.Root>
                            )}
                            {passwordMessage && !passwordError && (
                                <Alert.Root status="success" mt="18px">
                                    <Alert.Indicator />
                                    <Alert.Content>
                                        <Alert.Description>{passwordMessage}</Alert.Description>
                                    </Alert.Content>
                                </Alert.Root>
                            )}
                        </Dialog.Body>
                        <Dialog.Footer pt="18px" pb="24px">
                            <Button variant="ghost" onClick={() => setPasswordOpen(false)}>
                                취소
                            </Button>
                            {passwordFlow.verificationToken && (
                                <Button
                                    bg="accent"
                                    color="accentContrast"
                                    onClick={changePassword}
                                    loading={busy === "password"}
                                    disabled={
                                        passwordFlow.next.length < 8 ||
                                        passwordFlow.next !== passwordFlow.confirm
                                    }
                                >
                                    비밀번호 저장
                                </Button>
                            )}
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Dialog.Root>
        </Box>
    );
}

function maskPhone(phone?: string) {
    if (!phone) return "휴대폰";
    const digits = phone.replace(/\D/g, "");
    return `010-****-${digits.slice(-4)}`;
}
function resizeProfileImage(file: File) {
    return new Promise<string>((resolve, reject) => {
        const image = new Image();
        const objectUrl = URL.createObjectURL(file);
        image.onload = () => {
            try {
                const size = Math.min(image.naturalWidth, image.naturalHeight);
                const canvas = document.createElement("canvas");
                canvas.width = 320;
                canvas.height = 320;
                const context = canvas.getContext("2d");
                if (!context) throw new Error("이미지를 처리하지 못했습니다.");
                context.drawImage(
                    image,
                    (image.naturalWidth - size) / 2,
                    (image.naturalHeight - size) / 2,
                    size,
                    size,
                    0,
                    0,
                    320,
                    320,
                );
                resolve(canvas.toDataURL("image/webp", 0.82));
            } catch (error) {
                reject(error);
            } finally {
                URL.revokeObjectURL(objectUrl);
            }
        };
        image.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error("이미지를 읽지 못했습니다."));
        };
        image.src = objectUrl;
    });
}
