# 班表管理系統 (Work Schedule Management System)

一個基於 Next.js 的現代化班表管理系統，提供員工排班、時數統計與 Excel 匯出等功能。

## 功能特色

### 📅 班表管理

- **月份/日期範圍篩選**：支援按月份或自訂日期範圍查看班表
- **視覺化班表**：Excel 格狀顯示，清楚呈現每位員工的排班狀況
- **國定假日標示**：自動標示國定假日與週末，使用不同顏色區分
- **即時編輯**：點擊任一格子即可編輯班次，支援時間、備註與休假設定
- **工時計算**：自動計算每日工時，9 小時工作自動扣除 1 小時休息時間
- **總時數統計**：顯示每位員工的總工時與全體總工時

### 👥 員工管理

- **員工資料管理**：建立、編輯、刪除員工資料
- **在職狀態追蹤**：標示員工在職/離職狀態
- **完整資訊記錄**：員工編號、姓名、職稱、時薪、備註等欄位

### 📊 報表功能

- **Excel 匯出**：一鍵匯出班表為 Excel 檔案
- **自動過濾離職員工**：匯出與統計時自動排除離職員工

### 🎨 使用者介面

- **現代化設計**：採用 Bootstrap 5 響應式設計
- **直覺操作**：點擊即可編輯，操作流暢
- **視覺化提示**：使用不同顏色與圖示區分狀態

## 技術架構

- **前端框架**：Next.js 15.5.4 (React 19)
- **UI 框架**：Bootstrap 5.3.8
- **資料庫**：PostgreSQL
- **ORM**：Prisma 6.16.3
- **語言**：TypeScript
- **容器化**：Docker & Docker Compose

## 系統需求

- Docker Desktop
- Windows 10/11 或 macOS 或 Linux
- 至少 4GB RAM
- 10GB 可用硬碟空間

## Windows 安裝指南

### 步驟 1：下載與安裝 Docker Desktop

