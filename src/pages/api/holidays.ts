import type { NextApiRequest, NextApiResponse } from "next";
import { loadHolidays } from "@/lib/holidays";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { year } = req.query;
    const yearStr = (year as string) || "2025";

    const holidays = loadHolidays(yearStr);
    res.status(200).json(holidays);
  } catch (error) {
    console.error("Error fetching holidays:", error);
    res.status(500).json({ error: "Failed to fetch holidays" });
  }
}
