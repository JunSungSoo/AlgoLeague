"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import { notifySessionExpired } from "@/lib/auth-client";
import { GLOBAL_LOADING_EVENTS } from "@/lib/global-loading";
import { ROUTES } from "@/lib/route-paths";

const SHOW_DELAY_MS = 160;
const MINIMUM_VISIBLE_MS = 420;

function isPublicPath(pathname: string) {
    return (
        pathname === ROUTES.LOGIN ||
        pathname === ROUTES.SIGNUP ||
        pathname.startsWith(ROUTES.ACCOUNT_PREFIX)
    );
}

export function GlobalLoadingLayer() {
    const activeCount = useRef(0);
    const showTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const shownAt = useRef(0);
    const visibleRef = useRef(false);
    const sessionRedirecting = useRef(false);
    const [visible, setVisible] = useState(false);
    const [dotCount, setDotCount] = useState(1);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        const originalFetch = window.fetch.bind(window);
        const trackedFetch: typeof window.fetch = async (...args) => {
            window.dispatchEvent(new Event(GLOBAL_LOADING_EVENTS.start));
            try {
                const response = await originalFetch(...args);
                const requestUrl =
                    args[0] instanceof Request
                        ? args[0].url
                        : typeof args[0] === "string"
                          ? args[0]
                          : String(args[0]);
                const pathname = new URL(requestUrl, window.location.href).pathname;
                notifySessionExpired(response, pathname);
                if (
                    response.status === 401 &&
                    pathname !== "/api/auth/login" &&
                    !isPublicPath(window.location.pathname) &&
                    !sessionRedirecting.current
                ) {
                    sessionRedirecting.current = true;
                    router.replace(
                        ROUTES.LOGIN_WITH_NEXT(
                            `${window.location.pathname}${window.location.search}`,
                        ),
                    );
                }
                return response;
            } finally {
                window.dispatchEvent(new Event(GLOBAL_LOADING_EVENTS.end));
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
            window.dispatchEvent(new Event(GLOBAL_LOADING_EVENTS.start));
        };
        document.addEventListener("click", trackNavigation);
        const trackHistoryNavigation = () =>
            window.dispatchEvent(new Event(GLOBAL_LOADING_EVENTS.start));
        window.addEventListener("popstate", trackHistoryNavigation);

        return () => {
            if (window.fetch === trackedFetch) window.fetch = originalFetch;
            document.removeEventListener("click", trackNavigation);
            window.removeEventListener("popstate", trackHistoryNavigation);
        };
    }, [router]);

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
                shownAt.current = performance.now();
                visibleRef.current = true;
                setVisible(true);
            }, SHOW_DELAY_MS);
        };
        const hide = () => {
            activeCount.current = Math.max(0, activeCount.current - 1);
            if (activeCount.current > 0) return;
            if (showTimer.current) {
                clearTimeout(showTimer.current);
                showTimer.current = null;
            }
            const remaining = Math.max(
                0,
                MINIMUM_VISIBLE_MS - (performance.now() - shownAt.current),
            );
            hideTimer.current = setTimeout(() => {
                hideTimer.current = null;
                if (activeCount.current > 0) return;
                visibleRef.current = false;
                setVisible(false);
            }, remaining);
        };
        window.addEventListener(GLOBAL_LOADING_EVENTS.start, show);
        window.addEventListener(GLOBAL_LOADING_EVENTS.end, hide);
        return () => {
            window.removeEventListener(GLOBAL_LOADING_EVENTS.start, show);
            window.removeEventListener(GLOBAL_LOADING_EVENTS.end, hide);
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
        sessionRedirecting.current = false;
        activeCount.current = 0;
        if (showTimer.current) {
            clearTimeout(showTimer.current);
            showTimer.current = null;
        }
        if (hideTimer.current) {
            clearTimeout(hideTimer.current);
            hideTimer.current = null;
        }
        visibleRef.current = false;
        hideTimer.current = setTimeout(() => {
            hideTimer.current = null;
            setVisible(false);
        }, 0);
    }, [pathname]);

    if (!visible) return null;

    return (
        <Flex
            position="fixed"
            inset="0"
            zIndex="max"
            direction="column"
            align="center"
            justify="center"
            bg="rgba(0, 0, 0, 0.68)"
            role="status"
            aria-live="polite"
            aria-label="페이지를 불러오는 중"
        >
            <Box w={{ base: "230px", md: "270px" }} aspectRatio="1" position="relative">
                <Image
                    src="/brand/loading/study/algodal-studying.png?v=1"
                    alt="책상에서 공부하고 있는 알고달"
                    fill
                    unoptimized
                    priority
                    sizes="270px"
                    style={{ objectFit: "contain" }}
                />
            </Box>
            <Text
                mt="-8px"
                color="#fff8ea"
                fontSize="16px"
                fontWeight="800"
                letterSpacing="0.03em"
                textShadow="0 2px 8px rgba(0, 0, 0, 0.7)"
            >
                Loading{".".repeat(dotCount)}
            </Text>
        </Flex>
    );
}
