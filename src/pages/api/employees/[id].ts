import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  const employeeId = parseInt(id as string);

  if (isNaN(employeeId)) {
    return res.status(400).json({ error: "Invalid employee ID" });
  }

  if (req.method === "GET") {
    try {
      const employee = await prisma.employee.findUnique({
        where: { id: employeeId },
        include: { shifts: true },
      });

      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }

      res.status(200).json(employee);
    } catch (error) {
      console.error("Error fetching employee:", error);
      res.status(500).json({ error: "Failed to fetch employee" });
    }
  } else if (req.method === "PUT") {
    try {
      const { empNo, name, title, hourlyWage, note, isActive } = req.body;

      const employee = await prisma.employee.update({
        where: { id: employeeId },
        data: {
          empNo,
          name,
          title,
          hourlyWage,
          note,
          isActive,
        },
      });

      res.status(200).json(employee);
    } catch (error: any) {
      console.error("Error updating employee:", error);
      if (error.code === "P2025") {
        res.status(404).json({ error: "Employee not found" });
      } else if (error.code === "P2002") {
        res.status(400).json({ error: "Employee number already exists" });
      } else {
        res.status(500).json({ error: "Failed to update employee" });
      }
    }
  } else if (req.method === "DELETE") {
    try {
      await prisma.employee.delete({
        where: { id: employeeId },
      });

      res.status(204).end();
    } catch (error: any) {
      console.error("Error deleting employee:", error);
      if (error.code === "P2025") {
        res.status(404).json({ error: "Employee not found" });
      } else {
        res.status(500).json({ error: "Failed to delete employee" });
      }
    }
  } else {
    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
