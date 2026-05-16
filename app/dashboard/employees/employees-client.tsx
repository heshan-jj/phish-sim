"use client";

import { EmployeeCsvImportDialog } from "@/app/dashboard/employees/employee-csv-import-dialog";
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
import { useMemo, useState } from "react";

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
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return initialEmployees.filter((employee) => {
      if (
        departmentFilter !== "all" &&
        (employee.department ?? "") !== departmentFilter
      ) {
        return false;
      }

      if (!query) return true;

      const haystack = [
        employee.name,
        employee.email,
        employee.department ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [initialEmployees, search, departmentFilter]);

  if (initialEmployees.length === 0) {
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
              filtered.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell>{displayValue(employee.department)}</TableCell>
                  <TableCell>{displayValue(employee.role)}</TableCell>
                  <TableCell>{formatSeniority(employee.seniority)}</TableCell>
                  <TableCell>—</TableCell>
                  <TableCell className="text-right">
                    <span
                      className="text-[13px]"
                      style={{ color: "var(--ds-muted)" }}
                      title="Coming soon"
                    >
                      —
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-[13px]" style={{ color: "var(--ds-steel)" }}>
        Showing {filtered.length} of {initialEmployees.length} employees
      </p>
    </div>
  );
}
