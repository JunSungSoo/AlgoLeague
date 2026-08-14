"use client";

import { createContext, useContext, useEffect, useMemo, useSyncExternalStore } from "react";
import {
    DEFAULT_LOCALE,
    isAppLocale,
    LOCALE_STORAGE_KEY,
    translate,
    type AppLocale,
    type TranslationKey,
} from "@/lib/i18n";
import { setDayjsLocale } from "@/lib/dayjs-config";

type TranslationValues = Record<string, string | number>;
type LocaleContextValue = {
    locale: AppLocale;
    setLocale: (locale: AppLocale) => void;
    t: (key: TranslationKey, values?: TranslationValues) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);
const LOCALE_CHANGE_EVENT = "algoleague-locale-change";

function applyLocale(locale: AppLocale) {
    document.documentElement.lang = locale;
    document.title = translate(locale, "brand.name");
    setDayjsLocale(locale);
}

function localeSnapshot() {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    return isAppLocale(stored) ? stored : DEFAULT_LOCALE;
}

function subscribeLocale(callback: () => void) {
    window.addEventListener("storage", callback);
    window.addEventListener(LOCALE_CHANGE_EVENT, callback);
    return () => {
        window.removeEventListener("storage", callback);
        window.removeEventListener(LOCALE_CHANGE_EVENT, callback);
    };
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
    const locale = useSyncExternalStore(subscribeLocale, localeSnapshot, () => DEFAULT_LOCALE);
    useEffect(() => {
        applyLocale(locale);
    }, [locale]);

    const value = useMemo<LocaleContextValue>(
        () => ({
            locale,
            setLocale: (nextLocale) => {
                window.localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
                window.dispatchEvent(new Event(LOCALE_CHANGE_EVENT));
            },
            t: (key, values) => translate(locale, key, values),
        }),
        [locale],
    );
    return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
    const context = useContext(LocaleContext);
    if (!context) throw new Error("useLocale must be used inside LocaleProvider");
    return context;
}
