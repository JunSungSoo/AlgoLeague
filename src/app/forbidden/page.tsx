import NextLink from "next/link";
import { Box, Button, Heading, Text } from "@chakra-ui/react";
import { ShieldX } from "lucide-react";

export default function ForbiddenPage() {
    return (
        <Box
            w="full"
            maxW="560px"
            mx="auto"
            px="20px"
            py={{ base: "72px", md: "120px" }}
            textAlign="center"
            wordBreak="keep-all"
        >
            <Box color="accent" display="flex" justifyContent="center">
                <ShieldX size={48} />
            </Box>
            <Heading mt="20px" fontSize={{ base: "26px", md: "30px" }}>
                접근 권한이 없습니다
            </Heading>
            <Text mt="12px" color="muted" lineHeight="1.7">
                관리 기능은 운영자 또는 관리자 권한이 있는 계정만 사용할 수 있습니다.
            </Text>
            <Button asChild mt="28px" bg="accent" color="accentContrast">
                <NextLink href="/">홈으로 돌아가기</NextLink>
            </Button>
        </Box>
    );
}
