import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const THEME_CONFIG = defineConfig({
    theme: {
        tokens: {
            colors: {
                brand: {
                    50: { value: "#fffaf1" },
                    100: { value: "#f4e4cd" },
                    300: { value: "#d8ae7e" },
                    500: { value: "#ad7650" },
                    700: { value: "#875536" },
                    900: { value: "#3b2a21" },
                    950: { value: "#241a15" },
                },
            },
            fonts: {
                body: {
                    value: "Pretendard, Arial, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif",
                },
                heading: {
                    value: "Pretendard, Arial, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif",
                },
                mono: { value: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" },
            },
            radii: { panel: { value: "18px" } },
            shadows: { panel: { value: "0 3px 12px rgba(92,60,39,.06)" } },
        },
        semanticTokens: {
            colors: {
                canvas: { value: "#f8f1e7" },
                surface: { value: "#fffdf8" },
                surfaceRaised: { value: "#fff9f0" },
                surfaceMuted: { value: "#f1e3d2" },
                ink: { value: "#34251e" },
                muted: { value: "#79675c" },
                line: { value: "#e1cdb8" },
                accent: { value: "#8d5637" },
                accentSubtle: { value: "#f3dfc8" },
                accentContrast: { value: "#fffdf8" },
            },
        },
    },
    globalCss: {
        "html, body": {
            margin: 0,
            minHeight: "100%",
            bg: "canvas",
            color: "ink",
            colorScheme: "light",
        },
        "*": { boxSizing: "border-box" },
        "::selection": { bg: "brand.300", color: "brand.900" },
    },
});

export const THEME_SYSTEM = createSystem(defaultConfig, THEME_CONFIG);