1. **下載 Docker Desktop**

   - 前往 [Docker Desktop 官方下載頁面](https://www.docker.com/products/docker-desktop/)
   - 點擊 "Download for Windows" 按鈕
   - 等待下載完成（檔案約 500MB）

2. **安裝 Docker Desktop**

   - 雙擊下載的 `Docker Desktop Installer.exe`
   - 在安裝視窗中，確保勾選：
     - ✅ Use WSL 2 instead of Hyper-V (建議選項)
     - ✅ Add shortcut to desktop
   - 點擊 "Ok" 開始安裝
   - 安裝完成後，點擊 "Close and restart" 重新啟動電腦

3. **啟動 Docker Desktop**

   - 重新啟動後，從桌面或開始選單啟動 Docker Desktop
   - 第一次啟動可能需要幾分鐘時間
   - 等待 Docker Engine 啟動（左下角顯示綠色表示已就緒）

4. **驗證安裝**
   - 開啟 PowerShell 或命令提示字元
   - 輸入以下命令驗證：
   ```bash
   docker --version
   docker-compose --version
   ```
   - 如果顯示版本號，表示安裝成功

### 步驟 2：下載專案

1. **下載專案壓縮檔**

   - 前往專案頁面：https://github.com/c30541/WorkSchedule
   - 點擊綠色的 "Code" 按鈕
   - 選擇 "Download ZIP"
   - 等待下載完成

2. **解壓縮專案**

   - 找到下載的 `WorkSchedule-main.zip` 檔案
   - 在檔案上按右鍵，選擇「解壓縮全部」
   - 選擇解壓縮位置（例如：`C:\Projects\`）
   - 解壓縮完成後，開啟資料夾

3. **開啟命令提示字元或 PowerShell**

   - 在解壓縮後的專案資料夾中
   - 按住 Shift 鍵 + 滑鼠右鍵
   - 選擇「在此處開啟 PowerShell 視窗」或「在此處開啟命令視窗」

   _或者使用傳統方式：_

   ```bash
   cd C:\Projects\WorkSchedule-main
   ```

### 步驟 3：啟動專案

1. **使用 Docker Compose 啟動服務**

   ```bash
   docker-compose up -d
   ```

   - `-d` 參數表示在背景執行
   - 第一次啟動會自動執行以下動作：
     - 下載所需的 Docker 映像檔（可能需要 5-10 分鐘）
     - 建立並啟動 PostgreSQL 資料庫
     - 建置應用程式
     - 自動執行資料庫遷移
     - 啟動 Next.js 應用程式
   - 環境變數已預先設定在 `docker-compose.yml` 中，無需手動配置

2. **（選用）建立測試資料**

   如果想要建立一些測試用的員工與班表資料：

   ```bash
   docker-compose exec app npm run db:seed
   ```

3. **查看啟動狀態**

   確認所有服務都已正常啟動：

   ```bash
   docker-compose ps
   ```

   應該會看到兩個服務都處於 `running` 狀態。

### 步驟 4：訪問系統

開啟瀏覽器，前往：

- **主頁**：http://localhost:3000
- **班表管理**：http://localhost:3000/schedule
- **員工管理**：http://localhost:3000/employees

## macOS / Linux 安裝指南

### 安裝 Docker Desktop

**macOS:**

1. 前往 https://www.docker.com/products/docker-desktop/
2. 下載 macOS 版本（Intel 或 Apple Silicon）
3. 將 Docker.app 拖曳到應用程式資料夾
4. 啟動 Docker Desktop

**Linux:**

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install docker.io docker-compose

# Fedora
sudo dnf install docker docker-compose

# 啟動 Docker 服務
sudo systemctl start docker
sudo systemctl enable docker
```

### 啟動專案

```bash
# 下載專案 ZIP 並解壓縮，或使用 git clone
git clone https://github.com/c30541/WorkSchedule.git
cd WorkSchedule

# 使用 Docker Compose 啟動（環境變數已內建）
docker-compose up -d

# （選用）建立測試資料
docker-compose exec app npm run db:seed
```

訪問 http://localhost:3000

**註：** 環境變數已預先配置在 `docker-compose.yml` 中，無需手動設定。

## 使用說明

### 員工管理

1. **新增員工**

   - 點擊「員工管理」進入員工管理頁面
   - 點擊「新增員工」按鈕
   - 填寫員工資料：
     - 員工編號（必填）
     - 姓名（必填）
     - 職稱（選填）
     - 時薪（選填）
     - 在職狀態（預設為在職）
     - 備註（選填）
   - 點擊「新增」完成

2. **編輯員工**

   - 在員工列表中點擊「編輯」按鈕
   - 修改資料後點擊「更新」

3. **離職設定**
   - 編輯員工時，將「在職狀態」切換為「離職」
   - 離職員工不會出現在班表中，但資料會保留在系統

### 班表管理

1. **選擇檢視模式**

   - **月份模式**：選擇年份與月份，顯示整月班表
   - **日期範圍模式**：自訂開始與結束日期

2. **新增/編輯班次**

   - 點擊任一空白格子或已有班次的格子
   - 在彈出視窗中設定：
     - **休假**：勾選此選項表示該日為休假
     - **開始時間**：選擇上班時間（時/分）
     - **結束時間**：選擇下班時間（時/分）
     - **備註**：填寫額外說明
   - 點擊「儲存」完成

3. **工時限制**

   - 系統限制每日工時最多 9 小時
   - 若輸入超過 9 小時，會顯示紅色警告訊息
   - 9 小時工作會自動扣除 1 小時休息時間（統計時顯示為 8 小時）

4. **刪除班次**
   - 點擊已有班次的格子
   - 在彈出視窗中點擊「刪除」按鈕
   - 確認後即可刪除

### 統計與匯出

1. **查看時數統計**

   - 班表下方會顯示「總計時數統計」
   - 包含每位在職員工的總工時
   - 以及所有在職員工的總計工時

2. **匯出 Excel**
   - 點擊右上角「匯出 Excel」按鈕
   - 系統會自動下載 Excel 檔案
   - 檔名格式：
     - 月份模式：`班表_2025年1月.xlsx`
     - 日期範圍模式：`班表_20250101_20250131.xlsx`
   - 僅包含在職員工的資料

### 視覺化說明

- **一般日**：淺灰色背景
- **一般假日**：深灰色背景
- **國定假日**：黃色背景，顯示假日名稱（如：春節）
- **休假**：紅色方塊，白色「休」字
- **工時顯示**：班次時間下方的藍色標籤（如：8.0h）

## 常用指令

```bash
# 啟動服務
docker-compose up -d

# 停止服務
docker-compose down

# 查看日誌
docker-compose logs -f app

# 重新建置並啟動
docker-compose up -d --build

# 進入應用程式容器
docker-compose exec app sh

# 執行 Prisma 指令
docker-compose exec app npx prisma studio  # 開啟資料庫管理介面
docker-compose exec app npx prisma migrate dev  # 建立新的遷移

# 重設資料庫
docker-compose exec app npx prisma migrate reset
```

## 開發模式

如果要在本地開發而不使用 Docker（進階使用者）：

1. **安裝依賴**

   ```bash
   npm install
   # 或
   pnpm install
   ```

2. **使用 Docker Compose 啟動資料庫**

   ```bash
   docker-compose up -d db
   ```

3. **建立 `.env` 檔案**

   在專案根目錄建立 `.env` 檔案：

   ```env
   DATABASE_URL="postgresql://prisma:prisma@localhost:5432/schedule?schema=public"
   ```

4. **執行資料庫遷移**

   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **啟動開發伺服器**

   ```bash
   npm run dev
   ```

6. **訪問開發環境**

   http://localhost:3000

**註：** 生產環境建議使用 Docker Compose 完整啟動，開發模式僅適用於需要修改程式碼的情況。

## 資料庫管理

使用 Prisma Studio 管理資料庫：

```bash
docker-compose exec app npx prisma studio
```

開啟瀏覽器訪問 http://localhost:5555

## 故障排除

### Docker Desktop 無法啟動

- 確認已啟用 WSL 2（Windows）
- 檢查 BIOS 是否啟用虛擬化技術
- 重新啟動電腦

### 連線資料庫失敗

```bash
# 重新啟動資料庫容器
docker-compose restart db

# 檢查資料庫日誌
docker-compose logs db
```

### 前端無法顯示

```bash
# 重新建置應用程式
docker-compose up -d --build app

# 清除快取
docker-compose exec app npm run build
```

### Port 已被佔用

如果 3000 或 5432 port 已被使用，可以修改 `docker-compose.yml`：

```yaml
services:
  app:
    ports:
      - "3001:3000" # 改用 3001
  db:
    ports:
      - "5433:5432" # 改用 5433
```

## 專案結構

```
WorkSchedule/
├── src/
│   ├── app/                    # Next.js App Router 頁面
│   │   ├── employees/          # 員工管理頁面
│   │   ├── schedule/           # 班表管理頁面
│   │   └── globals.css         # 全域樣式
│   ├── components/             # React 元件
│   │   ├── ScheduleGrid.tsx    # 班表網格元件
│   │   ├── ShiftCell.tsx       # 班次儲存格元件
│   │   └── ShiftModal.tsx      # 班次編輯彈窗
│   ├── lib/                    # 工具函式
│   │   ├── prisma.ts           # Prisma Client 實例
│   │   └── utils.ts            # 通用工具函式
│   └── pages/
│       └── api/                # API Routes
│           ├── employees/      # 員工相關 API
│           ├── shifts/         # 班次相關 API
│           └── holidays/       # 假日相關 API
├── prisma/
│   ├── schema.prisma           # 資料庫結構定義
│   ├── migrations/             # 資料庫遷移記錄
│   └── seed.ts                 # 測試資料產生器
├── data/
│   └── 2025.json               # 2025 年假日資料
├── docker-compose.yml          # Docker 容器編排設定
├── Dockerfile                  # Docker 映像檔設定
└── package.json                # 專案依賴與腳本
```

## 授權

ISC License

## 貢獻

歡迎提交 Issue 或 Pull Request！

## 聯絡資訊

- GitHub: https://github.com/c30541/WorkSchedule
- Issues: https://github.com/c30541/WorkSchedule/issues
