import { Alert, Box, Dialog, Field, Text } from "@chakra-ui/react";
import { KeyRound, X } from "lucide-react";
import { AppButton, AppInput, FlexLayout } from "@/components/ui";
import type { PasswordFlow, ProfileBusy } from "./profile-types";
import { maskPhone } from "./profile-utils";

type PasswordChangeDialogProps = {
    open: boolean;
    phone?: string;
    flow: PasswordFlow;
    setFlow: React.Dispatch<React.SetStateAction<PasswordFlow>>;
    busy: ProfileBusy;
    error: string;
    message: string;
    onOpenChange: (open: boolean) => void;
    onRequestCode: () => void;
    onVerifyCode: () => void;
    onSave: () => void;
};

export function PasswordChangeDialog({
    open,
    phone,
    flow,
    setFlow,
    busy,
    error,
    message,
    onOpenChange,
    onRequestCode,
    onVerifyCode,
    onSave,
}: PasswordChangeDialogProps) {
    return (
        <Dialog.Root
            open={open}
            onOpenChange={(details) => onOpenChange(details.open)}
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
                        <FlexLayout
                            layout="center"
                            w="40px"
                            h="40px"
                            borderRadius="12px"
                            bg="accentSubtle"
                            color="accent"
                            mb="16px"
                        >
                            <KeyRound size={19} />
                        </FlexLayout>
                        <Dialog.Title fontSize="22px" letterSpacing="-.03em">
                            비밀번호 변경
                        </Dialog.Title>
                        <Dialog.Description mt="7px" color="muted" fontSize="13px">
                            등록된 휴대폰 {maskPhone(phone)}로 본인 인증을 진행합니다.
                        </Dialog.Description>
                    </Dialog.Header>
                    <Dialog.CloseTrigger asChild>
                        <AppButton
                            aria-label="닫기"
                            variant="ghost"
                            size="sm"
                            position="absolute"
                            top="15px"
                            right="15px"
                        >
                            <X size={18} />
                        </AppButton>
                    </Dialog.CloseTrigger>
                    <Dialog.Body pb="6px">
                        {!flow.challengeId ? (
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
                                <AppButton
                                    mt="14px"
                                    w="full"
                                    variant="outline"
                                    onClick={onRequestCode}
                                    loading={busy === "password-code"}
                                >
                                    인증번호 받기
                                </AppButton>
                            </Box>
                        ) : null}
                        {flow.challengeId && !flow.verificationToken ? (
                            <Field.Root required>
                                <Field.Label>휴대폰 인증번호</Field.Label>
                                <FlexLayout gap="8px">
                                    <AppInput
                                        inputMode="numeric"
                                        autoComplete="one-time-code"
                                        maxLength={6}
                                        placeholder="6자리 숫자"
                                        value={flow.code}
                                        onChange={(event) =>
                                            setFlow((value) => ({
                                                ...value,
                                                code: event.target.value.replace(/\D/g, ""),
                                            }))
                                        }
                                    />
                                    <AppButton
                                        minW="88px"
                                        tone="primary"
                                        onClick={onVerifyCode}
                                        disabled={flow.code.length !== 6}
                                        loading={busy === "password-verify"}
                                    >
                                        인증
                                    </AppButton>
                                </FlexLayout>
                                {flow.devCode ? (
                                    <Field.HelperText color="accent">
                                        개발용 인증번호: <strong>{flow.devCode}</strong>
                                    </Field.HelperText>
                                ) : null}
                            </Field.Root>
                        ) : null}
                        {flow.verificationToken ? (
                            <>
                                <Field.Root required>
                                    <Field.Label>새 비밀번호</Field.Label>
                                    <AppInput
                                        type="password"
                                        autoComplete="new-password"
                                        placeholder="영문·숫자 포함 8자 이상"
                                        value={flow.next}
                                        onChange={(event) =>
                                            setFlow((value) => ({
                                                ...value,
                                                next: event.target.value,
                                            }))
                                        }
                                    />
                                </Field.Root>
                                <Field.Root
                                    required
                                    mt="16px"
                                    invalid={Boolean(flow.confirm) && flow.next !== flow.confirm}
                                >
                                    <Field.Label>새 비밀번호 확인</Field.Label>
                                    <AppInput
                                        type="password"
                                        autoComplete="new-password"
                                        value={flow.confirm}
                                        onChange={(event) =>
                                            setFlow((value) => ({
                                                ...value,
                                                confirm: event.target.value,
                                            }))
                                        }
                                    />
                                    <Field.ErrorText>비밀번호가 일치하지 않습니다.</Field.ErrorText>
                                </Field.Root>
                            </>
                        ) : null}
                        {error ? (
                            <Alert.Root status="error" mt="18px">
                                <Alert.Indicator />
                                <Alert.Content>
                                    <Alert.Description>{error}</Alert.Description>
                                </Alert.Content>
                            </Alert.Root>
                        ) : null}
                        {message && !error ? (
                            <Alert.Root status="success" mt="18px">
                                <Alert.Indicator />
                                <Alert.Content>
                                    <Alert.Description>{message}</Alert.Description>
                                </Alert.Content>
                            </Alert.Root>
                        ) : null}
                    </Dialog.Body>
                    <Dialog.Footer pt="18px" pb="24px">
                        <AppButton variant="ghost" onClick={() => onOpenChange(false)}>
                            취소
                        </AppButton>
                        {flow.verificationToken ? (
                            <AppButton
                                tone="primary"
                                onClick={onSave}
                                loading={busy === "password"}
                                disabled={flow.next.length < 8 || flow.next !== flow.confirm}
                            >
                                비밀번호 저장
                            </AppButton>
                        ) : null}
                    </Dialog.Footer>
                </Dialog.Content>
            </Dialog.Positioner>
        </Dialog.Root>
    );
}
