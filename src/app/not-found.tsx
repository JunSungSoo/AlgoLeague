import Image from "next/image";
import NextLink from "next/link";
import { Button, Flex, Heading } from "@chakra-ui/react";
import { ROUTES } from "@/lib/route-paths";

export default function NotFound() {
    return (
        <Flex
            minH={{ base: "calc(100svh - 66px)", md: "calc(100svh - 74px)" }}
            px="20px"
            py="40px"
            direction="column"
            align="center"
            justify="center"
            gap={{ base: "18px", md: "22px" }}
            textAlign="center"
        >
            <Image
                src="/brand/algodal-404-cutout-v1.png"
                alt="물음표를 띄운 채 의아해하는 알고달"
                width={1254}
                height={1254}
                priority
                sizes="(max-width: 768px) 180px, 230px"
                style={{ width: "clamp(180px, 20vw, 230px)", height: "auto" }}
            />
            <Heading as="h1" fontSize={{ base: "21px", md: "24px" }}>
                페이지를 찾을 수 없습니다.
            </Heading>
            <Button
                asChild
                bg="accent"
                color="accentContrast"
                borderRadius="12px"
                _hover={{ bg: "brand.700" }}
            >
                <NextLink href={ROUTES.HOME}>홈으로 돌아가기</NextLink>
            </Button>
        </Flex>
    );
}
