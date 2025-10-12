import { prisma } from "@/lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

interface ReorderItem {
  id: number;
  sortOrder: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "PUT") {
    res.setHeader("Allow", ["PUT"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const updates = req.body as ReorderItem[];

    if (!Array.isArray(updates)) {
      return res.status(400).json({ error: "請求格式錯誤" });
    }

    // 使用事務來批次更新排序
    const transactions = updates.map(({ id, sortOrder }) =>
      prisma.employee.update({
        where: { id },
        data: { sortOrder }
      })
    );

    await prisma.$transaction(transactions);

    res.status(200).json({ 
      success: true, 
      message: "員工順序更新成功",
      updatedCount: updates.length
    });
  } catch (error) {
    console.error("Error reordering employees:", error);
    res.status(500).json({ error: "更新員工順序失敗" });
  }
}