import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    try {
      const employees = await prisma.employee.findMany({
        orderBy: { name: "asc" },
      });
      res.status(200).json(employees);
    } catch (error) {
      console.error("Error fetching employees:", error);
      res.status(500).json({ error: "Failed to fetch employees" });
    }
  } else if (req.method === "POST") {
    try {
      const { name, title, hourlyWage, note, isActive } = req.body;

      if (!name) {
        return res.status(400).json({ error: "name is required" });
      }

      const employee = await prisma.employee.create({
        data: {
          name,
          title,
          hourlyWage,
          note,
          isActive: isActive ?? true,
        },
      });

      res.status(201).json(employee);
    } catch (error: any) {
      console.error("Error creating employee:", error);
      res.status(500).json({ error: "Failed to create employee" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
