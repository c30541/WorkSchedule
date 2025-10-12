# 班表系統 — 開發流程文件

> 本文件為針對需求所撰寫的開發流程（Markdown 格式），內容包含系統需求概要、技術選型、資料模型、Next.js 頁面與 API Routes 設計、前端元件說明、資料庫/Prisma 設定、Docker 運行範例、重點 UI/UX 規範與測試項目。

---

## 1. 目標與範圍

- 入口路由：`/schedule`（主班表）與 `/employees`（員工管理）。
- 前端採用 Next.js (React)；後端使用 Next.js API Routes（不獨立後端服務）。
- ORM：Prisma；資料庫：PostgreSQL。
- 以 Excel 格狀顯示班表，左側為員工，頂部為日期（含星期），中間為該日班別（24 小時格式，例：`11-16`）。
- 國定假日以實體 JSON 管理（格式已由需求提供）。
- 容器化執行（Docker / docker-compose）。
- 不含薪資/薪酬計算。

---

## 2. 核心功能清單

1. 畫面一進入預設顯示「目前月份」的班表。
2. 使用者可選擇年/月。
3. 預設顯示整個月；使用者可調整要顯示多少週（例如 1/2/4 週），週數以當下日期推算起點，並可左右移動週區間。
4. 員工管理介面：建立/編輯/刪除員工，包含員工基本資料、時薪（儲存但不計算）、備註等欄位。支援拖拉排序功能調整員工順序。
5. 每人每日總工時顯示；亦可按週/月預覽總時數。
6. 提供統計（選定時間範圍）下：全部員工總時數，以及依員工拆分的時數。
7. 日期顏色規則：一般日淺灰、一般假日深灰、國定假日黃色。
8. 雙薪工時功能：班次可標記為雙薪，統計時數時會 x2 計算，顯示時會加上「(薪)」標記。當勾選休假時，雙薪選項將被隱藏。
9. 員工排序功能：使用 material-react-table 的 Row DnD Ordering 功能，支援拖拉調整員工順序，班表顯示將依此順序排列。

---

## 3. 技術架構（概要）

- 前端：Next.js（React）
  - Pages: `/schedule`, `/employees`
  - UI: 客製化 Excel-like 表格（可用 virtualized list for performance）
  - 員工管理：Material React Table with Row DnD Ordering
  - State 管理：React Context / SWR
- 後端：Next.js API Routes（`/api/*`）
- ORM：Prisma（schema, migration）
- DB：PostgreSQL
- 容器：Docker + docker-compose
- 假日資料：`/data/2025.json`, `/data/2026.json`（repository 管理）
- 第三方套件：
  - `material-react-table`：員工管理表格與拖拉排序
  - `@dnd-kit/core`、`@dnd-kit/sortable`：拖拉排序核心功能

---

## 4. Prisma 資料模型（建議）

```prisma
// schema.prisma (重點片段)
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Employee {
  id         Int      @id @default(autoincrement())
  name       String
  title      String?
  hourlyWage Decimal? @db.Decimal(10,2)
  note       String?
  sortOrder  Int      @default(0) // 員工排序順序
  isActive   Boolean  @default(true) // 在職狀態
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  shifts     Shift[]

  @@index([sortOrder])
}

model Shift {
  id         Int      @id @default(autoincrement())
  employee   Employee @relation(fields: [employeeId], references: [id])
  employeeId Int
  date       String   // 格式: YYYYMMDD 或 20230101，方便與假日 JSON 比對
  startTime  Int      // 24h, 例如 8 -> 08:00, 13 -> 13:00；也可記錄分鐘 e.g. 830
  endTime    Int
  duration   Float    // 小時數，例如 7.5（可由 app 或 DB Trigger 計）
  note       String?
  isLeave    Boolean  @default(false) // 是否為休假
  isDouble   Boolean  @default(false) // 是否為雙薪工時
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([date])
  @@index([employeeId])
}
```

**說明**：

