import { dayjs } from "@/lib/dayjs-config";
import type { TranslationKey } from "@/lib/i18n";

export function dashboardGreeting(t: (key: TranslationKey) => string) {
    const hour = dayjs().tz().hour();
    return hour < 12
        ? t("dashboard.greeting.morning")
        : hour < 18
          ? t("dashboard.greeting.afternoon")
          : t("dashboard.greeting.evening");
}

export function relativeActivityTime(value: string, t: (key: TranslationKey) => string) {
    const minutes = Math.max(0, dayjs().diff(dayjs(value), "minute"));
    if (minutes < 1) return t("ranking.justNow");
    return dayjs(value).fromNow();
}
