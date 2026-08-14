"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    authRequest,
    rememberUser,
    type AuthUser,
    type ProgrammingLanguage,
} from "@/lib/auth-client";
import { startGlobalLoading } from "@/lib/global-loading";
import { ROUTES } from "@/lib/route-paths";

export type SignupForm = {
    username: string;
    password: string;
    passwordConfirm: string;
    name: string;
    phone: string;
    nickname: string;
    address: string;
    preferredLanguage: ProgrammingLanguage;
};

const INITIAL_FORM: SignupForm = {
    username: "",
    password: "",
    passwordConfirm: "",
    name: "",
    phone: "",
    nickname: "",
    address: "",
    preferredLanguage: "python",
};

export function useSignupForm() {
    const [form, setForm] = useState(INITIAL_FORM);
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
    const router = useRouter();

    function update<K extends keyof SignupForm>(key: K, value: SignupForm[K]) {
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

    async function perform(action: () => Promise<void>, fallback: string) {
        setBusy(true);
        setError("");
        try {
            await action();
        } catch (value) {
            setError(value instanceof Error ? value.message : fallback);
        } finally {
            setBusy(false);
        }
    }

    const requestCode = () =>
        perform(async () => {
            const result = await authRequest<{ challengeId: string; devCode?: string }>(
                "/api/auth/phone/request",
                { phone: form.phone, purpose: "signup" },
            );
            setChallengeId(result.challengeId);
            setDevCode(result.devCode ?? "");
            setMessage("인증번호를 전송했습니다.");
        }, "인증번호를 요청하지 못했습니다.");

    const verifyCode = () =>
        perform(async () => {
            const result = await authRequest<{ verificationToken: string }>(
                "/api/auth/phone/verify",
                { challengeId, code },
            );
            setVerificationToken(result.verificationToken);
            setMessage("휴대폰 인증이 완료되었습니다.");
        }, "인증하지 못했습니다.");

    const checkNickname = () => {
        setNicknameChecked(false);
        return perform(async () => {
            const result = await authRequest<{ available: boolean; message: string }>(
                "/api/auth/nickname/check",
                { nickname: form.nickname },
            );
            setNicknameChecked(true);
            setNicknameAvailable(result.available);
            setMessage(result.message);
        }, "중복 확인에 실패했습니다.");
    };

    const checkUsername = () => {
        setUsernameChecked(false);
        return perform(async () => {
            const result = await authRequest<{ available: boolean; message: string }>(
                "/api/auth/username/check",
                { username: form.username },
            );
            setUsernameChecked(true);
            setUsernameAvailable(result.available);
            setMessage(result.message);
        }, "중복 확인에 실패했습니다.");
    };

    async function submit() {
        if (form.password !== form.passwordConfirm) {
            setError("비밀번호 확인이 일치하지 않습니다.");
            return;
        }
        await perform(async () => {
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
            router.push(ROUTES.HOME);
            router.refresh();
        }, "회원가입을 완료하지 못했습니다.");
    }

    const passwordValid =
        form.password.length >= 8 &&
        /[A-Za-z]/.test(form.password) &&
        /\d/.test(form.password) &&
        form.password === form.passwordConfirm;
    const ready = Boolean(
        form.name.trim().length >= 2 &&
        verificationToken &&
        usernameChecked &&
        usernameAvailable &&
        nicknameChecked &&
        nicknameAvailable &&
        passwordValid,
    );

    return {
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
    };
}