- Shift 的 date 使用字串 `YYYYMMDD` 方便與假日 JSON 比對與查詢索引。
- startTime、endTime 可選擇以 `Int`（例如 800、1330）或單純小時（例如 8、13）存放；視 UI 時間選取器而定。
- duration 可在儲存時由伺服器計算並寫入，以利快速查詢統計（或作為 materialized field）。

---

## 5. 假日 JSON 管理

- 放置路徑：`/data/2025.json`（repository 管理，若需要可新增年度檔案，例如 `2027.json`）
- 讀取方式：Next.js 在 API Route 或 getServerSideProps/getStaticProps 讀取檔案（`fs`）或以 build-time 導入

範例讀取（Node）：

```ts
import fs from "fs";
import path from "path";

export function loadHolidays() {
  const p = path.join(process.cwd(), "data", "holidays.json");
  const raw = fs.readFileSync(p, "utf8");
  return JSON.parse(raw) as Array<{
    date: string;
    week: string;
    isHoliday: boolean;
    description: string;
  }>;
}
```

---

## 6. Next.js API Routes 設計（重點）

> API Routes 皆置於 `pages/api/`，採 REST 風格。

1. `GET /api/employees` — 取得員工清單（可帶 filter, paginate），預設依 sortOrder 排序
2. `POST /api/employees` — 建立員工
3. `PUT /api/employees/:id` — 更新員工
4. `DELETE /api/employees/:id` — 刪除員工
5. `PUT /api/employees/reorder` — 批次更新員工排序（body: [{ id, sortOrder }]）

6. `GET /api/shifts?start=YYYYMMDD&end=YYYYMMDD` — 取得指定日期區間的班表（含 employee 資料與 duration）
7. `POST /api/shifts` — 建立班次（body: employeeId, date, startTime, endTime, note, isLeave, isDouble）
8. `PUT /api/shifts/:id` — 更新
9. `DELETE /api/shifts/:id` — 刪除

10. `GET /api/statistics?start=YYYYMMDD&end=YYYYMMDD` — 回傳統計（總時數、依員工拆分）
11. `GET /api/holidays?year=2025` — 由 `data/holidays.json` 回傳該年假日

**回傳範例（/api/statistics）**

```json
{
  "totalHours": 1234.5,
  "byEmployee": [
    { "employeeId": 1, "name": "張三", "hours": 120.5 },
    { "employeeId": 2, "name": "李四", "hours": 98.0 }
  ]
}
```

---

## 7. 前端頁面結構與主要元件

```
/pages
  /schedule.tsx        // 主班表頁
  /employees.tsx       // 員工管理
/components
  /ScheduleGrid.tsx    // Excel-like 表格（核心）
  /DateHeader.tsx
  /EmployeeRow.tsx
  /ShiftCell.tsx       // 單格：顯示 11-16、點擊編輯
  /EmployeeModal.tsx   // 新增/編輯員工
  /EmployeeTable.tsx   // Material React Table with DnD（員工管理表格）
  /ShiftEditor.tsx     // 小型彈窗或行內編輯器（開始/結束時間選擇）
  /StatsPanel.tsx      // 統計面板
  /HolidayLegend.tsx   // 顯色說明
/hooks
  useHolidays.ts
  useShifts.ts
  useEmployees.ts
```

### ScheduleGrid 行為重點

- 左側固定欄為員工名稱（可滾動或 virtualized），員工順序依照 `sortOrder` 欄位排序。
- 頂欄為日期（YYYY/MM/DD）與星期（例如 2025/10/01 (三)）。
- 每格顯示：班別 `HH-HH`，滑鼠 hover 顯示詳細（含備註）、點擊可編輯/新增。
- 單一儲存格（ShiftCell）支援快捷鍵與時間範圍搜尋（例如篩選 `08:00-17:00` 的班次）。
- 提供 batch 操作：選擇多個儲存格後可批次填入相同班別。
- 員工排序與員工管理頁面的拖拉排序結果同步。

---

## 8. UI 視覺規範（顏色）

