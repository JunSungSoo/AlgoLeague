"use client";

import { ChakraProvider } from "@chakra-ui/react";
import { system } from "@/theme";
import { RippleLayer } from "@/components/ripple-layer";
import { GlobalLoadingLayer } from "@/components/global-loading-layer";

export function Provider({ children }: { children: React.ReactNode }) {
    return (
        <ChakraProvider value={system}>
            <GlobalLoadingLayer />
            <RippleLayer />
            {children}
        </ChakraProvider>
    );
}
