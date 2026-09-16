import dayjs from "dayjs";
import utcPlugin from "dayjs/plugin/utc";
import timezonePlugin from "dayjs/plugin/timezone";

const dayts = dayjs;

dayts.extend(utcPlugin);
dayts.extend(timezonePlugin);

export default dayts;
