import { Text } from "@chakra-ui/react";
import { AppButton, FlexLayout } from "@/components/ui";

export function SocialLoginButton({
    mark,
    label,
    tone = "surfaceMuted",
}: {
    mark: string;
    label: string;
    tone?: string;
}) {
    return (
        <AppButton
            disabled
            aria-label={`${label} 로그인 (준비 중)`}
            variant="outline"
            h="46px"
            px="8px"
            borderColor="line"
            title={`${label} 로그인은 추후 제공됩니다.`}
        >
            <FlexLayout
                layout="center"
                w="22px"
                h="22px"
                borderRadius="full"
                bg={tone}
                color={tone === "yellow.400" ? "black" : "white"}
                fontSize="10px"
                fontWeight="900"
            >
                {mark}
            </FlexLayout>
            <Text display={{ base: "none", sm: "block" }} fontSize="11px">
                {label}
            </Text>
        </AppButton>
    );
}
