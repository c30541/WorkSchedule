import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { start, end } = req.query;

    if (!start || !end) {
      return res.status(400).json({ error: "start and end dates are required" });
    }

    const shifts = await prisma.shift.findMany({
      where: {
        date: {
          gte: start as string,
          lte: end as string,
        },
      },
      include: {
        employee: true,
      },
    });

    const totalHours = shifts.reduce((sum, shift) => sum + shift.duration, 0);

    const employeeHoursMap = new Map<
      number,
      { employeeId: number; name: string; hours: number }
    >();

    shifts.forEach((shift) => {
      const existing = employeeHoursMap.get(shift.employeeId);
      if (existing) {
        existing.hours += shift.duration;
      } else {
        employeeHoursMap.set(shift.employeeId, {
          employeeId: shift.employeeId,
          name: shift.employee.name,
          hours: shift.duration,
        });
      }
    });

    const byEmployee = Array.from(employeeHoursMap.values()).sort(
      (a, b) => b.hours - a.hours
    );

    res.status(200).json({
      totalHours,
      byEmployee,
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
}
