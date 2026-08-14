import { Heading, Text } from "@chakra-ui/react";

export function AuthHeading({
    eyebrow,
    title,
    description,
}: {
    eyebrow: string;
    title: string;
    description: string;
}) {
    return (
        <>
            <Text color="accent" fontSize="11px" fontWeight="800" letterSpacing=".14em">
                {eyebrow}
            </Text>
            <Heading mt="8px" fontSize="34px" letterSpacing="-.05em">
                {title}
            </Heading>
            <Text mt="10px" color="muted">
                {description}
            </Text>
        </>
    );
}
