import { Button, type ButtonProps } from "@chakra-ui/react";

type AppButtonProps = ButtonProps & {
    tone?: "default" | "primary" | "danger";
};

export function AppButton({ tone = "default", ...props }: AppButtonProps) {
    const toneProps: ButtonProps =
        tone === "primary"
            ? { bg: "accent", color: "accentContrast", _hover: { opacity: 0.88 } }
            : tone === "danger"
              ? { color: "red.600", variant: "plain" }
              : {};

    return <Button {...toneProps} {...props} />;
}
