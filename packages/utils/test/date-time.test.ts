import { DateTime } from "../src/date-time";

describe("date-time", () => {
  it("formate", () => {
    const date = new DateTime(1693108800000);
    expect(date.format("yyyy-MM-dd hh:mm")).toEqual("2023-08-27 12:00");
    expect(date.format("yyyy-MM-dd hh:mm:ss")).toEqual("2023-08-27 12:00:00");
    expect(date.format("yyyy-MM-dd hhhh:mm:ss")).toEqual("2023-08-27 0012:00:00");
  });

  it("constructor", () => {
    const d1 = new DateTime("2024-12-12");
    expect(d1.format("yyyy-MM-dd hh:mm:ss")).toBe("2024-12-12 00:00:00");
    const d2 = new DateTime("2024-12-12 13:53:51");
    expect(d2.format("yyyy-MM-dd hh:mm:ss")).toBe("2024-12-12 13:53:51");
    const d3 = new DateTime("2024-12-12T13:53:51.829Z");
    expect(d3.format("yyyy-MM-dd hh:mm:ss")).toBe("2024-12-12 21:53:51"); // UTC+8
    const d4 = new DateTime("2024-12-12T13:53:51.829+08:00");
    expect(d4.format("yyyy-MM-dd hh:mm:ss")).toBe("2024-12-12 13:53:51");
  });

  it("add", () => {
    const date = new DateTime("2023-08-27");
    date.add(1, 2, 3);
    expect(date.format("yyyy-MM-dd")).toEqual("2024-10-30");
    date.add(0, 0, 1);
    expect(date.format("yyyy-MM-dd")).toEqual("2024-10-31");
  });

  it("diff", () => {
    const date = new DateTime("2023-08-27 12:00:00");
    const date2 = new DateTime("2024-10-31 13:53:51");
    expect(date.diff(date2)).toEqual({
      minus: true,
      years: 1,
      months: 14,
      days: 431,
      hours: 1,
      minutes: 53,
      seconds: 51,
      total: 37245231,
    });
  });

  it("next", () => {
    const d = new DateTime("2023-08-27 12:00:00");
    expect(d.clone().nextMonth().format("yyyy-MM-dd hh:mm:ss")).toEqual("2023-09-01 00:00:00");
    expect(d.clone().nextMonth(2).format("yyyy-MM-dd hh:mm:ss")).toEqual("2023-10-01 00:00:00");
    expect(d.clone().nextDay().format("yyyy-MM-dd hh:mm:ss")).toEqual("2023-08-28 00:00:00");
    expect(d.clone().nextDay(5).format("yyyy-MM-dd hh:mm:ss")).toEqual("2023-09-01 00:00:00");
    expect(d.clone().nextHour().format("yyyy-MM-dd hh:mm:ss")).toEqual("2023-08-27 13:00:00");
    expect(d.clone().nextHour(5).format("yyyy-MM-dd hh:mm:ss")).toEqual("2023-08-27 17:00:00");
    expect(d.clone().nextMinute().format("yyyy-MM-dd hh:mm:ss")).toEqual("2023-08-27 12:01:00");
    expect(d.clone().nextMinute(5).format("yyyy-MM-dd hh:mm:ss")).toEqual("2023-08-27 12:05:00");
  });

  it("defer", () => {
    const d = new DateTime("2023-08-27 12:00:00");
    expect(d.clone().deferMonth().format("yyyy-MM-dd hh:mm:ss")).toEqual("2023-09-27 12:00:00");
    expect(d.clone().deferMonth(2).format("yyyy-MM-dd hh:mm:ss")).toEqual("2023-10-27 12:00:00");
    expect(d.clone().deferDay().format("yyyy-MM-dd hh:mm:ss")).toEqual("2023-08-28 12:00:00");
    expect(d.clone().deferDay(5).format("yyyy-MM-dd hh:mm:ss")).toEqual("2023-09-01 12:00:00");
    expect(d.clone().deferHour().format("yyyy-MM-dd hh:mm:ss")).toEqual("2023-08-27 13:00:00");
    expect(d.clone().deferHour(5).format("yyyy-MM-dd hh:mm:ss")).toEqual("2023-08-27 17:00:00");
    expect(d.clone().deferMinute().format("yyyy-MM-dd hh:mm:ss")).toEqual("2023-08-27 12:01:00");
    expect(d.clone().deferMinute(5).format("yyyy-MM-dd hh:mm:ss")).toEqual("2023-08-27 12:05:00");
  });

  it("from", () => {
    const d = new Date("2023-08-27T05:00:00.000Z");
    expect(DateTime.from(d).getTime()).toEqual(1693112400000);
  });
});
