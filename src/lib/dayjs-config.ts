import dayjs from "dayjs";
import "dayjs/locale/ko";
import "dayjs/locale/ja";
import relativeTime from "dayjs/plugin/relativeTime";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

export const SEOUL_TIME_ZONE = "Asia/Seoul";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);
dayjs.locale("ko");

export function setDayjsLocale(locale: "ko" | "en" | "ja") {
    dayjs.locale(locale);
}
dayjs.tz.setDefault(SEOUL_TIME_ZONE);

export { dayjs };
