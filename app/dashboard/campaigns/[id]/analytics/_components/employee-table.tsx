"use client";

import { useState, useMemo } from "react";
import type { EmployeeRow } from "@/lib/db/queries/analytics";
import { ChevronUp, ChevronDown, ChevronsUpDown, Search } from "lucide-react";

interface Props {
  employees: EmployeeRow[];
}

type SortKey = "name" | "department" | "role" | "displayAction" | "timeToActionMinutes" | "status";
type SortDir = "asc" | "desc";

const ACTION_ORDER: Record<string, number> = {
  Compromised: 0,
  Clicked: 1,
  Reported: 2,
  Sent: 3,
  Safe: 4,
  Pending: 5,
};

const ACTION_STYLES: Record<string, React.CSSProperties> = {
  Compromised: { backgroundColor: "#fde0ec", color: "#e03131" },
  Reported: { backgroundColor: "#d9f3e1", color: "#1aae39" },
  Clicked: { backgroundColor: "#ffe8d4", color: "#dd5b00" },
  Safe: { backgroundColor: "#d9f3e1", color: "#1aae39" },
  Sent: { backgroundColor: "var(--ds-lavender)", color: "var(--ds-primary)" },
  Pending: {
    backgroundColor: "var(--ds-surface)",
    color: "var(--ds-steel)",
    border: "1px solid var(--ds-hairline)",
  },
};

const STATUS_STYLES: Record<string, React.CSSProperties> = {
  compromised: { backgroundColor: "#fde0ec", color: "#e03131" },
  reported: { backgroundColor: "#d9f3e1", color: "#1aae39" },
  safe: { backgroundColor: "#d9f3e1", color: "#1aae39" },
  sent: { backgroundColor: "var(--ds-lavender)", color: "var(--ds-primary)" },
  pending: {
    backgroundColor: "var(--ds-surface)",
    color: "var(--ds-steel)",
    border: "1px solid var(--ds-hairline)",
  },
};

function Badge({
  label,
  styles,
}: {
  label: string;
  styles: React.CSSProperties;
}) {
  return (
    <span
      className="inline-flex items-center rounded-[6px] px-2 py-0.5 text-[11px] font-[600] capitalize"
      style={styles}
    >
      {label}
    </span>
  );
}

function SortIcon({
  column,
  active,
  dir,
}: {
  column: SortKey;
  active: SortKey;
  dir: SortDir;
}) {
  if (column !== active)
    return <ChevronsUpDown className="size-3.5 opacity-40" />;
  return dir === "asc" ? (
    <ChevronUp className="size-3.5" />
  ) : (
    <ChevronDown className="size-3.5" />
  );
}

