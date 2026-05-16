"use client";

import { updateEmployee } from "@/app/dashboard/employees/_actions";
import type { EmployeeListItem } from "@/app/dashboard/employees/employees-client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface EmployeeEditDialogProps {
  employee: EmployeeListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: (employee: EmployeeListItem) => void;
}

function toFormState(employee: EmployeeListItem) {
  return {
    name: employee.name,
    email: employee.email,
    department: employee.department ?? "",
    role: employee.role ?? "",
    seniority: employee.seniority ?? "",
  };
}

export function EmployeeEditDialog({
  employee,
  open,
  onOpenChange,
  onSaved,
}: EmployeeEditDialogProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    department: "",
    role: "",
    seniority: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (employee && open) {
      setForm(toFormState(employee));
      setError(null);
    }
  }, [employee, open]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!employee) return;

    setSaving(true);
    setError(null);

    try {
      const result = await updateEmployee(employee.id, {
        name: form.name,
        email: form.email,
        department: form.department || null,
        role: form.role || null,
        seniority: form.seniority || null,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      toast.success("Employee updated");
      onSaved?.({
        ...employee,
        name: form.name.trim(),
        email: form.email.trim(),
        department: form.department.trim() || null,
        role: form.role.trim() || null,
        seniority: form.seniority.trim() || null,
      });
      onOpenChange(false);
      router.refresh();
    } catch {
      setError("Something went wrong while saving.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle>Edit employee</DialogTitle>
          <DialogDescription>
            Update this employee&apos;s profile information.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-name">Name</Label>
            <Input
              id="edit-name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
              className="h-11 rounded-[8px] border-[var(--ds-hairline-strong)] bg-[var(--ds-canvas)]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-email">Email</Label>
            <Input
              id="edit-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
              className="h-11 rounded-[8px] border-[var(--ds-hairline-strong)] bg-[var(--ds-canvas)]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-department">Department</Label>
            <Input
              id="edit-department"
              value={form.department}
              onChange={(e) =>
                setForm((f) => ({ ...f, department: e.target.value }))
              }
              className="h-11 rounded-[8px] border-[var(--ds-hairline-strong)] bg-[var(--ds-canvas)]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-role">Role</Label>
            <Input
              id="edit-role"
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              className="h-11 rounded-[8px] border-[var(--ds-hairline-strong)] bg-[var(--ds-canvas)]"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-seniority">Seniority</Label>
            <Input
              id="edit-seniority"
              value={form.seniority}
              onChange={(e) =>
                setForm((f) => ({ ...f, seniority: e.target.value }))
              }
              placeholder="e.g. junior, mid, senior"
              className="h-11 rounded-[8px] border-[var(--ds-hairline-strong)] bg-[var(--ds-canvas)]"
            />
          </div>

          {error && (
            <p className="text-[13px]" style={{ color: "var(--ds-error)" }}>
              {error}
            </p>
          )}

          <DialogFooter className="sm:justify-end gap-2 -mx-0 -mb-0 border-0 bg-transparent p-0">
            <Button
              type="button"
              variant="dsOutline"
              size="app"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" variant="ds" size="app" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
