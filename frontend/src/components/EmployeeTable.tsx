"use client";

import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Switch,
  TextField,
} from "@mui/material";
import {
  type MRT_ColumnDef,
  type MRT_Row,
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import { useEffect, useState } from "react";

interface Employee {
  id: number;
  name: string;
  title?: string | null;
  hourlyWage?: number | null;
  note?: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface EmployeeTableProps {
  employees: Employee[];
  onUpdate: () => void;
}

export default function EmployeeTable({
  employees,
  onUpdate,
}: EmployeeTableProps) {
  const [tableData, setTableData] = useState<Employee[]>(employees);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    hourlyWage: "",
    note: "",
    isActive: true,
  });

  // Update table data when employees prop changes
  useEffect(() => {
    setTableData(employees);
  }, [employees]);

  const columns: MRT_ColumnDef<Employee>[] = [
    {
      accessorKey: "name",
      header: "姓名",
      size: 150,
    },
    {
      accessorKey: "title",
      header: "職稱",
      size: 120,
      Cell: ({ cell }: any) => (cell.getValue() as string) || "-",
    },
    {
      accessorKey: "hourlyWage",
      header: "時薪",
      size: 100,
      Cell: ({ cell }: any) => {
        const wage = cell.getValue() as number;
        return wage ? `$${wage}` : "-";
      },
    },
    {
      accessorKey: "isActive",
      header: "狀態",
      size: 80,
      Cell: ({ cell }: any) => (
        <span
          style={{
            color: cell.getValue() ? "#28a745" : "#dc3545",
            fontWeight: "bold",
          }}
        >
          {cell.getValue() ? "在職" : "離職"}
        </span>
      ),
    },
    {
      accessorKey: "note",
      header: "備註",
      size: 200,
      Cell: ({ cell }: any) => {
        const note = cell.getValue() as string;
        return note ? (
          <span title={note}>
            {note.length > 20 ? `${note.substring(0, 20)}...` : note}
          </span>
        ) : (
          "-"
        );
      },
    },
    {
      id: "actions",
      header: "操作",
      size: 120,
      enableColumnDragging: false,
      enableColumnOrdering: false,
      enableSorting: false,
      Cell: ({ row }: any) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton
            size="small"
            onClick={() => handleEdit(row.original)}
            title="編輯"
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDelete(row.original.id)}
            title="刪除"
            color="error"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  // Handle row reordering when drag ends
  const updateEmployeeOrder = async (newData: Employee[]) => {
    // 更新本地狀態
    setTableData(newData);

    // 計算新的排序值
    const updates = newData.map((employee: Employee, index: number) => ({
      id: employee.id,
      sortOrder: (index + 1) * 10, // 使用 10 的倍數作為排序值
    }));

    try {
      setIsLoading(true);
      const response = await fetch("/api/employees/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error("更新排序失敗");
      }

      // 重新載入員工資料
      onUpdate();
    } catch (error) {
      setError("更新員工順序失敗");
      // 恢復原本的順序
      setTableData(employees);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      title: employee.title || "",
      hourlyWage: employee.hourlyWage?.toString() || "",
      note: employee.note || "",
      isActive: employee.isActive,
    });
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingEmployee(null);
    setFormData({
      name: "",
      title: "",
      hourlyWage: "",
      note: "",
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      setError("員工姓名為必填欄位");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const payload = {
        name: formData.name.trim(),
        title: formData.title.trim() || null,
        hourlyWage: formData.hourlyWage
          ? parseFloat(formData.hourlyWage)
          : null,
        note: formData.note.trim() || null,
        isActive: formData.isActive,
        // 新增員工時，設定排序值為當前最大值 + 10
        ...(editingEmployee
          ? {}
          : {
              sortOrder: Math.max(...employees.map((e) => e.sortOrder), 0) + 10,
            }),
      };

      const url = editingEmployee
        ? `/api/employees/${editingEmployee.id}`
        : "/api/employees";

      const method = editingEmployee ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "儲存失敗");
      }

      setIsModalOpen(false);
      onUpdate();
    } catch (error: any) {
      setError(error.message || "儲存失敗");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("確定要刪除此員工嗎？")) {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/employees/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("刪除失敗");
        }

        onUpdate();
      } catch (error) {
        setError("刪除員工失敗");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const table = useMaterialReactTable({
    autoResetPageIndex: false,
    columns,
    data: tableData,
    getRowId: (row) => row.id.toString(),
    enableRowOrdering: true,
    enableSorting: false,
    enablePagination: false,
    enableBottomToolbar: false,
    enableTopToolbar: true,
    muiRowDragHandleProps: ({ table }) => ({
      onDragEnd: () => {
        const { draggingRow, hoveredRow } = table.getState();
        if (hoveredRow && draggingRow) {
          // 重新排列本地資料
          const newData = [...tableData];
          newData.splice(
            (hoveredRow as MRT_Row<Employee>).index,
            0,
            newData.splice(draggingRow.index, 1)[0]
          );

          // 更新本地狀態
          setTableData(newData);

          // 發送到伺服器更新排序
          updateEmployeeOrder(newData);
        }
      },
    }),
    renderTopToolbarCustomActions: () => (
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={handleAdd}
        disabled={isLoading}
      >
        新增員工
      </Button>
    ),
    state: {
      isLoading,
    },
  });

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <MaterialReactTable table={table} />

      {/* 員工編輯對話框 */}
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{editingEmployee ? "編輯員工" : "新增員工"}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            autoFocus
            margin="dense"
            label="員工姓名 *"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            label="職稱"
            fullWidth
            variant="outlined"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            label="時薪"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.hourlyWage}
            onChange={(e) =>
              setFormData({ ...formData, hourlyWage: e.target.value })
            }
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            label="備註"
            multiline
            rows={3}
            fullWidth
            variant="outlined"
            value={formData.note}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            sx={{ mb: 2 }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
              />
            }
            label="在職狀態"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsModalOpen(false)} disabled={isLoading}>
            取消
          </Button>
          <Button onClick={handleSave} variant="contained" disabled={isLoading}>
            {isLoading ? "儲存中..." : "儲存"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
