"use client";

import NextLink from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
    Avatar,
    Box,
    Button,
    CloseButton,
    Drawer,
    Flex,
    Icon,
    IconButton,
    Link,
    Menu,
    Portal,
    Text,
    VStack,
} from "@chakra-ui/react";
import {
    Bell,
    BookOpenCheck,
    Check,
    Code2,
    Home,
    LogIn,
    LogOut,
    Medal,
    Menu as MenuIcon,
    Settings,
    UserRound,
} from "lucide-react";
import {
    AuthApiError,
    authGet,
    authRequest,
    currentUser,
    forgetUser,
    rememberUser,
    type AuthUser,
} from "@/lib/auth-client";
import { canManage } from "@/lib/permissions";
import { startGlobalLoading } from "@/lib/global-loading";
import { ROUTES } from "@/lib/route-paths";
import { useLocale } from "@/components/LocaleProvider";
import { LOCALE_OPTIONS, type TranslationKey } from "@/lib/i18n";

const NAV_ITEMS: Array<{
    href: string;
    label: TranslationKey;
    caption: TranslationKey;
    icon: typeof Home;
}> = [
    { href: ROUTES.HOME, label: "nav.home.label", caption: "nav.home.caption", icon: Home },
    {
        href: ROUTES.PROBLEMS,
        label: "nav.problems.label",
        caption: "nav.problems.caption",
        icon: Code2,
    },
    {
        href: ROUTES.MY_PROBLEMS,
        label: "nav.myProblems.label",
        caption: "nav.myProblems.caption",
        icon: BookOpenCheck,
    },
    {
        href: ROUTES.RANKING,
        label: "nav.ranking.label",
        caption: "nav.ranking.caption",
        icon: Medal,
    },
    {
        href: ROUTES.PROFILE,
        label: "nav.profile.label",
        caption: "nav.profile.caption",
        icon: UserRound,
    },
    {
        href: ROUTES.ADMIN,
        label: "nav.admin.label",
        caption: "nav.admin.caption",
        icon: Settings,
    },
];
function isPublicPath(pathname: string) {
    return (
        pathname === ROUTES.LOGIN ||
        pathname === ROUTES.SIGNUP ||
        pathname.startsWith(ROUTES.ACCOUNT_PREFIX)
    );
}

function Brand({ name }: { name: string }) {
    return (
        <Flex align="center" gap="10px">
            <Flex
                w="42px"
                h="42px"
                flex="none"
                borderRadius="13px"
                bg="accentSubtle"
                align="center"
                justify="center"
                overflow="hidden"
            >
                <Image
                    src="/brand/algoleague-otter-logo-512.png"
                    alt=""
                    width={42}
                    height={42}
                    priority
                />
            </Flex>
            <Box>
                <Text
                    color="ink"
                    fontSize="13px"
                    lineHeight="1.1"
                    fontWeight="900"
                    letterSpacing="-.02em"
                >
                    {name}
                </Text>
                <Text mt="3px" fontSize="7px" color="muted" letterSpacing=".12em">
                    ALGORITHM LEAGUE
                </Text>
            </Box>
        </Flex>
    );
}
function UserAvatar({
    user,
    guest,
    profileImage,
}: {
    user: AuthUser | null;
    guest: string;
    profileImage: string;
}) {
    return (
        <Avatar.Root size="sm" bg="accentSubtle" color="accent">
            <Avatar.Fallback name={user?.nickname ?? guest} />
            {user?.profileImageUrl && (
                <Avatar.Image src={user.profileImageUrl} alt={profileImage} />
            )}
        </Avatar.Root>
    );
}