export function EmployeeTable({ employees }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("displayAction");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const departments = useMemo(() => {
    const depts = Array.from(
      new Set(employees.map((e) => e.department ?? "Unknown")),
    ).sort();
    return ["all", ...depts];
  }, [employees]);

  const statuses = useMemo(() => {
    const ss = Array.from(new Set(employees.map((e) => e.status))).sort();
    return ["all", ...ss];
  }, [employees]);

  const filtered = useMemo(() => {
    let rows = employees;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q) ||
          (e.department ?? "").toLowerCase().includes(q) ||
          (e.role ?? "").toLowerCase().includes(q),
      );
    }

    if (deptFilter !== "all") {
      rows = rows.filter((e) => (e.department ?? "Unknown") === deptFilter);
    }

    if (statusFilter !== "all") {
      rows = rows.filter((e) => e.status === statusFilter);
    }

    return rows;
  }, [employees, search, deptFilter, statusFilter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp = 0;

      switch (sortKey) {
        case "name":
          cmp = a.name.localeCompare(b.name);
          break;
        case "department":
          cmp = (a.department ?? "").localeCompare(b.department ?? "");
          break;
        case "role":
          cmp = (a.role ?? "").localeCompare(b.role ?? "");
          break;
        case "displayAction":
          cmp =
            (ACTION_ORDER[a.displayAction] ?? 99) -
            (ACTION_ORDER[b.displayAction] ?? 99);
          break;
        case "timeToActionMinutes":
          cmp =
            (a.timeToActionMinutes ?? Infinity) -
            (b.timeToActionMinutes ?? Infinity);
          break;
        case "status":
          cmp = a.status.localeCompare(b.status);
          break;
      }

      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const thClass =
    "px-4 py-3 text-left text-[12px] font-[600] uppercase tracking-wide cursor-pointer select-none";

  return (
    <div>
      {/* Filters */}
      <div
        className="flex flex-wrap items-center gap-3 px-6 py-4 border-b"
        style={{ borderColor: "var(--ds-hairline)" }}
      >
        <div
          className="flex items-center gap-2 flex-1 min-w-[200px] max-w-sm rounded-[8px] border px-3 py-2"
          style={{
            borderColor: "var(--ds-hairline-strong)",
            backgroundColor: "var(--ds-canvas)",
          }}
        >
          <Search className="size-4 shrink-0" style={{ color: "var(--ds-steel)" }} />
          <input
            type="text"
            placeholder="Search employees…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-[13px]"
            style={{ color: "var(--ds-ink)" }}
          />
        </div>

        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="rounded-[8px] border px-3 py-2 text-[13px] outline-none"
          style={{
            borderColor: "var(--ds-hairline-strong)",
            backgroundColor: "var(--ds-canvas)",
            color: "var(--ds-ink)",
          }}
        >
          {departments.map((d) => (
            <option key={d} value={d}>
              {d === "all" ? "All departments" : d}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-[8px] border px-3 py-2 text-[13px] outline-none"
          style={{
            borderColor: "var(--ds-hairline-strong)",
            backgroundColor: "var(--ds-canvas)",
            color: "var(--ds-ink)",
          }}
        >
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s === "all" ? "All statuses" : s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>

        <span className="text-[13px] ml-auto" style={{ color: "var(--ds-steel)" }}>
          {sorted.length} of {employees.length}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--ds-hairline)" }}>
              {(
                [
                  ["name", "Name"],
                  ["department", "Department"],
                  ["role", "Role"],
                  ["displayAction", "Action"],
                  ["timeToActionMinutes", "Time to action"],
                  ["status", "Status"],
                ] as [SortKey, string][]
              ).map(([key, label]) => (
                <th
                  key={key}
                  className={thClass}
                  style={{ color: "var(--ds-steel)" }}
                  onClick={() => handleSort(key)}
                >
                  <span className="flex items-center gap-1.5">
                    {label}
                    <SortIcon column={key} active={sortKey} dir={sortDir} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-12 text-center text-[14px]"
                  style={{ color: "var(--ds-steel)" }}
                >
                  No employees match the current filters.
                </td>
              </tr>
            ) : (
              sorted.map((emp) => (
                <tr
                  key={emp.employeeId}
                  className="border-b last:border-b-0 hover:bg-[var(--ds-surface)] transition-colors"
                  style={{ borderColor: "var(--ds-hairline)" }}
                >
                  <td className="px-4 py-3">
                    <div
                      className="text-[13px] font-[500]"
                      style={{ color: "var(--ds-ink)" }}
                    >
                      {emp.name}
                    </div>
                    <div className="text-[12px]" style={{ color: "var(--ds-steel)" }}>
                      {emp.email}
                    </div>
                  </td>
                  <td
                    className="px-4 py-3 text-[13px]"
                    style={{ color: "var(--ds-charcoal)" }}
                  >
                    {emp.department ?? <span style={{ color: "var(--ds-muted)" }}>—</span>}
                  </td>
                  <td
                    className="px-4 py-3 text-[13px]"
                    style={{ color: "var(--ds-charcoal)" }}
                  >
                    {emp.role ?? <span style={{ color: "var(--ds-muted)" }}>—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      label={emp.displayAction}
                      styles={ACTION_STYLES[emp.displayAction] ?? ACTION_STYLES.Pending}
                    />
                  </td>
                  <td
                    className="px-4 py-3 text-[13px]"
                    style={{ color: "var(--ds-charcoal)" }}
                  >
                    {emp.timeToActionMinutes !== null ? (
                      emp.timeToActionMinutes < 60 ? (
                        `${emp.timeToActionMinutes}m`
                      ) : (
                        `${Math.floor(emp.timeToActionMinutes / 60)}h ${emp.timeToActionMinutes % 60}m`
                      )
                    ) : (
                      <span style={{ color: "var(--ds-muted)" }}>—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      label={emp.status}
                      styles={STATUS_STYLES[emp.status] ?? STATUS_STYLES.pending}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
