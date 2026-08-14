import { Alert, type AlertRootProps } from "@chakra-ui/react";

type StatusAlertProps = AlertRootProps & {
    message: React.ReactNode;
    title?: React.ReactNode;
};

export function StatusAlert({ message, title, ...props }: StatusAlertProps) {
    return (
        <Alert.Root {...props}>
            <Alert.Indicator />
            <Alert.Content>
                {title ? <Alert.Title>{title}</Alert.Title> : null}
                <Alert.Description>{message}</Alert.Description>
            </Alert.Content>
        </Alert.Root>
    );
}
