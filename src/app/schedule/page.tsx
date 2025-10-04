"use client";

import ScheduleGrid from "@/components/ScheduleGrid";
import Link from "next/link";
import { useState } from "react";

export default function SchedulePage() {
  const currentDate = new Date();
  const [filterMode, setFilterMode] = useState<"month" | "range">("month");
  const [year, setYear] = useState(currentDate.getFullYear());
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [exportFunction, setExportFunction] = useState<(() => void) | null>(null);

  const handleFilterModeChange = (mode: "month" | "range") => {
    setFilterMode(mode);
    if (mode === "month") {
      setStartDate("");
      setEndDate("");
    }
  };

  const handleExportReady = (exportFn: () => void) => {
    setExportFunction(() => exportFn);
  };

  return (
    <div className="container-fluid py-4">
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="display-5 fw-bold">班表管理</h1>
          <div className="d-flex gap-2">
            <button
              className="btn btn-success"
              onClick={() => exportFunction?.()}
              disabled={!exportFunction}
            >
              <i className="bi bi-file-earmark-excel me-2"></i>
              匯出 Excel
            </button>
            <Link href="/" className="btn btn-secondary">
              <i className="bi bi-house me-2"></i>
              返回首頁
            </Link>
          </div>
        </div>

        <div className="card mb-4">
          <div className="card-body">
            <div className="row">
              <div className="col-auto">
                <label className="form-label">篩選模式</label>
                <div className="btn-group d-block" role="group">
                  <button
                    type="button"
                    className={`btn ${
                      filterMode === "month"
                        ? "btn-primary"
                        : "btn-outline-primary"
                    }`}
                    onClick={() => handleFilterModeChange("month")}
                  >
                    <i className="bi bi-calendar-month me-2"></i>
                    月份
                  </button>
                  <button
                    type="button"
                    className={`btn ${
                      filterMode === "range"
                        ? "btn-primary"
                        : "btn-outline-primary"
                    }`}
                    onClick={() => handleFilterModeChange("range")}
                  >
                    <i className="bi bi-calendar-range me-2"></i>
                    日期範圍
                  </button>
                </div>
              </div>

              {filterMode === "month" ? (
                <>
                  <div className="col-auto">
                    <label className="form-label">年份</label>
                    <select
                      className="form-select"
                      value={year}
                      onChange={(e) => setYear(parseInt(e.target.value))}
                    >
                      {[2024, 2025, 2026].map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-auto">
                    <label className="form-label">月份</label>
                    <select
                      className="form-select"
                      value={month}
                      onChange={(e) => setMonth(parseInt(e.target.value))}
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                        <option key={m} value={m}>
                          {m}月
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div className="col-auto">
                    <label className="form-label">開始日期</label>
                    <input
                      type="date"
                      className="form-control"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="col-auto">
                    <label className="form-label">結束日期</label>
                    <input
                      type="date"
                      className="form-control"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="alert alert-light border d-flex align-items-center gap-4 mb-4">
          <span className="fw-semibold">圖例：</span>
          <div className="d-flex align-items-center gap-2">
            <div
              className="border"
              style={{
                width: "20px",
                height: "20px",
                backgroundColor: "var(--color-normal-day)",
              }}
            ></div>
            <small>一般日</small>
          </div>
          <div className="d-flex align-items-center gap-2">
            <div
              className="border"
              style={{
                width: "20px",
                height: "20px",
                backgroundColor: "var(--color-weekend)",
              }}
            ></div>
            <small>一般假日</small>
          </div>
          <div className="d-flex align-items-center gap-2">
            <div
              className="border"
              style={{
                width: "20px",
                height: "20px",
                backgroundColor: "var(--color-holiday)",
              }}
            ></div>
            <small>國定假日</small>
          </div>
        </div>

        <div className="card shadow">
          <div className="card-body p-3">
            <ScheduleGrid
              filterMode={filterMode}
              year={year}
              month={month}
              startDate={startDate}
              endDate={endDate}
              onExportReady={handleExportReady}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
