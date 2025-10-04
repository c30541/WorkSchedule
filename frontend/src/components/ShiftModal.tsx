"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { formatDate } from "@/lib/utils";

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

interface ShiftModalProps {
  isOpen: boolean;
  shift?: Shift;
  employeeId: number;
  date: Date;
  onClose: () => void;
  onUpdate: () => void;
}

export default function ShiftModal({
  isOpen,
  shift,
  employeeId,
  date,
  onClose,
  onUpdate,
}: ShiftModalProps) {
  const [mounted, setMounted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({
    startHour: "",
    startMinute: "00",
    endHour: "",
    endMinute: "00",
    note: "",
    isLeave: false,
  });

  useEffect(() => {
    setMounted(true);
    console.log("ShiftModal mounted");
  }, []);

  useEffect(() => {
    console.log("ShiftModal isOpen changed:", isOpen);
    if (isOpen) {
      setErrorMessage(""); // 清除錯誤訊息
      if (shift) {
        console.log("Editing existing shift:", shift);
        const startHour = Math.floor(shift.startTime / 100);
        const startMinute = shift.startTime % 100;
        const endHour = Math.floor(shift.endTime / 100);
        const endMinute = shift.endTime % 100;

        setFormData({
          startHour: startHour.toString(),
          startMinute: startMinute.toString().padStart(2, "0"),
          endHour: endHour.toString(),
          endMinute: endMinute.toString().padStart(2, "0"),
          note: shift.note || "",
          isLeave: shift.isLeave || false,
        });
      } else {
        console.log("Creating new shift");
        setFormData({
          startHour: "",
          startMinute: "00",
          endHour: "",
          endMinute: "00",
          note: "",
          isLeave: false,
        });
      }
    }
  }, [isOpen, shift]);

  const handleSave = async () => {
    console.log("Saving shift...", formData);

    // 如果是休假，設定預設時間為 0
    const startTime = formData.isLeave
      ? 0
      : parseInt(formData.startHour) * 100 + parseInt(formData.startMinute);
    const endTime = formData.isLeave
      ? 0
      : parseInt(formData.endHour) * 100 + parseInt(formData.endMinute);

    // 驗證工時不超過9小時
    if (!formData.isLeave) {
      const toHours = (t: number) => Math.floor(t / 100) + (t % 100) / 60;
      const duration = toHours(endTime) - toHours(startTime);
      if (duration > 9) {
        setErrorMessage("每日工時不可超過9小時");
        return;
      }
      if (duration <= 0) {
        setErrorMessage("結束時間必須大於開始時間");
        return;
      }
    }

    const payload = {
      employeeId,
      date: formatDate(date),
      startTime,
      endTime,
      note: formData.note || null,
      isLeave: formData.isLeave,
    };

    try {
      if (shift) {
        await fetch(`/api/shifts/${shift.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch("/api/shifts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      setErrorMessage("");
      onClose();
      onUpdate();
    } catch (error) {
      setErrorMessage("儲存失敗，請稍後再試");
    }
  };

  const handleDelete = async () => {
    if (shift && confirm("確定要刪除此班次嗎？")) {
      await fetch(`/api/shifts/${shift.id}`, { method: "DELETE" });
      onClose();
      onUpdate();
    }
  };

  if (!isOpen || !mounted) {
    console.log("ShiftModal not rendering - isOpen:", isOpen, "mounted:", mounted);
    return null;
  }

  console.log("ShiftModal rendering portal");

  return createPortal(
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {shift ? "編輯班次" : "新增班次"}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            {errorMessage && (
              <div className="alert alert-danger py-2 mb-3" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {errorMessage}
              </div>
            )}

            <div className="mb-3">
              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="isLeaveCheck"
                  checked={formData.isLeave}
                  onChange={(e) => {
                    setFormData({ ...formData, isLeave: e.target.checked });
                    setErrorMessage(""); // 清除錯誤訊息
                  }}
                />
                <label className="form-check-label fw-semibold" htmlFor="isLeaveCheck">
                  休假
                </label>
              </div>
            </div>

            {!formData.isLeave && (
              <>
                <div className="mb-3">
                  <label className="form-label">開始時間</label>
                  <div className="d-flex align-items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="23"
                      className="form-control"
                      style={{ width: '80px' }}
                      value={formData.startHour}
                      onChange={(e) =>
                        setFormData({ ...formData, startHour: e.target.value })
                      }
                      placeholder="時"
                    />
                    <span>:</span>
                    <select
                      className="form-select"
                      style={{ width: '80px' }}
                      value={formData.startMinute}
                      onChange={(e) =>
                        setFormData({ ...formData, startMinute: e.target.value })
                      }
                    >
                      <option value="00">00</option>
                      <option value="15">15</option>
                      <option value="30">30</option>
                      <option value="45">45</option>
                    </select>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">結束時間</label>
                  <div className="d-flex align-items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="23"
                      className="form-control"
                      style={{ width: '80px' }}
                      value={formData.endHour}
                      onChange={(e) =>
                        setFormData({ ...formData, endHour: e.target.value })
                      }
                      placeholder="時"
                    />
                    <span>:</span>
                    <select
                      className="form-select"
                      style={{ width: '80px' }}
                      value={formData.endMinute}
                      onChange={(e) =>
                        setFormData({ ...formData, endMinute: e.target.value })
                      }
                    >
                      <option value="00">00</option>
                      <option value="15">15</option>
                      <option value="30">30</option>
                      <option value="45">45</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            <div className="mb-3">
              <label className="form-label">備註</label>
              <textarea
                className="form-control"
                rows={2}
                value={formData.note}
                onChange={(e) =>
                  setFormData({ ...formData, note: e.target.value })
                }
              />
            </div>
          </div>
          <div className="modal-footer">
            {shift && (
              <button
                type="button"
                className="btn btn-danger me-auto"
                onClick={handleDelete}
              >
                <i className="bi bi-trash me-2"></i>
                刪除
              </button>
            )}
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              取消
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSave}
            >
              <i className="bi bi-check-lg me-2"></i>
              儲存
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
