import { dayjs } from "@/lib/dayjs-config";

export function dashboardGreeting() {
    const hour = dayjs().tz().hour();
    return hour < 12 ? "좋은 아침이에요" : hour < 18 ? "좋은 오후예요" : "좋은 저녁이에요";
}

export function relativeActivityTime(value: string) {
    const minutes = Math.max(0, dayjs().diff(dayjs(value), "minute"));
    if (minutes < 1) return "방금";
    return dayjs(value).fromNow();
}
