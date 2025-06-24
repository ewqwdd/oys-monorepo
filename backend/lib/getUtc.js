const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

dayjs.extend(utc);
dayjs.extend(timezone);

const getUTC = (value) =>
  dayjs
    .utc(
      `${value.year()}-${value.month() + 1}-${value
        .get("D")
        .toString()
        .padStart(2, "0")}`,
      "YYYY-MM-DD"
    )
    .startOf("day");

    module.exports = getUTC;