- 一般日：淺灰（例如 `#D1D5DB`）
- 一般假日：深灰（例如 `#4B5563`）
- 國定假日：黃色（例如 `#FBBF24`）

（實作時請使用 design token 或 CSS variables 以利維護）

---

## 9. 排班時間輸入介面建議

- 使用 24 小時制的時間選單（select）或可輸入的時間範圍控制（例如 `start` 下拉 + `end` 下拉）。
- 支援分鐘精度（可選 00/15/30/45）或只用整點，視需求決定。
- 編輯流程：點擊 cell -> 出現小型編輯器（start, end, note, 休假, 雙薪）-> 儲存（呼叫 API）-> 更新 UI。
- 立即在 UI 計算該日/週/月份的工時與顯示（同時由 API 返回 duration 作為確認）。
- 雙薪工時選項：勾選後統計計算時會將工時乘以 2，並在顯示時加上「(薪)」標記。當勾選休假時，雙薪選項會被隱藏且自動取消勾選。

---

## 10. 統計邏輯（範例）

- 由 API（`/api/statistics`）計算：
  1. 依 `start`、`end` 範圍抓取 shifts
  2. 計算實際工時：若 duration = 9 則實際工時 = 8（扣除休息時間），否則實際工時 = duration
  3. 計算統計工時：若 isDouble = true 則統計工時 = 實際工時 x 2，否則統計工時 = 實際工時
  4. sum(統計工時) 為 `totalHours`
  5. group by employeeId sum(統計工時) 為 `byEmployee`

SQL/Prisma 範例（概念）

```ts
const totals = await prisma.shift.groupBy({
  by: ["employeeId"],
  where: { date: { gte: start, lte: end } },
  _sum: { duration: true },
});
```

---

## 11. 雙薪工時功能詳細說明

### 11.1 功能概要

- 雙薪工時是一個可選的班次屬性，用於標記需要雙薪計算工時的班次（例如加班、特殊津貼等）
- 在 ShiftModal 中，「雙薪」選項位於「休假」選項下方，但只在非休假狀態時顯示
- 當勾選休假時，雙薪選項會被隱藏且自動取消勾選
- 當班次標記為雙薪時，統計計算會將實際工時乘以 2
- 在 ShiftCell 顯示時會在工時後方加上「(薪)」標記

### 11.2 UI 變更

- **ShiftModal**：在休假 checkbox 下方增加雙薪 checkbox，但只在非休假狀態時顯示
- **ShiftCell**：時數顯示格式由 `8.0h` 改為 `8.0h(薪)`（當 isDouble = true 時）

### 11.3 資料庫變更

- Shift 模型新增 `isDouble` Boolean 欄位，預設為 false
- 遷移檔案：`20251012130643_add_is_double_to_shift`

### 11.4 API 變更

- `POST /api/shifts` 和 `PUT /api/shifts/:id` 支援 `isDouble` 參數
- `/api/statistics` 統計計算邏輯更新：
  - 實際工時 = (duration === 9) ? 8 : duration
  - 統計工時 = isDouble ? (實際工時 × 2) : 實際工時

### 11.5 計算邏輯

```typescript
// 計算實際工時（扣除休息時間）
const getActualHours = (duration: number): number => {
  return duration === 9 ? 8 : duration;
};

// 計算統計用工時（雙薪時數 × 2）
const getCalculatedHours = (duration: number, isDouble: boolean): number => {
  const actualHours = getActualHours(duration);
  return isDouble ? actualHours * 2 : actualHours;
};
```

---

## 12. 員工排序功能詳細說明

### 12.1 功能概要

- 使用 `material-react-table` 套件的 Row DnD Ordering Example 功能實現員工拖拉排序
- 員工資料庫模型新增 `sortOrder` 整數欄位，用於儲存排序順序
- 員工管理頁面提供直觀的拖拉介面調整順序
- 班表頁面的員工順序將依照 `sortOrder` 欄位排列
- 排序變更即時同步至資料庫與所有相關頁面

