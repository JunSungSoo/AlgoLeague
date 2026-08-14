"use client";

import { ChakraProvider } from "@chakra-ui/react";
import { THEME_SYSTEM } from "@/theme";
import { RippleLayer } from "@/components/RippleLayer";
import { GlobalLoadingLayer } from "@/components/GlobalLoadingLayer";

export function Provider({ children }: { children: React.ReactNode }) {
    return (
        <ChakraProvider value={THEME_SYSTEM}>
            <GlobalLoadingLayer />
            <RippleLayer />
            {children}
        </ChakraProvider>
    );
}
