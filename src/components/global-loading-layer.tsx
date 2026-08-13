"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { globalLoadingEvents } from "@/lib/global-loading";

const showDelayMs = 160;
const minimumVisibleMs = 420;
const runningFrames = [
    "/brand/loading/frames-v4/algodal-run-frame-1.png",
    "/brand/loading/frames-v4/algodal-run-frame-2.png",
    "/brand/loading/frames-v4/algodal-run-frame-3.png",
] as const;

export function GlobalLoadingLayer() {
    const pathname = usePathname();
    const activeCount = useRef(0);
    const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const shownAt = useRef(0);
    const visibleRef = useRef(false);
    const [visible, setVisible] = useState(false);
    const [dotCount, setDotCount] = useState(1);
    const [runFrame, setRunFrame] = useState(0);

    useEffect(() => {
        const originalFetch = window.fetch.bind(window);
        const trackedFetch: typeof window.fetch = async (...args) => {
            window.dispatchEvent(new Event(globalLoadingEvents.start));
            try {
                return await originalFetch(...args);
            } finally {
                window.dispatchEvent(new Event(globalLoadingEvents.end));
            }
        };
        window.fetch = trackedFetch;

        const trackNavigation = (event: MouseEvent) => {
            if (
                event.defaultPrevented ||
                event.button !== 0 ||
                event.metaKey ||
                event.ctrlKey ||
                event.shiftKey ||
                event.altKey
            )
                return;
            const target = event.target;
            if (!(target instanceof Element)) return;
            const anchor = target.closest("a[href]");
            if (!(anchor instanceof HTMLAnchorElement) || anchor.target || anchor.download) return;
            const destination = new URL(anchor.href, window.location.href);
            if (
                destination.origin !== window.location.origin ||
                destination.pathname === window.location.pathname
            )
                return;
            window.dispatchEvent(new Event(globalLoadingEvents.start));
        };
        document.addEventListener("click", trackNavigation);
        const trackHistoryNavigation = () =>
            window.dispatchEvent(new Event(globalLoadingEvents.start));
        window.addEventListener("popstate", trackHistoryNavigation);

        return () => {
            if (window.fetch === trackedFetch) window.fetch = originalFetch;
            document.removeEventListener("click", trackNavigation);
            window.removeEventListener("popstate", trackHistoryNavigation);
        };
    }, []);

    useEffect(() => {
        const show = () => {
            activeCount.current += 1;
            if (hideTimer.current) {
                clearTimeout(hideTimer.current);
                hideTimer.current = null;
            }
            if (activeCount.current !== 1 || visibleRef.current || showTimer.current) return;
            showTimer.current = setTimeout(() => {
                showTimer.current = null;
                shownAt.current = Date.now();
                visibleRef.current = true;
                setVisible(true);
            }, showDelayMs);
        };
        const hide = () => {
            activeCount.current = Math.max(0, activeCount.current - 1);
            if (activeCount.current > 0) return;
            if (showTimer.current) {
                clearTimeout(showTimer.current);
                showTimer.current = null;
            }
            const remaining = Math.max(0, minimumVisibleMs - (Date.now() - shownAt.current));
            hideTimer.current = setTimeout(() => {
                hideTimer.current = null;
                if (activeCount.current > 0) return;
                visibleRef.current = false;
                setVisible(false);
            }, remaining);
        };
        window.addEventListener(globalLoadingEvents.start, show);
        window.addEventListener(globalLoadingEvents.end, hide);
        return () => {
            window.removeEventListener(globalLoadingEvents.start, show);
            window.removeEventListener(globalLoadingEvents.end, hide);
            if (showTimer.current) clearTimeout(showTimer.current);
            if (hideTimer.current) clearTimeout(hideTimer.current);
        };
    }, []);

    useEffect(() => {
        if (!visible) return;
        const interval = window.setInterval(
            () => setDotCount((current) => (current === 5 ? 1 : current + 1)),
            360,
        );
        return () => window.clearInterval(interval);
    }, [visible]);

    useEffect(() => {
        if (!visible) return;
        const interval = window.setInterval(
            () => setRunFrame((current) => (current + 1) % runningFrames.length),
            130,
        );
        return () => window.clearInterval(interval);
    }, [visible]);

    useEffect(() => {
        window.dispatchEvent(new Event(globalLoadingEvents.end));
    }, [pathname]);

    if (!visible) return null;

    return (
        <Flex
            position="fixed"
            inset="0"
            zIndex="max"
            align="center"
            justify="center"
            bg="rgba(52, 37, 30, 0.34)"
            backdropFilter="blur(5px)"
            role="status"
            aria-live="polite"
            aria-label="페이지를 불러오는 중"
        >
            <Flex
                minW={{ base: "210px", md: "238px" }}
                px="26px"
                pt="18px"
                pb="22px"
                direction="column"
                align="center"
                borderWidth="1px"
                borderColor="rgba(255, 253, 248, 0.78)"
                borderRadius="24px"
                bg="rgba(255, 249, 240, 0.94)"
                boxShadow="0 22px 70px rgba(52, 37, 30, 0.28)"
            >
                <Box w={{ base: "150px", md: "170px" }} aspectRatio="1" position="relative">
                    {runningFrames.map((src, index) => (
                        <Image
                            key={src}
                            src={src}
                            alt={index === 0 ? "달리고 있는 알고달" : ""}
                            fill
                            unoptimized
                            priority
                            sizes="170px"
                            style={{
                                display: runFrame === index ? "block" : "none",
                                objectFit: "contain",
                            }}
                        />
                    ))}
                </Box>
                <Text
                    mt="-7px"
                    color="accent"
                    fontSize="16px"
                    fontWeight="800"
                    letterSpacing="0.03em"
                >
                    Loading{".".repeat(dotCount)}
                </Text>
            </Flex>
        </Flex>
    );
}
