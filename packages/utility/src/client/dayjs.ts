import dayjs from "dayjs";
import utcPlugin from "dayjs/plugin/utc";
import timezonePlugin from "dayjs/plugin/timezone";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(isBetween);
dayjs.extend(utcPlugin);
dayjs.extend(timezonePlugin);

export default dayjs;
