"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import EmployeeTable from "../../components/EmployeeTable";

interface Employee {
  id: number;
  name: string;
  title?: string;
  hourlyWage?: number;
  note?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filterStatus, setFilterStatus] = useState<
    "active" | "inactive" | "all"
  >("active");

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    const res = await fetch("/api/employees");
    const data = await res.json();
    setEmployees(data);
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
          <Link href="/" className="btn btn-secondary">
            <i className="bi bi-house me-2"></i>
            返回首頁
          </Link>
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
                    className={`btn ${
                      filterStatus === "active"
                        ? "btn-success"
                        : "btn-outline-success"
                    }`}
                    onClick={() => setFilterStatus("active")}
                  >
                    <i className="bi bi-check-circle me-1"></i>
                    在職
                  </button>
                  <button
                    type="button"
                    className={`btn ${
                      filterStatus === "inactive"
                        ? "btn-secondary"
                        : "btn-outline-secondary"
                    }`}
                    onClick={() => setFilterStatus("inactive")}
                  >
                    <i className="bi bi-x-circle me-1"></i>
                    離職
                  </button>
                  <button
                    type="button"
                    className={`btn ${
                      filterStatus === "all"
                        ? "btn-primary"
                        : "btn-outline-primary"
                    }`}
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

        <EmployeeTable
          employees={filteredEmployees}
          onUpdate={fetchEmployees}
        />
      </div>
    </div>
  );
}
