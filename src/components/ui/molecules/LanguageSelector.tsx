import { Box, Grid, Text, VisuallyHidden, type GridProps } from "@chakra-ui/react";
import { Check, Code2 } from "lucide-react";
import type { ProgrammingLanguage } from "@/lib/auth-client";
import { FlexLayout } from "../atoms";

export type LanguageOption = {
    value: ProgrammingLanguage;
    label: string;
    description?: string;
};

export function LanguageSelector({
    name,
    value,
    options,
    onChange,
    columns = { base: "1fr 1fr", md: "repeat(4,1fr)" },
}: {
    name: string;
    value: ProgrammingLanguage;
    options: readonly LanguageOption[];
    onChange: (value: ProgrammingLanguage) => void;
    columns?: GridProps["templateColumns"];
}) {
    return (
        <Grid
            role="radiogroup"
            aria-label="선호 프로그래밍 언어"
            templateColumns={columns}
            gap="10px"
        >
            {options.map((option) => {
                const selected = value === option.value;
                return (
                    <Box
                        key={option.value}
                        as="label"
                        position="relative"
                        cursor="pointer"
                        minH={option.description ? undefined : "88px"}
                        borderWidth="1px"
                        borderColor={selected ? "accent" : "line"}
                        bg={selected ? "accentSubtle" : "surface"}
                        borderRadius="13px"
                        p="14px"
                        transition="all .15s"
                        _hover={{ borderColor: "accent" }}
                    >
                        <VisuallyHidden>
                            <input
                                type="radio"
                                name={name}
                                value={option.value}
                                checked={selected}
                                onChange={() => onChange(option.value)}
                            />
                        </VisuallyHidden>
                        <FlexLayout
                            pointerEvents="none"
                            justify="space-between"
                            color={selected ? "accent" : "fg"}
                        >
                            <Code2 size={17} />
                            {selected ? <Check size={16} /> : null}
                        </FlexLayout>
                        <Text pointerEvents="none" mt="14px" fontWeight="800" fontSize="13px">
                            {option.label}
                        </Text>
                        {option.description ? (
                            <Text pointerEvents="none" mt="3px" color="muted" fontSize="10px">
                                {option.description}
                            </Text>
                        ) : null}
                    </Box>
                );
            })}
        </Grid>
    );
}
