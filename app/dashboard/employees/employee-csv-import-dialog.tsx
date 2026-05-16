"use client";

import {
  importEmployees,
  type CsvEmployeeRow,
} from "@/app/dashboard/employees/_actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Upload } from "lucide-react";
import Papa from "papaparse";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";

const PREVIEW_LIMIT = 50;
const REQUIRED_COLUMNS = ["name", "email"] as const;
const OPTIONAL_COLUMNS = ["department", "role", "seniority"] as const;

function normalizeHeaderKey(key: string) {
  return key.trim().toLowerCase().replace(/\s+/g, "_");
}

function parseCsvRows(
  data: Record<string, string>[],
): { rows: CsvEmployeeRow[]; errors: string[] } {
  const errors: string[] = [];
  const rows: CsvEmployeeRow[] = [];

  data.forEach((raw, index) => {
    const normalized: Record<string, string> = {};
    for (const [key, value] of Object.entries(raw)) {
      normalized[normalizeHeaderKey(key)] = String(value ?? "").trim();
    }

    const name = normalized.name ?? "";
    const email = normalized.email ?? "";

    if (!name && !email) return;

    if (!name || !email) {
      errors.push(`Row ${index + 2}: name and email are required.`);
      return;
    }

    rows.push({
      name,
      email,
      department: normalized.department || null,
      role: normalized.role || null,
      seniority: normalized.seniority || null,
    });
  });

  return { rows, errors };
}

function validateHeaders(fields: string[] | undefined): string | null {
  if (!fields?.length) {
    return "CSV has no header row.";
  }

  const normalized = new Set(fields.map(normalizeHeaderKey));
  const missing = REQUIRED_COLUMNS.filter((col) => !normalized.has(col));

  if (missing.length > 0) {
    return `Missing required columns: ${missing.join(", ")}. Expected: ${[...REQUIRED_COLUMNS, ...OPTIONAL_COLUMNS].join(", ")}.`;
  }

  return null;
}

export function EmployeeCsvImportDialog() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [parsedRows, setParsedRows] = useState<CsvEmployeeRow[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [headerError, setHeaderError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);

  function resetState() {
    setParsedRows([]);
    setParseErrors([]);
    setHeaderError(null);
    setFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) resetState();
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setHeaderError(null);
    setParseErrors([]);
    setParsedRows([]);

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headerErr = validateHeaders(results.meta.fields);
        if (headerErr) {
          setHeaderError(headerErr);
          return;
        }

        const { rows, errors } = parseCsvRows(results.data);
        setParsedRows(rows);
        setParseErrors(errors);

        if (rows.length === 0 && errors.length === 0) {
          setHeaderError("No valid employee rows found in this file.");
        }
      },
      error: (error) => {
        setHeaderError(error.message);
      },
    });
  }

  async function handleConfirm() {
    if (parsedRows.length === 0) return;

    setImporting(true);
    try {
      const result = await importEmployees(parsedRows);

      if (result.error && result.inserted === 0) {
        toast.error(result.error);
        return;
      }

      const skippedPart =
        result.skipped > 0
          ? ` (${result.skipped} skipped — duplicate email)`
          : "";

      toast.success(
        `Imported ${result.inserted} employee${result.inserted === 1 ? "" : "s"}${skippedPart}`,
      );

      if (result.error) {
        toast.warning(result.error);
      }

      setOpen(false);
      resetState();
      router.refresh();
    } catch {
      toast.error("Something went wrong while importing employees.");
    } finally {
      setImporting(false);
    }
  }

  const previewRows = parsedRows.slice(0, PREVIEW_LIMIT);
  const remaining = parsedRows.length - previewRows.length;
  const canConfirm = parsedRows.length > 0 && !headerError && !importing;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button type="button" variant="ds" size="app" />
        }
      >
        <Upload className="size-4" />
        Import CSV
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-2xl max-h-[90vh] overflow-y-auto"
        showCloseButton
      >
        <DialogHeader>
          <DialogTitle>Import employees</DialogTitle>
          <DialogDescription>
            Upload a CSV with columns: name, email, department, role, seniority.
          </DialogDescription>
        </DialogHeader>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={handleFileChange}
          className="block w-full text-[14px] file:mr-4 file:rounded-[8px] file:border file:border-[var(--ds-hairline-strong)] file:bg-[var(--ds-canvas)] file:px-3 file:py-2 file:text-[14px] file:font-medium"
        />

        {fileName && (
          <p className="text-[13px]" style={{ color: "var(--ds-steel)" }}>
            Selected: {fileName}
          </p>
        )}

        {headerError && (
          <p className="text-[13px]" style={{ color: "var(--ds-error)" }}>
            {headerError}
          </p>
        )}

        {parseErrors.length > 0 && (
          <div
            className="rounded-[8px] border px-3 py-2 text-[13px]"
            style={{
              borderColor: "var(--ds-hairline)",
              color: "var(--ds-error)",
            }}
          >
            {parseErrors.slice(0, 5).map((err) => (
              <p key={err}>{err}</p>
            ))}
            {parseErrors.length > 5 && (
              <p>…and {parseErrors.length - 5} more row errors</p>
            )}
          </div>
        )}

        {previewRows.length > 0 && (
          <div
            className="rounded-[12px] border overflow-hidden"
            style={{ borderColor: "var(--ds-hairline)" }}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Seniority</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewRows.map((row, i) => (
                  <TableRow key={`${row.email}-${i}`}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>{row.department ?? "—"}</TableCell>
                    <TableCell>{row.role ?? "—"}</TableCell>
                    <TableCell>{row.seniority ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {remaining > 0 && (
              <p
                className="px-3 py-2 text-[13px] border-t"
                style={{
                  color: "var(--ds-steel)",
                  borderColor: "var(--ds-hairline)",
                }}
              >
                …and {remaining} more row{remaining === 1 ? "" : "s"}
              </p>
            )}
          </div>
        )}

        <DialogFooter className="sm:justify-end gap-2">
          <Button
            type="button"
            variant="dsOutline"
            size="app"
            onClick={() => handleOpenChange(false)}
            disabled={importing}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="ds"
            size="app"
            disabled={!canConfirm}
            onClick={() => void handleConfirm()}
          >
            {importing ? "Importing…" : `Import ${parsedRows.length} employees`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
