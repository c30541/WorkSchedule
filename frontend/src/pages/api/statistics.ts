import { prisma } from "@/lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

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

    // 計算統計用工時（考慮雙倍工時）
    const getCalculatedHours = (shift: any): number => {
      // 如果是9小時則扣除1小時休息時間，然後考慮雙倍
      const actualHours = shift.duration === 9 ? 8 : shift.duration;
      return shift.isDouble ? actualHours * 2 : actualHours;
    };

    const totalHours = shifts.reduce((sum, shift) => sum + getCalculatedHours(shift), 0);

    const employeeHoursMap = new Map<
      number,
      { employeeId: number; name: string; hours: number }
    >();

    shifts.forEach((shift) => {
      const calculatedHours = getCalculatedHours(shift);
      const existing = employeeHoursMap.get(shift.employeeId);
      if (existing) {
        existing.hours += calculatedHours;
      } else {
        employeeHoursMap.set(shift.employeeId, {
          employeeId: shift.employeeId,
          name: shift.employee.name,
          hours: calculatedHours,
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
