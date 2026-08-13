import Image from "next/image";
import NextLink from "next/link";
import { Box, Button, Flex, Heading, Text } from "@chakra-ui/react";

export default function NotFound() {
    return (
        <Box
            position="relative"
            minH={{ base: "calc(100svh - 66px)", md: "calc(100svh - 74px)" }}
            overflow="hidden"
            bg="#d5a75f"
        >
            <Image
                src="/brand/algodal-404-cottage-wide-v3.png"
                alt="목재 집 한가운데서 물음표를 띄운 채 의아해하는 알고달"
                fill
                priority
                sizes="100vw"
                style={{ objectFit: "cover", objectPosition: "center center" }}
            />

            <Box
                position="absolute"
                inset="0"
                bg="linear-gradient(180deg, transparent 56%, rgba(52, 37, 30, 0.16) 100%)"
                pointerEvents="none"
            />

            <Flex
                position="absolute"
                left="50%"
                bottom={{ base: "18px", md: "28px" }}
                transform="translateX(-50%)"
                w={{ base: "calc(100% - 32px)", sm: "auto" }}
                minW={{ sm: "430px" }}
                px={{ base: "22px", md: "30px" }}
                py={{ base: "18px", md: "20px" }}
                direction={{ base: "column", sm: "row" }}
                align={{ base: "stretch", sm: "center" }}
                justify="space-between"
                gap="18px"
                borderWidth="1px"
                borderColor="rgba(255, 253, 248, 0.72)"
                borderRadius="20px"
                bg="rgba(255, 249, 240, 0.9)"
                boxShadow="0 16px 50px rgba(77, 48, 30, 0.2)"
                backdropFilter="blur(14px)"
                textAlign={{ base: "center", sm: "left" }}
            >
                <Box wordBreak="keep-all">
                    <Text color="accent" fontSize="11px" fontWeight="900" letterSpacing="0.16em">
                        404 · 길을 잃었어요
                    </Text>
                    <Heading mt="5px" fontSize={{ base: "20px", md: "23px" }}>
                        찾는 페이지가 어디 갔을까요?
                    </Heading>
                </Box>
                <Button
                    asChild
                    flex="none"
                    bg="accent"
                    color="accentContrast"
                    borderRadius="12px"
                    _hover={{ bg: "brand.700" }}
                >
                    <NextLink href="/">홈으로 돌아가기</NextLink>
                </Button>
            </Flex>
        </Box>
    );
}
