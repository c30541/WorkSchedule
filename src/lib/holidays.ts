import fs from "fs";
import path from "path";

export interface Holiday {
  date: string;
  week: string;
  isHoliday: boolean;
  description: string;
}

const holidaysCache: Map<string, Holiday[]> = new Map();

export function loadHolidays(year: string = "2025"): Holiday[] {
  if (holidaysCache.has(year)) {
    return holidaysCache.get(year)!;
  }

  const filePath = path.join(process.cwd(), "data", `${year}.json`);

  try {
    const raw = fs.readFileSync(filePath, "utf8");
    const holidays = JSON.parse(raw) as Holiday[];
    holidaysCache.set(year, holidays);
    return holidays;
  } catch (error) {
    console.error(`Failed to load holidays for year ${year}:`, error);
    return [];
  }
}

export function isHoliday(date: string, year?: string): boolean {
  const yearStr = year || date.substring(0, 4);
  const holidays = loadHolidays(yearStr);
  return holidays.some((h) => h.date === date && h.isHoliday);
}

export function isNationalHoliday(date: string, year?: string): boolean {
  const yearStr = year || date.substring(0, 4);
  const holidays = loadHolidays(yearStr);
  return holidays.some((h) => h.date === date && h.isHoliday && h.description !== "");
}
