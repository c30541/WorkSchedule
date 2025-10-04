"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Employee {
  id: number;
  name: string;
  title?: string;
  hourlyWage?: number;
  note?: string;
  isActive?: boolean;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filterStatus, setFilterStatus] = useState<"active" | "inactive" | "all">("active");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    hourlyWage: "",
    note: "",
    isActive: true,
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    const res = await fetch("/api/employees");
    const data = await res.json();
    setEmployees(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name: formData.name,
      title: formData.title || null,
      hourlyWage: formData.hourlyWage ? parseFloat(formData.hourlyWage) : null,
      note: formData.note || null,
      isActive: formData.isActive,
    };

    if (editingEmployee) {
      await fetch(`/api/employees/${editingEmployee.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    setIsModalOpen(false);
    setEditingEmployee(null);
    setFormData({ name: "", title: "", hourlyWage: "", note: "", isActive: true });
    fetchEmployees();
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      title: employee.title || "",
      hourlyWage: employee.hourlyWage?.toString() || "",
      note: employee.note || "",
      isActive: employee.isActive ?? true,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("確定要刪除此員工嗎？")) {
      await fetch(`/api/employees/${id}`, { method: "DELETE" });
      fetchEmployees();
    }
  };

  const openCreateModal = () => {
    setEditingEmployee(null);
    setFormData({ name: "", title: "", hourlyWage: "", note: "", isActive: true });
    setIsModalOpen(true);
  };

  const filteredEmployees = employees.filter((emp) => {
    if (filterStatus === "active") return emp.isActive !== false;
    if (filterStatus === "inactive") return emp.isActive === false;
    return true; // "all"
  });

  return (
    <div className="container-fluid py-4">
      <div className="container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="display-5 fw-bold">員工管理</h1>
          <div className="d-flex gap-2">
            <Link href="/" className="btn btn-secondary">
              <i className="bi bi-house me-2"></i>
              返回首頁
            </Link>
            <button onClick={openCreateModal} className="btn btn-primary">
              <i className="bi bi-person-plus me-2"></i>
              新增員工
            </button>
          </div>
        </div>

        <div className="card mb-4">
          <div className="card-body">
            <div className="row align-items-center">
              <div className="col-auto">
                <label className="form-label mb-0">在職狀態篩選</label>
              </div>
              <div className="col-auto">
                <div className="btn-group" role="group">
                  <button
                    type="button"
                    className={`btn ${filterStatus === "active" ? "btn-success" : "btn-outline-success"}`}
                    onClick={() => setFilterStatus("active")}
                  >
                    <i className="bi bi-check-circle me-1"></i>
                    在職
                  </button>
                  <button
                    type="button"
                    className={`btn ${filterStatus === "inactive" ? "btn-secondary" : "btn-outline-secondary"}`}
                    onClick={() => setFilterStatus("inactive")}
                  >
                    <i className="bi bi-x-circle me-1"></i>
                    離職
                  </button>
                  <button
                    type="button"
                    className={`btn ${filterStatus === "all" ? "btn-primary" : "btn-outline-primary"}`}
                    onClick={() => setFilterStatus("all")}
                  >
                    <i className="bi bi-list-ul me-1"></i>
                    全部
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card shadow">
          <div className="table-responsive">
            <table className="table table-hover mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th className="text-center">姓名</th>
                  <th className="text-center">職稱</th>
                  <th className="text-center">時薪</th>
                  <th className="text-center">在職狀態</th>
                  <th className="text-center">備註</th>
                  <th className="text-center">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id}>
                    <td className="text-center">{emp.name}</td>
                    <td className="text-center">{emp.title || "-"}</td>
                    <td className="text-center">{emp.hourlyWage ? `$${emp.hourlyWage}` : "-"}</td>
                    <td className="text-center">
                      {emp.isActive ? (
                        <span className="badge bg-success">在職</span>
                      ) : (
                        <span className="badge bg-secondary">離職</span>
                      )}
                    </td>
                    <td className="text-center">{emp.note || "-"}</td>
                    <td className="text-center">
                      <button
                        onClick={() => handleEdit(emp)}
                        className="btn btn-sm btn-outline-primary me-2"
                      >
                        <i className="bi bi-pencil"></i> 編輯
                      </button>
                      <button
                        onClick={() => handleDelete(emp.id)}
                        className="btn btn-sm btn-outline-danger"
                      >
                        <i className="bi bi-trash"></i> 刪除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {isModalOpen && (
          <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editingEmployee ? "編輯員工" : "新增員工"}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setIsModalOpen(false)}
                  ></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">姓名 *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">職稱</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">時薪</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        value={formData.hourlyWage}
                        onChange={(e) =>
                          setFormData({ ...formData, hourlyWage: e.target.value })
                        }
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">在職狀態</label>
                      <div className="btn-group d-block" role="group">
                        <button
                          type="button"
                          className={`btn ${formData.isActive ? "btn-success" : "btn-outline-success"}`}
                          onClick={() => setFormData({ ...formData, isActive: true })}
                        >
                          <i className="bi bi-check-circle me-2"></i>
                          在職
                        </button>
                        <button
                          type="button"
                          className={`btn ${!formData.isActive ? "btn-secondary" : "btn-outline-secondary"}`}
                          onClick={() => setFormData({ ...formData, isActive: false })}
                        >
                          <i className="bi bi-x-circle me-2"></i>
                          離職
                        </button>
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">備註</label>
                      <textarea
                        className="form-control"
                        rows={3}
                        value={formData.note}
                        onChange={(e) =>
                          setFormData({ ...formData, note: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setIsModalOpen(false)}
                    >
                      取消
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {editingEmployee ? "更新" : "新增"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
