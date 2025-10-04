"use client";

import { formatDate, formatTimeRange } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";
import * as XLSX from "xlsx";
import ShiftCell from "./ShiftCell";

interface Employee {
  id: number;
  name: string;
  isActive?: boolean;
}

interface Shift {
  id: number;
  employeeId: number;
  date: string;
  startTime: number;
  endTime: number;
  duration: number;
  note?: string;
  isLeave?: boolean;
}

interface Holiday {
  date: string;
  week: string;
  isHoliday: boolean;
  description: string;
}

interface ScheduleGridProps {
  filterMode: "month" | "range";
  year: number;
  month: number;
  startDate: string;
  endDate: string;
  onExportReady?: (exportFn: () => void) => void;
}

export default function ScheduleGrid({
  filterMode,
  year,
  month,
  startDate,
  endDate,
  onExportReady,
}: ScheduleGridProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [dates, setDates] = useState<Date[]>([]);
  const [editingCell, setEditingCell] = useState<string | null>(null);

  useEffect(() => {
    fetchEmployees();
    if (filterMode === "month") {
      fetchHolidays(year);
      generateDatesFromMonth(year, month);
    } else if (filterMode === "range" && startDate && endDate) {
      const startYear = parseInt(startDate.split("-")[0]);
      fetchHolidays(startYear);
      generateDatesFromRange(startDate, endDate);
    }
  }, [filterMode, year, month, startDate, endDate]);

  useEffect(() => {
    if (dates.length > 0) {
      fetchShifts();
    }
  }, [dates]);

  useEffect(() => {
    if (onExportReady) {
      onExportReady(handleExportExcel);
    }
  }, [employees, shifts, dates, filterMode, year, month, startDate, endDate]);

  const fetchEmployees = async () => {
    const res = await fetch("/api/employees");
    const data = await res.json();
    setEmployees(data);
  };

  const fetchShifts = async () => {
    if (dates.length === 0) return;
    const start = formatDate(dates[0]);
    const end = formatDate(dates[dates.length - 1]);
    const res = await fetch(`/api/shifts?start=${start}&end=${end}`);
    const data = await res.json();
    setShifts(data);
  };

  const fetchHolidays = async (year: number) => {
    const res = await fetch(`/api/holidays?year=${year}`);
    const data = await res.json();
    setHolidays(data);
  };

  const generateDatesFromMonth = (year: number, month: number) => {
    const daysInMonth = new Date(year, month, 0).getDate();
    const dates: Date[] = [];
    for (let day = 1; day <= daysInMonth; day++) {
      dates.push(new Date(year, month - 1, day));
    }
    setDates(dates);
  };

  const generateDatesFromRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const dates: Date[] = [];

    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    setDates(dates);
  };

  const getDateColor = (date: Date): string => {
    const dateStr = formatDate(date);
    const holiday = holidays.find((h) => h.date === dateStr);

    if (holiday?.description) {
      return "table-warning"; // 國定假日
    } else if (holiday?.isHoliday) {
      return "table-secondary"; // 一般假日
    } else {
      return "table-light"; // 一般日
    }
  };

  const getHolidayName = (date: Date): string | null => {
    const dateStr = formatDate(date);
    const holiday = holidays.find((h) => h.date === dateStr);
    return holiday?.description || null;
  };

  const getShift = (employeeId: number, date: Date): Shift | undefined => {
    const dateStr = formatDate(date);
    return shifts.find(
      (s) => s.employeeId === employeeId && s.date === dateStr
    );
  };

  const getDayOfWeek = (date: Date): string => {
    const days = ["日", "一", "二", "三", "四", "五", "六"];
    return days[date.getDay()];
  };

  const handleEditingChange = useCallback(
    (cellKey: string, editing: boolean) => {
      console.log(
        "ScheduleGrid handleEditingChange - cellKey:",
        cellKey,
        "editing:",
        editing
      );
      console.log("Previous editingCell:", editingCell);
      setEditingCell(editing ? cellKey : null);
      console.log("New editingCell will be:", editing ? cellKey : null);
    },
    [editingCell]
  );

  const calculateTotalHours = (employeeId: number): number => {
    return shifts
      .filter((s) => s.employeeId === employeeId && !s.isLeave)
      .reduce((total, shift) => {
        // 若工時為9小時，扣除1小時休息時間
        const actualHours = shift.duration === 9 ? 8 : shift.duration;
        return total + actualHours;
      }, 0);
  };

  const calculateGrandTotal = (): number => {
    // 只計算在職員工的班次
    const activeEmployeeIds = employees
      .filter((emp) => emp.isActive !== false)
      .map((emp) => emp.id);

    return shifts
      .filter((s) => !s.isLeave && activeEmployeeIds.includes(s.employeeId))
      .reduce((total, shift) => {
        // 若工時為9小時，扣除1小時休息時間
        const actualHours = shift.duration === 9 ? 8 : shift.duration;
        return total + actualHours;
      }, 0);
  };

  const handleExportExcel = () => {
    // 只匯出在職員工
    const activeEmployees = employees.filter((emp) => emp.isActive !== false);

    // 準備表頭
    const headers = [
      "員工",
      ...dates.map((date) => `${date.getMonth() + 1}/${date.getDate()}`),
    ];

    // 準備資料
    const data = activeEmployees.map((employee) => {
      const row: any = { 員工: employee.name };
      dates.forEach((date) => {
        const shift = getShift(employee.id, date);
        const dateKey = `${date.getMonth() + 1}/${date.getDate()}`;
        if (shift) {
          if (shift.isLeave) {
            row[dateKey] = "休";
          } else {
            row[dateKey] = formatTimeRange(shift.startTime, shift.endTime);
          }
          if (shift.note) {
            row[dateKey] += `\n(${shift.note})`;
          }
        } else {
          row[dateKey] = "-";
        }
      });
      return row;
    });

    // 建立工作簿
    const worksheet = XLSX.utils.json_to_sheet(data, { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "班表");

    // 設定欄寬
    const columnWidths = [{ wch: 15 }, ...dates.map(() => ({ wch: 12 }))];
    worksheet["!cols"] = columnWidths;

    // 產生檔名
    let filename = "";
    if (filterMode === "month") {
      filename = `班表_${year}年${month}月.xlsx`;
    } else {
      filename = `班表_${startDate}_${endDate}.xlsx`;
    }

    // 匯出檔案
    XLSX.writeFile(workbook, filename);
  };

  return (
    <div className="table-responsive">
      <table className="table table-bordered table-hover mb-0 align-middle">
        <thead>
          <tr>
            <th
              className="table-info position-sticky start-0 text-center align-middle"
              style={{ minWidth: "120px", zIndex: 10 }}
            >
              員工
            </th>
            {dates.map((date) => {
              const holidayName = getHolidayName(date);
              return (
                <th
                  key={date.toISOString()}
                  className={`text-center small ${getDateColor(date)}`}
                  style={{ minWidth: "100px", verticalAlign: "middle" }}
                >
                  <div>{`${date.getMonth() + 1}/${date.getDate()}`}</div>
                  <div>({getDayOfWeek(date)})</div>
                  {holidayName && (
                    <div
                      className="badge bg-danger mt-1"
                      style={{ fontSize: "0.65rem" }}
                    >
                      {holidayName}
                    </div>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {employees
            .filter((employee) => employee.isActive !== false)
            .map((employee) => (
              <tr key={employee.id}>
                <td
                  className="fw-semibold table-info position-sticky start-0 text-center"
                  style={{ zIndex: 9 }}
                >
                  {employee.name}
                </td>
                {dates.map((date) => {
                  const shift = getShift(employee.id, date);
                  const cellKey = `${employee.id}-${formatDate(date)}`;
                  return (
                    <ShiftCell
                      key={cellKey}
                      cellKey={cellKey}
                      employeeId={employee.id}
                      date={date}
                      shift={shift}
                      onUpdate={fetchShifts}
                      isEditing={editingCell === cellKey}
                      onEditingChange={handleEditingChange}
                    />
                  );
                })}
              </tr>
            ))}
        </tbody>
      </table>

      <div className="card mt-4">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">總計時數統計</h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-bordered mb-0">
              <thead>
                <tr className="table-light">
                  <th className="text-center">員工</th>
                  <th className="text-center">總工時</th>
                </tr>
              </thead>
              <tbody>
                {employees
                  .filter((employee) => employee.isActive !== false)
                  .map((employee) => {
                    const totalHours = calculateTotalHours(employee.id);
                    return (
                      <tr key={employee.id}>
                        <td className="text-center">{employee.name}</td>
                        <td className="text-center fw-semibold">
                          {totalHours.toFixed(1)} 小時
                        </td>
                      </tr>
                    );
                  })}
                <tr className="table-info">
                  <td className="text-center fw-bold">總計</td>
                  <td className="text-center fw-bold">
                    {calculateGrandTotal().toFixed(1)} 小時
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
