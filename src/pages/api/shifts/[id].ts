import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { calcDuration } from "@/lib/utils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  const shiftId = parseInt(id as string);

  if (isNaN(shiftId)) {
    return res.status(400).json({ error: "Invalid shift ID" });
  }

  if (req.method === "GET") {
    try {
      const shift = await prisma.shift.findUnique({
        where: { id: shiftId },
        include: { employee: true },
      });

      if (!shift) {
        return res.status(404).json({ error: "Shift not found" });
      }

      res.status(200).json(shift);
    } catch (error) {
      console.error("Error fetching shift:", error);
      res.status(500).json({ error: "Failed to fetch shift" });
    }
  } else if (req.method === "PUT") {
    try {
      const { date, startTime, endTime, note, isLeave } = req.body;

      const duration =
        startTime !== undefined && endTime !== undefined
          ? calcDuration(startTime, endTime)
          : undefined;

      const updateData: any = {};
      if (date !== undefined) updateData.date = date;
      if (startTime !== undefined) updateData.startTime = startTime;
      if (endTime !== undefined) updateData.endTime = endTime;
      if (duration !== undefined) updateData.duration = duration;
      if (note !== undefined) updateData.note = note;
      if (isLeave !== undefined) updateData.isLeave = isLeave;

      const shift = await prisma.shift.update({
        where: { id: shiftId },
        data: updateData,
        include: { employee: true },
      });

      res.status(200).json(shift);
    } catch (error: any) {
      console.error("Error updating shift:", error);
      if (error.code === "P2025") {
        res.status(404).json({ error: "Shift not found" });
      } else if (error.code === "P2003") {
        res.status(400).json({ error: "Employee not found" });
      } else {
        res.status(500).json({ error: "Failed to update shift" });
      }
    }
  } else if (req.method === "DELETE") {
    try {
      await prisma.shift.delete({
        where: { id: shiftId },
      });

      res.status(204).end();
    } catch (error: any) {
      console.error("Error deleting shift:", error);
      if (error.code === "P2025") {
        res.status(404).json({ error: "Shift not found" });
      } else {
        res.status(500).json({ error: "Failed to delete shift" });
      }
    }
  } else {
    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
