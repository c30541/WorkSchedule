"use client";

import { formatTimeRange } from "@/lib/utils";
import ShiftModal from "./ShiftModal";

interface Shift {
  id: number;
  employeeId: number;
  date: string;
  startTime: number;
  endTime: number;
  duration: number;
  note?: string;
  isLeave?: boolean;
  isDouble?: boolean;
}

interface ShiftCellProps {
  cellKey: string;
  employeeId: number;
  date: Date;
  shift?: Shift;
  onUpdate: () => void;
  isEditing: boolean;
  onEditingChange: (cellKey: string, editing: boolean) => void;
}

export default function ShiftCell({
  cellKey,
  employeeId,
  date,
  shift,
  onUpdate,
  isEditing,
  onEditingChange,
}: ShiftCellProps) {
  const handleClick = () => {
    console.log(
      "ShiftCell clicked - cellKey:",
      cellKey,
      "current isEditing:",
      isEditing
    );
    onEditingChange(cellKey, true);
    console.log("After onEditingChange, setting to true");
  };

  const handleClose = () => {
    console.log("ShiftModal closing - cellKey:", cellKey);
    onEditingChange(cellKey, false);
  };

  // 計算實際工時（若為9小時則扣除1小時休息時間）
  const getActualHours = (duration: number): number => {
    return duration === 9 ? 8 : duration;
  };

  // 計算統計用工時（雙倍時數 x 2）
  const getCalculatedHours = (duration: number, isDouble: boolean): number => {
    const actualHours = getActualHours(duration);
    return isDouble ? actualHours * 2 : actualHours;
  };

  console.log(
    "ShiftCell rendering - cellKey:",
    cellKey,
    "isEditing:",
    isEditing
  );

  return (
    <>
      <td
        className="text-center align-middle small p-2 cursor-pointer"
        onClick={handleClick}
        style={{ cursor: "pointer", verticalAlign: "middle" }}
      >
        {shift ? (
          <div className="d-flex flex-column align-items-center justify-content-center gap-1">
            {shift.isLeave ? (
              <div
                className="fw-bold d-flex align-items-center justify-content-center"
                style={{
                  backgroundColor: "#dc3545",
                  color: "#fff",
                  width: "40px",
                  height: "40px",
                  borderRadius: "4px",
                  fontSize: "1.2rem",
                }}
              >
                休
              </div>
            ) : (
              <>
                <div className="fw-semibold">
                  {formatTimeRange(shift.startTime, shift.endTime)}
                </div>
                <div
                  className="badge bg-info text-dark"
                  style={{ fontSize: "0.7rem" }}
                >
                  {getActualHours(shift.duration).toFixed(1)}h
                  {shift.isDouble ? "(雙薪)" : ""}
                </div>
              </>
            )}
            {shift.note && !shift.isLeave && (
              <div
                className="text-muted small text-truncate"
                style={{ maxWidth: "100px" }}
              >
                {shift.note}
              </div>
            )}
          </div>
        ) : (
          <div className="text-muted">-</div>
        )}
      </td>

      <ShiftModal
        isOpen={isEditing}
        shift={shift}
        employeeId={employeeId}
        date={date}
        onClose={handleClose}
        onUpdate={onUpdate}
      />
    </>
  );
}
