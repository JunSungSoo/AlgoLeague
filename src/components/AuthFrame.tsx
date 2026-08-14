import NextLink from "next/link";
import Image from "next/image";
import { Box, Flex, Link, Text } from "@chakra-ui/react";
import { Code2, ShieldCheck, Trophy } from "lucide-react";

export function AuthFrame({
    mode,
    children,
}: {
    mode: "login" | "signup";
    children: React.ReactNode;
}) {
    return (
        <Flex as="main" position="relative" minH="100vh" bg="canvas">
            <Flex
                position="relative"
                isolation="isolate"
                overflow="hidden"
                display={{ base: "none", lg: "flex" }}
                w="46%"
                minH="100vh"
                color="white"
                p={{ lg: "48px", xl: "64px" }}
                direction="column"
                justify="space-between"
            >
                <Image
                    src="/brand/algodal-coding-meadow-wide-v2.png"
                    alt=""
                    fill
                    priority
                    sizes="46vw"
                    style={{ objectFit: "cover", objectPosition: "center center" }}
                />
                <Box
                    position="absolute"
                    inset="0"
                    zIndex="-1"
                    bg="linear-gradient(180deg, rgba(59,42,33,.34) 0%, rgba(59,42,33,.08) 42%, rgba(59,42,33,.66) 100%)"
                />
                <Box>
                    <Link asChild _hover={{ textDecoration: "none" }}>
                        <NextLink href="/" aria-label="알고리그 홈">
                            <Flex
                                display="inline-flex"
                                align="center"
                                gap="12px"
                                p="8px 14px 8px 8px"
                                borderRadius="18px"
                                bg="rgba(59,42,33,.72)"
                                backdropFilter="blur(8px)"
                            >
                                <Flex
                                    w="58px"
                                    h="58px"
                                    borderRadius="15px"
                                    bg="brand.50"
                                    align="center"
                                    justify="center"
                                    overflow="hidden"
                                >
                                    <Image
                                        src="/brand/algoleague-otter-logo-512.png"
                                        alt=""
                                        width={58}
                                        height={58}
                                        priority
                                    />
                                </Flex>
                                <Box>
                                    <Text
                                        color="white"
                                        fontSize="15px"
                                        fontWeight="900"
                                        letterSpacing="-.02em"
                                    >
                                        알고리그
                                    </Text>
                                    <Text
                                        fontSize="9px"
                                        color="whiteAlpha.700"
                                        letterSpacing=".12em"
                                    >
                                        ALGORITHM LEAGUE
                                    </Text>
                                </Box>
                            </Flex>
                        </NextLink>
                    </Link>
                </Box>
                <Flex
                    alignSelf="flex-start"
                    gap="22px"
                    px="17px"
                    py="11px"
                    borderRadius="full"
                    bg="rgba(59,42,33,.76)"
                    backdropFilter="blur(8px)"
                    color="white"
                    fontSize="11px"
                >
                    <Flex align="center" gap="7px">
                        <Code2 size={15} />
                        4개 언어
                    </Flex>
                    <Flex align="center" gap="7px">
                        <ShieldCheck size={15} />
                        안전한 채점
                    </Flex>
                    <Flex align="center" gap="7px">
                        <Trophy size={15} />
                        등급 리그
                    </Flex>
                </Flex>
            </Flex>
            <Flex
                flex="1"
                px={{ base: "20px", md: "48px" }}
                py={{ base: "28px", md: "52px" }}
                align="center"
                justify="center"
            >
                <Box w="full" maxW={mode === "signup" ? "660px" : "460px"}>
                    {children}
                </Box>
            </Flex>
        </Flex>
    );
}
