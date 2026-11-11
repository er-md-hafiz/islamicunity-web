export { bearing } from "./qibla.mjs";

export function calendar(date = new Date()) {
  const locale = "en-US-u-ca-islamic-umalqura";
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "numeric",
      year: "numeric",
      timeZone: "UTC",
    })
      .formatToParts(date)
      .map((p) => [p.type, p.value]),
  );
  const events = [
    {
      month: 9,
      day: 1,
      title: "Ramadan begins",
      subtitle: "A month of mercy & reflection",
    },
    {
      month: 10,
      day: 1,
      title: "Eid al-Fitr",
      subtitle: "A celebration of gratitude",
    },
    {
      month: 12,
      day: 9,
      title: "Day of Arafah",
      subtitle: "A day of prayer & remembrance",
    },
    {
      month: 12,
      day: 10,
      title: "Eid al-Adha",
      subtitle: "A celebration of sacrifice",
    },
    {
      month: 1,
      day: 1,
      title: "Islamic New Year",
      subtitle: "A new beginning",
    },
  ];
  const upcoming = [];
  for (let offset = 0; offset < 370; offset++) {
    const d = new Date(date);
    d.setUTCDate(d.getUTCDate() + offset);
    const p = Object.fromEntries(
      new Intl.DateTimeFormat(locale, {
        month: "numeric",
        day: "numeric",
        timeZone: "UTC",
      })
        .formatToParts(d)
        .map((p) => [p.type, p.value]),
    );
    for (const e of events)
      if (+p.month === e.month && +p.day === e.day)
        upcoming.push({
          ...e,
          date: d.toISOString().slice(0, 10),
          daysAway: offset,
        });
  }
  return {
    gregorian: date.toISOString().slice(0, 10),
    hijri: new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(date),
    hijriParts: parts,
    events: upcoming.slice(0, 4),
    note: "Umm al-Qura calendar. Local moon sighting may differ by a day.",
  };
}
