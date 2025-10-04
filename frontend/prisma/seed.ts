import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding...");

  // Create sample employees
  const employee1 = await prisma.employee.create({
    data: {
      name: "張小明",
      title: "店長",
      hourlyWage: 200,
      note: "資深員工",
    },
  });

  const employee2 = await prisma.employee.create({
    data: {
      name: "李小華",
      title: "正職員工",
      hourlyWage: 180,
    },
  });

  const employee3 = await prisma.employee.create({
    data: {
      name: "王小美",
      title: "兼職員工",
      hourlyWage: 170,
    },
  });

  console.log("Created employees:", { employee1, employee2, employee3 });

  // Create sample shifts
  const shifts = [
    {
      employeeId: employee1.id,
      date: "20251001",
      startTime: 900,
      endTime: 1800,
      duration: 9,
      note: "早班",
    },
    {
      employeeId: employee2.id,
      date: "20251001",
      startTime: 1400,
      endTime: 2200,
      duration: 8,
      note: "晚班",
    },
    {
      employeeId: employee1.id,
      date: "20251002",
      startTime: 900,
      endTime: 1800,
      duration: 9,
    },
    {
      employeeId: employee3.id,
      date: "20251002",
      startTime: 1000,
      endTime: 1400,
      duration: 4,
      note: "兼職",
    },
  ];

  for (const shift of shifts) {
    await prisma.shift.create({
      data: shift,
    });
  }

  console.log("Created sample shifts");
  console.log("Seeding finished.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
