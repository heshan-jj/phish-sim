"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertTriangle, Trash2 } from "lucide-react";
import { EmployeeCsvImportDialog } from "@/app/dashboard/employees/employee-csv-import-dialog";
import { deleteEmployee, deleteAllEmployees } from "@/app/dashboard/employees/_actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMemo } from "react";

export interface EmployeeListItem {
  id: string;
  name: string;
  email: string;
  department: string | null;
  role: string | null;
  seniority: string | null;
}

interface EmployeesClientProps {
  initialEmployees: EmployeeListItem[];
  departments: string[];
}

function displayValue(value: string | null | undefined) {
  return value?.trim() ? value : "—";
}

function formatSeniority(value: string | null) {
  if (!value?.trim()) return "—";
  const lower = value.trim().toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

export function EmployeesClient({
  initialEmployees,
  departments,
}: EmployeesClientProps) {
  const router = useRouter();
  const [employees, setEmployees] = useState(initialEmployees);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return employees.filter((employee) => {
      if (
        departmentFilter !== "all" &&
        (employee.department ?? "") !== departmentFilter
      ) return false;
      if (!query) return true;
      return [employee.name, employee.email, employee.department ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [employees, search, departmentFilter]);

  function handleDeleteClick(id: string) {
    setConfirmId(id);
  }

  function handleCancelDelete() {
    setConfirmId(null);
  }

  function handleConfirmDeleteAll() {
    startTransition(async () => {
      const { deleted, error } = await deleteAllEmployees();
      if (error) {
        toast.error(`Failed to delete employees: ${error}`);
      } else {
        setEmployees([]);
        toast.success(`Deleted ${deleted} employee${deleted !== 1 ? "s" : ""}`);
        router.refresh();
      }
      setConfirmDeleteAll(false);
    });
  }

  function handleConfirmDelete(id: string) {
    startTransition(async () => {
      const { error } = await deleteEmployee(id);
      if (error) {
        toast.error(`Failed to delete employee: ${error}`);
      } else {
        setEmployees((prev) => prev.filter((e) => e.id !== id));
        toast.success("Employee deleted");
        router.refresh();
      }
      setConfirmId(null);
    });
  }

  if (employees.length === 0) {
    return (
      <div
        className="rounded-[12px] border px-8 py-16 text-center"
        style={{
          backgroundColor: "var(--ds-canvas)",
          borderColor: "var(--ds-hairline)",
        }}
      >
        <h2
          className="text-[18px] font-[600] mb-2"
          style={{ color: "var(--ds-ink)" }}
        >
          No employees yet
        </h2>
        <p
          className="text-[14px] leading-[1.50] mb-6 max-w-md mx-auto"
          style={{ color: "var(--ds-steel)" }}
        >
          Import your team from a CSV to start running phishing simulations and
          tracking risk by department.
        </p>
        <EmployeeCsvImportDialog />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <Input
          type="search"
          placeholder="Search by name, email, or department…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-11 flex-1 rounded-[8px] border-[var(--ds-hairline-strong)] bg-[var(--ds-canvas)]"
        />
        <Select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          className="sm:w-52"
          aria-label="Filter by department"
        >
          <option value="all">All departments</option>
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </Select>
        <EmployeeCsvImportDialog />
      </div>

      <div
        className="rounded-[12px] border overflow-hidden"
        style={{
          backgroundColor: "var(--ds-canvas)",
          borderColor: "var(--ds-hairline)",
        }}
      >
        {/* Delete-all confirmation banner */}
        {confirmDeleteAll && (
          <div
            className="flex items-center gap-3 px-5 py-3 border-b text-[13px]"
            style={{ backgroundColor: "#fde0ec", borderColor: "#fca5a5" }}
          >
            <AlertTriangle className="size-4 shrink-0" style={{ color: "#e03131" }} />
            <span className="font-[500]" style={{ color: "#7f1d1d" }}>
              This will permanently delete all {employees.length} employee{employees.length !== 1 ? "s" : ""} and their campaign history. This cannot be undone.
            </span>
            <div className="ml-auto flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                disabled={isPending}
                onClick={handleConfirmDeleteAll}
                className="h-7 rounded-[6px] px-3 text-[11px] font-[600]"
                style={{ backgroundColor: "#e03131", color: "#fff" }}
              >
                {isPending ? "Deleting…" : `Yes, delete all ${employees.length}`}
              </Button>
              <button
                onClick={() => setConfirmDeleteAll(false)}
                disabled={isPending}
                className="text-[11px] font-[500] hover:underline"
                style={{ color: "#991b1b" }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Seniority</TableHead>
              <TableHead>Risk score</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-[14px]"
                  style={{ color: "var(--ds-steel)" }}
                >
                  No employees match your search.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((employee) => {
                const isConfirming = confirmId === employee.id;
                const isDeleting = isPending && confirmId === employee.id;

                return (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>{displayValue(employee.department)}</TableCell>
                    <TableCell>{displayValue(employee.role)}</TableCell>
                    <TableCell>{formatSeniority(employee.seniority)}</TableCell>
                    <TableCell>—</TableCell>
                    <TableCell className="text-right">
                      {!isConfirming ? (
                        <button
                          onClick={() => handleDeleteClick(employee.id)}
                          className="inline-flex items-center justify-center rounded-[6px] p-1.5 transition-colors hover:bg-[#fde0ec]"
                          style={{ color: "var(--ds-stone)" }}
                          title="Delete employee"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      ) : (
                        <div className="inline-flex items-center gap-2 justify-end">
                          <AlertTriangle
                            className="size-3.5 shrink-0"
                            style={{ color: "#dd5b00" }}
                          />
                          <span
                            className="text-[12px] font-[500]"
                            style={{ color: "var(--ds-charcoal)" }}
                          >
                            Delete?
                          </span>
                          <Button
                            size="sm"
                            disabled={isDeleting}
                            onClick={() => handleConfirmDelete(employee.id)}
                            className="h-7 rounded-[6px] px-2.5 text-[11px] font-[600]"
                            style={{ backgroundColor: "#e03131", color: "#fff" }}
                          >
                            {isDeleting ? "Deleting…" : "Yes, delete"}
                          </Button>
                          <button
                            onClick={handleCancelDelete}
                            disabled={isDeleting}
                            className="text-[11px] font-[500] hover:underline"
                            style={{ color: "var(--ds-steel)" }}
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {/* Footer: count + delete-all trigger */}
        <div
          className="flex items-center justify-between px-4 py-3 border-t text-[13px]"
          style={{ borderColor: "var(--ds-hairline)" }}
        >
          <span style={{ color: "var(--ds-steel)" }}>
            Showing {filtered.length} of {employees.length} employee{employees.length !== 1 ? "s" : ""}
          </span>
          {!confirmDeleteAll && (
            <button
              onClick={() => setConfirmDeleteAll(true)}
              disabled={isPending || employees.length === 0}
              className="inline-flex items-center gap-1.5 text-[12px] font-[500] hover:underline disabled:opacity-40"
              style={{ color: "#e03131" }}
            >
              <Trash2 className="size-3.5" />
              Delete all
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