export function AppShell({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const { locale, setLocale, t } = useLocale();
    useEffect(() => {
        const sync = () => setUser(currentUser());
        const frame = requestAnimationFrame(sync);
        window.addEventListener("algorithm-champions-auth", sync);
        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener("algorithm-champions-auth", sync);
        };
    }, []);
    useEffect(() => {
        if (isPublicPath(pathname)) return;
        let active = true;
        let redirecting = false;
        const moveToLogin = () => {
            if (!active || redirecting) return;
            redirecting = true;
            forgetUser();
            setUser(null);
            setMenuOpen(false);
            startGlobalLoading();
            router.replace(ROUTES.LOGIN_WITH_NEXT(pathname));
        };
        const onExpired = () => moveToLogin();
        window.addEventListener("algorithm-champions-session-expired", onExpired);
        void authGet<{ user: AuthUser }>("/api/profile")
            .then((result) => {
                if (active) {
                    setUser(result.user);
                    rememberUser(result.user);
                }
            })
            .catch((error) => {
                if (error instanceof AuthApiError && (error.status === 401 || error.status === 404))
                    moveToLogin();
            });
        return () => {
            active = false;
            window.removeEventListener("algorithm-champions-session-expired", onExpired);
        };
    }, [pathname, router]);
    async function logout() {
        try {
            await authRequest("/api/auth/logout", {});
        } catch {
        } finally {
            forgetUser();
            setUser(null);
            setMenuOpen(false);
            startGlobalLoading();
            router.push(ROUTES.LOGIN);
        }
    }
    if (isPublicPath(pathname)) return <>{children}</>;
    const visibleNav = NAV_ITEMS.filter(
        (item) => item.href !== ROUTES.ADMIN || canManage(user?.role),
    );
    const current =
        visibleNav.find((item) =>
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href),
        ) ?? visibleNav[0];
    return (
        <Box minH="100vh" bg="canvas">
            <Flex
                as="header"
                position="sticky"
                top="0"
                zIndex="sticky"
                h={{ base: "66px", md: "74px" }}
                px={{ base: "16px", md: "28px", xl: "42px" }}
                align="center"
                gap="16px"
                bg="surface/92"
                backdropFilter="blur(18px)"
                borderBottomWidth="1px"
                borderColor="line"
            >
                <IconButton
                    aria-label={t("header.openMenu")}
                    variant="ghost"
                    size="md"
                    color="ink"
                    onClick={() => setMenuOpen(true)}
                >
                    <MenuIcon size={21} />
                </IconButton>
                <Link asChild _hover={{ textDecoration: "none" }}>
                    <NextLink href="/" aria-label={t("header.home")}>
                        <Brand name={t("brand.name")} />
                    </NextLink>
                </Link>
                <Box display={{ base: "none", md: "block" }} h="28px" w="1px" bg="line" ml="4px" />
                <Box display={{ base: "none", md: "block" }}>
                    <Text fontSize="10px" color="muted" letterSpacing=".12em">
                        {t(current.caption).toUpperCase()}
                    </Text>
                    <Text fontSize="13px" fontWeight="800">
                        {t(current.label)}
                    </Text>
                </Box>
                <Flex ml="auto" align="center" gap={{ base: "4px", md: "9px" }}>
                    <Menu.Root positioning={{ placement: "bottom-end" }}>
                        <Menu.Trigger asChild>
                            <IconButton
                                aria-label={t("header.settings")}
                                variant="ghost"
                                color="ink"
                            >
                                <Settings size={18} />
                            </IconButton>
                        </Menu.Trigger>
                        <Portal>
                            <Menu.Positioner>
                                <Menu.Content
                                    minW="230px"
                                    p="8px"
                                    bg="surfaceRaised"
                                    borderColor="line"
                                    borderWidth="1px"
                                    borderRadius="14px"
                                    boxShadow="panel"
                                >
                                    <Box px="10px" pt="7px" pb="10px">
                                        <Text fontSize="12px" fontWeight="900">
                                            {t("header.languageSettings")}
                                        </Text>
                                        <Text mt="3px" fontSize="10px" color="muted">
                                            {t("header.languageDescription")}
                                        </Text>
                                    </Box>
                                    {LOCALE_OPTIONS.map((option) => (
                                        <Menu.Item
                                            key={option.value}
                                            value={option.value}
                                            borderRadius="10px"
                                            px="10px"
                                            py="9px"
                                            onClick={() => setLocale(option.value)}
                                        >
                                            <Flex w="full" align="center" gap="10px">
                                                <Flex
                                                    w="28px"
                                                    h="22px"
                                                    align="center"
                                                    justify="center"
                                                    borderRadius="7px"
                                                    bg={
                                                        locale === option.value
                                                            ? "accentSubtle"
                                                            : "surfaceMuted"
                                                    }
                                                    color="accent"
                                                    fontSize="9px"
                                                    fontWeight="900"
                                                >
                                                    {option.shortLabel}
                                                </Flex>
                                                <Text flex="1" fontSize="12px" fontWeight="700">
                                                    {option.label}
                                                </Text>
                                                {locale === option.value && <Check size={15} />}
                                            </Flex>
                                        </Menu.Item>
                                    ))}
                                </Menu.Content>
                            </Menu.Positioner>
                        </Portal>
                    </Menu.Root>
                    <IconButton aria-label={t("header.notifications")} variant="ghost" color="ink">
                        <Bell size={18} />
                    </IconButton>
                    <Link
                        asChild
                        display={{ base: "none", sm: "block" }}
                        borderRadius="full"
                        _hover={{
                            textDecoration: "none",
                            boxShadow: "0 0 0 2px var(--chakra-colors-accent-subtle)",
                        }}
                    >
                        <NextLink href={ROUTES.PROFILE} aria-label={t("header.profile")}>
                            <UserAvatar
                                user={user}
                                guest={t("account.guest")}
                                profileImage={t("account.profileImage", {
                                    nickname: user?.nickname ?? t("account.guest"),
                                })}
                            />
                        </NextLink>
                    </Link>
                </Flex>
            </Flex>
            <Box as="main">{children}</Box>
            <Drawer.Root
                open={menuOpen}
                onOpenChange={(details) => setMenuOpen(details.open)}
                placement="start"
                size="xs"
            >
                <Portal>
                    <Drawer.Backdrop bg="blackAlpha.700" backdropFilter="blur(3px)" />
                    <Drawer.Positioner>
                        <Drawer.Content
                            bg="surfaceRaised"
                            borderRightWidth="1px"
                            borderColor="line"
                        >
                            <Drawer.Header
                                px="24px"
                                py="22px"
                                borderBottomWidth="1px"
                                borderColor="line"
                            >
                                <Drawer.Title>
                                    <Brand name={t("brand.name")} />
                                </Drawer.Title>
                                <Drawer.CloseTrigger asChild>
                                    <CloseButton size="sm" />
                                </Drawer.CloseTrigger>
                            </Drawer.Header>
                            <Drawer.Body display="flex" flexDirection="column" p="18px">
                                <Text
                                    px="10px"
                                    mb="10px"
                                    color="muted"
                                    fontSize="9px"
                                    fontWeight="800"
                                    letterSpacing=".16em"
                                >
                                    {t("nav.navigation").toUpperCase()}
                                </Text>
                                <VStack align="stretch" gap="6px">
                                    {visibleNav.map((item) => {
                                        const active =
                                            item.href === "/"
                                                ? pathname === item.href
                                                : pathname.startsWith(item.href);
                                        return (
                                            <Link
                                                key={item.href}
                                                asChild
                                                color={active ? "accent" : "muted"}
                                                bg={active ? "accentSubtle" : "transparent"}
                                                borderRadius="13px"
                                                _hover={{
                                                    bg: "surfaceMuted",
                                                    color: "ink",
                                                    textDecoration: "none",
                                                }}
                                                onClick={() => setMenuOpen(false)}
                                            >
                                                <NextLink href={item.href}>
                                                    <Flex
                                                        px="13px"
                                                        py="12px"
                                                        align="center"
                                                        gap="13px"
                                                    >
                                                        <Flex
                                                            w="35px"
                                                            h="35px"
                                                            borderRadius="10px"
                                                            bg={active ? "surface" : "transparent"}
                                                            align="center"
                                                            justify="center"
                                                        >
                                                            <Icon as={item.icon} boxSize="17px" />
                                                        </Flex>
                                                        <Box>
                                                            <Text
                                                                color={active ? "ink" : "inherit"}
                                                                fontSize="13px"
                                                                fontWeight="800"
                                                            >
                                                                {t(item.label)}
                                                            </Text>
                                                            <Text
                                                                mt="2px"
                                                                fontSize="10px"
                                                                color="muted"
                                                            >
                                                                {t(item.caption)}
                                                            </Text>
                                                        </Box>
                                                    </Flex>
                                                </NextLink>
                                            </Link>
                                        );
                                    })}
                                </VStack>
                                <Box mt="auto" pt="20px" borderTopWidth="1px" borderColor="line">
                                    <Flex align="center" gap="11px">
                                        <UserAvatar
                                            user={user}
                                            guest={t("account.guest")}
                                            profileImage={t("account.profileImage", {
                                                nickname: user?.nickname ?? t("account.guest"),
                                            })}
                                        />
                                        <Box flex="1">
                                            <Text fontWeight="800" fontSize="13px">
                                                {user?.nickname ?? t("account.guest")}
                                            </Text>
                                            <Text color="muted" fontSize="10px">
                                                {user
                                                    ? t("account.verifiedSolves", {
                                                          grade: user.grade,
                                                          count: user.verifiedSolves,
                                                      })
                                                    : t("account.loginRequired")}
                                            </Text>
                                        </Box>
                                    </Flex>
                                    {user ? (
                                        <Button
                                            mt="14px"
                                            w="full"
                                            variant="outline"
                                            onClick={logout}
                                        >
                                            <LogOut size={15} />
                                            {t("account.logout")}
                                        </Button>
                                    ) : (
                                        <Button
                                            mt="14px"
                                            w="full"
                                            bg="accent"
                                            color="accentContrast"
                                            onClick={logout}
                                        >
                                            <LogIn size={15} />
                                            {t("account.login")}
                                        </Button>
                                    )}
                                </Box>
                            </Drawer.Body>
                        </Drawer.Content>
                    </Drawer.Positioner>
                </Portal>
            </Drawer.Root>
        </Box>
    );
}
