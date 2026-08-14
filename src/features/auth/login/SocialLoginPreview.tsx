import { SimpleGrid } from "@chakra-ui/react";
import { SocialLoginButton } from "./SocialLoginButton";

export function SocialLoginPreview() {
    return (
        <SimpleGrid columns={3} gap="8px">
            <SocialLoginButton mark="G" label="Google" />
            <SocialLoginButton mark="N" label="네이버" tone="green.500" />
            <SocialLoginButton mark="K" label="카카오" tone="yellow.400" />
        </SimpleGrid>
    );
}
