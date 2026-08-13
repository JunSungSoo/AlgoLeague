import NextLink from "next/link";
import { Badge, Box, Button, Flex, Heading, Text, type BoxProps } from "@chakra-ui/react";

export function Eyebrow({ children }: { children: React.ReactNode }) {
    return (
        <Text
            textTransform="uppercase"
            letterSpacing=".16em"
            fontWeight="800"
            fontSize="10px"
            color="accent"
        >
            {children}
        </Text>
    );
}

export function Panel(props: BoxProps) {
    return (
        <Box
            bg="surface"
            borderWidth="1px"
            borderColor="line"
            borderRadius="panel"
            boxShadow="panel"
            p="22px"
            {...props}
        />
    );
}

export function GradeBadge({
    children,
    subtle = false,
}: {
    children: React.ReactNode;
    subtle?: boolean;
}) {
    return (
        <Badge
            borderRadius="full"
            px="10px"
            py="6px"
            fontSize="11px"
            fontWeight="800"
            bg={subtle ? "surfaceMuted" : "brand.300"}
            color={subtle ? "muted" : "brand.900"}
        >
            {children}
        </Badge>
    );
}

export function PageHeader({
    eyebrow,
    title,
    action,
}: {
    eyebrow: string;
    title: string;
    action?: React.ReactNode;
}) {
    return (
        <Flex justify="space-between" align="center" gap="5" mb="34px">
            <Box>
                <Eyebrow>{eyebrow}</Eyebrow>
                <Heading
                    as="h1"
                    fontSize={{ base: "26px", md: "32px" }}
                    letterSpacing="-.04em"
                    mt="7px"
                >
                    {title}
                </Heading>
            </Box>
            {action}
        </Flex>
    );
}

export function SectionHeader({
    title,
    href,
    label,
}: {
    title: string;
    href?: string;
    label?: string;
}) {
    return (
        <Flex justify="space-between" align="end" mt="29px" mb="13px">
            <Heading as="h2" fontSize="20px" letterSpacing="-.02em">
                {title}
            </Heading>
            {href && (
                <NextLink href={href}>
                    <Text fontSize="12px" color="accent" fontWeight="800">
                        {label ?? "전체 보기"}
                    </Text>
                </NextLink>
            )}
        </Flex>
    );
}

export function PrimaryLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <Button
            asChild
            bg="brand.300"
            color="brand.900"
            _hover={{ bg: "brand.100" }}
            fontWeight="800"
        >
            <NextLink href={href}>{children}</NextLink>
        </Button>
    );
}