### 12.2 技術實作

#### 12.2.1 資料庫變更

- Employee 模型新增 `sortOrder Int @default(0)` 欄位
- 新增索引 `@@index([sortOrder])` 提升查詢效能
- 遷移檔案新增 sortOrder 欄位並為現有員工設定初始順序

#### 12.2.2 套件依賴

```json
{
  "material-react-table": "^2.0.0",
  "@dnd-kit/core": "^6.0.0",
  "@dnd-kit/sortable": "^8.0.0",
  "@dnd-kit/utilities": "^3.2.0"
}
```

#### 12.2.3 API 端點

- `PUT /api/employees/reorder`：批次更新員工排序
  - Request Body: `[{ id: number, sortOrder: number }]`
  - Response: `{ success: boolean, message: string }`

#### 12.2.4 前端組件架構

- `EmployeeTable.tsx`：使用 MaterialReactTable 實現拖拉排序
- `useEmployees.ts`：新增 reorderEmployees 方法
- `ScheduleGrid.tsx`：依 sortOrder 排序員工清單

### 12.3 UI/UX 設計

#### 12.3.1 員工管理頁面

- 表格左側顯示拖拉手柄圖示（⋮⋮）
- 支援滑鼠拖拉與觸控裝置拖拉
- 拖拉時提供視覺回饋（行高亮、拖拉預覽）
- 排序變更後自動儲存，顯示成功提示

#### 12.3.2 班表頁面

- 員工名稱列依照 sortOrder 欄位遞增排序
- 離職員工（isActive: false）不顯示於班表中
- 排序變更後班表即時重新排列

### 12.4 實作範例

#### 12.4.1 EmployeeTable 組件結構

```typescript
import { MaterialReactTable } from "material-react-table";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

const EmployeeTable = ({ employees, onReorder }) => {
  const handleDragEnd = async (event) => {
    // 計算新的排序並呼叫 API 更新
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={employees} strategy={verticalListSortingStrategy}>
        <MaterialReactTable
          columns={columns}
          data={employees}
          enableRowDragging
          rowDragHandleProps={{ tabIndex: -1 }}
        />
      </SortableContext>
    </DndContext>
  );
};
```

#### 12.4.2 排序 API 實作

```typescript
// pages/api/employees/reorder.ts
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "PUT") {
    const updates = req.body as Array<{ id: number; sortOrder: number }>;

    const transactions = updates.map(({ id, sortOrder }) =>
      prisma.employee.update({
        where: { id },
        data: { sortOrder },
      })
    );

    await prisma.$transaction(transactions);
    res.json({ success: true });
  }
}
```

### 12.5 資料查詢順序

#### 12.5.1 員工清單查詢

```typescript
// 所有員工查詢都需依 sortOrder 排序
const employees = await prisma.employee.findMany({
  where: { isActive: true },
  orderBy: { sortOrder: "asc" },
});
```

#### 12.5.2 班表員工順序

```typescript
// ScheduleGrid 中的員工排序
const sortedEmployees = employees
  .filter((emp) => emp.isActive)
  .sort((a, b) => a.sortOrder - b.sortOrder);
```

---

## 13. 進階：週數推算與左右移動

- 使用者可選擇要顯示的週數 `N`（例如 1, 2, 4）
- 畫面預設以當前日期為中心或當月第一天為起點（需求中以「依照當下日期來推算週數」）
  - 建議：以「包含當下日期的週」為起點（例如當日為 2025-10-04，若週為 Mon-Sun，則起點為 2025-09-29）
- 左右按鈕：「上一組週」「下一組週」，每次移動 `N` 週。
- 若使用者選年/月選擇器，則切換至該月的第一個週區間（或包含該日期的週）。

---

## 14. Docker 與啟動範例

**docker-compose.yml 範例（重點）**

