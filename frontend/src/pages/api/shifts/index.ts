import { prisma } from "@/lib/prisma";
import { calcDuration } from "@/lib/utils";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const { start, end, employeeId } = req.query;

      const where: any = {};

      if (start && end) {
        where.date = {
          gte: start as string,
          lte: end as string,
        };
      }

      if (employeeId) {
        where.employeeId = parseInt(employeeId as string);
      }

      const shifts = await prisma.shift.findMany({
        where,
        include: {
          employee: true,
        },
        orderBy: [{ date: "asc" }, { employeeId: "asc" }],
      });

      res.status(200).json(shifts);
    } catch (error) {
      console.error("Error fetching shifts:", error);
      res.status(500).json({ error: "Failed to fetch shifts" });
    }
  } else if (req.method === "POST") {
    try {
      const { employeeId, date, startTime, endTime, note, isLeave, isDouble } = req.body;

      if (!employeeId || !date || startTime === undefined || endTime === undefined) {
        return res.status(400).json({
          error: "employeeId, date, startTime, and endTime are required",
        });
      }

      const duration = calcDuration(startTime, endTime);

      const shift = await prisma.shift.create({
        data: {
          employeeId,
          date,
          startTime,
          endTime,
          duration,
          note,
          isLeave: isLeave || false,
          isDouble: isDouble || false,
        },
        include: {
          employee: true,
        },
      });

      res.status(201).json(shift);
    } catch (error: any) {
      console.error("Error creating shift:", error);
      if (error.code === "P2003") {
        res.status(400).json({ error: "Employee not found" });
      } else {
        res.status(500).json({ error: "Failed to create shift" });
      }
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
