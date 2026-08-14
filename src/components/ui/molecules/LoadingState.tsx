import { Spinner, Text, type FlexProps } from "@chakra-ui/react";
import { FlexLayout } from "../atoms";

type LoadingStateProps = FlexProps & { label: string };

export function LoadingState({ label, ...props }: LoadingStateProps) {
    return (
        <FlexLayout layout="center" gap="10px" color="muted" {...props}>
            <Spinner size="sm" />
            <Text>{label}</Text>
        </FlexLayout>
    );
}