```yaml
version: "3.8"
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: schedule
      POSTGRES_USER: prisma
      POSTGRES_PASSWORD: prisma
    volumes:
      - db_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  app:
    build: .
    command: sh -c "pnpm install && pnpm build && pnpm start"
    environment:
      DATABASE_URL: postgres://prisma:prisma@db:5432/schedule
    ports:
      - "3000:3000"
    depends_on:
      - db

volumes:
  db_data:
```

**本地開發建議**：

- 使用 `pnpm` 或 `yarn`，確保 `prisma migrate dev` 後執行 `prisma generate`。

---

## 15. 資料遷移與種子資料（seed）

- 建議建立 `prisma/seed.ts`：載入範例員工、載入 `data/2025.json` 中的假日作測試（或僅載入員工與部分 shifts）。

---

## 16. 權限與驗證

- 無需權限與驗證

---

## 17. 測試項目（建議）

- 單元測試：Prisma 的 CRUD（create/update/delete shifts/employees）
- 顯示測試：ScheduleGrid 在不同週數與月份下的行為
- 假日顏色測試：檢查 `2025.json` 的載入與對應日期的著色
- 拖拉排序測試：EmployeeTable 的拖拉功能與資料庫同步
- 排序一致性測試：確保員工管理與班表頁面的順序一致

---

## 18. 開發時程

- 無需控制開發時程

---

## 19. 範例程式片段

### 計算 duration（Node）

```ts
function calcDuration(start: number, end: number) {
  // 假設 start/end 為整數小時或 HHMM，轉換為小時數
  const toHours = (t: number) => Math.floor(t / 100) + (t % 100) / 60;
  const s = toHours(start);
  const e = toHours(end);
  return Math.max(0, parseFloat((e - s).toFixed(2)));
}
```

### 讀取 shifts（API 範例）

```ts
// pages/api/shifts/index.ts
import { prisma } from "../../../lib/prisma";
export default async function handler(req, res) {
  const { start, end } = req.query;
  const shifts = await prisma.shift.findMany({
    where: { date: { gte: start, lte: end } },
    include: { employee: true },
  });
  res.json(shifts);
}
```

### 員工排序 API（範例）

```ts
// pages/api/employees/reorder.ts
import { prisma } from "../../../lib/prisma";
export default async function handler(req, res) {
  if (req.method === "PUT") {
    const updates = req.body as Array<{ id: number; sortOrder: number }>;

    try {
      const transactions = updates.map(({ id, sortOrder }) =>
        prisma.employee.update({
          where: { id },
          data: { sortOrder },
        })
      );

      await prisma.$transaction(transactions);
      res.json({ success: true, message: "員工順序更新成功" });
    } catch (error) {
      res.status(500).json({ error: "更新失敗" });
    }
  }
}
```

### 依排序取得員工清單

```ts
// 取得依排序的員工清單
const getEmployeesSorted = async () => {
  return await prisma.employee.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
};
```

---

## 20. 注意事項與建議

1. 儲存時間格式時請一致（決定使用 HHMM 或 小時浮點數），避免前後轉換差異。
2. 假日 JSON 若維護頻繁，考慮改由管理後台上傳或接一個小服務以便年度更新。
3. 若需匯出 Excel，可利用 `xlsx` 生成檔案。
4. 員工排序功能建議使用適當的步進值（如 10, 20, 30...），方便後續插入新員工。
5. 拖拉排序時注意效能，大量員工時考慮虛擬化或分頁處理。
6. 確保 material-react-table 版本與 @dnd-kit 套件相容性。

---

## 21. 補充：Excel-like 匯出格式範例

- 左側員工名稱列、上方日期列，儲存格為 `start-end`。
- 匯出時可帶上 `duration` 與 `note` 欄位於隱藏欄以利報表分析。

---

### 結語

此文件為開發主要流程與技術設計導引，包含 Prisma schema、API 設計、前端元件、Docker 環境與測試要點。若要我把此文件轉為 GitHub README 或把某段程式碼實作為範本（例如完整的 `pages/api/shifts` 與 `ScheduleGrid` 元件），我可以繼續產出具體檔案。
