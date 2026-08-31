"use client";

import {
    createToaster,
    Toaster,
    ToastCloseTrigger,
    ToastDescription,
    ToastIndicator,
    ToastRoot,
    ToastTitle,
} from "@chakra-ui/react";

const APP_TOAST_DURATION_MS = 4_500;

export const APP_TOASTER = createToaster({
    placement: "top",
    offsets: { top: "88px", right: "1rem", bottom: "1rem", left: "1rem" },
    gap: 12,
    max: 3,
});

export function showAppErrorToast(title: string, description: string) {
    APP_TOASTER.create({
        type: "error",
        title,
        description,
        duration: APP_TOAST_DURATION_MS,
    });
}

export function AppToast() {
    return (
        <Toaster toaster={APP_TOASTER}>
            {(toast) => (
                <ToastRoot key={toast.id}>
                    <ToastIndicator />
                    <ToastTitle>{toast.title}</ToastTitle>
                    <ToastDescription>{toast.description}</ToastDescription>
                    <ToastCloseTrigger />
                </ToastRoot>
            )}
        </Toaster>
    );
}
