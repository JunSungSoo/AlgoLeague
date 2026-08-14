import dayjs from "dayjs";
import "dayjs/locale/ko";
import relativeTime from "dayjs/plugin/relativeTime";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

export const SEOUL_TIME_ZONE = "Asia/Seoul";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);
dayjs.locale("ko");
dayjs.tz.setDefault(SEOUL_TIME_ZONE);

export { dayjs };
